# views.py
from inquiries.models import Inquiry
from rest_framework import viewsets, status,generics,filters
from rest_framework.response import Response
from .models import AgentPerformance, CommunicationLog, Property, PropertyPhoto, Transaction
from .serializers import AgentPerformanceSerializer, CommunicationLogSerializer, PropertyAnalyticsSerializer, PropertySerializer, TransactionSerializer
from django.db.models import Count, Sum,Q
from rest_framework.decorators import action
from django.utils.timezone import now
from django.db.models import Count, Avg, F, ExpressionWrapper, DurationField
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Lead, Client, CommunicationLog, AgentProfile
from .serializers import LeadSerializer, ClientSerializer, CommunicationLogSerializer, AgentProfileSerializer
from users.permissions import IsAdminOrManager, IsAgentAssignedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().select_related('agent').prefetch_related('photos')
    serializer_class = PropertySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    # ✅ move these OUTSIDE retrieve()
    filterset_fields = ['category', 'status', 'location', 'price']
    search_fields = ['title', 'description', 'location', 'category']
    ordering_fields = ['price', 'date_listed']

    def get_permissions(self):
        if self.action in ['list']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        property_obj = Property.objects.create(
            title=request.data.get("title"),
            description=request.data.get("description"),
            price=request.data.get("price"),
            location=request.data.get("location"),
            category=request.data.get("category"),
            status=request.data.get("status", "available"),
            agent=request.user if request.user.is_authenticated else None
        )
        
        photos = request.FILES.getlist("photos")
        for photo in photos:
            PropertyPhoto.objects.create(property=property_obj, image=photo)

        return Response(PropertySerializer(property_obj).data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        old_status = instance.status

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        property_obj = serializer.save()

        # if property closed, update agent performance
        if old_status != "closed" and property_obj.status == "sold":
            if property_obj.assigned_agent:
                commission = property_obj.price * 0.03  
                agent = property_obj.agent
                agent.total_commission += commission
                agent.deals_closed += 1
                agent.save()

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=["views"])
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        property_obj = self.get_object()
        inquiries_count = property_obj.inquiries.count()
        data = {
            "title": property_obj.title,
            "views": property_obj.views,
            "inquiries": inquiries_count,
            "days_on_market": property_obj.time_on_market,
        }
        return Response(data)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def property_analytics(request):
    properties = Property.objects.annotate(
        inquiries_count=Count('inquiries'),
        days_on_market=ExpressionWrapper(
            now() - F('date_listed'), output_field=DurationField()
        )
    ).values('id', 'title', 'inquiries_count', 'views', 'days_on_market')

    total_inquiries = Inquiry.objects.count()
    avg_days_on_market = properties.aggregate(avg_days=Avg('days_on_market'))['avg_days']

    return Response({
        "total_inquiries": total_inquiries,
        "avg_days_on_market": avg_days_on_market.days if avg_days_on_market else 0,
        "properties": list(properties)
    })  

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all().order_by('-created_at')
    serializer_class = LeadSerializer

    def get_permissions(self):
        if self.action in ['list', 'create']:
            permission_classes = [IsAdminOrManager | IsAgentAssignedOrReadOnly]
        else:
            # retrieve, update, partial_update, destroy
            permission_classes = [IsAgentAssignedOrReadOnly]
        return [p() for p in permission_classes]
    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'manager', ):
            return Lead.objects.all().order_by('-created_at')
        elif user.role == 'agent':
            return Lead.objects.filter(assigned_to=user.agent_profile).order_by('-created_at')
        return Lead.objects.none()
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        lead_data = serializer.validated_data
        territory = lead_data.get("preferred_location")
        specialization = None
        if lead_data.get("interested_property"):
            specialization = lead_data["interested_property"].category  # adjust if different

        agents = AgentProfile.objects.annotate(total_leads=Count("assigned_leads"))
        print(f"Found {agents.count()} agents before filtering")

        best_agent = (
            agents.filter(Q(territory=territory) & Q(specialization=specialization))
            .order_by("total_leads")
            .first()
        )

        if not best_agent:
            best_agent = (
                agents.filter(territory=territory)
                .order_by("total_leads")
                .first()
            )

        if not best_agent:
            best_agent = agents.order_by("total_leads").first()

        lead = serializer.save(assigned_to=best_agent)
        print(f"Assigned lead to agent: {best_agent.user.username if best_agent else 'None'}")

        return Response(
            LeadSerializer(lead).data,
            status=status.HTTP_201_CREATED,
        )
    

    
class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer
    

    def get_permissions(self):
        if self.action in ['list', 'create']:
            permission_classes = [IsAdminOrManager | IsAgentAssignedOrReadOnly]
        else:
            permission_classes = [IsAgentAssignedOrReadOnly]
        return [p() for p in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'manager'):
            return Client.objects.all().order_by('-created_at')
        elif user.role == 'agent':
            return Client.objects.filter(assigned_agent=user).order_by('-created_at')
        return Client.objects.none()

class CommunicationLogViewSet(viewsets.ModelViewSet):
    queryset = CommunicationLog.objects.all()
    serializer_class = CommunicationLogSerializer
    #permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['related_client', 'direction', 'recorded_by']
    ordering_fields = ['timestamp']


class AgentProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AgentProfile.objects.all()
    
    
    serializer_class = AgentProfileSerializer
    #permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__username', 'specialization', 'territory']

    
    def get_queryset(self):
        agents = AgentProfile.objects.all()
        print(agents)
        return AgentProfile.objects.all()


class IsAgentOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role in ('admin', 'manager', 'agent'))

    def has_object_permission(self, request, view, obj):
        # Admin/Manager can access all, Agent only their own
        if request.user.role in ('admin', 'manager'):
            return True
        return obj.agent.user == request.user

class AgentPerformanceDetail(generics.RetrieveAPIView):
    serializer_class = AgentPerformanceSerializer
    permission_classes = [IsAgentOrAdmin]

    def get_object(self):
        agent_user_id = self.kwargs['agent_user_id']
        # Verify user can access this agent's performance
        try:
            profile = AgentProfile.objects.get(user_id=agent_user_id)
            performance = AgentPerformance.objects.get(agent=profile)
        except (AgentProfile.DoesNotExist, AgentPerformance.DoesNotExist):
            raise PermissionDenied("Performance data not found")

        if self.request.user.role == 'agent' and self.request.user.id != int(agent_user_id):
            raise PermissionDenied("You do not have permission to view this data")

        return performance

class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'manager']

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('property', 'buyer', 'agent').all().order_by('-created_at')
    
    serializer_class = TransactionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsAdminOrManager]
        return [p() for p in permission_classes]
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agent_performance_summary(request):
    agents = AgentProfile.objects.filter(active=True).select_related('user')
    data = []

    for agent in agents:
        transactions = Transaction.objects.filter(agent=agent.user)
        deals_closed = transactions.count()
        total_commission = transactions.aggregate(total=Sum('commission_amount'))['total'] or 0
        data.append({
            'agent_id': agent.id,
            'username': agent.user.username,
            'deals_closed': deals_closed,
            'total_commission': float(total_commission),
        })
    return Response(data)

