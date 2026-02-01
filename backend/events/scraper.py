import re
from typing import List, Tuple
from artifacts.models import Indicator

def extract_indicators(text: str) -> List[Tuple[str, str]]:
    """
    Extracts IPs, Hashes, Domains from text.
    Returns list of (value, type).
    """
    indicators = []

    # Regex Patterns
    # IPv4
    ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
    # MD5/SHA1/SHA256 (simplified)
    hash_pattern = r'\b[a-fA-F0-9]{32,64}\b'
    # Domain (simplified)
    domain_pattern = r'\b(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}\b'

    for match in re.findall(ip_pattern, text):
        indicators.append((match, Indicator.Type.IP))

    for match in re.findall(hash_pattern, text):
        indicators.append((match, Indicator.Type.HASH))

    for match in re.findall(domain_pattern, text):
        if not re.match(ip_pattern, match): # Avoid matching IPs as domains
            indicators.append((match, Indicator.Type.DOMAIN))

    return list(set(indicators)) # Deduplicate
