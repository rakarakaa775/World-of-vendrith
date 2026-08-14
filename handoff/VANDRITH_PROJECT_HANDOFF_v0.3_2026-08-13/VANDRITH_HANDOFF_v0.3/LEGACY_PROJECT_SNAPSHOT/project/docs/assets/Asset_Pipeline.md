# Asset Pipeline

> The Vendrith World — how assets flow from creation to integration.

## 1. Overview
Assets move through a defined pipeline. Nothing is integrated into gameplay until
it has passed review and is registered.

## 2. Pipeline Stages

```
Inbox → Review → Naming → Registration → Integration → (Archive when deprecated)
```

### 2.1 Inbox
- Raw, unsorted assets land in `src/assets/inbox/`.
- No asset stays in inbox after it has been reviewed.

### 2.2 Review
- Asset is evaluated for quality, style fit, and licensing.
- Approved assets are promoted; rejected assets are archived.

### 2.3 Naming
- Filenames converted to `snake_case`.
- Names describe content, not author or date.
- No spaces, special characters, or version numbers.

### 2.4 Registration
- Asset is registered in `src/assets/registry/` with metadata.
- The registry is the single source of truth for what exists.

### 2.5 Integration
- Registered assets are moved to `core/` or `expansions/`.
- Only registered assets may be referenced by gameplay code.

### 2.6 Archive
- Deprecated assets move to `src/assets/archive/`.
- Assets are never deleted outright — they are archived for reference.

## 3. Generated Assets
- AI or procedurally generated assets go to `src/assets/generated/`.
- They follow the same pipeline: review, name, register, integrate.

## 4. Status
No assets are in the pipeline yet. Folders are empty placeholders.
