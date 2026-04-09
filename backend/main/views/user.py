from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.services.user import UserService


class ProfileView(APIView):
    """
    GET  /api/profile/ — Get current user profile.
    PUT  /api/profile/ — Full update of profile.
    PATCH /api/profile/ — Partial update of profile.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        result = UserService.get_profile(request.user)
        return Response(result, status=status.HTTP_200_OK)

    def put(self, request):
        result = UserService.update_profile(request.user, request.data)
        return Response(result, status=status.HTTP_200_OK)

    def patch(self, request):
        result = UserService.update_profile(request.user, request.data)
        return Response(result, status=status.HTTP_200_OK)
