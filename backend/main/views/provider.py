from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.permissions import IsProvider
from main.serializers.catalog import (
    ServiceSerializer,
    ServiceCreateUpdateSerializer,
    ServiceDetailSerializer,
)
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


class MyServiceListCreateView(APIView):
    """
    GET  /api/providers/services/ — List my services (provider only).
    POST /api/providers/services/ — Create a service (provider only).
    """

    permission_classes = [IsAuthenticated, IsProvider]

    def get(self, request):
        services = CatalogService.list_my_services(request.user)
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ServiceCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = CatalogService.create_service(
            request.user, serializer.validated_data,
        )
        return Response(
            ServiceSerializer(service).data,
            status=status.HTTP_201_CREATED,
        )


class MyServiceDetailView(APIView):
    """
    GET    /api/providers/services/{id}/ — Get service detail.
    PUT    /api/providers/services/{id}/ — Full update (provider owner).
    PATCH  /api/providers/services/{id}/ — Partial update (provider owner).
    DELETE /api/providers/services/{id}/ — Delete (provider owner).
    """

    permission_classes = [IsAuthenticated, IsProvider]

    def get(self, request, pk):
        service = CatalogService.get_service(pk)
        serializer = ServiceDetailSerializer(service)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        serializer = ServiceCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = CatalogService.update_service(
            request.user, pk, serializer.validated_data,
        )
        return Response(
            ServiceSerializer(service).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        serializer = ServiceCreateUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        service = CatalogService.update_service(
            request.user, pk, serializer.validated_data,
        )
        return Response(
            ServiceSerializer(service).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        CatalogService.delete_service(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProviderRegistrationCreateView(APIView):
    """POST /api/providers/registration/"""
    permission_classes = [IsAuthenticated, IsProvider]

    def post(self, request):
        serializer = ProviderRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
