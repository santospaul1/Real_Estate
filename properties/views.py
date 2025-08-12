# views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Property, PropertyPhoto
from .serializers import PropertyAnalyticsSerializer, PropertySerializer
from django.db.models import Count
from rest_framework.decorators import action
from django.utils.timezone import now


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().select_related('agent').prefetch_related('photos')
    serializer_class = PropertySerializer
    

    def create(self, request, *args, **kwargs):
        # Create Property
        property_obj = Property.objects.create(
            title=request.data.get("title"),
            description=request.data.get("description"),
            price=request.data.get("price"),
            location=request.data.get("location"),
            category=request.data.get("category"),
            status=request.data.get("status", "available"),
            agent=request.user if request.user.is_authenticated else None
        )
        
    
        # Upload multiple images
        photos = request.FILES.getlist("photos")
        for photo in photos:
            PropertyPhoto.objects.create(property=property_obj, image=photo)

        return Response(PropertySerializer(property_obj).data, status=status.HTTP_201_CREATED)
    

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
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
    
  