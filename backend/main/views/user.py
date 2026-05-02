from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.services.user import UserService
from main.models import PaymentCard
from main.serializers.user import PaymentCardSerializer


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


class PaymentCardListCreateView(APIView):
    """GET/POST /api/payment-cards/ - Manage current user's cards."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        cards = PaymentCard.objects.filter(user=request.user)
        serializer = PaymentCardSerializer(cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PaymentCardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        is_first_card = not PaymentCard.objects.filter(user=request.user).exists()
        serializer.save(user=request.user, is_primary=is_first_card)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PaymentCardDetailView(APIView):
    """DELETE /api/payment-cards/<id>/ - Remove current user's card."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            card = PaymentCard.objects.get(pk=pk, user=request.user)
        except PaymentCard.DoesNotExist:
            return Response({'detail': 'Card not found.'}, status=status.HTTP_404_NOT_FOUND)

        was_primary = card.is_primary
        card.delete()

        if was_primary:
            next_card = PaymentCard.objects.filter(user=request.user).first()
            if next_card:
                next_card.is_primary = True
                next_card.save(update_fields=['is_primary', 'updated_at'])

        return Response(status=status.HTTP_204_NO_CONTENT)
