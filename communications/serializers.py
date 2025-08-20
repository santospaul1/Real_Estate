
from rest_framework import serializers
from .models import Communication

class CommunicationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)
    recipient_name = serializers.CharField(source="recipient.username", read_only=True)

    class Meta:
        model = Communication
        fields = [
            "id", "sender", "sender_role", "recipient", "message",
            "created_at", "broadcast_to_agents", "sender_name", "recipient_name"
        ]
        read_only_fields = ["sender", "sender_role", "created_at"]
