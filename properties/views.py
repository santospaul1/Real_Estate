from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Property
from users.models import User
from .serializers import PropertySerializer, AgentSerializer

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().select_related('agent')
    serializer_class = PropertySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def agents(self, request):
        agents = User.objects.filter(role='agent')  # filter based on your user roles
        serializer = AgentSerializer(agents, many=True)
        return Response(serializer.data)
