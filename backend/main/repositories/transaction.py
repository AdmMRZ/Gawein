from django.db.models import QuerySet, Q

from main.models import HiringTransaction, User, ProviderProfile


class TransactionRepository:
    """Database access layer for HiringTransaction."""

    @staticmethod
    def create_hiring(**kwargs) -> HiringTransaction:
        return HiringTransaction.objects.create(**kwargs)

    @staticmethod
    def get_hiring_by_id(hiring_id: int) -> HiringTransaction | None:
        return (
            HiringTransaction.objects
            .select_related(
                'client',
                'provider__user',
                'registration__category',
                'booking',
            )
            .filter(pk=hiring_id)
            .first()
        )

    @staticmethod
    def list_hirings_by_user(user: User) -> QuerySet:
        """Return hirings where user is either client or provider."""
        return (
            HiringTransaction.objects
            .select_related(
                'client',
                'provider__user',
                'registration__category',
                'booking',
            )
            .filter(
                Q(client=user) | Q(provider__user=user)
            )
        )

    @staticmethod
    def list_hirings_by_client(client: User) -> QuerySet:
        return (
            HiringTransaction.objects
            .select_related('provider__user', 'registration__category', 'booking')
            .filter(client=client)
        )

    @staticmethod
    def list_hirings_by_provider(provider: ProviderProfile) -> QuerySet:
        return (
            HiringTransaction.objects
            .select_related('client', 'registration__category', 'booking')
            .filter(provider=provider)
        )

    @staticmethod
    def update_hiring_status(hiring: HiringTransaction, status: str) -> HiringTransaction:
        hiring.status = status
        hiring.save(update_fields=['status', 'updated_at'])
        return hiring

    @staticmethod
    def get_history_by_user(user: User) -> QuerySet:
        """
        Return completed/cancelled hirings for history view.
        Includes both client and provider perspective.
        """
        return (
            HiringTransaction.objects
            .select_related(
                'client',
                'provider__user',
                'registration__category',
                'booking',
            )
            .filter(
                Q(client=user) | Q(provider__user=user),
            )
            .order_by('-created_at')
        )
