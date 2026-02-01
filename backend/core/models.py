from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom user model for Casey.
    """
    # specific fields can be added here, e.g., role, department
    department = models.CharField(max_length=100, blank=True)
    is_analyst = models.BooleanField(default=True)

    def __str__(self):
        return self.username

class AuditLog(models.Model):
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=255)
    details = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.timestamp} - {self.user} - {self.action}"
