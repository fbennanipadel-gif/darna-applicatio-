# Security operations

- Rotate every credential pasted into chat, source control, issue trackers, or screenshots.
- Keep `.env` local or in a managed secret store. Only `.env.example` is tracked.
- Use unique 32+ byte values for JWT and NFC secrets.
- Restrict MongoDB Network Access, create least-privilege database users, and enable backups.
- Set `CLIENT_URL` to the production domain, deploy behind TLS, and rotate refresh tokens on every refresh.
