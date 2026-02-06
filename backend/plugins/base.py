from abc import ABC, abstractmethod
from typing import Dict, Any, List
from core.secrets import SecretManager

class BasePlugin(ABC):
    """
    Abstract Base Class for all Casey Plugins.
    Plugins are used for both Enrichment and Alert Ingestion.
    """

    def __init__(self):
        self.secrets = SecretManager()

    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the plugin"""
        pass

    @property
    def description(self) -> str:
        """Description of what the plugin does"""
        return ""

    @abstractmethod
    async def enrich(self, event) -> Dict[str, Any]:
        """
        Enriches an Event.
        Args:
            event: The Event model instance.
        Returns:
            Dict: data to be stored as Evidence.
                  Should contain keys like 'source', 'data', 'verdict'.
                  Return None if no relevant info found.
        """
        pass

    # Optional: Logic for ingestion plugins
    async def fetch_alerts(self) -> List[Dict[str, Any]]:
        """
        Fetches alerts from the external source.
        Returns:
            List of dictionaries representing raw alert data.
        """
        return []

    def get_config(self, key: str, default=None):
        """Helper to get configuration/secrets"""
        # Convention: Plugin config keys are prefixed with plugin name usually,
        # but here we just look up the key directly.
        return self.secrets.get_secret(key, default)
