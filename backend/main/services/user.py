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
