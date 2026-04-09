from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from main.repositories.scheduling import SchedulingRepository
from main.repositories.transaction import TransactionRepository
from main.repositories.user import UserRepository


class HiringService:
    """Business logic for hiring transactions."""

    @staticmethod
    def create_hiring(user, data: dict):
        """
        Create a hiring transaction from a confirmed booking.
        Only the client who owns the booking can do this.
        """
        if user.role != 'client':
            raise PermissionDenied("Only clients can create hiring transactions.")

        booking = SchedulingRepository.get_booking_by_id(data['booking_id'])
        if not booking:
            raise NotFound("Booking not found.")

        if booking.client != user:
            raise PermissionDenied("You can only hire from your own bookings.")

        if booking.status != 'confirmed':
            raise ValidationError(
                "Hiring can only be created from a confirmed booking."
            )

        # Check if hiring already exists for this booking
        if hasattr(booking, 'hiring_transaction') and booking.hiring_transaction:
            raise ValidationError(
                "A hiring transaction already exists for this booking."
            )

        hiring = TransactionRepository.create_hiring(
            client=user,
            provider=booking.provider,
            service=booking.service,
            booking=booking,
            agreed_price=data['agreed_price'],
            work_date=data['work_date'],
            location=data.get('location', ''),
            notes=data.get('notes', ''),
        )

        return hiring

    @staticmethod
    def list_hirings(user):
        """List hirings based on user role."""
        if user.role == 'admin':
            return TransactionRepository.list_hirings_by_user(user)
        return TransactionRepository.list_hirings_by_user(user)

    @staticmethod
    def get_hiring(hiring_id: int):
        hiring = TransactionRepository.get_hiring_by_id(hiring_id)
        if not hiring:
            raise NotFound("Hiring transaction not found.")
        return hiring

    @staticmethod
    def update_hiring_status(user, hiring_id: int, new_status: str):
        """
        Update hiring status with business rules:
        - Provider can confirm, start work (in_progress), complete
        - Client can cancel (only if pending)
        - Status transitions must be valid
        """
        hiring = TransactionRepository.get_hiring_by_id(hiring_id)
        if not hiring:
            raise NotFound("Hiring transaction not found.")

        is_client = hiring.client == user
        is_provider = hiring.provider.user == user

        if not is_client and not is_provider and user.role != 'admin':
            raise PermissionDenied("You are not involved in this hiring.")

        # Status transition rules
        valid_transitions = {
            'pending': {
                'provider': ['confirmed', 'cancelled'],
                'client': ['cancelled'],
            },
            'confirmed': {
                'provider': ['in_progress', 'cancelled'],
                'client': ['cancelled'],
            },
            'in_progress': {
                'provider': ['completed'],
                'client': [],
            },
        }

        current = hiring.status
        role_key = 'client' if is_client else 'provider'

        allowed = valid_transitions.get(current, {}).get(role_key, [])
        if user.role == 'admin':
            allowed = ['confirmed', 'in_progress', 'completed', 'cancelled']

        if new_status not in allowed:
            raise ValidationError(
                f"Cannot transition from '{current}' to '{new_status}' as {role_key}."
            )

        # If completed, also mark the booking as completed
        if new_status == 'completed' and hiring.booking:
            SchedulingRepository.update_booking_status(hiring.booking, 'completed')

        return TransactionRepository.update_hiring_status(hiring, new_status)

    @staticmethod
    def get_history(user):
        """Get all hiring history for a user (both roles)."""
        return TransactionRepository.get_history_by_user(user)

    @staticmethod
    def get_history_detail(user, hiring_id: int):
        """Get a single hiring detail, only if user is involved."""
        hiring = TransactionRepository.get_hiring_by_id(hiring_id)
        if not hiring:
            raise NotFound("Hiring transaction not found.")

        is_client = hiring.client == user
        is_provider = hiring.provider.user == user

        if not is_client and not is_provider and user.role != 'admin':
            raise PermissionDenied("You are not authorized to view this transaction.")

        return hiring
