# AGENTS.md — Wild Beyond the Witchlight Vault

Agent onboarding guide for this Obsidian vault. Read this before touching anything.

---

## 1. Project Overview

This is an **Obsidian vault** used as a living campaign wiki for a D&D 5e campaign running the *Wild Beyond the Witchlight* adventure module (with heavy homebrew additions).

**Purpose:** A shared reference for DM and players — tracking characters, NPCs, locations, items, and the full narrative history of the campaign through the Player's Journal.

**Campaign context:**
- The party is navigating **Prismeer**, a Feywild domain split into three realms: **Hither** (swamps), **Tither** (forests), and **Yon** (mountains)
- The **Hourglass Coven** — three hags (Bavlorna Blightstraw, Scabatha Nightshade, Endelyn Moongrave) — usurped control of Prismeer after freezing its Archfey, **Zybilna**, in time
- The party liberated Hither by defeating Bavlorna; they are currently in Tither confronting Scabatha
- The vault is published as a static website via **Quartz** at [hiddenplace.world](https://hiddenplace.world)

**Current campaign day:** 17
**Current location:** Tither — near the Tin Soldier Factories

---

## 2. Vault Structure

```
wild-beyond-the-witchlight/
│
├── index.md                   # Campaign homepage — party table, story summary, realm map, quick links
├── Player's Journal.md        # Full chronological narrative of every session (primary source of truth)
│
├── Characters/                # Player characters (active and former)
│   ├── Companions/            # NPCs that travel with the party (Kiiki, Owlie)
│   ├── Former/                # Deceased or departed PCs (Alex Jones, Imuen)
│   └── *.md                   # One file per active PC (Ghee, Argon, Leneus, Fudd, Wigglit Quibblefuzz,
│                              #   Doug, Dial Up, Alberto, Boudia, Skathach)
│
├── NPCs/                      # All named non-player characters encountered
│   └── *.md                   # One file per NPC (flat structure, no sub-folders)
│
├── Locations/                 # Places visited or referenced in the campaign
│   └── *.md                   # One file per location (carnival attractions, realms, settlements, sub-areas)
│
├── Items/                     # Inventory, magical items, and party treasury
│   └── *.md                   # One file per item or item category (Party Treasury.md, Spells Used.md, etc.)
│
├── README.md                  # Brief public-facing description; points to website and index.md
│
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md   # PR template — always use this
│   └── workflows/deploy.yml       # CI/CD: builds Quartz and deploys to /var/www/dnd/ on push to master
│
└── .obsidian/                 # Obsidian plugin/theme config — DO NOT TOUCH (see §6)
```

---

## 3. Content Conventions

### File Naming
- **Title Case with spaces** — matches the in-world name exactly (e.g., `Bavlorna Blightstraw.md`, `Leaning Tower.md`)
- Apostrophes and special characters are used when part of the name (`Mr Witch's Watch.md`, `Tsu Harabax's Walking Inn.md`)
- No slugification — spaces are preserved in filenames

### Internal Links
- All cross-references use **Obsidian wikilinks**: `[[Target File Name]]`
- Link text may be aliased: `[[Bavlorna Blightstraw|Bavlorna]]`
- Folder links use trailing slash: `[[NPCs/|NPCs]]`
- **Never use relative markdown links** (`[text](path.md)`) — wikilinks only

### Frontmatter
- Most files have **no YAML frontmatter** — the vault is content-first
- `index.md` uses `---` horizontal rules as visual dividers (not YAML fences)
- Do **not** add frontmatter fields (tags, aliases, dates) to existing files without explicit instruction from Master Ghadi
- If a new field is genuinely needed, document it in your PR description

### Content Structure per File Type

**Characters (`Characters/`):**
- Opening paragraph: character background and personality
- `## Items` section — what the character currently carries, with wikilinks to `Items/`
- Optional sections: `## Familiar`, `## Locations Visited`

**NPCs (`NPCs/`):**
- Opening paragraph: who they are, their role, their allegiances
- Inline bold for notable traits (e.g., `**Weaknesses:**`)
- Optional `## Locations` section listing where they appear

**Locations (`Locations/`):**
- Opening paragraph: realm/area description and current status
- `## Settlements & Locations` or `## Description` sub-sections
- `## Inhabitants` section for creatures and factions

**Items (`Items/`):**
- Description of the item and its properties
- Tables used in `Party Treasury.md` for tracking gold

### Media
- Images are embedded as standard markdown image links pointing to Google Docs/Lh7 CDN URLs
- Do not rehost or alter image URLs

### The Player's Journal
- Structured as: **Prelude → Chapter 1 → Chapter 2 → Chapter 3...**
- Each chapter contains **Day N** sub-sections (e.g., `### Day 1`)
- Written in third-person narrative prose
- The canonical source of truth for campaign events — all other files must be consistent with it

---

## 4. Agent Scope

### The Obsidian Agent Owns
- All `.md` files in the vault root and content folders (`Characters/`, `NPCs/`, `Locations/`, `Items/`)
- Internal link integrity — if a file is renamed, all `[[wikilinks]]` pointing to it must be updated
- Structural organization of content folders (with explicit approval for structural changes)
- Keeping the Player's Journal in sync with recent sessions when instructed
- New NPC/Location/Item files following existing conventions

### The Obsidian Agent Does NOT Own
- `.obsidian/` — plugin/theme configuration (ask Master Ghadi before any changes)
- `.github/workflows/deploy.yml` — CI/CD is infrastructure territory
- `README.md` — only update with explicit instruction
- The Quartz deployment itself (`freiha-org/quartz-obsidian-client` repo) — separate repo, separate concern
- Merging its own PRs

### Off-Limits Without Explicit Instruction
- Deleting any note
- Renaming files (triggers cascading link updates — confirm scope before proceeding)
- Restructuring folder hierarchy
- Any write directly to `master` (branch protection enforced)

---

## 5. Tooling

### Quartz (Static Site Generator)
- The vault is built and published using a **custom Quartz fork**: `freiha-org/quartz-obsidian-client`
- Build is triggered automatically on push to `master` via GitHub Actions (`.github/workflows/deploy.yml`)
- The workflow checks out Quartz, checks out vault content into `quartz/content/`, builds, and deploys to `/var/www/dnd/` on a self-hosted runner
- Live site: [hiddenplace.world](https://hiddenplace.world)

### GitHub Actions
- **Trigger:** Push to `master` branch only
- **Runner:** Self-hosted (configured separately from this repo)
- **Secret required:** `QUARTZ_ACCESS_TOKEN` (for checking out the Quartz repo)

### `.claude/settings.local.json`
- Claude Code local settings — not for agent use; do not modify

### No Additional Scripts or Plugins
- No automation scripts exist in this repo
- Obsidian plugin config lives in `.obsidian/` — do not inspect or modify

---

## 6. Known Constraints

| Path | Constraint | Reason |
|------|-----------|--------|
| `.obsidian/` | Never modify | Plugin/theme config — changes can corrupt the vault for active users |
| `master` branch | Never push directly | Branch protection enforced; PRs required |
| `Player's Journal.md` | Append only, never rewrite existing entries | Source of truth for campaign history |
| Image URLs (Google Docs CDN) | Do not alter | External embeds; broken links cannot be self-repaired |
| `.github/workflows/deploy.yml` | Do not modify without infrastructure approval | Controls production deploy pipeline |
| `README.md` | Do not modify without explicit instruction | Public-facing document |

---

## 7. Relevant Skills

### `github`
Use the `gh` CLI for all GitHub interactions.

```bash
# Create a PR
gh pr create --title "type(scope): description" --body "..." --reviewer Ghadif

# Check PR status / CI
gh pr checks <number> --repo freiha-org/wild-beyond-the-witchlight

# List open PRs
gh pr list --repo freiha-org/wild-beyond-the-witchlight
```

Full skill: `~/.openclaw/workspace/skills/github/SKILL.md`

### `git-essentials`
Standard git workflow:

```bash
git checkout -b <branch>       # Always branch from master
git add -p                     # Stage changes interactively
git commit -m "type(scope): message"
git push origin <branch>
```

Branch naming: `docs/`, `feat/`, `fix/`, `chore/` prefixes — see `agents/shared/GIT_WORKFLOW.md`

Full skill: `~/.openclaw/workspace/skills/git-essentials/SKILL.md`

---

## Quick Reference: Making a Change

1. `git pull origin master` — always start fresh
2. `git checkout -b <type>/<description>`
3. Make changes following §3 conventions
4. Verify all wikilinks are intact (no broken `[[references]]`)
5. `git commit -m "type(scope): imperative description"`
6. `git push origin <branch>`
7. `gh pr create` using the PR template (`.github/PULL_REQUEST_TEMPLATE.md`)
8. Assign reviewer: `Ghadif`
9. **Never self-merge** — Master Ghadi reviews and merges

---

*This file is maintained by the Obsidian Agent. Update it when vault conventions change.*
