from django.test import TestCase, override_settings
from plugins.registry import PluginRegistry
from plugins.base import BasePlugin
from events.models import Event
from artifacts.models import Evidence
from events.tasks import run_enrichments
from unittest.mock import patch, MagicMock
import asyncio

class MockPlugin(BasePlugin):
    @property
    def name(self):
        return "MockPlugin"

    async def enrich(self, event):
        return {
            "source": self.name,
            "data": {"foo": "bar"},
            "verdict": "INFO"
        }

@override_settings(CELERY_TASK_ALWAYS_EAGER=True, CELERY_TASK_EAGER_PROPAGATES=True)
class PluginSystemTest(TestCase):
    def test_registry_discovery(self):
        # Force discovery
        PluginRegistry._initialized = False
        PluginRegistry.discover_plugins()
        plugins = PluginRegistry.get_all_plugins()
        # Check if our implemented plugins are there
        self.assertIn("CrowdStrike", plugins)
        self.assertIn("Netskope", plugins)

    def test_plugin_config(self):
        plugin = MockPlugin()
        # Mock SecretManager method directly on the class/singleton
        # We assume core.secrets is where it is defined
        with patch('core.secrets.SecretManager.get_secret') as mock_get_secret:
            mock_get_secret.return_value = "secret_value"

            val = plugin.get_config("KEY")
            self.assertEqual(val, "secret_value")
            mock_get_secret.assert_called_with("KEY", None)

    def test_async_enrichment_flow(self):
        # Mock the registry to return our MockPlugin
        # We patch the object directly to avoid import path ambiguity
        with patch.object(PluginRegistry, 'get_all_plugins') as mock_get:
            mock_get.return_value = {"MockPlugin": MockPlugin()}

            # Create an Event
            # This triggers signal -> process_new_event -> run_enrichments
            # So the mock should be used here too.
            event = Event.objects.create(
                title="Test Event",
                source="MANUAL",
                status="NEW"
            )

            # Check Evidence
            # Signal should have triggered enrichment
            evidence = Evidence.objects.filter(event=event)
            self.assertTrue(evidence.exists())

            # There should only be one evidence if our mock worked
            self.assertEqual(evidence.count(), 1, f"Expected 1 evidence, got {evidence.count()}. Sources: {[e.source for e in evidence]}")
            self.assertEqual(evidence.first().source, "MockPlugin")
            self.assertEqual(evidence.first().data, {"foo": "bar"})
