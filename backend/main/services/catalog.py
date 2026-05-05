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


