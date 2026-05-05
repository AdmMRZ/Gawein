from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with role-based access."""

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        CLIENT = 'client', 'Client'
        PROVIDER = 'provider', 'Provider'

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    gender = models.CharField(max_length=20, blank=True, default='')
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CLIENT,
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_client(self):
        return self.role == self.Role.CLIENT

    @property
    def is_provider(self):
        return self.role == self.Role.PROVIDER


class ClientProfile(models.Model):
    """Extended profile for clients (job seekers)."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='client_profile',
    )

    city = models.ForeignKey(
        'main.City',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clients',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'client_profiles'

    def __str__(self):
        return f"ClientProfile: {self.user.email}"


class PaymentCard(models.Model):
    """Payment card details owned by a user."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payment_cards',
    )
    card_number = models.CharField(max_length=19)
    expiry_date = models.CharField(max_length=7)
    cvv = models.CharField(max_length=4)
    cardholder_name = models.CharField(max_length=150)
    billing_address = models.CharField(max_length=255)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payment_cards'
        ordering = ['-is_primary', '-created_at']

    def __str__(self):
        return f"PaymentCard: {self.user.email} ****{self.card_number[-4:]}"


class ProviderProfile(models.Model):
    """Extended profile for service providers."""

    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        OTHER = 'other', 'Other'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='provider_profile',
    )
    bio = models.TextField(blank=True, default='')
    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        blank=True,
        default='',
    )
    age = models.PositiveIntegerField(null=True, blank=True)
    city = models.ForeignKey(
        'main.City',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='providers',
    )
    years_of_experience = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('verified', 'Verified'),
            ('rejected', 'Rejected'),
        ],
        default='pending',
    )
    rating_average = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
    )
    total_reviews = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'provider_profiles'

    def __str__(self):
        return f"ProviderProfile: {self.user.email}"

class ProviderRegistration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    category_id = models.CharField(max_length=50)
    category_name = models.CharField(max_length=100)
    foto_diri = models.TextField(null=True, blank=True)
    
    # Regional Data (External API IDs)
    provinsi_id = models.CharField(max_length=20, null=True, blank=True)
    provinsi_name = models.CharField(max_length=100, null=True, blank=True)
    kota_id = models.CharField(max_length=20, null=True, blank=True)
    kota_name = models.CharField(max_length=100, null=True, blank=True)
    kecamatan_id = models.CharField(max_length=20, null=True, blank=True)
    kecamatan_name = models.CharField(max_length=100, null=True, blank=True)
    kelurahan_id = models.CharField(max_length=20, null=True, blank=True)
    kelurahan_name = models.CharField(max_length=100, null=True, blank=True)
    alamat_lengkap = models.TextField(null=True, blank=True)
    
    pengalaman = models.TextField(null=True, blank=True)
    tahun_pengalaman = models.IntegerField(default=0)
    gaji_diharapkan = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'providers_registration'
        ordering = ['-created_at']
