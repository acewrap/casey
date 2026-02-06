import os
import json
import logging

logger = logging.getLogger(__name__)

class SecretManager:
    _instance = None
    _secrets_cache = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SecretManager, cls).__new__(cls)
        return cls._instance

    @staticmethod
    def get_secret(secret_name: str, default: str = None) -> str:
        """
        Retrieves a secret.
        If PRODUCTION=true, tries to fetch from AWS Secrets Manager (mocked).
        Otherwise, falls back to environment variables.
        """
        is_production = os.getenv('PRODUCTION', 'false').lower() == 'true'

        # 1. Check Cache first
        if secret_name in SecretManager._secrets_cache:
            return SecretManager._secrets_cache[secret_name]

        # 2. Check Environment Variable (Always acts as an override or local dev source)
        env_value = os.getenv(secret_name)
        if env_value:
             return env_value

        # 3. If Production, try AWS Secrets Manager
        if is_production:
            try:
                # Mock implementation for AWS Secrets Manager
                # In a real scenario, this would use boto3
                logger.info(f"Attempting to fetch {secret_name} from AWS Secrets Manager")
                # Simulate a fetch
                # client = boto3.client('secretsmanager')
                # response = client.get_secret_value(SecretId=secret_name)
                # secret = response['SecretString']

                # For this exercise, we assume if it's not in env and we are in prod,
                # we might be looking for a specific secret structure.
                # Since we don't have real AWS, we return the default or raise.
                pass
            except Exception as e:
                logger.error(f"Failed to fetch secret {secret_name} from AWS: {e}")

        # 4. Return default if provided
        if default is not None:
            return default

        return None
