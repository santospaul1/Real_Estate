from properties.models import Client
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import ClientRegistrationSerializer, ClientSerializer, UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status, permissions
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
User = get_user_model()
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password

class IsAdminOrSelf(permissions.BasePermission):
    """
    Allow access if user is admin, manager, or operating on their own object.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in ("admin", "manager"):
            return True
        return obj.id == request.user.id

class UserViewSet(viewsets.ModelViewSet):
    """
    - Admin/Manager: can list/create/delete/update any user.
    - Regular users: can retrieve and update their own profile (password via serializer).
    """
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer

    def get_permissions(self):
        # Allow only admins/managers to create/list/destroy
        if self.action in ("list", "create", "destroy"):
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ("partial_update", "update", "retrieve"):
            permission_classes = [permissions.IsAuthenticated, IsAdminOrSelf]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [p() for p in permission_classes]

    def get_queryset(self):
        # Admin/manager see all users; others see only themselves
        user = self.request.user
        if user.is_authenticated and user.role in ("admin", "manager"):
            return User.objects.all().order_by("id")
        if user.is_authenticated:
            return User.objects.filter(id=user.id)
        return User.objects.none()

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """GET /api/accounts/users/me/ -> current user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    

class RoleAwareTokenObtainPairSerializer(TokenObtainPairSerializer):
    # accept "role" from request and ensure it matches the user's role
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = getattr(user, "role", None)
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        requested_role = self.initial_data.get("role")
        user_role = getattr(self.user, "role", None)

        if requested_role and requested_role != user_role:
            raise ValidationError("Role mismatch for this user.")

        data["role"] = user_role
        data["username"] = self.user.username
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = RoleAwareTokenObtainPairSerializer

class ClientRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        full_name = request.data.get("full_name")
        email = request.data.get("email")
        password = request.data.get("password")

        if not all([full_name, email, password]):
            return Response({"detail": "full_name, email and password are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"detail": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the user as role=client
        user = User.objects.create_user(
            username=email, email=email, password=password, role="client"
        )

        # Create your domain Client record
        Client.objects.create(
            full_name=full_name,
            email=email,
            assigned_agent=None
        )

        # Option A: auto-login (return tokens now)
        refresh = RefreshToken.for_user(user)
        return Response({
            "detail": "Client registered successfully.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": "client",
            "username": user.username
        }, status=status.HTTP_201_CREATED)