# CASEY: Cybersecurity Case Management System

## Overview
Casey is a modular case management system designed to triage security **Events** into **Incidents** and automate log searching across a specific tech stack (CrowdStrike, Splunk, etc.) without using AI.

## Key Features
*   **Ingestion:** Webhook-based ingestion for SIEM alerts (CrowdStrike, ProofPoint).
*   **Triage Workflow:**
    *   Bulk Status Management (True/False Positive).
    *   False Positive Filtering and Reason Logging.
    *   Active Investigation mode for "True Positive" events.
*   **Automation:** Regex-based IOC extraction and automated threat intel lookups (VirusTotal, AbuseIPDB).
*   **Orchestration:** Abstracted integration layer for Log Searching (Splunk, Sumo Logic) and Actions (CrowdStrike RTR).
*   **Case Management:** Promote Investigations to Incidents with bi-directional OnSpring synchronization.
*   **Reporting:** Custom Chart creation and PDF/Excel export.
*   **Visualization:** React-based dashboard for metrics and event triage.
*   **Audit & Compliance:** Detailed audit logs for status changes and investigations.

## Architecture

### Backend (Django + Celery)
*   **Core:** User authentication and management.
*   **Events:** Data model for Events and Incidents.
*   **Artifacts:** Storage for Indicators (IPs, Hashes) and Evidence (search results).
*   **Integrations:** Modular wrappers for external APIs.
*   **Tasks:** Celery workers handle async scraping, enrichment, and sync.

### Frontend (React + MUI)
*   **Dashboard:** High-level metrics.
*   **Events:** Triage interface with bulk actions.
*   **Investigations:** Active investigation workspace.
*   **Incidents:** Case management and War Room creation.
*   **Reporting:** Analytics and data export.

## Deployment
See `docker-compose.yml` for the full stack definition.

```bash
docker-compose up --build
```

## Documentation
*   [User Guide](docs/USER_GUIDE.md)
*   [Admin Guide](docs/ADMIN_GUIDE.md)
*   [API Documentation](docs/API.md)
