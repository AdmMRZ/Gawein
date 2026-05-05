from rest_framework import serializers

from main.models import HiringTransaction


class HiringSerializer(serializers.ModelSerializer):
    """Hiring read serializer."""

    client_email = serializers.CharField(source='client.email', read_only=True)
    provider_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='registration.category.name', read_only=True)

    class Meta:
        model = HiringTransaction
        fields = [
            'id', 'client', 'client_email', 'provider', 'provider_name',
            'registration', 'category_name', 'booking',
            'agreed_price', 'work_date', 'location', 'notes',
            'status', 'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_provider_name(self, obj):
        user = obj.provider.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name or user.username


class HiringCreateSerializer(serializers.Serializer):
    """Hiring creation from a confirmed booking."""

    booking_id = serializers.IntegerField()
    agreed_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    work_date = serializers.DateField()
    location = serializers.CharField(max_length=255, required=False, default='')
    notes = serializers.CharField(required=False, default='')

    def validate_agreed_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Agreed price must be greater than zero.")
        return value


class HiringDetailSerializer(serializers.ModelSerializer):
    """Hiring detail with nested relations."""

    client_email = serializers.CharField(source='client.email', read_only=True)
    client_name = serializers.SerializerMethodField()
    provider_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='registration.category.name', read_only=True)
    has_review = serializers.SerializerMethodField()

    class Meta:
        model = HiringTransaction
        fields = [
            'id', 'client', 'client_email', 'client_name',
            'provider', 'provider_name',
            'registration', 'category_name',
            'booking', 'agreed_price', 'work_date', 'location', 'notes',
            'status', 'has_review', 'created_at', 'updated_at',
        ]

    def get_client_name(self, obj):
        full_name = f"{obj.client.first_name} {obj.client.last_name}".strip()
        return full_name or obj.client.username

    def get_provider_name(self, obj):
        user = obj.provider.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name or user.username

    def get_has_review(self, obj):
        return hasattr(obj, 'review')


class HiringStatusSerializer(serializers.Serializer):
    """Hiring status update serializer."""

    status = serializers.ChoiceField(
        choices=[
            ('confirmed', 'Confirmed'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled'),
        ],
    )
