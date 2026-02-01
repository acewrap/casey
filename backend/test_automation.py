import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Enable Eager Mode for Celery
settings.CELERY_TASK_ALWAYS_EAGER = True

from events.models import Event
from artifacts.models import Indicator, Evidence

# Clear existing
Event.objects.all().delete()
Indicator.objects.all().delete()
Evidence.objects.all().delete()

# Create Event with indicators
print("Creating Event...")
event = Event.objects.create(
    title="Suspicious Activity from 1.2.3.4",
    description="We detected malware hash 5d41402abc4b2a76b9719d911017c592 calling out to evil.com.",
    source=Event.Source.CROWDSTRIKE
)

# Check results
print(f"Event Created: {event}")
print("Checking Indicators...")
indicators = Indicator.objects.all()
for i in indicators:
    print(f" - Found: {i}")

print("Checking Evidence...")
evidence = Evidence.objects.all()
for e in evidence:
    print(f" - Evidence: {e.source} -> {e.verdict} for {e.indicator}")

if len(indicators) >= 3 and len(evidence) > 0:
    print("SUCCESS: Automation worked!")
else:
    print("FAILURE: Missing indicators or evidence.")
