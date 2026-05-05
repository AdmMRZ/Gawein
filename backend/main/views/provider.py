from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.permissions import IsProvider
from main.serializers.user import ProviderProfileDetailSerializer, ProviderRegistrationSerializer
from main.models.user import ProviderRegistration
from main.services.catalog import CatalogService
from main.services.provider import ProviderService


class ProviderListView(APIView):
    """GET /api/providers/ — List all providers (public)."""

    permission_classes = [AllowAny]

    def get(self, request):
        providers = ProviderService.list_providers()
        serializer = ProviderProfileDetailSerializer(providers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProviderDetailView(APIView):
    """GET /api/providers/{id}/ — Get provider detail (public)."""

    permission_classes = [AllowAny]

    def get(self, request, pk):
        provider = ProviderService.get_provider_detail(pk)
        serializer = ProviderProfileDetailSerializer(provider)
        return Response(serializer.data, status=status.HTTP_200_OK)




class ProviderRegistrationCreateView(APIView):
    """POST /api/providers/registration/"""
    permission_classes = [IsAuthenticated, IsProvider]

    def post(self, request):
        serializer = ProviderRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
