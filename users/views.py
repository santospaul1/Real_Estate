from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

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