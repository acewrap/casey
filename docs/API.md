# API Documentation

## Overview
Casey exposes a RESTful API for event ingestion, incident management, and system configuration.

**Base URL:** `/api/`

## Authentication
Authentication is handled via Session (local) or Okta (production). Ensure valid cookies or headers are included in requests.

## Endpoints

### Events

#### `GET /api/events/`
Retrieve a paginated list of security events.

**Parameters:**
*   `page`: Page number (default: 1)
*   `page_size`: Results per page (default: 10)
*   `source`: Filter by source (e.g., `CROWDSTRIKE`, `SPLUNK`)
*   `status`: Filter by status (e.g., `NEW`, `TRIAGED`)

#### `POST /api/events/`
Submit a new event for ingestion. This is the primary entry point for SIEM alerts.

**Request Body:**

| Field | Type | Required | Description | Choices / Example |
| :--- | :--- | :--- | :--- | :--- |
| `source` | string | **Yes** | The origin of the alert. | `CROWDSTRIKE`, `SPLUNK`, `PROOFPOINT`, `NETSKOPE`, `SUMOLOGIC`, `MANUAL`, `OTHER` |
| `title` | string | **Yes** | Short summary of the event. | "Malware Detected on Host X" |
| `description` | string | No | Detailed description or raw log content. | |
| `severity` | string | No | Perceived severity. | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO` (Default: `INFO`) |
| `status` | string | No | Initial status. | `NEW` (Default), `PROCESSING`, `TRIAGED`, `PROMOTED`, `CLOSED` |
| `mitre_tactics` | list[str] | No | Associated MITRE ATT&CK tactics. | `["Execution", "Persistence"]` |
| `indicators` | list[obj] | No | IOCs extracted from the event. | `[{"value": "1.2.3.4", "indicator_type": "IPv4"}]` |
| `raw_data` | json | No | Full JSON payload from the source system. | `{...}` |

**Example Request:**

```json
{
    "source": "CROWDSTRIKE",
    "title": "Suspicious PowerShell Execution",
    "severity": "HIGH",
    "description": "Detected encoded command line...",
    "mitre_tactics": ["Execution"],
    "indicators": [
        { "value": "powershell.exe", "indicator_type": "Process" }
    ],
    "raw_data": {
        "event_id": "12345",
        "timestamp": "2023-10-27T10:00:00Z"
    }
}
```

#### `POST /api/events/{id}/promote/`
Promote an existing Event to an Incident.

### Incidents

#### `GET /api/incidents/`
List incidents.

#### `POST /api/incidents/`
Create a new incident manually.

#### `POST /api/incidents/{id}/create_war_room/`
Trigger the creation of a WebEx War Room for the incident.

### Investigations

#### `GET /api/investigations/`
List active investigations.

#### `GET /api/investigations/{id}/`
Get details of a specific investigation.

#### `PATCH /api/investigations/{id}/`
Update investigation details (e.g. description/notes).

#### `POST /api/investigations/{id}/promote/`
Promote the investigation (and its event) to an Incident.

### Reporting & Charts

#### `GET /api/charts/`
List saved chart definitions.

#### `POST /api/charts/`
Create a new chart definition.

#### `POST /api/reporting/generate/`
Generate chart data based on query configuration.

#### `POST /api/reporting/export_excel/`
Export report data as an Excel file.

#### `POST /api/reporting/export_pdf/`
Export report data as a PDF file.

### Bulk Actions

#### `POST /api/events/bulk_status_update/`
Update the status of multiple events at once.

**Request Body:**
```json
{
  "ids": [1, 2, 3],
  "status": "FALSE_POSITIVE",
  "reason": "Scanning activity authorized by change request CR-123"
}
```
