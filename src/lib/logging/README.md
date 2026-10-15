# Cafe Panel logging

## Technical logs

The Next.js process writes JSON Lines files under `CAFE_LOG_DIR`, defaulting to `<process.cwd()>/logs`. Electron sets this to `app.getPath("userData")/logs`. The main process uses the same directory and rotates each active file at 10 MiB, keeping up to five rotated copies.

Set `CAFE_LOG_LEVEL=debug` to enable debug-level records. Production defaults to `info`. Do not add credentials, passwords, session cookies, full customer records, or payment data to log metadata.

## Audit events

Call `recordAudit` from the server-side business operation that owns the action. Audit event persistence and outbox persistence are committed in the same SQLite transaction. Callers must provide the true actor identity where available and must not infer a human actor from a device.

The outbox exporter appends records to `audit.jsonl`. Since a process may stop after appending but before acknowledging the batch in SQLite, downstream consumers must de-duplicate by `eventId`. Never treat the file as a transactional replacement for the database.

## Diagnostics

On Windows, run `scripts/export-diagnostics.ps1` from PowerShell. Inspect the generated ZIP before sharing it. The script intentionally does not include the database file. App-data folder naming may differ by install configuration; adjust the detected user-data path if necessary.

## Limitations

- Local logs are not tamper-proof against a user with access to the machine.
- Log writes are best-effort and must not be used as the sole persistence mechanism for business state.
- Audit export is bounded and retryable, but requires a caller/scheduled startup hook to drain the outbox; do not assume every event is immediately present in the file.
