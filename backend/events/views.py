from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Event, Incident
from .serializers import EventSerializer, IncidentSerializer
from .services import promote_event_to_incident
from .sync import OnSpringSyncManager
from .permissions import HasAPIKey
import json

class OnSpringWebhookView(APIView):
    """
    Receives updates from OnSpring.
    """
    permission_classes = [HasAPIKey]

    def post(self, request):
        data = request.data
        os_id = data.get('recordId')

        if os_id:
            OnSpringSyncManager.handle_incoming_update(os_id, data)
            return Response({"status": "received"}, status=status.HTTP_200_OK)
        return Response({"error": "missing recordId"}, status=status.HTTP_400_BAD_REQUEST)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        event = self.get_object()
        incident = promote_event_to_incident(event, request.user)
        return Response(IncidentSerializer(incident).data, status=status.HTTP_201_CREATED)

from integrations.ops.clients import WebExClient

class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all().order_by('-created_at')
    serializer_class = IncidentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def create_war_room(self, request, pk=None):
        incident = self.get_object()
        client = WebExClient(mock=True)
        room_url = client.create_room(f"War Room: {incident.title}", ["analyst@example.com"])
        return Response({"room_url": room_url}, status=status.HTTP_201_CREATED)

class WebhookIngestView(APIView):
    """
    Public endpoint for ingesting alerts from SIEMs.
    """
    permission_classes = [HasAPIKey]

    def post(self, request, source=None):
        data = request.data

        # Simple normalization logic
        title = data.get('title', 'Untitled Alert')
        description = data.get('description', json.dumps(data))

        # Detect source if not provided in URL
        if not source:
            source = Event.Source.OTHER
            if 'crowdstrike' in json.dumps(data).lower():
                source = Event.Source.CROWDSTRIKE

        event = Event.objects.create(
            source=source.upper(),
            title=title,
            description=description,
            raw_data=data,
            status=Event.Status.NEW
        )

        return Response(EventSerializer(event).data, status=status.HTTP_201_CREATED)
