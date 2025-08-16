from django.contrib import admin
from properties.models import Client, Property, PropertyPhoto
from users.models import User
from django.contrib.auth.hashers import make_password

# Unregister the default User admin if already registered
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'is_active', 'is_staff')
    search_fields = ('email', 'role')

    def save_model(self, request, obj, form, change):
        if form.cleaned_data.get("password"):
            obj.password = make_password(form.cleaned_data["password"])
        super().save_model(request, obj, form, change)

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


    def save_model(self, request, obj, form, change):
        if form.cleaned_data.get("password"):
            obj.password = make_password(form.cleaned_data["password"])
        super().save_model(request, obj, form, change)

