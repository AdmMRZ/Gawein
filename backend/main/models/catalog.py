from django.db import models


class Province(models.Model):
    """Administrative province/region."""

    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'provinces'
        ordering = ['name']

    def __str__(self):
        return self.name


class City(models.Model):
    """Administrative city within a province."""

    province = models.ForeignKey(
        Province,
        on_delete=models.CASCADE,
        related_name='cities'
    )
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cities'
        unique_together = ('province', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name}, {self.province.name}"

class Category(models.Model):
    """Service category for organizing provider offerings."""

    name = models.CharField(max_length=100, unique=True)
    icon_name = models.CharField(max_length=50, default='grid-outline', help_text="Ionicons name")
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Service(models.Model):
    """A service offering by a provider."""

    provider = models.ForeignKey(
        'main.ProviderProfile',
        on_delete=models.CASCADE,
        related_name='services',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='services',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    city = models.ForeignKey(
        City,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='services'
    )
    service_scope = models.TextField(blank=True, default='')
    service_limitations = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'services'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.provider.user.email}"
