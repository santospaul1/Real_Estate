from rest_framework import serializers
from .models import Property
from users.models import User  # custom user

class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class PropertySerializer(serializers.ModelSerializer):
    agent_name = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = '__all__'

    def get_agent_name(self, obj):
        return obj.agent.get_full_name() if obj.agent else None
