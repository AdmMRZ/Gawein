from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.permissions import IsAdmin
from main.serializers.user import ProviderProfileDetailSerializer
from main.repositories.user import UserRepository


class PendingProviderListView(APIView):
    """GET /api/admin/providers/pending/ — List unverified providers."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        providers = UserRepository.list_pending_providers()
        serializer = ProviderProfileDetailSerializer(providers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VerifyProviderView(APIView):
    """PATCH /api/admin/providers/{id}/verify/ — Verify a provider."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        provider = UserRepository.get_provider_profile_by_id(pk)
        if not provider:
            return Response(
                {'detail': 'Provider not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        provider = UserRepository.verify_provider(provider)
        serializer = ProviderProfileDetailSerializer(provider)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RejectProviderView(APIView):
    """PATCH /api/admin/providers/{id}/reject/ — Reject a provider."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        provider = UserRepository.get_provider_profile_by_id(pk)
        if not provider:
            return Response(
                {'detail': 'Provider not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        provider = UserRepository.reject_provider(provider)
        serializer = ProviderProfileDetailSerializer(provider)
        return Response(serializer.data, status=status.HTTP_200_OK)
