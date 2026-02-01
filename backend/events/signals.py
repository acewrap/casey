from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Event
from .tasks import process_new_event
from .models import Incident
from .sync import OnSpringSyncManager

@receiver(post_save, sender=Event)
def event_created(sender, instance, created, **kwargs):
    if created:
        # Trigger Celery task
        process_new_event.delay(instance.id)

@receiver(post_save, sender=Incident)
def incident_saved(sender, instance, created, **kwargs):
    # Avoid infinite loop if save() called inside sync manager
    # In real app, check 'update_fields' or use a flag

    # We simply push. The Manager checks if ID exists to determine Create vs Update.
    # Note: Ideally this should be async (Celery), but sync for now for simplicity of demo
    OnSpringSyncManager.push_incident(instance)
