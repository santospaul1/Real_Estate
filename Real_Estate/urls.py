from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/', include('properties.urls')),
    path('api/', include('users.urls')),  # if you add user profile endpoints later
    path('api/inquiries/', include('inquiries.urls')),
    path('api/auth/', include('rest_framework.urls')),  # browsable API login
] +static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)