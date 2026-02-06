from ..base import BasePlugin
from typing import Dict, Any, List
import asyncio

class SumoLogicPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "SumoLogic"

    @property
    def description(self) -> str:
        return "SIEM Log Search."

    async def enrich(self, event) -> Dict[str, Any]:
        await asyncio.sleep(0.5)

        return {
            "source": self.name,
            "verdict": "INFO",
            "data": {
                "correlated_logs": [
                    {"_sourceCategory": "firewall", "msg": "Deny traffic from IP 1.2.3.4"},
                    {"_sourceCategory": "windows/events", "event_id": 4624}
                ],
                "query": f'"{event.title}"'
            }
        }
