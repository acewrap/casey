from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseClient(ABC):
    def __init__(self, api_key: str = None, base_url: str = None, mock: bool = False):
        self.api_key = api_key
        self.base_url = base_url
        self.mock = mock

class LogSourceClient(BaseClient):
    @abstractmethod
    def search(self, query: str, time_range: str = '24h') -> List[Dict[str, Any]]:
        """
        Executes a search and returns a list of raw log events.
        """
        pass

class ThreatIntelClient(BaseClient):
    @abstractmethod
    def lookup_indicator(self, indicator_value: str, indicator_type: str) -> Dict[str, Any]:
        """
        Enriches an indicator.
        """
        pass

class TicketingClient(BaseClient):
    @abstractmethod
    def create_ticket(self, title: str, description: str, **kwargs) -> str:
        """
        Creates a ticket and returns the ID.
        """
        pass

    @abstractmethod
    def update_ticket(self, ticket_id: str, **kwargs) -> bool:
        pass

class CommunicationClient(BaseClient):
    @abstractmethod
    def create_room(self, title: str, participants: List[str]) -> str:
        """
        Creates a chat room/channel and returns the ID/Link.
        """
        pass

    @abstractmethod
    def send_message(self, room_id: str, message: str):
        pass
