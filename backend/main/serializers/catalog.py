from rest_framework import serializers

from main.models import Category, Service, City


class CategorySerializer(serializers.ModelSerializer):
    """Category CRUD serializer."""

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon_name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ServiceSerializer(serializers.ModelSerializer):
    """Service read serializer with category name."""

    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    category_icon = serializers.CharField(source='category.icon_name', read_only=True, default=None)
    provider_name = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 'provider', 'category', 'category_name', 'category_icon', 'provider_name',
            'title', 'description', 'price', 'city',
            'service_scope', 'service_limitations', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'provider', 'created_at', 'updated_at']

    def get_provider_name(self, obj):
        user = obj.provider.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name or user.username


class ServiceCreateUpdateSerializer(serializers.ModelSerializer):
    """Service create/update serializer (provider auto-set via service layer)."""

    class Meta:
        model = Service
        fields = [
            'category', 'title', 'description', 'price', 'city',
            'service_scope', 'service_limitations', 'is_active',
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value


class ServiceDetailSerializer(serializers.ModelSerializer):
    """Service detail with nested provider and category."""

    category = CategorySerializer(read_only=True)
    provider_info = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 'provider_info', 'category',
            'title', 'description', 'price', 'city',
            'service_scope', 'service_limitations', 'is_active',
            'created_at', 'updated_at',
        ]

    def get_provider_info(self, obj):
        from main.serializers.user import ProviderProfileDetailSerializer
        return {
            'id': obj.provider.id,
            'name': f"{obj.provider.user.first_name} {obj.provider.user.last_name}".strip() or obj.provider.user.username,
            'rating_average': str(obj.provider.rating_average),
            'is_verified': obj.provider.is_verified,
            'city': obj.provider.city.name if obj.provider.city else '',
        }

class CitySerializer(serializers.ModelSerializer):
    province_name = serializers.CharField(source='province.name', read_only=True)
    class Meta:
        model = City
        fields = ['id', 'name', 'province_name']
