from django.contrib import admin
from .models import Indicator, Evidence

@admin.register(Indicator)
class IndicatorAdmin(admin.ModelAdmin):
    list_display = ('value', 'indicator_type', 'first_seen', 'last_seen')
    list_filter = ('indicator_type',)
    search_fields = ('value',)

@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ('source', 'verdict', 'indicator', 'incident', 'created_at')
    list_filter = ('source', 'verdict')
    search_fields = ('source',)
