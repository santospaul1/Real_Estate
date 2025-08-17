from django.contrib import admin
from django.contrib.auth.hashers import make_password
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'is_active', 'is_staff')
    search_fields = ('email', 'role')

    def save_model(self, request, obj, form, change):
        if form.cleaned_data.get("password"):
            obj.password = make_password(form.cleaned_data["password"])
        super().save_model(request, obj, form, change)
