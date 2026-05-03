from rest_framework import serializers
from django.contrib.auth import get_user_model
from main.models import ChatRoom, Message

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'room', 'sender', 'text', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at', 'sender', 'is_read']

class ChatRoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'client', 'provider', 'created_at', 'updated_at', 'last_message', 'unread_count', 'other_user']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
            
        user = obj.provider if request.user == obj.client else obj.client
        
        # Simple representation of the other user
        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'avatar': None
        }
