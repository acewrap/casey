from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, IncidentViewSet, InvestigationViewSet, ChartDefinitionViewSet, ReportingViewSet, WebhookIngestView, OnSpringWebhookView, GlobalSearchView

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'investigations', InvestigationViewSet)
router.register(r'charts', ChartDefinitionViewSet, basename='chartdefinition')
router.register(r'reporting', ReportingViewSet, basename='reporting')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('ingest/webhook/', WebhookIngestView.as_view(), name='webhook-ingest'),
    path('ingest/webhook/<str:source>/', WebhookIngestView.as_view(), name='webhook-ingest-source'),
    path('integrations/onspring/webhook/', OnSpringWebhookView.as_view(), name='onspring-webhook'),
]
