# Administration Guide

## Creating New Async Plugins

Casey's enrichment engine is extensible. To add a new integration:

1.  **Create a File**: Add a new `.py` file in `backend/plugins/implementations/`.
2.  **Inherit from BasePlugin**:

    ```python
    from ..base import BasePlugin
    from typing import Dict, Any

    class MyNewPlugin(BasePlugin):
        @property
        def name(self) -> str:
            return "MyService"

        async def enrich(self, event) -> Dict[str, Any]:
            # 1. Get credentials
            api_key = self.get_config("MY_SERVICE_API_KEY")

            # 2. Perform Async I/O (use aiohttp)
            # await fetch_data(...)

            # 3. Return Evidence Data
            return {
                "source": self.name,
                "verdict": "INFO",
                "data": { "foo": "bar" }
            }
    ```

3.  **Restart**: Restart the Celery worker and Django server. The `PluginRegistry` will automatically discover the new class.

## Configuring Secrets

### Local Development
Set environment variables in your `.env` file or docker-compose:
```bash
CROWDSTRIKE_API_KEY=xyz
NETSKOPE_TOKEN=abc
```

### Production
Ensure `PRODUCTION=true` is set.
Store secrets in AWS Secrets Manager with names matching the keys requested by the plugin (e.g., `CROWDSTRIKE_API_KEY`).
