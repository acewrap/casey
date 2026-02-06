from ..base import BasePlugin
from typing import Dict, Any, List
import asyncio

class ProofPointPlugin(BasePlugin):
    @property
    def name(self) -> str:
        return "ProofPoint"

    @property
    def description(self) -> str:
        return "Email Security and Sandbox Analysis."

    async def enrich(self, event) -> Dict[str, Any]:
        await asyncio.sleep(0.5)

        return {
            "source": self.name,
            "verdict": "MALICIOUS",
            "data": {
                "delivered": False,
                "sandbox_analysis": {
                    "malware_family": "Emotet",
                    "urls": ["http://malicious-link.com/download"]
                }
            }
        }
