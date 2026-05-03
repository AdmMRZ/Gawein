from django.db import models
from django.conf import settings

class ChatRoom(models.Model):
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='client_chat_rooms'
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='provider_chat_rooms'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_rooms'
        unique_together = ('client', 'provider')
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chat: {self.client.username} & {self.provider.username}"


class Message(models.Model):
    room = models.ForeignKey(
        ChatRoom, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    text = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Msg from {self.sender.username} in Room {self.room.id}"
