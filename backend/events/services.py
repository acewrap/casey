from .models import Event, Incident
from django.db import transaction

def promote_event_to_incident(event, user=None):
    """
    Promotes an Event to an Incident.
    """
    if event.status == Event.Status.PROMOTED:
        # Check if already linked to an incident
        existing = event.incidents.first()
        if existing:
            return existing

    with transaction.atomic():
        incident = Incident.objects.create(
            title=f"Incident from {event.source}: {event.title}",
            description=event.description,
            status=Incident.Status.OPEN,
            owner=user
        )
        incident.events.add(event)

        event.status = Event.Status.PROMOTED
        event.save()

        # Trigger OnSpring Sync (Signal will handle this)

    return incident
