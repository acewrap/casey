from django.contrib import admin
from .models import Event, Incident

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'source', 'status', 'severity', 'created_at')
    list_filter = ('source', 'status', 'severity')
    search_fields = ('title', 'description')

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'owner', 'onspring_id', 'created_at')
    list_filter = ('status', 'owner')
    search_fields = ('title', 'description', 'onspring_id')
