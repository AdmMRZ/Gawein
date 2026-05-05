from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from main.models import ChatRoom, Message
from main.serializers.chat import ChatRoomSerializer, MessageSerializer

class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = ChatRoom.objects.filter(
            Q(client=user) | Q(provider=user)
        ).distinct().order_by('-updated_at')
        if self.action == 'list':
            return qs.filter(messages__isnull=False)
        return qs

    @action(detail=False, methods=['post'])
    def get_or_create(self, request):
        provider_id = request.data.get('provider_id')
        if not provider_id:
            return Response({'error': 'provider_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Assuming client initiates chat with provider
        client = request.user
        
        # Determine roles based on user type if needed, but for simplicity:
        room, created = ChatRoom.objects.get_or_create(
            client_id=client.id,
            provider_id=provider_id
        )
        
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        room = self.get_object()
        messages = room.messages.all().order_by('created_at')
        
        # Mark unread messages as read
        unread_messages = messages.filter(is_read=False).exclude(sender=request.user)
        if unread_messages.exists():
            unread_messages.update(is_read=True)
            
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
