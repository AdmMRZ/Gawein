from django.db.models import QuerySet

from main.models import User, ClientProfile, ProviderProfile


class UserRepository:
    """Database access layer for User and profile models."""

    # ── User ────────────────────────────────────────────────

    @staticmethod
    def get_by_id(user_id: int) -> User | None:
        return User.objects.filter(pk=user_id).first()

    @staticmethod
    def get_by_email(email: str) -> User | None:
        return User.objects.filter(email=email).first()

    @staticmethod
    def create_user(*, email: str, username: str, password: str, role: str, **extra) -> User:
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            role=role,
            **extra,
        )
        return user

    @staticmethod
    def user_exists(email: str) -> bool:
        return User.objects.filter(email=email).exists()

    # ── Client Profile ──────────────────────────────────────

    @staticmethod
    def get_client_profile(user: User) -> ClientProfile | None:
        return ClientProfile.objects.filter(user=user).first()

    @staticmethod
    def create_client_profile(user: User, **kwargs) -> ClientProfile:
        return ClientProfile.objects.create(user=user, **kwargs)

    @staticmethod
    def update_client_profile(profile: ClientProfile, **kwargs) -> ClientProfile:
        for key, value in kwargs.items():
            setattr(profile, key, value)
        profile.save()
        return profile

    # ── Provider Profile ────────────────────────────────────

    @staticmethod
    def get_provider_profile(user: User) -> ProviderProfile | None:
        return ProviderProfile.objects.filter(user=user).first()

    @staticmethod
    def get_provider_profile_by_id(profile_id: int) -> ProviderProfile | None:
        return (
            ProviderProfile.objects
            .select_related('user')
            .filter(pk=profile_id)
            .first()
        )

    @staticmethod
    def create_provider_profile(user: User, **kwargs) -> ProviderProfile:
        return ProviderProfile.objects.create(user=user, **kwargs)

    @staticmethod
    def update_provider_profile(profile: ProviderProfile, **kwargs) -> ProviderProfile:
        for key, value in kwargs.items():
            setattr(profile, key, value)
        profile.save()
        return profile

    @staticmethod
    def list_providers(verified_only: bool = False) -> QuerySet:
        qs = ProviderProfile.objects.select_related('user')
        if verified_only:
            qs = qs.filter(is_verified=True)
        return qs

    @staticmethod
    def list_pending_providers() -> QuerySet:
        return (
            ProviderProfile.objects
            .select_related('user')
            .filter(verification_status='pending')
        )

    @staticmethod
    def verify_provider(profile: ProviderProfile) -> ProviderProfile:
        profile.is_verified = True
        profile.verification_status = 'verified'
        profile.save(update_fields=['is_verified', 'verification_status', 'updated_at'])
        return profile

    @staticmethod
    def reject_provider(profile: ProviderProfile) -> ProviderProfile:
        profile.is_verified = False
        profile.verification_status = 'rejected'
        profile.save(update_fields=['is_verified', 'verification_status', 'updated_at'])
        return profile
