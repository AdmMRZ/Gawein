from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from main.repositories.review import ReviewRepository
from main.repositories.transaction import TransactionRepository


class ReviewService:
    """Business logic for review operations."""

    @staticmethod
    def create_review(user, data: dict):
        """
        Create a review for a completed hiring transaction.
        Business rules:
        - Only the client of the hiring can review
        - The hiring must be completed
        - No duplicate reviews per hiring
        - Provider cannot review themselves
        """
        if user.role != 'client':
            raise PermissionDenied("Only clients can create reviews.")

        hiring = TransactionRepository.get_hiring_by_id(data['hiring_id'])
        if not hiring:
            raise NotFound("Hiring transaction not found.")

        if hiring.client != user:
            raise PermissionDenied("You can only review your own hiring transactions.")

        if hiring.status != 'completed':
            raise ValidationError(
                "You can only review a completed hiring transaction."
            )

        if ReviewRepository.review_exists_for_hiring(hiring):
            raise ValidationError(
                "A review already exists for this hiring transaction."
            )

        # Prevent provider from reviewing themselves
        if hiring.provider.user == user:
            raise PermissionDenied("You cannot review yourself.")

        review = ReviewRepository.create_review(
            hiring=hiring,
            client=user,
            provider=hiring.provider,
            rating=data['rating'],
            comment=data.get('comment', ''),
        )

        # Recalculate provider's rating
        ReviewRepository.recalculate_provider_rating(hiring.provider)

        return review

    @staticmethod
    def list_reviews(provider_id: int | None = None):
        return ReviewRepository.list_reviews(provider_id=provider_id)

    @staticmethod
    def get_review(review_id: int):
        review = ReviewRepository.get_review_by_id(review_id)
        if not review:
            raise NotFound("Review not found.")
        return review
