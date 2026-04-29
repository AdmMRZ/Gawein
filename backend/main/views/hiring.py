from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.permissions import IsClient
from main.serializers.transaction import (
    HiringSerializer,
    HiringCreateSerializer,
    HiringDetailSerializer,
    HiringStatusSerializer,
)
from main.services.hiring import HiringService


class HiringListCreateView(APIView):
    """
    POST /api/hirings/ — Create hiring (client only).
    GET  /api/hirings/ — List hirings (role-based).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        hirings = HiringService.list_hirings(request.user)
        serializer = HiringSerializer(hirings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Only clients can create hirings
        if request.user.role != 'client':
            return Response(
                {'detail': 'Only clients can create hiring transactions.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = HiringCreateSerializer(data=request.data)
        if not serializer.is_valid():
            print("HIRING VALIDATION ERROR:", serializer.errors)
            serializer.is_valid(raise_exception=True)
            
        hiring = HiringService.create_hiring(
            request.user, serializer.validated_data,
        )
        return Response(
            HiringDetailSerializer(hiring).data,
            status=status.HTTP_201_CREATED,
        )


class HiringDetailView(APIView):
    """GET /api/hirings/{id}/ — Get hiring detail."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        hiring = HiringService.get_hiring(pk)
        # Check involvement
        is_client = hiring.client == request.user
        is_provider = hiring.provider.user == request.user
        if not is_client and not is_provider and request.user.role != 'admin':
            return Response(
                {'detail': 'You are not authorized to view this transaction.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = HiringDetailSerializer(hiring)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HiringStatusView(APIView):
    """PATCH /api/hirings/{id}/status/ — Update hiring status."""

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        serializer = HiringStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        hiring = HiringService.update_hiring_status(
            request.user, pk, serializer.validated_data['status'],
        )
        return Response(
            HiringDetailSerializer(hiring).data,
            status=status.HTTP_200_OK,
        )
