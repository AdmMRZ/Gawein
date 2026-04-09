from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.serializers.auth import (
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
)
from main.services.auth import AuthService


class RegisterView(APIView):
    """POST /api/register/ — Register a new user."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = AuthService.register(serializer.validated_data)
        return Response(result, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/login/ — Authenticate and get JWT tokens."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = AuthService.login(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        return Response(result, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """POST /api/logout/ — Blacklist the refresh token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        AuthService.logout(refresh_token)
        return Response(
            {'detail': 'Successfully logged out.'},
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    """POST /api/change-password/ — Change the authenticated user's password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.change_password(
            user=request.user,
            old_password=serializer.validated_data['old_password'],
            new_password=serializer.validated_data['new_password'],
        )
        return Response(
            {'detail': 'Password changed successfully.'},
            status=status.HTTP_200_OK,
        )
