# properties/admin.py
from django.contrib import admin
from .models import Client, Property, PropertyPhoto

class PropertyPhotoInline(admin.TabularInline):
    model = PropertyPhoto
    extra = 1
    readonly_fields = ('uploaded_at',)

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title','category','price','location','agent','date_listed')
    search_fields = ('title','location','description')
    inlines = [PropertyPhotoInline]

@admin.register(PropertyPhoto)
class PropertyPhotoAdmin(admin.ModelAdmin):
    list_display = ('property','caption','uploaded_at')
    readonly_fields = ('uploaded_at',)
@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('full_name','email','phone')

