# Backup and Restore

Backup script:

```bash
sudo bash deploy/scripts/backup_database.sh
```

Restore script:

```bash
sudo bash deploy/scripts/restore_database.sh /opt/pvdg-edge-local/backups/example.dump
```

Backups are stored under `/opt/pvdg-edge-local/backups`.

Restore uses `pg_restore --clean --if-exists`; run it only with an intentional backup file and an explicit maintenance window.

