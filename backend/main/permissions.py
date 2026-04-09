from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsClient(BasePermission):
    """Allow access only to client users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'client'
        )


class IsProvider(BasePermission):
    """Allow access only to provider users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'provider'
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow access to the object owner or admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class IsProviderOwner(BasePermission):
    """Allow access only to the provider who owns the resource."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'provider'
        )

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'provider'):
            return obj.provider.user == request.user
        return False


class IsInvolvedParty(BasePermission):
    """Allow access only to client or provider involved in the transaction."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        # Check if user is the client
        if hasattr(obj, 'client') and obj.client == user:
            return True
        # Check if user is the provider
        if hasattr(obj, 'provider') and obj.provider.user == user:
            return True
        # Admin override
        if user.role == 'admin':
            return True
        return False


class IsClientOfCompletedHiring(BasePermission):
    """Allow review only by the client of a completed hiring."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'client'
        )
