# serializers.py
from rest_framework import serializers
from .models import Property, PropertyPhoto
from rest_framework import serializers
from .models import Property, PropertyPhoto

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
