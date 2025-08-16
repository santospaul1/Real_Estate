from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, TransactionViewSet, agent_performance_summary, property_analytics
from .views import LeadViewSet, ClientViewSet, CommunicationLogViewSet, AgentProfileViewSet

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'leads', LeadViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'communications', CommunicationLogViewSet)
router.register(r'agentprofiles', AgentProfileViewSet, basename='agentprofile')
router.register(r'transactions', TransactionViewSet, basename='transaction')

#router.register(r'agent-performance', agent_performance_summary)


urlpatterns = [
    path('', include(router.urls)),
    path('property-analytics/', property_analytics, name='property-analytics'),
    path('dashboard/agent-performance/', agent_performance_summary, name='agent-performance-summary'),
]
