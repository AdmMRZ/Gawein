from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.permissions import IsProvider
from main.serializers.scheduling import (
    AvailabilitySerializer,
    BookingSerializer,
    BookingCreateSerializer,
    BookingStatusSerializer,
)
from main.services.scheduling import SchedulingService


class AvailabilityListCreateView(APIView):
    """
    GET  /api/availability/ — List my availability (provider only).
    POST /api/availability/ — Create availability (provider only).
    """

    permission_classes = [IsAuthenticated, IsProvider]

    def get(self, request):
        slots = SchedulingService.list_my_availability(request.user)
        serializer = AvailabilitySerializer(slots, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AvailabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        slot = SchedulingService.create_availability(
            request.user, serializer.validated_data,
        )
        return Response(
            AvailabilitySerializer(slot).data,
            status=status.HTTP_201_CREATED,
        )


class AvailabilityDetailView(APIView):
    """
    PUT    /api/availability/{id}/ — Update availability (provider owner).
    DELETE /api/availability/{id}/ — Delete availability (provider owner).
    """

    permission_classes = [IsAuthenticated, IsProvider]

    def put(self, request, pk):
        serializer = AvailabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        slot = SchedulingService.update_availability(
            request.user, pk, serializer.validated_data,
        )
        return Response(
            AvailabilitySerializer(slot).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        SchedulingService.delete_availability(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


class BookingListCreateView(APIView):
    """
    GET  /api/bookings/ — List bookings (role-based).
    POST /api/bookings/ — Create booking (client only).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = SchedulingService.list_bookings(request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = SchedulingService.create_booking(
            request.user, serializer.validated_data,
        )
        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class BookingDetailView(APIView):
    """
    GET   /api/bookings/{id}/ — Get booking detail.
    PATCH /api/bookings/{id}/ — Update booking status.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        booking = SchedulingService.get_booking(pk)
        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        serializer = BookingStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = SchedulingService.update_booking_status(
            request.user, pk, serializer.validated_data['status'],
        )
        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_200_OK,
        )
