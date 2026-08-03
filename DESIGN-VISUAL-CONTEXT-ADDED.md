---
name: HireHub Community — WS3 Added Surfaces
tagline: "Talent with opportunity — payment, chat, and hiring-flow additions"
visualPersonality:
  - Warm
  - Professional
  - Approachable
  - Community-driven
  - Human-centered
  - Conversation-led
palette:
  canvas: "#f5f1ec"
  surface-1: "#ffffff"
  surface-2: "#ebe7e1"
  ink: "#111111"
  ink-muted: "#626260"
  ink-tertiary: "#9c9fa5"
  accent: "#ff5600"
  success: "#2e7d32"
  hairline: "#d3cec6"
typography:
  primary: "Inter (sans, 400/500)"
  mono: "JetBrains Mono (mono, 400)"
motion:
  style: "Subtle fades, gentle slides, staggered reveals, 200-300ms easeOut"
  personality: "Professional-minimal"
---

# HireHub Community — Visual Context: Added Surfaces (WS3)

> Companion to `DESIGN-VISUAL-CONTEXT.md`. Covers the surfaces shipped in WS3 — the payment-to-chat flow, the messages tab, the hiring-flow progress modal, post-apply success, bulk-import prompting, and resume replace/upload. Same brand DNA: orange `#ff5600` accent on warm neutral `#f5f1ec` canvas, human warmth over corporate sterility. Code tokens follow `DESIGN.md`; image language follows the parent file's photography rules.

---

## Brand DNA (Addendum)

```
Personality: Conversation-led, human, reassuring — money, hiring status, and chat
             should all feel like talking to a person, not a process.
Palette:     Canvas #f5f1ec | Surface-1 #ffffff | Surface-2 #ebe7e1
             Ink #111111 | Ink-muted #626260 | Ink-tertiary #9c9fa5
             Accent #ff5600 | Success #2e7d32 | Hairline #d3cec6
Key moves:   Ink-dark UI elements for "mine" / interactive surfaces, accent only
             for reach and action, success green reserved for confirmation.
             Hairline borders (no box-shadows) except floating dialog panels.
```

**Interaction DNA (addendum):**
```
Floating surfaces: bg-black/50 overlay + white panel, entrance opacity 0→1,
             y:16 → 0, scale 0.96 → 1, 0.25s easeOut. Exit mirrors entrance.
Focus:       focus-visible:ring-2 ring-ink/30 on buttons/rows, ring-ink/40 on inputs.
Chat:        mine = ink-dark bubble right-aligned, theirs = surface-2 left-aligned,
             max-w-[80%], rounded-lg, entry slide y:6 → 0.
Progress:    reached = accent tint circle with Check, upcoming = hairline circle
             with Clock; connectors flush with stage color.
Empty/Error: skeleton pulse (bg-surface-2), centered icon + message, accent
             action button. Error message in text-error with role="alert".
```

---

## Section: Payment Modal (Checkout → Chat Handoff)

**Emotional objective:** Trust + Confidence + Relief

**Primary prompt (modal check icon set — success symbol):**
```
Subject: A minimal flat checkmark inside a softly tinted circle, rendered in the
       brand success green on a white surface. No badge, no ribbon, no sparkle
       effects — just the clean confirmation mark.
Environment: Isolated on Surface-1 #FFFFFF, within the warm canvas field.
Narrative: "It worked." — the single most reassuring visual in the flow.
Emotion: Calm certainty; the transaction is done and a human will follow up.
Lighting: Soft ambient, flat.
Camera: Front-facing, centered.
Composition: Mark centered at 96px, generous padding, no competing elements.
Color palette: Success green #2E7D32 mark, Surface-1 #FFFFFF field, Ink #111111
              for the headline beside/above it.
Rendering style: Clean flat UI illustration, no gradient, no grain.
Aspect ratio: 1:1
Negative: No confetti, no fireworks, no trophy icons, no 3D, no gold coins,
          no celebratory clutter.
```

**Primary prompt (dialog backdrop — quiet ambient wash):**
```
Subject: A barely-there warm wash identical in spirit to the Auth vignette — canvas
       #F5F1EC deepening slightly to Surface-2 #EBE7E1, with a faint accent
       #FF5600 glimmer at 2-3% in the upper-right. The checkout panel itself stays
       clean white and untouched.
Narrative: The checkout should feel unhurried and safe — atmosphere is present
          but never competes with the form.
Emotion: Trust and focus.
Composition: Designed as a backdrop behind the dialog, no focal point.
Aspect ratio: 16:9
Negative: No shapes, no patterns, no text, no cold blue tones.
```

**Component rules (from `PaymentModal.tsx`):**
- Panel: `bg-surface-1 rounded-xl p-6 w-full max-w-lg shadow-xl border border-hairline` — the dialog is the one place box-shadow elevation is allowed (`shadow-xl`) to separate it from the canvas; the hairline border still reads as the brand's flat language.
- Order summary strip: `rounded-lg bg-surface-2 px-4 py-3` with plan name left, price right — the two-line summary (`tier` + billing cadence) reads as a receipt stub, quiet and trustworthy.
- Close button: ghost icon button, `text-ink-tertiary hover:text-ink hover:bg-surface-2`, focus ring `ring-ink/30`, `aria-label="Close"`.
- Demo disclosure: centered `text-xs text-ink-tertiary` "Demo checkout — no real charge will be made." — honesty as brand warmth.
- Success state: full-width accent Button labeled "Start chatting with the HireHub team" — the handoff from money to conversation is the single most important action on the screen.
- Sign-in gate: if no user, replace form with centered "Sign in required" and an accent Link to `/login` — never show a form a user can't submit.

---

## Section: Messages Tab (Support Conversation + Thread)

**Emotional objective:** Reassurance + Human Presence

**Primary prompt (conversation thread illustration):**
```
Subject: A flat UI illustration of a two-person chat — three surface-2 message
       bubbles on the left (team replies) and two ink-dark bubbles on the right
       (the user), each rounded with 8px corners and a small sender label above
       the first bubble. The last team bubble carries a small orange accent
       outline to suggest "a human is typing."
Environment: Isolated on Canvas #F5F1EC, inside a hairline-bordered white card.
Narrative: A real person on the other side — hiring help that talks back.
Emotion: Relief and approachability; no ticket queue, no bot maze.
Lighting: Soft ambient, flat.
Camera: Front-facing, flat lay.
Composition: Bubbles stack naturally, mine-aligned right, theirs left, 20% padding.
Color palette: Surface-1 #FFFFFF card, Surface-2 #EBE7E1 theirs, Ink #111111 mine,
              Ink-muted #626260 sender labels, accent #FF5600 for the active row
              tint and the typing hint.
Rendering style: Clean flat UI illustration, 1.5px-consistent detail.
Aspect ratio: 16:9
Negative: No notification bell icons, no avatars with logos, no glassmorphism,
          no thick borders, no blue chat clichés.
```

**Component rules (from `MessagesTab.tsx`):**
- Two-pane layout: conversation list `lg:col-span-1` + thread `lg:col-span-2`, in a `grid-cols-1 lg:grid-cols-3`; both panes `border border-hairline rounded-lg bg-surface-1`.
- Conversation rows are full-width buttons: active row `bg-accent/10`, hover `hover:bg-surface-2`, hairline dividers, focus ring `ring-ink/30`. The active tint is the only accent in the list — one selected item, unambiguous.
- Row content: name (`text-sm font-medium text-ink`), job title + last message (`text-xs/text-sm text-ink-muted`), timestamp right-aligned (`text-xs text-ink-tertiary`).
- Thread header: name + job title, hairline bottom border.
- Message bubbles: `max-w-[80%] rounded-lg px-3 py-2 text-sm`; mine `ml-auto bg-ink text-surface-1` (ink-dark — the brand's inverse surface reads as "you"), theirs `bg-surface-2 text-ink` (warm neutral — "them"). Sender label `text-xs opacity-70`.
- The **"HireHub Team"** label (`role === 'ADMIN'`) is the brand's persona in chat — the team is one named presence, not a faceless support address.
- Composer: hairline top border, input `border-hairline rounded-md` matching the global Input style, Send button `bg-ink text-surface-1` with a `Send` icon, disabled at `opacity-50` while sending or empty.
- Empty thread: centered "No messages yet. Say hello!" — an invitation, not a dead end.
- Empty list: centered `MessageSquare` icon `w-12 h-12 text-ink-tertiary` + "No conversations yet."
- `?conv=` deep link auto-opens a conversation — the handoff from PaymentModal lands the user directly in the thread, so the transition should feel continuous (same card language, same entrance motion).

---

## Section: Hiring Flow Modal (Application Status Timeline)

**Emotional objective:** Reassurance + Progress

**Primary prompt (timeline status illustration):**
```
Subject: A flat vertical progress timeline — four circular nodes connected by thin
       vertical lines. The first three nodes are tinted accent (soft orange fill,
       orange ring, white checkmark inside); the fourth is an empty hairline
       circle with a small clock icon. Beside each node, a stage label and a
       one-line description in ink-muted.
Environment: Isolated on Surface-1 #FFFFFF inside the dialog panel.
Narrative: "We'll keep you updated here at every stage. No chasing required."
          — the timeline is the promise made visible.
Emotion: Calm certainty about what happens next, zero anxiety about the unknown.
Lighting: Flat ambient.
Camera: Front-facing.
Composition: Vertical stack, nodes on a fixed 32px column, text to the right,
            generous vertical rhythm, connectors flush with node colors.
Color palette: Accent #FF5600 tint (10% fill) + ring for reached nodes, Hairline
              #D3CEC6 for upcoming, Ink #111111 current label, Ink-muted
              #626260 descriptions, Success-adjacent neutral for nothing else.
Rendering style: Clean flat UI illustration.
Aspect ratio: 9:16
Negative: No stepper arrows, no progress-bar clichés, no confetti, no gamification.
```

**Component rules (from `HiringFlowModal.tsx`):**
- Nodes: `w-8 h-8 rounded-full border` — reached = `bg-accent/10 border-accent text-accent` with a `Check` icon; upcoming = `border-hairline text-ink-tertiary` with a `Clock` icon. State is carried by icon + color, not color alone.
- Connectors: `w-px flex-1 min-h-6`, `bg-accent/30` when reached, `bg-hairline` otherwise — the gradient of commitment is orange, quietly.
- Stage label: current = `text-accent` with a tiny inline "Current" tag; reached = `text-ink`; upcoming = `text-ink-muted`.
- Rejected state: `text-error bg-error/10 px-3 py-2 rounded-md` — honest but encouraging ("keep applying — new roles are posted weekly"), never a dead end.
- Interviewing state: hairline `border-t` divider, `Calendar` icon in accent next to "Upcoming interview".
- The whole panel scrolls (`max-h-[85vh] overflow-y-auto`) — long flows stay readable on small screens.

---

## Section: Apply Success (Post-Application)

**Emotional objective:** Relief + Confirmation

**Component rules (from `ApplySuccess.tsx`):**
- Backdrop: `absolute inset-0 opacity-25` background image (`/apply-success-bg.png`) — decorative, `aria-hidden`, lazy-loaded. The glow behind the success message is real imagery but so soft it reads as atmosphere, not noise.
- Content: centered stack — `CheckCircle` `w-16 h-16 text-success` (`aria-hidden`), headline "Application Submitted!", body copy in `text-ink-muted`, resume-attached line in `text-ink-tertiary`, and a single accent `Button` ("Done").
- Visual hierarchy: one big confirmation mark, one primary action. Nothing else competes.

**Primary prompt (success backdrop — reward bloom):**
```
Subject: A soft radial bloom — warm canvas #F5F1EC core brightening to a gentle
       white center behind the success content, with a very faint success-green
       undertone at 4% at the core and the standard accent #FF5600 glow in the
       upper-right. No shapes, no confetti.
Narrative: The application landed — a quiet glow of confirmation after the effort
          of applying.
Emotion: Relief, slight elation, trust.
Composition: Center-weighted glow behind the message, warm falloff.
Aspect ratio: 4:3
Negative: Same as parent Apply Success section, plus no celebration graphics.
```

---

## Section: Resume Replace & Upload (File States)

**Emotional objective:** Control + Confidence

**Component rules (from `SeekerResumeStep.tsx`, `ApplyJobForm.tsx`):**
- Returning users see their existing resume as a pill with file name, a short "choose a new file to replace it" hint, and a **Replace** control styled `text-accent` with `focus-visible:ring-2 ring-ink/30` — the replace affordance must be visually present, never a read-only surprise.
- Empty-state dropzone and the remove-resume ("X") control in the apply form both carry the focus ring; the dropzone reads as clickable even before focus.
- Confirmation language: new file name appears in place of the old one after selection — the change is immediate and visible.

**Primary prompt (resume upload illustration):**
```
Subject: A flat illustration of a document with a folded corner (PDF-style), a
       small orange upload arrow over it, and a tiny success-green check badge
       in the corner. Minimal, single-color ink line work with accent and
       success details.
Environment: Isolated on Canvas #F5F1EC.
Narrative: Your document is in good hands — upload is safe, replace is easy.
Emotion: Confidence and control over the user's own data.
Rendering style: Flat 2D vector, consistent 1.5px strokes.
Aspect ratio: 1:1
Negative: No folder metaphors, no cloud shapes, no 3D paper folds.
```

---

## Section: Bulk Import Prompt (Post-Job / ImportPromptButton)

**Emotional objective:** Efficiency + Competence

**Component rules (from `ImportPromptButton.tsx`):**
- Ghost-level control: `bg-transparent px-3 py-1.5 text-sm font-medium text-ink-muted`, `hover:bg-surface-2 hover:text-ink`, focus ring `ring-ink/30`.
- Two-word state swap on copy: label flips to **"Copied!"** for ~2s then back — confirmation in place, no toast needed, no layout shift.

**Primary prompt (clipboard/paste illustration):**
```
Subject: A minimal flat clipboard with a small orange spark or plus at its corner,
       suggesting "paste your bulk jobs here." Clean single-tone line work.
Environment: Isolated on Canvas #F5F1EC.
Narrative: Many jobs, one paste — the import flow rewards the prepared.
Emotion: Competence and time-saved.
Rendering style: Flat 2D vector, 1.5px consistent strokes.
Aspect ratio: 1:1
Negative: No robotic icons, no conveyor-belt metaphors, no multi-step arrows.
```

---

## Section: Empty / Loading / Error States (Shared)

**Emotional objective:** Patience + Recovery

**Component rules (from `SkeletonGrid`, `ErrorState`, MessagesTab/PricingSection usage):**
- Loading: `animate-pulse bg-surface-2` skeletons (`SkeletonGrid count={3}` in pricing, `count={3} columns={2}` in messages) — warm neutral shimmer, never spinner-only pages.
- Error: `ErrorState` with `text-error` message + a `primary` "try again" Button wired to refetch (`onRetry`), centered `py-16`.
- Empty: centered icon `text-ink-tertiary` + ink-muted copy + accent action when one exists.

---

## Motion System Addendum (WS3 surfaces)

Ground truth from the shipped components:

| Surface | Motion | Values |
|---------|--------|--------|
| Dialog overlay | fade | opacity 0 → 1, 0.2s |
| Dialog panel | enter | opacity 0 → 1, y 16 → 0, scale 0.96 → 1, 0.25s `easeOut`; exit mirrors |
| Pricing card | hover | y 0 → −6, 0.25s `easeOut` (featured card keeps its border accent) |
| Message bubble | enter | opacity 0 → 1, y 6 → 0 |
| Section reveals | scroll | opacity 0, y 24 → 1, y 0, 0.45s easeOut (parent file) |

Rules: all motion honors `prefers-reduced-motion` (global `index.css` + per-component `useReducedMotion()`). Keep dialog motion under 300ms — the checkout→chat handoff should feel instant, not cinematic.

---

## Image Generation Checklist (WS3 additions)

When generating imagery for these surfaces:
- [ ] Matches the section's emotional objective above
- [ ] Follows parent Photography/Illustration DNA (flat vector, 1.5px strokes, warm neutrals)
- [ ] Uses brand palette tokens only (no new hexes)
- [ ] Success states: green `#2e7d32` confirmation, never celebratory clutter
- [ ] Chat visuals: ink-dark = "mine", surface-2 = "theirs", accent = active/attention
- [ ] Modals stay flat white panels over the warm canvas wash — no glass, no gradients
- [ ] No cold blue tones, no stock tropes, no busy backgrounds
- [ ] Correct aspect ratio for placement (1:1 icons, 16:9 backdrops)
