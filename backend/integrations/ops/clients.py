from ..base import TicketingClient, CommunicationClient
from typing import List, Dict, Any
import uuid

class OnSpringClient(TicketingClient):
    def create_ticket(self, title: str, description: str, **kwargs) -> str:
        if self.mock:
            return str(uuid.uuid4().int)[:6] # Return a fake Ticket ID
        # Real implementation: POST /api/v1/records
        raise NotImplementedError("Real OnSpring client not implemented")

    def update_ticket(self, ticket_id: str, **kwargs) -> bool:
        if self.mock:
            return True
        raise NotImplementedError("Real OnSpring client not implemented")

class WebExClient(CommunicationClient):
    def create_room(self, title: str, participants: List[str]) -> str:
        if self.mock:
            return f"https://webex.com/meet/room-{uuid.uuid4()}"
        raise NotImplementedError("Real WebEx client not implemented")

    def send_message(self, room_id: str, message: str):
        if self.mock:
            print(f"[WebEx Mock] Sent to {room_id}: {message}")
            return
        raise NotImplementedError("Real WebEx client not implemented")
