from .models import Incident
from configuration.models import SystemConfig
from integrations.ops.clients import OnSpringClient
from celery import shared_task
import json

class OnSpringSyncManager:
    @staticmethod
    def push_incident(incident):
        """
        Creates or Updates an incident in OnSpring.
        """
        client = OnSpringClient(mock=True) # Load config for real usage

        if not incident.onspring_id:
            # Create
            os_id = client.create_ticket(
                title=incident.title,
                description=incident.description,
                status=incident.status
            )
            incident.onspring_id = os_id
            incident.save(update_fields=['onspring_id'])
        else:
            # Update
            client.update_ticket(
                ticket_id=incident.onspring_id,
                status=incident.status,
                description=incident.description
            )

    @staticmethod
    def handle_incoming_update(os_id, data):
        """
        Updates local incident based on OnSpring data.
        """
        try:
            incident = Incident.objects.get(onspring_id=os_id)

            # Update fields if changed
            new_status = data.get('status')
            if new_status and new_status != incident.status:
                incident.status = new_status
                incident.save()

            # Log synchronization?
        except Incident.DoesNotExist:
            print(f"Received update for unknown OnSpring ID: {os_id}")

@shared_task
def sync_onspring_changes():
    """
    Polling task.
    """
    # Check config if polling is enabled
    mode = SystemConfig.get_value('ONSPRING_SYNC_MODE', 'POLLING')
    if mode != 'POLLING':
        return

    # In a real impl, we'd query OnSpring for "Modified Since Last Run"
    # Here we mock it
    pass
