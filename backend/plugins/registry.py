import importlib
import pkgutil
import inspect
from typing import Dict, Type
from .base import BasePlugin

class PluginRegistry:
    _plugins: Dict[str, Type[BasePlugin]] = {}
    _initialized = False

    @classmethod
    def register(cls, plugin_class: Type[BasePlugin]):
        instance = plugin_class()
        cls._plugins[instance.name] = plugin_class
        print(f"Registered plugin: {instance.name}")

    @classmethod
    def get_plugin(cls, name: str) -> BasePlugin:
        if not cls._initialized:
            cls.discover_plugins()

        plugin_cls = cls._plugins.get(name)
        if plugin_cls:
            return plugin_cls()
        return None

    @classmethod
    def get_all_plugins(cls) -> Dict[str, BasePlugin]:
        if not cls._initialized:
            cls.discover_plugins()
        return {name: cls._plugins[name]() for name in cls._plugins}

    @classmethod
    def discover_plugins(cls):
        """
        Dynamically discovers and registers plugins from the 'implementations' package.
        """
        if cls._initialized:
            return

        try:
            import plugins.implementations as implementations_pkg
        except ImportError:
             import backend.plugins.implementations as implementations_pkg

        package_path = implementations_pkg.__path__
        prefix = implementations_pkg.__name__ + "."

        for _, name, _ in pkgutil.iter_modules(package_path, prefix):
            try:
                module = importlib.import_module(name)
                for attribute_name in dir(module):
                    attribute = getattr(module, attribute_name)
                    if (inspect.isclass(attribute) and
                        issubclass(attribute, BasePlugin) and
                        attribute is not BasePlugin):

                        # Avoid registering abstract classes if any accidentally slip through
                        if not inspect.isabstract(attribute):
                            cls.register(attribute)
            except Exception as e:
                print(f"Failed to load plugin module {name}: {e}")

        cls._initialized = True
