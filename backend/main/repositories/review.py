from django.db.models import QuerySet, Avg

from main.models import Review, ProviderProfile, HiringTransaction


class ReviewRepository:
    """Database access layer for Review model."""

    @staticmethod
    def create_review(**kwargs) -> Review:
        return Review.objects.create(**kwargs)

    @staticmethod
    def get_review_by_id(review_id: int) -> Review | None:
        return (
            Review.objects
            .select_related('client', 'provider__user', 'hiring')
            .filter(pk=review_id)
            .first()
        )

    @staticmethod
    def list_reviews(provider_id: int | None = None) -> QuerySet:
        qs = Review.objects.select_related('client', 'provider__user', 'hiring')
        if provider_id:
            qs = qs.filter(provider_id=provider_id)
        return qs

    @staticmethod
    def review_exists_for_hiring(hiring: HiringTransaction) -> bool:
        return Review.objects.filter(hiring=hiring).exists()

    @staticmethod
    def calculate_provider_rating(provider: ProviderProfile) -> dict:
        """Calculate average rating and total reviews for a provider."""
        result = (
            Review.objects
            .filter(provider=provider)
            .aggregate(
                avg_rating=Avg('rating'),
                total=__import__('django.db.models', fromlist=['Count']).Count('id'),
            )
        )
        return {
            'rating_average': result['avg_rating'] or 0.00,
            'total_reviews': result['total'] or 0,
        }

    @staticmethod
    def recalculate_provider_rating(provider: ProviderProfile) -> ProviderProfile:
        """Recalculate and update provider's rating stats."""
        from django.db.models import Count
        result = (
            Review.objects
            .filter(provider=provider)
            .aggregate(
                avg_rating=Avg('rating'),
                total=Count('id'),
            )
        )
        provider.rating_average = result['avg_rating'] or 0.00
        provider.total_reviews = result['total'] or 0
        provider.save(update_fields=['rating_average', 'total_reviews', 'updated_at'])
        return provider
