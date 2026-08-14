# NPC TEMPLATE SYSTEM v0.1

Status: DESIGN COMPLETE — IMPLEMENTATION PENDING

## Architecture

```text
NPC Template
├── Life Profile
├── Personality Profile
├── Occupation Profile
├── Household Profile
└── AI Behavior Profile
        ↓
NPC Generation
        ↓
Actual Life Entity
```

## Personality Attributes

1. Sociability
2. Work Ethic
3. Curiosity
4. Risk Tolerance
5. Patience
6. Generosity
7. Ambition
8. Trust

Values are generated from template ranges, not fixed values.

## Life Stages

| Stage | Age |
|---|---:|
| Infant | 0–2 |
| Child | 3–11 |
| Teen | 12–17 |
| Young Adult | 18–29 |
| Adult | 30–49 |
| Mature Adult | 50–64 |
| Elder | 65+ |

## Village Templates

- NPC-FARMER
- NPC-MINER
- NPC-BLACKSMITH
- NPC-CRAFTSMAN
- NPC-FISHER
- NPC-HUNTER
- NPC-WOODCUTTER
- NPC-HERBALIST
- NPC-SHOPKEEPER
- NPC-TAVERN-KEEPER
- NPC-TAVERN-WORKER
- NPC-TEACHER
- NPC-HEALER
- NPC-BUILDER
- NPC-VILLAGE-GUARD
- NPC-ELDER
- NPC-CHILD
- NPC-STUDENT
- NPC-HOUSEHOLD-WORKER

## External Templates

- NPC-TRAVELING-MERCHANT
- NPC-TEMPORARY-TRADER
- NPC-TRAVELING-CRAFTSMAN
- NPC-SEASONAL-WORKER
- NPC-TRAVELER
- NPC-PILGRIM
- NPC-ADVENTURER
- NPC-CITY-MIGRANT
- NPC-MARRIAGE-MIGRANT
- NPC-PROFESSIONAL-VISITOR

## AI Behavior Archetypes

- AI-WORKER
- AI-FAMILY
- AI-SOCIAL
- AI-MERCHANT
- AI-EXPLORER
- AI-SCHOLAR
- AI-CAREGIVER
- AI-GUARDIAN
- AI-ELDER
- AI-STUDENT
- AI-CHILD

## Household Templates

- HH-FARMER-SMALL
- HH-FARMER-LARGE
- HH-MINER
- HH-CRAFTSMAN
- HH-BLACKSMITH
- HH-TAVERN
- HH-SHOPKEEPER
- HH-FISHER
- HH-HUNTER
- HH-ELDER
- HH-SINGLE-ADULT
- HH-SINGLE-PARENT

## Population Target

Initial permanent population target: 75.

Dynamic population is separate and may include temporary visitors.

## Generation Pipeline

```text
Household Template
 ↓
Family Structure
 ↓
Life Entities
 ↓
Age / Life Stage
 ↓
Personality
 ↓
Occupation
 ↓
AI Archetype
 ↓
Household Assignment
 ↓
Residence
 ↓
Inventory
 ↓
Relationships
 ↓
Schedule
 ↓
NPC
```

## Determinism

Use:

```text
World Seed + Village Seed + NPC Seed
```

Example:

`Vandrith + CrescentMoon + CMV-00001`

This supports deterministic regeneration, debugging, replay, and testing.

## Core Rule

Templates create starting conditions. They do not dictate future life.

Marriage, birth, migration, career changes, conflict, friendship, and death must emerge from simulation systems.
