from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.permissions import IsAdmin
from main.serializers.catalog import CategorySerializer, CitySerializer
from main.services.catalog import CatalogService
from main.models import City


class CategoryListCreateView(APIView):
    """
    GET  /api/categories/ — List all categories (public).
    POST /api/categories/ — Create category (admin only).
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def get(self, request):
        categories = CatalogService.list_categories()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = CatalogService.create_category(serializer.validated_data)
        return Response(
            CategorySerializer(category).data,
            status=status.HTTP_201_CREATED,
        )


class CategoryDetailView(APIView):
    """
    PUT    /api/categories/{id}/ — Update category (admin only).
    DELETE /api/categories/{id}/ — Delete category (admin only).
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = CatalogService.update_category(pk, serializer.validated_data)
        return Response(
            CategorySerializer(category).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        CatalogService.delete_category(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

class CityListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        cities = City.objects.filter(is_active=True).select_related('province')
        return Response(CitySerializer(cities, many=True).data, status=status.HTTP_200_OK)
