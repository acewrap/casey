from celery import shared_task
from .models import Event, Incident
from artifacts.models import Indicator, Evidence
from .scraper import extract_indicators
from .mitre import apply_mitre_mapping
from integrations.intel.clients import VirusTotalClient, AbuseIPDBClient
from integrations.logs.clients import SplunkClient, SumoLogicClient
import json

@shared_task
def process_new_event(event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return

    # Apply MITRE Mapping
    apply_mitre_mapping(event)

    # Scrape
    text_to_scan = f"{event.title} {event.description} {json.dumps(event.raw_data)}"
    extracted = extract_indicators(text_to_scan)

    for value, ind_type in extracted:
        indicator, created = Indicator.objects.get_or_create(
            value=value,
            defaults={'indicator_type': ind_type}
        )
        indicator.related_events.add(event)

        # Trigger Enrichment & Log Search (async)
        enrich_indicator.delay(indicator.id)
        search_logs_for_indicator.delay(indicator.id)

@shared_task
def enrich_indicator(indicator_id):
    try:
        indicator = Indicator.objects.get(id=indicator_id)
    except Indicator.DoesNotExist:
        return

    # VT Lookup
    vt = VirusTotalClient(mock=True)
    try:
        data = vt.lookup_indicator(indicator.value, indicator.indicator_type)
        Evidence.objects.create(
            indicator=indicator,
            source="VirusTotal",
            data=data,
            verdict=Evidence.Verdict.MALICIOUS if data.get('malicious', 0) > 0 else Evidence.Verdict.BENIGN
        )
    except Exception as e:
        print(f"VT Error: {e}")

    # AbuseIPDB Lookup (if IP)
    if indicator.indicator_type == Indicator.Type.IP:
        ab = AbuseIPDBClient(mock=True)
        try:
            data = ab.lookup_indicator(indicator.value, indicator.indicator_type)
            Evidence.objects.create(
                indicator=indicator,
                source="AbuseIPDB",
                data=data,
                verdict=Evidence.Verdict.MALICIOUS if data.get('abuseConfidenceScore', 0) > 50 else Evidence.Verdict.BENIGN
            )
        except Exception as e:
            print(f"AbuseIPDB Error: {e}")

@shared_task
def search_logs_for_indicator(indicator_id):
    try:
        indicator = Indicator.objects.get(id=indicator_id)
    except Indicator.DoesNotExist:
        return

    # Splunk Search
    splunk = SplunkClient(mock=True)
    try:
        results = splunk.search(indicator.value)
        if results:
            Evidence.objects.create(
                indicator=indicator,
                source="Splunk",
                data={"count": len(results), "events": results},
                verdict=Evidence.Verdict.SUSPICIOUS # Presence in logs is interesting
            )
    except Exception as e:
        print(f"Splunk Error: {e}")
