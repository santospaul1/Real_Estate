from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsAgent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'agent')

class IsManager(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'manager')

class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ('admin','manager'))
from rest_framework.permissions import BasePermission

class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ('admin', 'manager'))

class IsAgentAssignedOrReadOnly(BasePermission):
    """
    Agents can only access Leads assigned to them.
    Admins and Managers can access all.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ('admin', 'manager'):
            return True
        if user.role == 'agent':
            return obj.assigned_to == user
        return False

    def has_permission(self, request, view):
        # Allow list, create only if authenticated, detail check in has_object_permission
        return bool(request.user and request.user.is_authenticated)
