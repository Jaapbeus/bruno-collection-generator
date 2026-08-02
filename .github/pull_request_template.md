## Checklist

- [ ] No real hostnames, credentials, tokens, or keys anywhere in this diff — use `example.com`, `localhost`, or an obviously fake value instead.
- [ ] No personal data (names, emails, BSNs, IBANs, phone numbers) from a real person or organisation.

An automated check (`Fixture hygiene`) scans every PR for these. If it fails, fix the value rather than silencing the check — see `scripts/check-fixture-hygiene.mjs`.
