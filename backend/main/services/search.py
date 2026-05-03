from main.repositories.catalog import CatalogRepository


class SearchService:
    """Business logic for provider search and filtering."""

    @staticmethod
    def search_providers(params: dict):
        """
        Execute multi-dimensional provider search.
        Accepts raw query parameters and delegates to repository.
        """
        return CatalogRepository.search_providers(
            keyword=params.get('keyword'),
            category=params.get('category'),
            city_id=params.get('city_id'),
            min_price=params.get('min_price'),
            max_price=params.get('max_price'),
            gender=params.get('gender'),
            min_age=params.get('min_age'),
            max_age=params.get('max_age'),
            experience=params.get('experience'),
            rating=params.get('rating'),
            verified_only=params.get('verified_only', False),
            ordering=params.get('ordering'),
        )
