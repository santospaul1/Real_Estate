from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Inquiry
from .serializers import InquirySerializer

class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all().order_by('-created_at')
    serializer_class = InquirySerializer

    def get_permissions(self):
        if self.action in ('create',):
            # Allow anonymous to submit inquiry from website
            return [AllowAny()]
        return [IsAuthenticated()]
