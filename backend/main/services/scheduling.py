from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from main.models import Booking
from main.repositories.scheduling import SchedulingRepository
from main.repositories.user import UserRepository


class SchedulingService:
    """Business logic for availability and booking operations."""

    # ── Availability ────────────────────────────────────────

    @staticmethod
    def list_my_availability(user):
        provider = UserRepository.get_provider_profile(user)
        if not provider:
            raise NotFound("Provider profile not found.")
        return SchedulingRepository.list_availability_by_provider(provider)

    @staticmethod
    def create_availability(user, data: dict):
        provider = UserRepository.get_provider_profile(user)
        if not provider:
            raise NotFound("Provider profile not found.")

        # Check for time slot conflicts
        if SchedulingRepository.check_availability_conflict(
            provider=provider,
            date=data['date'],
            start_time=data['start_time'],
            end_time=data['end_time'],
        ):
            raise ValidationError(
                "This time slot overlaps with an existing availability."
            )

        return SchedulingRepository.create_availability(provider=provider, **data)

    @staticmethod
    def update_availability(user, availability_id: int, data: dict):
        availability = SchedulingRepository.get_availability_by_id(availability_id)
        if not availability:
            raise NotFound("Availability not found.")
        if availability.provider.user != user:
            raise PermissionDenied("You can only update your own availability.")

        # Check for conflicts if date/time changed
        date = data.get('date', availability.date)
        start = data.get('start_time', availability.start_time)
        end = data.get('end_time', availability.end_time)
        if SchedulingRepository.check_availability_conflict(
            provider=availability.provider,
            date=date,
            start_time=start,
            end_time=end,
            exclude_id=availability_id,
        ):
            raise ValidationError(
                "This time slot overlaps with an existing availability."
            )

        return SchedulingRepository.update_availability(availability, **data)

    @staticmethod
    def delete_availability(user, availability_id: int):
        availability = SchedulingRepository.get_availability_by_id(availability_id)
        if not availability:
            raise NotFound("Availability not found.")
        if availability.provider.user != user:
            raise PermissionDenied("You can only delete your own availability.")
        SchedulingRepository.delete_availability(availability)

    # ── Booking ─────────────────────────────────────────────

    @staticmethod
    def list_bookings(user):
        """List bookings based on user role."""
        if user.role == 'client':
            return SchedulingRepository.list_bookings_by_client(user)
        elif user.role == 'provider':
            provider = UserRepository.get_provider_profile(user)
            if not provider:
                raise NotFound("Provider profile not found.")
            return SchedulingRepository.list_bookings_by_provider(provider)
        return Booking.objects.none()

    @staticmethod
    def create_booking(user, data: dict):
        """Create a booking — only clients can book."""
        if user.role != 'client':
            raise PermissionDenied("Only clients can create bookings.")

        registration = data['registration']
        availability = data.get('availability')
        provider = registration.user.provider_profile

        # Validate availability belongs to the registration's provider
        if availability and availability.provider != provider:
            raise ValidationError(
                "The selected availability does not belong to this provider."
            )

        # Check availability is still open
        if availability and not availability.is_available:
            raise ValidationError("This time slot is no longer available.")

        booking = SchedulingRepository.create_booking(
            client=user,
            provider=provider,
            registration=registration,
            availability=availability,
            notes=data.get('notes', ''),
        )

        # Mark availability as booked
        if availability:
            SchedulingRepository.update_availability(
                availability, is_available=False,
            )

        return booking

    @staticmethod
    def get_booking(booking_id: int):
        booking = SchedulingRepository.get_booking_by_id(booking_id)
        if not booking:
            raise NotFound("Booking not found.")
        return booking

    @staticmethod
    def update_booking_status(user, booking_id: int, new_status: str):
        """
        Update booking status with business rules:
        - Provider can confirm/reject/complete
        - Client can cancel
        - Status transitions must be valid
        """
        booking = SchedulingRepository.get_booking_by_id(booking_id)
        if not booking:
            raise NotFound("Booking not found.")

        # Verify user involvement
        is_client = booking.client == user
        is_provider = booking.provider.user == user

        if not is_client and not is_provider and user.role != 'admin':
            raise PermissionDenied("You are not involved in this booking.")

        # Status transition rules
        valid_transitions = {
            'pending': {
                'provider': ['confirmed', 'rejected'],
                'client': ['cancelled'],
            },
            'confirmed': {
                'provider': ['completed'],
                'client': ['cancelled'],
            },
        }

        current = booking.status
        role_key = 'client' if is_client else 'provider'

        allowed = valid_transitions.get(current, {}).get(role_key, [])
        if user.role == 'admin':
            allowed = ['confirmed', 'rejected', 'cancelled', 'completed']

        if new_status not in allowed:
            raise ValidationError(
                f"Cannot transition from '{current}' to '{new_status}' as {role_key}."
            )

        # If cancelled, release the availability slot
        if new_status == 'cancelled' and booking.availability:
            SchedulingRepository.update_availability(
                booking.availability, is_available=True,
            )

        return SchedulingRepository.update_booking_status(booking, new_status)
