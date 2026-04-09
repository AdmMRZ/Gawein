from rest_framework import serializers

from main.models import User, ClientProfile, ProviderProfile


class UserSerializer(serializers.ModelSerializer):
    """Read-only user representation."""

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'role', 'is_active', 'is_verified', 'created_at', 'updated_at',
        ]
        read_only_fields = fields


class ClientProfileSerializer(serializers.ModelSerializer):
    """Client profile read/write."""

    class Meta:
        model = ClientProfile
        fields = ['id', 'phone', 'location', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProviderProfileSerializer(serializers.ModelSerializer):
    """Provider profile read/write."""

    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'bio', 'gender', 'age', 'location',
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
            'id', 'user', 'bio', 'gender', 'age', 'location',
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
