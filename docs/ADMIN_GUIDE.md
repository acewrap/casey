# Admin Guide

## Configuration
Casey is designed to be configurable. Key settings are managed via the Django Admin panel or Environment Variables.

### Environment Variables
*   `ONSPRING_API_URL`: URL for the OnSpring instance.
*   `SPLUNK_HOST`: Hostname for Splunk.
*   `CROWDSTRIKE_CLIENT_ID`: API Credentials.

### System Config (Database)
Dynamic settings can be changed in the Admin Panel under `Configuration > System Configs`.

*   `ONSPRING_SYNC_MODE`: Set to `POLLING` or `WEBHOOK`.

## User Management
Users are managed via Django Admin. Assign the `is_analyst` flag to give access to the Casey Dashboard.

![Admin](screenshots/admin.png)

## Authentication & SSO (Okta)
Casey supports Single Sign-On (SSO) via OpenID Connect (OIDC), specifically configured for Okta. This is handled by the `mozilla-django-oidc` library.

### Configuration
To enable Okta authentication, set the following environment variables in your `docker-compose.yml` or production environment:

```bash
OIDC_RP_CLIENT_ID=<Your Okta Client ID>
OIDC_RP_CLIENT_SECRET=<Your Okta Client Secret>
OIDC_OP_AUTHORIZATION_ENDPOINT=https://<your-org>.okta.com/oauth2/v1/authorize
OIDC_OP_TOKEN_ENDPOINT=https://<your-org>.okta.com/oauth2/v1/token
OIDC_OP_USER_ENDPOINT=https://<your-org>.okta.com/oauth2/v1/userinfo
OIDC_RP_SIGN_ALGO=RS256
```

Ensure the Callback URL in Okta is set to: `https://<your-casey-domain>/oidc/callback/`

## Backup & Recovery
It is critical to regularly backup the database and persistent storage.

### Database (PostgreSQL)
Casey uses a PostgreSQL database. You can perform a backup using `pg_dump` from within the container or externally.

**Backup Command:**
```bash
# Execute from the host machine
docker exec -t casey_db_1 pg_dump -U postgres casey > casey_backup_$(date +%Y%m%d).sql
```

**Restore Command:**
```bash
# Execute from the host machine
cat casey_backup_20231027.sql | docker exec -i casey_db_1 psql -U postgres casey
```

### Async Tasks (Redis)
Redis is used for task queues and caching. While less critical for long-term data storage than Postgres, you may wish to enable persistence.

Ensure your `redis.conf` has AOF (Append Only File) enabled:
```
appendonly yes
```

### Application Logs
Logs are emitted to stdout/stderr and captured by the Docker logging driver. For production, it is recommended to forward these to a central logging system (e.g., Sumo Logic, Splunk) via a log driver or sidecar container.
