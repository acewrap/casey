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
