import os
import django
import time
from django.db import connection
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from events.models import Event, Investigation
from artifacts.models import Indicator

def setup_data(num_investigations=20):
    User = get_user_model()
    user, _ = User.objects.get_or_create(username='benchmark_user')

    # Cleanup
    Investigation.objects.all().delete()
    Event.objects.all().delete()
    Indicator.objects.all().delete()

    indicators = []
    for i in range(10):
        indicators.append(Indicator.objects.create(value=f'indicator-{i}', indicator_type=Indicator.Type.IP))

    for i in range(num_investigations):
        event = Event.objects.create(
            title=f'Event {i}',
            source=Event.Source.OTHER,
            status=Event.Status.TRUE_POSITIVE
        )
        event.indicators.add(*indicators[:3]) # Add 3 indicators to each event

        investigation = Investigation.objects.create(event=event)
        investigation.indicators.add(*indicators[3:6]) # Add 3 indicators to each investigation

        # Add some related events
        related_event1 = Event.objects.create(title=f'Related Event {i}-1', source=Event.Source.OTHER)
        related_event1.indicators.add(*indicators[6:8])
        related_event2 = Event.objects.create(title=f'Related Event {i}-2', source=Event.Source.OTHER)
        related_event2.indicators.add(*indicators[8:10])

        investigation.related_events.add(related_event1, related_event2)

    return user

def run_benchmark():
    user = setup_data()
    client = APIClient()
    client.force_authenticate(user=user)

    # Warm up
    client.get('/api/investigations/')

    connection.queries_log.clear()
    start_time = time.time()
    response = client.get('/api/investigations/')
    end_time = time.time()

    num_queries = len(connection.queries)
    duration = end_time - start_time

    print(f"Number of investigations: {Investigation.objects.count()}")
    print(f"Number of queries: {num_queries}")
    print(f"Duration: {duration:.4f} seconds")

    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        print(response.data)

if __name__ == "__main__":
    run_benchmark()
