from .models import Event

def apply_mitre_mapping(event):
    """
    Simple rule-based mapping for MITRE ATT&CK Tactics.
    """
    text = f"{event.title} {event.description}".lower()
    tactics = []

    if any(x in text for x in ['powershell', 'cmd.exe', 'bash']):
        tactics.append('Execution')

    if any(x in text for x in ['registry', 'scheduled task', 'startup']):
        tactics.append('Persistence')

    if any(x in text for x in ['lsass', 'mimikatz', 'shadow copy']):
        tactics.append('Credential Access')

    if any(x in text for x in ['nmap', 'scan', 'recon']):
        tactics.append('Discovery')

    if any(x in text for x in ['exfil', 'upload', 'ftp']):
        tactics.append('Exfiltration')

    if tactics:
        event.mitre_tactics = list(set(tactics))
        event.save(update_fields=['mitre_tactics'])
