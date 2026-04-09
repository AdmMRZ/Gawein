from rest_framework import serializers

from main.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Review read serializer."""

    client_email = serializers.CharField(source='client.email', read_only=True)
    client_name = serializers.SerializerMethodField()
    provider_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'hiring', 'client', 'client_email', 'client_name',
            'provider', 'provider_name',
            'rating', 'comment', 'created_at',
        ]
        read_only_fields = fields

    def get_client_name(self, obj):
        full_name = f"{obj.client.first_name} {obj.client.last_name}".strip()
        return full_name or obj.client.username

    def get_provider_name(self, obj):
        user = obj.provider.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name or user.username


class ReviewCreateSerializer(serializers.Serializer):
    """Review creation serializer."""

    hiring_id = serializers.IntegerField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, default='')
