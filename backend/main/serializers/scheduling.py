from rest_framework import serializers

from main.models import Availability, Booking


class AvailabilitySerializer(serializers.ModelSerializer):
    """Availability CRUD serializer."""

    class Meta:
        model = Availability
        fields = [
            'id', 'provider', 'date', 'start_time', 'end_time',
            'is_available', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'provider', 'created_at', 'updated_at']

    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')
        if start and end and start >= end:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time.',
            })
        return data


class BookingSerializer(serializers.ModelSerializer):
    """Booking read serializer with related data."""

    client_email = serializers.CharField(source='client.email', read_only=True)
    provider_name = serializers.SerializerMethodField()
    service_title = serializers.CharField(source='service.title', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'client', 'client_email', 'provider', 'provider_name',
            'service', 'service_title', 'availability',
            'status', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'client', 'client_email', 'provider_name',
            'service_title', 'created_at', 'updated_at',
        ]

    def get_provider_name(self, obj):
        user = obj.provider.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name or user.username


class BookingCreateSerializer(serializers.ModelSerializer):
    """Booking creation serializer."""

    class Meta:
        model = Booking
        fields = ['service', 'availability', 'notes']

    def validate_service(self, value):
        if not value.is_active:
            raise serializers.ValidationError("This service is not currently active.")
        return value


class BookingStatusSerializer(serializers.Serializer):
    """Booking status update serializer."""

    status = serializers.ChoiceField(
        choices=[
            ('confirmed', 'Confirmed'),
            ('rejected', 'Rejected'),
            ('cancelled', 'Cancelled'),
            ('completed', 'Completed'),
        ],
    )
