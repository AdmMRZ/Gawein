from django.conf import settings
from django.db import models


class Availability(models.Model):
    """Provider availability time slots."""

    provider = models.ForeignKey(
        'main.ProviderProfile',
        on_delete=models.CASCADE,
        related_name='availabilities',
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'availabilities'
        verbose_name_plural = 'availabilities'
        ordering = ['date', 'start_time']
        unique_together = ['provider', 'date', 'start_time', 'end_time']

    def __str__(self):
        return f"{self.provider.user.email}: {self.date} {self.start_time}-{self.end_time}"


class Booking(models.Model):
    """A booking request from a client to a provider."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        REJECTED = 'rejected', 'Rejected'
        CANCELLED = 'cancelled', 'Cancelled'
        COMPLETED = 'completed', 'Completed'

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    provider = models.ForeignKey(
        'main.ProviderProfile',
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    registration = models.ForeignKey(
        'main.ProviderRegistration',
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    availability = models.ForeignKey(
        Availability,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking #{self.pk}: {self.client.email} → {self.provider.user.email}"
