from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class HiringTransaction(models.Model):
    """A hiring transaction between client and provider."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hiring_transactions',
    )
    provider = models.ForeignKey(
        'main.ProviderProfile',
        on_delete=models.CASCADE,
        related_name='hiring_transactions',
    )
    service = models.ForeignKey(
        'main.Service',
        on_delete=models.CASCADE,
        related_name='hiring_transactions',
    )
    booking = models.OneToOneField(
        'main.Booking',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hiring_transaction',
    )
    agreed_price = models.DecimalField(max_digits=12, decimal_places=2)
    work_date = models.DateField()
    location = models.CharField(max_length=255, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hiring_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Hiring #{self.pk}: {self.client.email} → {self.provider.user.email}"


class Review(models.Model):
    """Review for a completed hiring transaction."""

    hiring = models.OneToOneField(
        HiringTransaction,
        on_delete=models.CASCADE,
        related_name='review',
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_given',
    )
    provider = models.ForeignKey(
        'main.ProviderProfile',
        on_delete=models.CASCADE,
        related_name='reviews_received',
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f"Review #{self.pk}: {self.rating}★ for {self.provider.user.email}"


class IdempotencyKey(models.Model):
    """Storage for idempotency keys to prevent duplicate requests."""
    key = models.CharField(max_length=255, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    response_code = models.IntegerField()
    response_body = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'idempotency_keys'
        ordering = ['-created_at']

    def __str__(self):
        return f"Key: {self.key} for {self.user.email}"
