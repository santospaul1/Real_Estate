from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import CustomTokenObtainPairView, ClientRegisterView  # we'll create these
from .views import ClientRegistrationView

urlpatterns = [
    path("api/auth/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/register-client/", ClientRegisterView.as_view(), name="register_client"),
    path('register-client/', ClientRegistrationView.as_view(), name='register-client'),

    path("api/", include("properties.urls")),   # your existing routers (properties, clients, etc.)
]
