from rest_framework import serializers

from main.models import User, ClientProfile, ProviderProfile, PaymentCard, ProviderRegistration


class UserSerializer(serializers.ModelSerializer):
    """Read-only user representation."""

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'phone', 'gender', 'role', 'is_active', 'is_verified', 'created_at', 'updated_at',
        ]
        read_only_fields = fields


class ClientProfileSerializer(serializers.ModelSerializer):
    """Client profile read/write."""

    class Meta:
        model = ClientProfile
        fields = ['id', 'city', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProviderProfileSerializer(serializers.ModelSerializer):
    """Provider profile read/write."""

    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'bio', 'gender', 'age', 'city',
            'years_of_experience', 'is_verified', 'verification_status',
            'rating_average', 'total_reviews',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'is_verified', 'verification_status',
            'rating_average', 'total_reviews',
            'created_at', 'updated_at',
        ]


class ProviderProfileDetailSerializer(serializers.ModelSerializer):
    """Provider profile with user info and services for public listing."""

    user = UserSerializer(read_only=True)
    services = serializers.SerializerMethodField()

    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'user', 'bio', 'gender', 'age', 'city',
            'years_of_experience', 'is_verified', 'verification_status',
            'rating_average', 'total_reviews',
            'services', 'created_at', 'updated_at',
        ]

    def get_services(self, obj):
        from main.serializers.catalog import ServiceSerializer
        services = obj.services.filter(is_active=True)
        return ServiceSerializer(services, many=True).data


class ProfileSerializer(serializers.Serializer):
    """Combined profile response for any user role."""

    user = UserSerializer(read_only=True)
    profile = serializers.SerializerMethodField()

    def get_profile(self, obj):
        user = obj
        if user.role == 'client':
            profile = getattr(user, 'client_profile', None)
            if profile:
                return ClientProfileSerializer(profile).data
        elif user.role == 'provider':
            profile = getattr(user, 'provider_profile', None)
            if profile:
                return ProviderProfileSerializer(profile).data
        return None


class PaymentCardSerializer(serializers.ModelSerializer):
    """Payment card read/write serializer."""

    class Meta:
        model = PaymentCard
        fields = [
            'id', 'card_number', 'expiry_date', 'cvv', 'cardholder_name',
            'billing_address', 'is_primary', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'is_primary', 'created_at', 'updated_at']

    def validate_card_number(self, value):
        digits = ''.join(ch for ch in value if ch.isdigit())
        if len(digits) < 12 or len(digits) > 19:
            raise serializers.ValidationError('Card number must contain 12-19 digits.')
        return digits

    def validate_expiry_date(self, value):
        raw_value = value.strip()
        digits = ''.join(ch for ch in raw_value if ch.isdigit())
        if len(digits) == 6:
            value = f'{digits[:2]}/{digits[2:]}'
        elif len(digits) == 4:
            value = f'{digits[:2]}/20{digits[2:]}'
        else:
            value = raw_value

        if len(value) != 7 or value[2] != '/' or not value[:2].isdigit() or not value[3:].isdigit():
            raise serializers.ValidationError('Expiry date must use MM/YYYY format.')
        month = int(value[:2])
        if month < 1 or month > 12:
            raise serializers.ValidationError('Expiry month must be between 01 and 12.')
        return value

    def validate_cvv(self, value):
        if not value.isdigit() or len(value) not in (3, 4):
            raise serializers.ValidationError('CVV must contain 3 or 4 digits.')
        return value

class ProviderRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderRegistration
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']
