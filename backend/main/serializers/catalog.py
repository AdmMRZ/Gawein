from rest_framework import serializers

from main.models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Category CRUD serializer."""

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon_name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
