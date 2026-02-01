import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Enable Eager Mode for Celery
settings.CELERY_TASK_ALWAYS_EAGER = True
settings.CELERY_BROKER_URL = 'memory://'
settings.CELERY_RESULT_BACKEND = 'db+sqlite:///results.sqlite'

from events.models import Incident, Event
from core.models import User

# Clear
Incident.objects.all().delete()
Event.objects.all().delete()

print("Creating Event...")
event = Event.objects.create(title="Test for OnSpring", source="MANUAL")

print("Promoting Event (should trigger Incident creation + OnSpring Push)...")
from events.services import promote_event_to_incident
user = User.objects.filter(is_superuser=True).first()
incident = promote_event_to_incident(event, user)

print(f"Incident Created: {incident}")
print(f"OnSpring ID: {incident.onspring_id}")

if incident.onspring_id:
    print("SUCCESS: OnSpring ID populated.")
else:
    print("FAILURE: OnSpring ID missing.")
