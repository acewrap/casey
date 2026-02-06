# Architecture Documentation

## Overview

Casey uses a modular, plugin-based architecture for enrichment and alert ingestion, powered by Django, Celery, and AsyncIO.

### Core Components

1.  **Event Ingestion**:
    *   Webhooks (`WebhookIngestView`) receive raw alerts.
    *   Events are stored in PostgreSQL.
    *   Background tasks (`Celery`) are triggered immediately.

2.  **Async Enrichment Engine**:
    *   The `run_enrichments` task executes asynchronously.
    *   It uses `asyncio.gather` to run multiple plugins concurrently.
    *   This ensures that slow external APIs (like VirusTotal or CrowdStrike) do not block the processing pipeline.

3.  **Plugin System**:
    *   Located in `backend/plugins/`.
    *   **BasePlugin**: Abstract base class defining the interface.
    *   **Registry**: dynamically discovers and loads plugins from `backend/plugins/implementations/`.
    *   **Implementations**: Individual files for each integration (e.g., `crowdstrike.py`, `netskope.py`).

4.  **Persistence**:
    *   **Event**: The core alert.
    *   **Evidence**: Stores enrichment results. Linked to `Event`, `Incident`, or `Indicator`.
    *   **Indicator**: Extractable artifacts (IPs, Hashes) that are also enriched.

5.  **Secret Management**:
    *   `SecretManager` handles credentials.
    *   **Local**: Reads from environment variables.
    *   **Production**: Fetches from AWS Secrets Manager (mocked for now).

## Data Flow

1.  **Alert Arrives** -> `WebhookIngestView` -> `Event` created.
2.  **Task Triggered** -> `process_new_event` (Celery).
3.  **Extraction** -> Indicators (IPs, URLs) are extracted from event text.
4.  **Enrichment** -> `run_enrichments` calls `enrich()` on all plugins.
5.  **Aggregation** -> Plugin results are saved as `Evidence` records linked to the Event.
6.  **Review** -> Analysts view the Event and associated Evidence in the UI.

## Database Schema (Key Models)

### Event
*   `source`: origin of the alert.
*   `status`: NEW, TRIAGED, FALSE_POSITIVE, etc.
*   `raw_data`: Original JSON payload.

### Evidence
*   `event`: FK to Event.
*   `source`: Plugin name (e.g., "CrowdStrike").
*   `data`: JSON result from the plugin.
*   `verdict`: MALICIOUS, SUSPICIOUS, BENIGN, INFO.

## IAM Roles & Permissions

For AWS Secrets Manager integration in production:
*   The EC2 instance or ECS task requires an IAM Role.
*   Policy: `secretsmanager:GetSecretValue` on the relevant ARNs.
