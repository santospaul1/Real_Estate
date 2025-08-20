from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Transaction, AgentPerformance, AgentProfile

@receiver(post_save, sender=Transaction)
def update_agent_performance(sender, instance, created, **kwargs):
    if instance.agent:
        try:
            profile = instance.agent.agent_profile  # user → agent_profile
            performance, _ = AgentPerformance.objects.get_or_create(agent=profile)

            if created:
                performance.deals_closed += 1
                performance.total_commission += instance.commission_amount or 0
                performance.save(update_fields=['deals_closed', 'total_commission', 'last_updated'])
        except AgentProfile.DoesNotExist:
            pass
