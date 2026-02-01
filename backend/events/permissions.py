from rest_framework import permissions
from configuration.models import SystemConfig

class HasAPIKey(permissions.BasePermission):
    def has_permission(self, request, view):
        # In dev, allow if no key configured
        api_key = SystemConfig.get_value('INGESTION_API_KEY')
        if not api_key:
            return True

        # Check header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return False

        token = auth_header.split(' ')[1]
        return token == api_key
