from rest_framework.exceptions import NotFound, PermissionDenied

from main.repositories.catalog import CatalogRepository
from main.repositories.user import UserRepository


class CatalogService:
    """Business logic for Category and Service management."""

    # ── Category ────────────────────────────────────────────

    @staticmethod
    def list_categories():
        return CatalogRepository.list_categories()

    @staticmethod
    def create_category(data: dict):
        return CatalogRepository.create_category(**data)

    @staticmethod
    def update_category(category_id: int, data: dict):
        category = CatalogRepository.get_category_by_id(category_id)
        if not category:
            raise NotFound("Category not found.")
        return CatalogRepository.update_category(category, **data)

    @staticmethod
    def delete_category(category_id: int):
        category = CatalogRepository.get_category_by_id(category_id)
        if not category:
            raise NotFound("Category not found.")
        CatalogRepository.delete_category(category)

    # ── Service ─────────────────────────────────────────────

    @staticmethod
    def list_my_services(user):
        """List services owned by the authenticated provider."""
        provider = UserRepository.get_provider_profile(user)
        if not provider:
            raise NotFound("Provider profile not found.")
        return CatalogRepository.list_services_by_provider(provider)

    @staticmethod
    def create_service(user, data: dict):
        """Create a service for the authenticated provider."""
        provider = UserRepository.get_provider_profile(user)
        if not provider:
            raise NotFound("Provider profile not found.")
        return CatalogRepository.create_service(provider=provider, **data)

    @staticmethod
    def get_service(service_id: int):
        service = CatalogRepository.get_service_by_id(service_id)
        if not service:
            raise NotFound("Service not found.")
        return service

    @staticmethod
    def update_service(user, service_id: int, data: dict):
        """Update a service — only the owning provider may do this."""
        service = CatalogRepository.get_service_by_id(service_id)
        if not service:
            raise NotFound("Service not found.")
        if service.provider.user != user:
            raise PermissionDenied("You can only update your own services.")
        return CatalogRepository.update_service(service, **data)

    @staticmethod
    def delete_service(user, service_id: int):
        """Delete a service — only the owning provider may do this."""
        service = CatalogRepository.get_service_by_id(service_id)
        if not service:
            raise NotFound("Service not found.")
        if service.provider.user != user:
            raise PermissionDenied("You can only delete your own services.")
        CatalogRepository.delete_service(service)
