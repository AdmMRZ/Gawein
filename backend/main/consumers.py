import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']

        if self.user.is_anonymous:
            await self.close()
            return

        # Check if user has access to this room
        has_access = await self.check_room_access()
        if not has_access:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message')

        if not message:
            return

        # Save message to database
        saved_msg = await self.save_message(message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'id': saved_msg.id,
                'message': saved_msg.text,
                'sender_id': self.user.id,
                'created_at': saved_msg.created_at.isoformat()
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'message': event['message'],
            'sender_id': event['sender_id'],
            'created_at': event['created_at']
        }))

    @database_sync_to_async
    def check_room_access(self):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            return room.client == self.user or room.provider == self.user
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, text):
        room = ChatRoom.objects.get(id=self.room_id)
        msg = Message.objects.create(room=room, sender=self.user, text=text)
        # Update room updated_at
        room.save()
        return msg
