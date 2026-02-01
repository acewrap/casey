from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, IncidentViewSet, WebhookIngestView, OnSpringWebhookView

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'incidents', IncidentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ingest/webhook/', WebhookIngestView.as_view(), name='webhook-ingest'),
    path('ingest/webhook/<str:source>/', WebhookIngestView.as_view(), name='webhook-ingest-source'),
    path('integrations/onspring/webhook/', OnSpringWebhookView.as_view(), name='onspring-webhook'),
]
