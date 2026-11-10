# Sector Rebound — GitHub Actions artifact storage policy

We keep GitHub commits, source, the release journal, QA recipes and rollback evidence. Only workflow **artifacts** are short-lived.

- Routine AI/gameplay/Android QA artifacts: **3 days**.
- Owner test/preview APK workflows: generally **7 days**.
- Certificate-continuity and deliberately owner-pinned evidence: **30 days**.
- Historical workflows without uploaded artifacts were left untouched.

All 65 workflows on main were reviewed; 56 uploading workflows had their existing retention values reduced where appropriate. This does not retroactively delete old items. Preserve milestone APKs or attestation material separately before expiry.

Use the [manual artifact cleanup workflow](../../actions/workflows/manage-qa-artifact-storage.yml). A dry-run lists candidates; delete-obsolete only removes older routine QA artifacts, keeps the newest ten, recent builds, signed/pinned/certificate/release/rollback names and at least one copy per normalized artifact type.

Account-level $0 Actions spend limits require GitHub Settings → Billing → Budgets and alerts; no repository commit can set them.
