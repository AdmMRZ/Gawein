from rest_framework.exceptions import NotFound

from main.repositories.user import UserRepository


class ProviderService:
    """Business logic for provider listings."""

    @staticmethod
    def list_providers(verified_only: bool = False):
        return UserRepository.list_providers(verified_only=verified_only)

    @staticmethod
    def get_provider_detail(provider_id: int):
        provider = UserRepository.get_provider_profile_by_id(provider_id)
        if not provider:
            raise NotFound("Provider not found.")
        return provider
