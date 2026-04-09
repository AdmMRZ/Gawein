from django.db.models import QuerySet

from main.models import Availability, Booking, ProviderProfile, User


class SchedulingRepository:
    """Database access layer for Availability and Booking models."""

    # ── Availability ────────────────────────────────────────

    @staticmethod
    def list_availability_by_provider(provider: ProviderProfile) -> QuerySet:
        return Availability.objects.filter(provider=provider)

    @staticmethod
    def get_availability_by_id(availability_id: int) -> Availability | None:
        return (
            Availability.objects
            .select_related('provider__user')
            .filter(pk=availability_id)
            .first()
        )

    @staticmethod
    def create_availability(provider: ProviderProfile, **kwargs) -> Availability:
        return Availability.objects.create(provider=provider, **kwargs)

    @staticmethod
    def update_availability(availability: Availability, **kwargs) -> Availability:
        for key, value in kwargs.items():
            setattr(availability, key, value)
        availability.save()
        return availability

    @staticmethod
    def delete_availability(availability: Availability) -> None:
        availability.delete()

    @staticmethod
    def check_availability_conflict(
        provider: ProviderProfile,
        date,
        start_time,
        end_time,
        exclude_id: int | None = None,
    ) -> bool:
        """Check if an availability slot overlaps with existing ones."""
        qs = Availability.objects.filter(
            provider=provider,
            date=date,
            start_time__lt=end_time,
            end_time__gt=start_time,
        )
        if exclude_id:
            qs = qs.exclude(pk=exclude_id)
        return qs.exists()

    # ── Booking ─────────────────────────────────────────────

    @staticmethod
    def list_bookings_by_client(client: User) -> QuerySet:
        return (
            Booking.objects
            .select_related('provider__user', 'service', 'availability')
            .filter(client=client)
        )

    @staticmethod
    def list_bookings_by_provider(provider: ProviderProfile) -> QuerySet:
        return (
            Booking.objects
            .select_related('client', 'service', 'availability')
            .filter(provider=provider)
        )

    @staticmethod
    def get_booking_by_id(booking_id: int) -> Booking | None:
        return (
            Booking.objects
            .select_related('client', 'provider__user', 'service', 'availability')
            .filter(pk=booking_id)
            .first()
        )

    @staticmethod
    def create_booking(**kwargs) -> Booking:
        return Booking.objects.create(**kwargs)

    @staticmethod
    def update_booking_status(booking: Booking, status: str) -> Booking:
        booking.status = status
        booking.save(update_fields=['status', 'updated_at'])
        return booking
