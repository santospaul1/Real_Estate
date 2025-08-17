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
# core/permissions.py
from rest_framework import permissions

class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'manager')

class IsAgentOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role in ('admin', 'manager', 'agent'))

class IsAgentAssignedOrReadOnly(permissions.BasePermission):
    """
    Admin/Manager -> full
    Agent -> only items assigned to them (write), can read all if you prefer set otherwise
    Others -> read-only or none
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ('admin', 'manager'):
            return True
        # Leads & Clients both use `assigned_to` or `assigned_agent`
        assigned_user = getattr(obj, 'assigned_to', None) or getattr(obj, 'assigned_agent', None)
        if user.role == 'agent':
            if request.method in permissions.SAFE_METHODS:
                return True
            return assigned_user == user
        # default: deny modification
        return request.method in permissions.SAFE_METHODS
