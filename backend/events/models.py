from django.db import models
from django.conf import settings

class Event(models.Model):
    class Source(models.TextChoices):
        CROWDSTRIKE = 'CROWDSTRIKE', 'CrowdStrike'
        PROOFPOINT = 'PROOFPOINT', 'ProofPoint'
        NETSKOPE = 'NETSKOPE', 'Netskope'
        SUMOLOGIC = 'SUMOLOGIC', 'Sumo Logic'
        MANUAL = 'MANUAL', 'Manual Entry'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        PROCESSING = 'PROCESSING', 'Processing'
        TRIAGED = 'TRIAGED', 'Triaged'
        PROMOTED = 'PROMOTED', 'Promoted to Incident'
        CLOSED = 'CLOSED', 'Closed'

    class Severity(models.TextChoices):
        CRITICAL = 'CRITICAL', 'Critical'
        HIGH = 'HIGH', 'High'
        MEDIUM = 'MEDIUM', 'Medium'
        LOW = 'LOW', 'Low'
        INFO = 'INFO', 'Info'

    source = models.CharField(max_length=50, choices=Source.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.INFO)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    raw_data = models.JSONField(default=dict)

    # MITRE ATT&CK
    mitre_tactics = models.JSONField(default=list, help_text="List of MITRE Tactics (e.g., Execution, Persistence)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.source}] {self.title} ({self.id})"

class Incident(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        INVESTIGATING = 'INVESTIGATING', 'Investigating'
        CONTAINMENT = 'CONTAINMENT', 'Containment'
        REMEDIATION = 'REMEDIATION', 'Remediation'
        CLOSED = 'CLOSED', 'Closed'

    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    # Links to Events
    events = models.ManyToManyField(Event, related_name='incidents')

    # OnSpring Integration
    onspring_id = models.CharField(max_length=100, blank=True, null=True, help_text="ID of the incident in OnSpring")
    onspring_url = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"INC-{self.id}: {self.title}"
