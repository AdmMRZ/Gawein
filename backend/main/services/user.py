from rest_framework.exceptions import NotFound

from main.repositories.user import UserRepository


class UserService:
    """Business logic for user profile operations."""

    @staticmethod
    def get_profile(user) -> dict:
        """Get user info with role-specific profile."""
        profile_data = None

        if user.role == 'client':
            profile = UserRepository.get_client_profile(user)
            if profile:
                profile_data = {
                    'id': profile.id,

                    'city': profile.city.name if profile.city else '', 'city_id': profile.city_id,
                }
        elif user.role == 'provider':
            profile = UserRepository.get_provider_profile(user)
            if profile:
                profile_data = {
                    'id': profile.id,
                    'bio': profile.bio,
                    'gender': profile.gender,
                    'age': profile.age,
                    'city': profile.city.name if profile.city else '', 'city_id': profile.city_id,
                    'years_of_experience': profile.years_of_experience,
                    'is_verified': profile.is_verified,
                    'verification_status': profile.verification_status,
                    'rating_average': str(profile.rating_average),
                    'total_reviews': profile.total_reviews,
                }

        return {
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'gender': user.gender,
                'phone': getattr(user, 'phone', ''),
                'role': user.role,
                'is_active': user.is_active,
                'is_verified': user.is_verified,
                'created_at': user.created_at,
                'updated_at': user.updated_at,
            },
            'profile': profile_data,
        }

    @staticmethod
    def update_profile(user, data: dict) -> dict:
        """Update user info and role-specific profile."""
        # Update user fields
        user_fields = ['first_name', 'last_name', 'username', 'gender', 'phone']
        user_updated = False
        for field in user_fields:
            if field in data:
                setattr(user, field, data[field])
                user_updated = True
        if user_updated:
            user.save()

        # Update role-specific profile
        if user.role == 'client':
            profile = UserRepository.get_client_profile(user)
            if profile:
                profile_fields = {k: v for k, v in data.items() if k in ['city_id']}
                if profile_fields:
                    UserRepository.update_client_profile(profile, **profile_fields)
        elif user.role == 'provider':
            profile = UserRepository.get_provider_profile(user)
            if profile:
                allowed = ['bio', 'gender', 'age', 'city_id', 'years_of_experience']
                profile_fields = {k: v for k, v in data.items() if k in allowed}
                if profile_fields:
                    UserRepository.update_provider_profile(profile, **profile_fields)

        return UserService.get_profile(user)

    @staticmethod
    def register_provider_category(user, data: dict):
        """Save detailed provider registration for a specific category."""
        from main.models import ProviderRegistration
        
        # We don't save name/email/phone here because they are in User model
        # But we update User model if they were provided in the registration form
        user_updates = {}
        if 'nama_lengkap' in data:
            name_parts = data['nama_lengkap'].split(' ')
            user_updates['first_name'] = name_parts[0]
            user_updates['last_name'] = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        if 'nomor_telepon' in data:
            user_updates['phone'] = data['nomor_telepon']
        if 'gender' in data:
            user_updates['gender'] = data['gender']
            
        if user_updates:
            for k, v in user_updates.items():
                setattr(user, k, v)
            user.save()

        # Save the detailed registration
        registration = ProviderRegistration.objects.create(
            user=user,
            category_id=data.get('category_id'),
            category_name=data.get('category_name'),
            foto_diri=data.get('foto_diri'),
            provinsi_id=data.get('provinsi_id'),
            provinsi_name=data.get('provinsi_name'),
            kota_id=data.get('kota_id'),
            kota_name=data.get('kota_name'),
            kecamatan_id=data.get('kecamatan_id'),
            kecamatan_name=data.get('kecamatan_name'),
            kelurahan_id=data.get('kelurahan_id'),
            kelurahan_name=data.get('kelurahan_name'),
            alamat_lengkap=data.get('alamat_lengkap'),
            pengalaman=data.get('pengalaman'),
            tahun_pengalaman=data.get('tahun_pengalaman', 0),
            gaji_diharapkan=data.get('gaji_diharapkan')
        )
        
        # Also update the main ProviderProfile to keep them in sync
        profile = UserRepository.get_provider_profile(user)
        if profile:
            profile.bio = data.get('pengalaman', profile.bio)
            profile.years_of_experience = data.get('tahun_pengalaman', profile.years_of_experience)
            # For city, we try to match our internal City ID if possible, 
            # otherwise we just rely on the detailed location fields in registration.
            profile.save()
            
        return registration
