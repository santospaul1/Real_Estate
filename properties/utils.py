from django.db.models import Count, Q
from .models import AgentProfile, Lead

def assign_lead_to_agent(lead: Lead):
    agents = AgentProfile.objects.filter(active=True)

    if lead.preferred_location:
        agents = agents.filter(territory__icontains=lead.preferred_location)

    agents = agents.annotate(
        active_leads=Count('user__assigned_leads', filter=Q(user__assigned_leads__stage__in=['lead', 'prospect']))
    )

    agent = agents.order_by('active_leads').first()

    if agent:
        lead.assigned_to = agent.user
        lead.save(update_fields=['assigned_to'])
        return agent.user
    return None
