from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.serializers.review import ReviewSerializer, ReviewCreateSerializer
from main.services.review import ReviewService


class ReviewListCreateView(APIView):
    """
    GET  /api/reviews/ — List reviews (public, optionally filtered by provider).
    POST /api/reviews/ — Create a review (authenticated client only).
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        provider_id = request.query_params.get('provider')
        try:
            provider_id = int(provider_id) if provider_id else None
        except (ValueError, TypeError):
            provider_id = None

        reviews = ReviewService.list_reviews(provider_id=provider_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = ReviewService.create_review(
            request.user, serializer.validated_data,
        )
        return Response(
            ReviewSerializer(review).data,
            status=status.HTTP_201_CREATED,
        )


class ReviewDetailView(APIView):
    """GET /api/reviews/{id}/ — Get review detail (public)."""

    permission_classes = [AllowAny]

    def get(self, request, pk):
        review = ReviewService.get_review(pk)
        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_200_OK)
