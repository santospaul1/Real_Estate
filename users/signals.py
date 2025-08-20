# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver

from properties.models import AgentProfile
from .models import User

@receiver(post_save, sender=User)
def create_agent_profile(sender, instance, created, **kwargs):
    if created and instance.role == "agent":
        AgentProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_agent_profile(sender, instance, **kwargs):
    if instance.role == "agent":
        if hasattr(instance, "agent_profile"):
            instance.agent_profile.save()
