from celery import shared_task
from .models import Event, Incident
from artifacts.models import Indicator, Evidence
from .scraper import extract_indicators
from .mitre import apply_mitre_mapping
from plugins.registry import PluginRegistry
from asgiref.sync import async_to_sync
import asyncio
import json
import logging

logger = logging.getLogger(__name__)

async def _run_plugins_concurrently(event_id):
    """
    Async helper to run all registered plugins concurrently for a given event.
    """
    try:
        # Re-fetch event inside async context to be safe,
        # though passing objects across sync/async boundaries in Django needs care.
        # It's safer to pass IDs and fetch using sync_to_async or just rely on the ID.
        # Since we are inside a Celery task, we can use sync DB access or async.
        # To avoid "SynchronousOnlyOperation" in async context, we should wrap DB calls.

        # NOTE: Django 5.x supports async ORM.
        event = await Event.objects.aget(id=event_id)

        plugins = PluginRegistry.get_all_plugins()
        tasks = []

        for name, plugin in plugins.items():
            logger.info(f"Scheduling plugin {name} for event {event.id}")
            tasks.append(plugin.enrich(event))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Plugin execution failed: {result}")
                continue

            if result:
                # Save Evidence
                # We need to do this carefully if we are in async mode
                # Use sync_to_async or simply await creation if Django supports it
                await Evidence.objects.acreate(
                    event=event,
                    source=result.get('source', 'Unknown Plugin'),
                    data=result.get('data', {}),
                    verdict=result.get('verdict', Evidence.Verdict.UNKNOWN)
                )

    except Event.DoesNotExist:
        logger.error(f"Event {event_id} not found during plugin execution")

@shared_task
def run_enrichments(event_id):
    """
    Celery task that bridges Sync -> Async to run plugins.
    """
    async_to_sync(_run_plugins_concurrently)(event_id)


@shared_task
def process_new_event(event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return

    # Apply MITRE Mapping
    apply_mitre_mapping(event)

    # Scrape Indicators
    text_to_scan = f"{event.title} {event.description} {json.dumps(event.raw_data)}"
    extracted = extract_indicators(text_to_scan)

    for value, ind_type in extracted:
        indicator, created = Indicator.objects.get_or_create(
            value=value,
            defaults={'indicator_type': ind_type}
        )
        indicator.related_events.add(event)

    # Trigger Async Plugin Enrichment Framework
    run_enrichments.delay(event.id)
