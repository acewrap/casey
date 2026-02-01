from django.db import models
from events.models import Incident, Event

class Indicator(models.Model):
    class Type(models.TextChoices):
        IP = 'IP', 'IP Address'
        HASH = 'HASH', 'File Hash'
        DOMAIN = 'DOMAIN', 'Domain'
        URL = 'URL', 'URL'
        EMAIL = 'EMAIL', 'Email Address'

    value = models.CharField(max_length=512, unique=True)
    indicator_type = models.CharField(max_length=20, choices=Type.choices)

    # Relationships for correlation
    related_events = models.ManyToManyField(Event, related_name='indicators')

    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.value} ({self.indicator_type})"

class Evidence(models.Model):
    """
    Stores enrichment data or search results associated with an Incident or Indicator.
    """
    class Verdict(models.TextChoices):
        MALICIOUS = 'MALICIOUS', 'Malicious'
        SUSPICIOUS = 'SUSPICIOUS', 'Suspicious'
        BENIGN = 'BENIGN', 'Benign'
        UNKNOWN = 'UNKNOWN', 'Unknown'

    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='evidence', null=True, blank=True)
    indicator = models.ForeignKey(Indicator, on_delete=models.CASCADE, related_name='evidence', null=True, blank=True)

    source = models.CharField(max_length=100, help_text="Source of this evidence (e.g. VirusTotal, Splunk)")
    data = models.JSONField(default=dict, help_text="The full raw response/report")
    verdict = models.CharField(max_length=20, choices=Verdict.choices, default=Verdict.UNKNOWN)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence from {self.source} for {self.indicator or self.incident}"
