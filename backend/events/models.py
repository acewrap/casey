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
        FALSE_POSITIVE = 'FALSE_POSITIVE', 'False Positive'
        TRUE_POSITIVE = 'TRUE_POSITIVE', 'True Positive'
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
    status_change_reason = models.TextField(null=True, blank=True, help_text="Reason for the latest status change (e.g. why FP/TP)")
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

class Investigation(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name='investigation')
    description = models.TextField(blank=True, help_text="Markdown enabled analyst notes")
    tags = models.JSONField(default=list)
    timeline = models.JSONField(default=list, help_text="List of timeline events")

    # Relationships
    indicators = models.ManyToManyField('artifacts.Indicator', related_name='investigations', blank=True)
    related_events = models.ManyToManyField(Event, related_name='related_investigations', symmetrical=False, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Investigation for {self.event.title}"

class ChartDefinition(models.Model):
    class ChartType(models.TextChoices):
        BAR = 'BAR', 'Bar Chart'
        LINE = 'LINE', 'Line Chart'
        PIE = 'PIE', 'Pie Chart'
        TABLE = 'TABLE', 'Table'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='charts')
    title = models.CharField(max_length=255)
    chart_type = models.CharField(max_length=20, choices=ChartType.choices)
    query_config = models.JSONField(default=dict, help_text="Configuration for the query (filters, grouping)")
    is_global = models.BooleanField(default=False, help_text="Visible to all users")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

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
