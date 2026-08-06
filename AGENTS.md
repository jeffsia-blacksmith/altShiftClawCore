# altShiftClawCore — Versioning & Release Rules

## Version scheme

This fork no longer tracks the upstream `duotify` version (`0.2.24`). It uses
**Semantic Versioning** (`MAJOR.MINOR.PATCH`) starting at **`0.3.0`**.

- `0.x.y` — pre-1.0 prototyping. Breaking changes bump `MINOR`; features/fixes bump `PATCH`.
- `1.x.y` — stable. Breaking changes bump `MAJOR`.

## Where the version lives

The version must stay **in sync** across these places:

| File | Field | What it drives |
|---|---|---|
| `src/config.js:7` | `DEFAULT_VERSION` | Version the running worker reports (e.g. `/health`, config `version`) |
| `package.json:3` | `version` | npm package version |
| `package-lock.json` | `version` (root + `packages[""]`) | npm lockfile version |
| `github-claw-worker-package.json:2` | `version` | Published manifest `version` |
| `github-claw-worker-package.json:3` | `revision` | **Do NOT edit manually** — the publish workflow overwrites it with the git commit SHA |

> ⚠️ `github-claw-worker-package.json` also has a `revision` field. That is **auto-set**
> to the git SHA by `.github/workflows/publish-package.yml` on every publish. Never bump it by hand.

## When to bump

Because this project ships lots of small fixes, **small fixes land on `main` without a version bump** —
deployed instances pick them up automatically via the `revision` (git SHA) comparison in
`autoupdate.yml`. The human-facing version only changes when you **cut an explicit release**.

- **Bump version:** only when running `npm run release` for a deliberate release.
- **Do NOT bump** for routine small fixes/commits on `main`.

## Releasing

Run, from `altShiftClawCore/`:

```bash
npm run release -- <new-version>    # e.g. npm run release -- 0.3.0
npm run build                       # rebuild the worker bundle
```

`npm run release <version>`:

1. Validates `<version>` is semver (`MAJOR.MINOR.PATCH`, optionally `-prerelease`).
2. Bumps `src/config.js`, `package.json`, and `github-claw-worker-package.json` in sync.
3. Commits the version bump on `main`.
4. Creates an annotated git tag `v<version>`.

After that, `git push origin main --tags` publishes the tag; pushing `main` also triggers
`.github/workflows/publish-package.yml` to rebuild and publish the Pages package.

### Version bump rules
- **Breaking change** (pre-1.0): bump `MINOR` (e.g. `0.3.0` → `0.4.0`).
- **Feature / fix / small change**: bump `PATCH` (e.g. `0.3.0` → `0.3.1`).
- Never bump `MAJOR` while pre-1.0; that only applies to `1.x+` stable.
- Every bump must stay consistent across all 4 files — always use `npm run release`, not manual edits.
