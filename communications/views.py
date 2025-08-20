# communications/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from .models import Communication
from .serializers import CommunicationSerializer
from django.db.models import Q


User = get_user_model()

class CommunicationListCreateView(generics.ListCreateAPIView):
    queryset = Communication.objects.all().order_by("-created_at")
    serializer_class = CommunicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Communication.objects.all().order_by("-created_at")
        elif user.role == "agent":
            return Communication.objects.filter(
                Q(sender=user) |
                Q(recipient=user) |
                Q(broadcast_to_agents=True)
            ).order_by("-created_at")
        elif user.role == "client":
            return Communication.objects.filter(
                Q(sender=user) |
                Q(recipient=user)
            ).order_by("-created_at")
        return Communication.objects.none()

    def perform_create(self, serializer):
        sender = self.request.user
        data = serializer.validated_data

        # Set sender & role automatically
        serializer.save(sender=sender, sender_role=sender.role)

        # Admin broadcast case
        if sender.role == "admin" and data.get("broadcast_to_agents"):
            # Create messages for each agent
            agents = User.objects.filter(role="agent")
            for agent in agents:
                if agent != sender:
                    Communication.objects.create(
                        sender=sender,
                        sender_role="admin",
                        recipient=agent,
                        message=data["message"],
                    )

# communications/views.py (continued)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def reply_to_client(request, client_id):
    """Admin or Agent replies directly to a client"""
    try:
        client = User.objects.get(id=client_id, role="client")
    except User.DoesNotExist:
        return Response({"error": "Client not found"}, status=404)

    msg = request.data.get("message")
    comm = Communication.objects.create(
        sender=request.user,
        sender_role=request.user.role,
        recipient=client,
        message=msg,
    )
    return Response(CommunicationSerializer(comm).data)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def reply_to_agent(request, agent_id):
    """Admin replies directly to an agent"""
    try:
        agent = User.objects.get(id=agent_id, role="agent")
    except User.DoesNotExist:
        return Response({"error": "Agent not found"}, status=404)

    msg = request.data.get("message")
    comm = Communication.objects.create(
        sender=request.user,
        sender_role=request.user.role,
        recipient=agent,
        message=msg,
    )
    return Response(CommunicationSerializer(comm).data)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def message_admin(request):
    """Client or Agent sends message to Admin (auto-pick superuser)"""
    admin = User.objects.filter(role="admin", is_superuser=True).first()
    if not admin:
        return Response({"error": "No admin found"}, status=404)

    msg = request.data.get("message")
    comm = Communication.objects.create(
        sender=request.user,
        sender_role=request.user.role,
        recipient=admin,
        message=msg,
    )
    return Response(CommunicationSerializer(comm).data)
