# communications/urls.py
from django.urls import path
from .views import (
    CommunicationListCreateView,
    reply_to_client,
    reply_to_agent,
    message_admin,
)

urlpatterns = [
    path("", CommunicationListCreateView.as_view(), name="communications"),
    path("reply-to-client/<int:client_id>/", reply_to_client, name="reply-to-client"),
    path("reply-to-agent/<int:agent_id>/", reply_to_agent, name="reply-to-agent"),
    path("message-admin/", message_admin, name="message-admin"),
]
