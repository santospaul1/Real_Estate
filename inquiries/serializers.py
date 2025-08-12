from rest_framework import serializers
from .models import Inquiry
from properties.serializers import PropertySerializer

class InquirySerializer(serializers.ModelSerializer):
    property_detail = PropertySerializer(source='property', read_only=True)

    class Meta:
        model = Inquiry
        fields = ['id','property','property_detail','name','email','phone','message','created_at']
        read_only_fields = ['id','created_at','property_detail']
