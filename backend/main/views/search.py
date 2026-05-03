from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from main.serializers.user import ProviderProfileDetailSerializer
from main.services.search import SearchService


class ProviderSearchView(APIView):
    """
    GET /api/search/providers/?keyword=&category=&location=&...
    Multi-dimensional provider search (public).
    """

    permission_classes = [AllowAny]

    def get(self, request):
        # Parse and clean query parameters
        params = {
            'keyword': request.query_params.get('keyword'),
            'category': self._parse_int(request.query_params.get('category')),
            'city_id': request.query_params.get('city_id'),
            'min_price': self._parse_float(request.query_params.get('min_price')),
            'max_price': self._parse_float(request.query_params.get('max_price')),
            'gender': request.query_params.get('gender'),
            'min_age': self._parse_int(request.query_params.get('min_age')),
            'max_age': self._parse_int(request.query_params.get('max_age')),
            'experience': self._parse_int(request.query_params.get('experience')),
            'rating': self._parse_float(request.query_params.get('rating')),
            'verified_only': request.query_params.get('verified_only', '').lower() == 'true',
            'ordering': request.query_params.get('ordering'),
        }

        providers = SearchService.search_providers(params)
        serializer = ProviderProfileDetailSerializer(providers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def _parse_int(value):
        if value is None:
            return None
        try:
            return int(value)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _parse_float(value):
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
