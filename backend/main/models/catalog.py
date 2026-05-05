from django.db import models


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



