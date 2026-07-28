# Design Intelligence Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the design-intelligence-engine skill a fully integrated design system hub that auto-generates, reads, and writes project-level design files — covering both code conventions (DESIGN.md) and visual context (DESIGN-VISUAL-CONTEXT.md). Seamlessly connects with awesome-design-md for brand matching and html-to-tailwind for site conversion. Orchestrated by a single entry-point skill (design-system-chain).

**Architecture:** Two project-level files form the design system:
- `DESIGN.md` — code-level source of truth (tokens, components, conventions)
- `DESIGN-VISUAL-CONTEXT.md` — visual source of truth (brand DNA, photography, image prompts)

The **design-system-chain** skill is the single entry point that orchestrates all design work. It invokes **design-intelligence-engine** as the central hub for reading, generating, and writing both files. All other design skills (page-composer, ui-styling, html-to-tailwind, awesome-design-md) connect through the chain.

**Tech Stack:** Markdown documentation + SKILL.md modifications

## Global Constraints

- All conventions must match the existing codebase exactly (no aspirational patterns)
- Both files must follow the YAML frontmatter structure that design-intelligence-engine expects
- SKILL.md modifications must be additive (no breaking changes to existing skill behavior)
- DESIGN.md always wins over skill defaults; brand DESIGN.md wins for visual appearance
- Never invoke a sub-skill directly — always go through design-system-chain

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `hirehub-frontend/DESIGN.md` | Created | Project-level code conventions (tokens, components, rules) |
| `hirehub-frontend/DESIGN-VISUAL-CONTEXT.md` | Created | Visual context (brand DNA, photography, section prompts) |
| `~/.agents/skills/design-system-chain/SKILL.md` | **Created** | Single entry point — orchestrates full design pipeline |
| `~/.agents/skills/design-intelligence-engine/SKILL.md` | Modified | Dual-file discovery, auto-generation, awesome-design-md integration |
| `~/.agents/skills/awesome-design-md/SKILL.md` | Modified | Cross-reference to design-intelligence-engine for merge flow |
| `~/.agents/skills/html-to-tailwind/SKILL.md` | Modified | Phase 8: Generate DESIGN.md + DESIGN-VISUAL-CONTEXT.md after conversion |
| `~/.agents/skills/ui-ux-pro-max/.../ui-styling/SKILL.md` | Modified | Read/write DESIGN.md before/after building components |

---

### Task 1: Create DESIGN.md at project root

**Status:** COMPLETE

**File:** `/home/jacobp/Desktop/Projecs/hirehub-frontend/DESIGN.md` (227 lines)

Contains: YAML frontmatter with all color tokens (light + dark), typography, layout, border radius scale, 10 component patterns (Button, Input, Textarea, Card, Tag, Tabs, Toast, Section, Container, Skeleton, EmptyState, ErrorState), conventions (naming, class composition, animation, accessibility), and 10 consistency rules.

---

### Task 2: Create DESIGN-VISUAL-CONTEXT.md at project root

**Status:** COMPLETE

**File:** `/home/jacobp/Desktop/Projecs/hirehub-frontend/DESIGN-VISUAL-CONTEXT.md` (314 lines)

Contains: Brand DNA, Photography DNA, section-by-section image prompts (Hero 16:9 + 9:16 mobile, ValueProps icons + scene, JobBoard, Auth, Pricing, Footer), photography Do's/Don'ts, color matching rules, image generation checklist.

---

### Task 3: Update design-intelligence-engine SKILL.md

**Status:** COMPLETE

**Modifications made:**

1. **Project-Level Design Conventions section** — Dual-file discovery (DESIGN.md + DESIGN-VISUAL-CONTEXT.md), auto-generation flows for both files, conflict resolution
2. **Design Integration section** — awesome-design-md brand merge flow with token merge rules (brand wins visual, project wins conventions)
3. **Quick Reference table** — Added brand DESIGN.md and visual context entries

**Key behaviors added:**
- Always check for both DESIGN.md and DESIGN-VISUAL-CONTEXT.md
- Generate both if missing (from codebase analysis)
- DESIGN-VISUAL-CONTEXT.md generation: infer visual personality → generate Brand DNA → Photography DNA → section prompts → photography rules
- Brand merge: brand tokens for appearance, project conventions for implementation

---

### Task 4: Update awesome-design-md SKILL.md

**Status:** COMPLETE

**Modification:** Added cross-reference to design-intelligence-engine in the "Apply it" section, explaining the merge flow when both brand and project DESIGN.md exist.

---

### Task 5: Update html-to-tailwind SKILL.md

**Status:** COMPLETE

**Modification:** Added Phase 8 — Generate DESIGN.md after conversion. Extracts color tokens, typography, border radius, component patterns, conventions, and consistency rules from the converted output. Also generates DESIGN-VISUAL-CONTEXT.md if hero images or photography are detected. Merges into existing DESIGN.md if one already exists.

---

### Task 6: Update ui-styling SKILL.md

**Status:** COMPLETE

**Modification:** Added "Project Design System Integration" section before Best Practices. Checks for DESIGN.md and DESIGN-VISUAL-CONTEXT.md before building components, applies project tokens/conventions, and writes back new component patterns after creation. Conflict resolution: DESIGN.md always wins over skill defaults.

---

### Task 7: Create design-system-chain SKILL.md

**Status:** COMPLETE

**File:** `~/.agents/skills/design-system-chain/SKILL.md`

**Purpose:** Single entry point for ALL design and UI work. Orchestrates the full pipeline:

1. **Phase 1: Discover** — Checks for DESIGN.md + DESIGN-VISUAL-CONTEXT.md, generates if missing
2. **Phase 2: Detect** — Classifies task type (brand matching, site conversion, component building, page composition, design review, theme update)
3. **Phase 3: Execute** — Routes to the appropriate sub-skill flow (A-F)
4. **Phase 4: Write Back** — Appends new components/prompts to design files

**Sub-skills connected:**
- design-intelligence-engine (hub for reading/writing design files)
- awesome-design-md (brand matching and token merging)
- html-to-tailwind (site conversion with DESIGN.md output)
- ui-styling (shadcn/ui + Tailwind component building)

**Conflict resolution:** Brand wins visual appearance, project wins conventions, DESIGN.md always wins over defaults.

---

## System Flow

```
User request (any UI/design task)
    ↓
design-system-chain (entry point)
    ↓
Phase 1: Discover → Check DESIGN.md + DESIGN-VISUAL-CONTEXT.md
    ├── Both exist → Load tokens
    ├── DESIGN.md only → Load CODE, generate VISUAL
    ├── VISUAL only → Load VISUAL, generate CODE
    └── Neither → Generate both from codebase
    ↓
Phase 2: Detect → Classify task type
    ├── Brand matching → Flow A
    ├── Site conversion → Flow B
    ├── Component building → Flow C
    ├── Page composition → Flow D
    ├── Design review → Flow E
    └── Theme update → Flow F
    ↓
Phase 3: Execute → Route to sub-skill
    ├── Flow A: awesome-design-md → merge tokens
    ├── Flow B: html-to-tailwind → generate + DESIGN.md
    ├── Flow C: ui-styling → read DESIGN.md → build
    ├── Flow D: design-intelligence-engine → full pipeline
    ├── Flow E: design-intelligence-engine → review mode
    └── Flow F: design-intelligence-engine → token update
    ↓
Phase 4: Write Back
    ├── New components → DESIGN.md
    ├── New sections → DESIGN-VISUAL-CONTEXT.md
    ├── Token changes → Both files
    └── New conventions → DESIGN.md
```

---

## Self-Review

After completing all tasks:

1. **DESIGN.md** — All tokens match the actual codebase (index.css, tailwind.config.js, Button.tsx)
2. **DESIGN-VISUAL-CONTEXT.md** — Brand DNA matches the DESIGN.md palette, section prompts cover all major pages
3. **design-system-chain SKILL.md** — Single entry point clear, 6 flows defined, sub-skill routing complete
4. **design-intelligence-engine SKILL.md** — Dual-file flow is clear, auto-generation steps are complete, awesome-design-md integration is bidirectional
5. **awesome-design-md SKILL.md** — Cross-reference points to design-intelligence-engine correctly
6. **html-to-tailwind SKILL.md** — Phase 8 generates DESIGN.md + DESIGN-VISUAL-CONTEXT.md after conversion, merges with existing files
7. **ui-styling SKILL.md** — Reads DESIGN.md before building, writes back new patterns after building, conflict resolution clear
8. **End-to-end flow** — Agent can now: discover files → generate if missing → classify task → route to sub-skill → apply tokens → merge brand → generate UI → write back new patterns

---

## Completion Status

| Task | Status |
|------|--------|
| Create DESIGN.md | ✅ COMPLETE |
| Create DESIGN-VISUAL-CONTEXT.md | ✅ COMPLETE |
| Update design-intelligence-engine | ✅ COMPLETE |
| Update awesome-design-md | ✅ COMPLETE |
| Update html-to-tailwind | ✅ COMPLETE |
| Update ui-styling | ✅ COMPLETE |
| Create design-system-chain | ✅ COMPLETE |
| Create responsive-patterns.md | ✅ COMPLETE |
| Update design-intelligence-engine (responsive) | ✅ COMPLETE |
| Update design-system-chain (responsive) | ✅ COMPLETE |

**All tasks complete.** The design system integration is fully wired end-to-end with comprehensive mobile-first responsive design guidance.

---

### Task 8: Create responsive-patterns.md reference

**Status:** COMPLETE

**File:** `~/.agents/skills/design-intelligence-engine/references/responsive-patterns.md`

Contains: 8-category responsive design reference covering breakpoint strategy, flex col→row, grid column progression, fluid typography, responsive spacing, visibility toggling, responsive containers, and responsive forms. All patterns use min-width media queries and Tailwind responsive prefixes.

---

### Task 9: Update design-intelligence-engine SKILL.md

**Status:** COMPLETE

**Modifications:**
1. Added dedicated "Responsive Design" section with core rules and Component Intelligence responsive decision framework
2. Expanded the pipeline's "Responsive" step from a single word to a full decision tree
3. Added responsive-patterns.md to Quick Reference table

---

### Task 10: Update design-system-chain SKILL.md

**Status:** COMPLETE

**Modification:** Added Phase 3.5: Responsive Validation — validates every UI output against responsive rules before proceeding to write-back.
