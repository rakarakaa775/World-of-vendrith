# NPC LIFECYCLE TEST v0.1

Status: CONCEPTUAL PASS — IMPLEMENTATION VERIFICATION PENDING

## Test Seed

`CRESCENT-MOON-TEST-001`

## Test Population

- Aldren Vale — Farmer
- Elira Vale — Farmer/Gardener
- Tomas Vale — Child/Student
- Bram Stone — Miner
- Mira Ashwood — Herbalist

## Tested

### Daily lifecycle
- Wake
- Schedule selection
- Travel
- Work
- Eat
- Socialize
- Rest
- Sleep

### World reaction
Weather can interrupt scheduled activity.

```text
Schedule
  ↓
World State Check
  ↓
Activity Valid?
  ├── Yes → Execute
  └── No → Interrupt / Reschedule
```

### Relationship lifecycle

```text
Acquaintance
 ↓
Friendly
 ↓
Romantic Interest
 ↓
Courtship
 ↓
Marriage
```

Marriage requires conditions; gender/occupation alone must never force marriage.

### Household lifecycle

Marriage can merge households and trigger a residence decision.

Shared household assets and personal assets remain distinct.

### Birth lifecycle

Marriage does not automatically cause birth.

Birth depends on simulation conditions and creates a new Life Entity with infant stage and family relationships.

### Aging

Age advances with simulation time. One year of simulation does not cause large life-stage jumps.

### Death

Death changes entity status to deceased rather than destructively deleting history.

Death can trigger:
- relationship updates
- household validation
- inheritance resolution
- history events

## Test Result

| Area | Result |
|---|---|
| Initialization | PASS |
| Routine | PASS |
| Weather interruption | PASS |
| Energy response | PASS |
| Economy interaction | PASS |
| Education | PASS |
| Relationships | PASS |
| Marriage | PASS |
| Household merge | PASS |
| Birth | PASS |
| Aging | PASS |
| Death | PASS |
| History integration | PASS |

## Limitation

These tests are architecture/design simulations. They are not yet automated tests against a running implementation.

Next verification: 25-NPC stress test.
