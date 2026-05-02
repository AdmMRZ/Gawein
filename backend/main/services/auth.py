from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from main.repositories.user import UserRepository


class AuthService:
    """Business logic for authentication operations."""

    @staticmethod
    def register(validated_data: dict) -> dict:
        """
        Register a new user and create the corresponding role profile.
        Returns user data and JWT tokens.
        """
        email = validated_data['email']
        username = validated_data['username']
        password = validated_data['password']
        role = validated_data['role']

        # Create user
        user = UserRepository.create_user(
            email=email,
            username=username,
            password=password,
            role=role,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            gender=validated_data.get('gender', ''),
        )

        # Create role-specific profile
        if role == 'client':
            UserRepository.create_client_profile(
                user=user,
                phone=validated_data.get('phone', ''),
                location=validated_data.get('location', ''),
            )
        elif role == 'provider':
            UserRepository.create_provider_profile(
                user=user,
                bio=validated_data.get('bio', ''),
                gender=validated_data.get('gender', ''),
                age=validated_data.get('age'),
                location=validated_data.get('location', ''),
                years_of_experience=validated_data.get('years_of_experience', 0),
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return {
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'gender': user.gender,
                'role': user.role,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
        }

    @staticmethod
    def login(email: str, password: str) -> dict:
        """
        Authenticate user and return JWT tokens.
        """
        user = authenticate(username=email, password=password)
        if user is None:
            raise AuthenticationFailed("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationFailed("This account has been deactivated.")

        refresh = RefreshToken.for_user(user)

        return {
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'gender': user.gender,
                'role': user.role,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
        }

    @staticmethod
    def logout(refresh_token: str) -> None:
        """Blacklist the refresh token."""
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            raise ValidationError("Invalid or expired token.")

    @staticmethod
    def change_password(user, old_password: str, new_password: str) -> None:
        """Change user password after verifying old password."""
        if not user.check_password(old_password):
            raise ValidationError({'old_password': 'Old password is incorrect.'})
        user.set_password(new_password)
        user.save(update_fields=['password'])
