from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_analyst', 'department', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Casey Info', {'fields': ('is_analyst', 'department')}),
    )
