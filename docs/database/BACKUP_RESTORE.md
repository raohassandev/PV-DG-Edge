# Backup and Restore

Backup script:

```bash
sudo bash deploy/scripts/backup_database.sh
```

If the deployment user has Docker group access, sudo is not required:

```bash
bash deploy/scripts/backup_database.sh
```

Restore script:

```bash
sudo bash deploy/scripts/restore_database.sh /opt/pvdg-edge-local/backups/example.dump
```

The scripts load database names from the target-only `.env` without printing secrets and use `docker compose --env-file .env`.

Backups are stored under `/opt/pvdg-edge-local/backups`.

Restore uses `pg_restore --clean --if-exists`; run it only with an intentional backup file and an explicit maintenance window.
