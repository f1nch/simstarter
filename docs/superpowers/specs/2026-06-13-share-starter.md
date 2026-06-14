# Share a Generated Starter

_2026-06-13_

## Goal

Let users share a generated starter via a link (no backend — the app is static
on GitHub Pages). Opening the link reproduces the exact starter in the app.

## Design

### Encoding (`src/share.ts`, pure)

A `StartingPoint` is fully described by the item `id`s in its 16 slots. ids are
stable and unique across categories (integrity test guarantees uniqueness), so a
global `id → DataItem` lookup can resolve any slot.

- `encodeStartingPoint(sp)` → `"1." + base64url(JSON(idPayload))`, where the
  payload is a positional array of ids (single slots: one id; array slots: id
  list) in a fixed slot order. `"1"` is a format version.
- `decodeStartingPoint(code)` → `StartingPoint | null`. Returns null on any
  failure: wrong version, malformed base64/JSON, wrong arity, or an unknown id.
- `buildShareUrl(sp)` → `origin + pathname + "#sp=" + encodeStartingPoint(sp)`.
- `readSharedFromHash(hash)` → `StartingPoint | null` (parses `#sp=…`).

Lookup uses the **full data**, never the viewer's owned packs, so a recipient
sees exactly what was shared even if they don't own those packs.

### App wiring

- On first render, `useState` lazily reads `window.location.hash`; a valid
  `#sp=…` loads that starter into view. Invalid hashes are ignored (empty state).
- "🔗 Share this starter" button below the result grid (shown only when a
  starter exists). On click: `history.replaceState` the hash so the address bar
  is shareable, copy the URL via `navigator.clipboard.writeText` (with a
  fallback), and show a transient "Link copied!" confirmation.

### Non-goals

- No text/image export (link only, per decision).
- No live hash sync on every re-roll — the Share button always encodes current
  state on demand.

## Verification

`share.test.ts`: round-trip equality, invalid/garbled/unknown-id → null, hash
parsing. App test: a `#sp=…` hash renders the shared starter. `pnpm test:run`
green; `pnpm build` clean.
