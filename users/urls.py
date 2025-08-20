from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import CustomTokenObtainPairView
from .views import ClientRegistrationView, me_view

urlpatterns = [
    path("api/auth/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/register-client/", ClientRegistrationView.as_view(), name="register_client"),
    path('register-client/', ClientRegistrationView.as_view(), name='register-client'),
    path("/me/", me_view, name="me"),
    path("api/", include("properties.urls")),   # your existing routers (properties, clients, etc.)
]
