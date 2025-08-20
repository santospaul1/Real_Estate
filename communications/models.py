
from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Communication(models.Model):
    SENDER_ROLES = (
        ('client', 'Client'),
        ('agent', 'Agent'),
        ('admin', 'Admin'),
    )

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    sender_role = models.CharField(max_length=10, choices=SENDER_ROLES)

    # Who receives this message (optional for "broadcast")
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True, related_name="received_messages"
    )

    # Message content
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    # Special flag if Admin wants to message all Agents
    broadcast_to_agents = models.BooleanField(default=False)

    def __str__(self):
        if self.broadcast_to_agents:
            return f"[Broadcast] {self.sender.username} → All Agents"
        return f"{self.sender.username} → {self.recipient.username if self.recipient else 'N/A'}"
