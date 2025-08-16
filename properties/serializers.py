# serializers.py
from rest_framework import serializers

from .models import AgentPerformance, AgentProfile, Client, CommunicationLog, Lead, Property, PropertyPhoto, Transaction
from rest_framework import serializers
from .models import Property, PropertyPhoto
from django.contrib.auth import get_user_model
User = get_user_model()

class PropertyPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyPhoto
        fields = ['id', 'image', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None
    
class PropertySerializer(serializers.ModelSerializer):
    photos = PropertyPhotoSerializer(many=True, read_only=True)
    agent_name = serializers.CharField(source='agent.username', read_only=True)

    class Meta:
        model = Property
        fields = [
            "id", "title", "description", "price", "location",
            "category", "status", "agent_name", "date_listed", "photos"
        ]

class PropertyAnalyticsSerializer(serializers.ModelSerializer):
    total_inquiries = serializers.IntegerField(read_only=True)
    time_on_market = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = ['id', 'title', 'views', 'total_inquiries', 'time_on_market']

    def get_time_on_market(self, obj):
        return obj.time_on_market

class LeadSerializer(serializers.ModelSerializer):
    assigned_to = serializers.SlugRelatedField(
        slug_field='username', queryset=User.objects.all(), required=False, allow_null=True
    )
    interested_property = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ('engagement_score', 'created_at', 'updated_at')

    def create(self, validated_data):
        lead = super().create(validated_data)
        lead.compute_score()
        lead.save(update_fields=['engagement_score'])
        return lead

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        instance.compute_score()
        instance.save(update_fields=['engagement_score'])
        return instance


class ClientSerializer(serializers.ModelSerializer):
    assigned_agent = serializers.SlugRelatedField(
        slug_field='username', queryset=User.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('created_at',)


class CommunicationLogSerializer(serializers.ModelSerializer):
    recorded_by = serializers.SlugRelatedField(
        slug_field='username', queryset=User.objects.all(), required=False, allow_null=True
    )
    related_client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), required=False, allow_null=True)

    class Meta:
        model = CommunicationLog
        fields = '__all__'


class AgentProfileSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(slug_field='username', read_only=True)

    class Meta:
        model = AgentProfile
        fields = '__all__'

class AgentPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentPerformance
        fields = ['deals_closed', 'total_commission', 'customer_satisfaction', 'last_updated']

class TransactionSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source="property.title", read_only=True)
    buyer_name = serializers.CharField(source="buyer.full_name", read_only=True)   # assuming Client has a "name" field
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)  # if using Django User with first+last

    class Meta:
        model = Transaction
        fields = [
            "id",
            "transaction_type",
            "amount",
            "commission_percent",
            "commission_amount",
            "signed_at",
            "created_at",
            "property",        # keep the id if you still want it
            "property_name",   # human readable
            "buyer",
            "buyer_name",
            "agent",
            "agent_name",
        ]
        read_only_fields = ['commission_amount', 'signed_at', 'created_at']