from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.serializers.transaction import HiringDetailSerializer
from main.services.hiring import HiringService


class HistoryListView(APIView):
    """GET /api/history/ — List hiring history for authenticated user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        hirings = HiringService.get_history(request.user)
        serializer = HiringDetailSerializer(hirings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HistoryDetailView(APIView):
    """GET /api/history/{id}/ — Get a single history entry."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        hiring = HiringService.get_history_detail(request.user, pk)
        serializer = HiringDetailSerializer(hiring)
        return Response(serializer.data, status=status.HTTP_200_OK)
