from rest_framework import serializers

from main.models import User


class RegisterSerializer(serializers.Serializer):
    """Validates registration data."""

    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, default='')
    last_name = serializers.CharField(max_length=150, required=False, default='')
    role = serializers.ChoiceField(
        choices=[('client', 'Client'), ('provider', 'Provider')],
    )
    # Optional profile fields
    phone = serializers.CharField(max_length=20, required=False, default='')
    city_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    bio = serializers.CharField(required=False, default='')
    gender = serializers.ChoiceField(
        choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')],
        required=False,
        default='',
    )
    age = serializers.IntegerField(required=False, allow_null=True, default=None)
    years_of_experience = serializers.IntegerField(required=False, default=0)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.',
            })
        return data


class LoginSerializer(serializers.Serializer):
    """Validates login credentials."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """Validates password change request."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password_confirm = serializers.CharField(min_length=8, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match.',
            })
        return data
