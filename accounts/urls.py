# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import CustomTokenObtainPairView

urlpatterns = [
   path("api/auth/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
   path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
