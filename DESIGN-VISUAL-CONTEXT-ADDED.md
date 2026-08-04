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

## Section: Dashboard Mobile (9:16)

**Emotional objective:** Quiet Focus + Competence

**Primary prompt (mobile dashboard overview — 9:16):**
```
Subject: A single hand holding a smartphone in a portrait orientation, thumb
       resting at the side, the HireHub dashboard overview legible on screen:
       a profile summary card at the top (avatar, name, headline, location),
       three tinted stat cards in a row (Applications, Saved Jobs, Interviews),
       a 4-column detail strip (email, salary expectation, employment type,
       work mode), and a wrap of small muted skill chips. The faint
       overview-grid background pattern sits behind the stat cards.
Environment: A softly lit desk or café corner behind the hand and phone, falling
           into a warm neutral blur that matches the brand canvas.
Narrative: Opportunity status at a glance — the quick check-in between tasks,
          thumb away from tapping.
Emotion: Quiet focus and competence; the data reads instantly.
Lighting: Soft natural light from camera-left, gentle warm falloff.
Camera: Straight-on to the screen at a slight downward angle, intimate distance.
Lens: 50mm f/2.8.
Composition: Phone occupies the center two-thirds of frame, screen bright and
            legible, ~30% warm negative space around it for editorial feel.
Color palette: Canvas #F5F1EC, Surface-1 #FFFFFF cards, Surface-2 #EBE7E1
              stat-card icon tints, Ink #111111 text, Ink-muted #626260 labels,
              Accent #FF5600 on the interview icon and Edit-profile link,
              Hairline #D3CEC6 borders.
Rendering style: Editorial photography of a real UI screen, crisp type, warm
                neutral color grade, 2-3% film grain.
Aspect ratio: 9:16
Negative: No cold blue tones, no stock hand-and-phone tropes, no visible
          background UI, no oversaturation, no heavy drop shadows.
```

**Component rules (from DashboardShell.tsx / OverviewTab.tsx):**
- Screen canvas: `bg-canvas` warm neutral; the profile summary and stat cards are `bg-surface-1` with `border-hairline`.
- Stat cards: `w-12 h-12 rounded-full` icon chips tinted `bg-blue-100 text-blue-600`, `bg-purple-100 text-purple-600`, `bg-green-100 text-green-600` — the only color beyond ink and accent; numbers `text-2xl font-semibold text-ink`.
- Accent `#ff5600` appears only as the Edit-profile link and the hover arrow — keep it sparse in the hero image.
- The grid behind the stat cards is `/overview-grid-bg.svg`, `text-ink` at low opacity — the "city of opportunities" pattern.
- Typography: Inter — name `text-lg font-semibold text-ink`, labels `text-sm text-ink-muted`, detail labels `text-xs text-ink-tertiary`.

---

## Section: Dashboard Profile Card (Light / Dark)

**Emotional objective:** Approachable + Credible

**Primary prompt (profile card avatar — neutral subject, light mode):**
```
Subject: One neutral professional subject (early 30s, warm medium-brown skin,
       short dark hair, soft amber sweater) photographed from the chest up at a
       slight angle, looking just off-camera with a calm, genuine smile. Framed
       as the avatar space of a profile card — small in frame, centered in the
       upper third.
Environment: A softly blurred warm interior — cream wall and warm lamplight —
           reading as the card background, not a studio backdrop.
Narrative: A real person, present and approachable — a face a candidate would
          scroll past and remember.
Emotion: Warm credibility — professional without being posed.
Lighting: Soft window light from camera-right, gentle warmth on skin.
Camera: Eye level, chest-up crop, intimate but not close.
Lens: 85mm f/2.0.
Composition: Subject centered in the upper third, ~50% negative space below and
            around for the card's name, headline, location, detail grid, skill
            chips, and resume row.
Color palette: Canvas #F5F1EC, Surface-1 #FFFFFF, Ink #111111, Ink-muted
              #626260, Ink-tertiary #9C9FA5, Accent #FF5600 (small detail),
              Hairline #D3CEC6.
Rendering style: Editorial portrait photography, warm neutral grade, 3% grain.
Aspect ratio: 4:3
Negative: No corporate blue suits, no forced smiles, no studio strobes, no cold
          tones, no stock-photo posing, no text overlays.
```

**Alt variant (same subject and scene, dark mode):**
```
Subject: The same subject, same pose, same expression, same crop — nothing
       changes except the surface tones around them.
Environment: The same interior rendered with the theme inverted — the warm canvas
           darkens to a deep warm charcoal, card surfaces to a dark warm gray,
           ink flips to warm white, hairlines become low-opacity warm outlines.
Narrative: The same person in the same room at a different hour — identity is
          unchanged by theme.
Emotion: Warm credibility in low light — same warmth, darker surfaces.
Lighting: Same window light, slightly dimmed to match the darker surfaces.
Camera: Same framing and distance as the light variant.
Composition: Identical placement — the light/dark pair must read as one card in
            two themes, so negative space and crop are pixel-consistent.
Color palette: Dark canvas ≈ #1F1C19, dark card surface ≈ #2A2622, ink →
              warm white #F5F1EC, accent #FF5600 retained, hairlines ≈ #3A3530
              at low opacity.
Rendering style: Same as primary, matching dark color grade.
Aspect ratio: 4:3
Negative: Same as primary, plus no pure-black backgrounds and no saturated blues.
```

**Component rules (from OverviewTab.tsx):**
- Card: `Card variant="default" className="p-5"` — `bg-surface-1` in light, its dark-theme equivalent in dark; hairline border.
- Avatar: `Avatar size="lg"` with initials fallback; name `text-lg font-semibold text-ink truncate`, headline `text-sm text-ink-muted truncate`, location a `MapPin` icon + `text-sm text-ink-muted`.
- Detail grid: `grid grid-cols-2 sm:grid-cols-4 gap-3` — each cell a `text-xs text-ink-tertiary` label over a `text-ink font-medium truncate` value.
- Skill chips: `bg-surface-2 text-ink-muted rounded-pill` — muted by design; accent is reserved for the Edit-profile link.
- Resume row: `text-sm text-ink-muted` with the file name in `text-ink font-medium`.

---

## Section: Blog Covers — August 2026 Digest

**Emotional objective:** Curiosity → Trust

> One photoshoot, five scenes. The August 2026 digest covers share a single warm
> color grade, soft directional window light from camera-left, 3% film grain, and
> 8K editorial still-life realism — no people in any frame. Distinct subjects,
> one light signature.

**Primary prompt (`blog-cover-us-labor-2026.png` — job market / economic outlook):**
```
Subject: A plain whiteboard on a wooden easel, angled slightly, with a hand-drawn
       market chart in dry-erase marker — an ink-black line climbing steadily,
       then flattening into a gentle plateau, with small accent-orange
       annotations at the elbow of the curve. A marker and a stone-gray eraser
       rest on the tray. On the warm oak table beside it, a folded morning
       newspaper and a ceramic mug of coffee.
Environment: A quiet, sunlit meeting corner — a warm cream wall, a frosted-glass
           window casting soft directional light, the whiteboard dominating the
           frame. No people, no other desks.
Narrative: The economy cooling from rapid growth into a steady, cautious plateau
          — "low-hire, low-fire." The flattened curve reads as stability, not
          stagnation; the morning paper suggests informed, deliberate optimism.
Emotion: Calm, measured confidence — a steady outlook delivered without hype.
Lighting: Soft morning window light from camera-left, diffused and warm, with a
         gentle shadow falloff across the whiteboard's matte surface.
Camera: Three-quarter front view, eye level on the chart, slight downward tilt.
Lens: 50mm f/2.8.
Composition: The whiteboard anchors the left two-thirds; the coffee and newspaper
            balance the lower-right on the table. 25% negative space upper-right
            for headline. Chart line readable at a glance.
Color palette: Whiteboard white #FFFFFF, canvas #F5F1EC walls, surface-2 #EBE7E1
              in the table shadow, ink #111111 chart line and annotations,
              accent #FF5600 annotation arrows, warm oak wood tones.
Materials: Whiteboard enamel, dry-erase marker ink, wood (easel and table),
          ceramic (mug), newsprint (paper).
Textures: 3% film grain, a faint dry-erase smudge on the board, soft paper tooth
         on the newspaper.
Rendering style: Editorial still-life photography, warm neutral color grade,
                consistent with the rest of the digest shoot.
Quality: 8K, marker-line detail sharp, no retouching beyond color.
Aspect ratio: 16:9
Negative: No people, no faces, no staged-office props, no red-tape clichés, no
         screen captures, no cold blue cast, no stock financial imagery.
```

**Primary prompt (`blog-cover-job-search-2026.png` — job-search strategy):**
```
Subject: A top-down desk scene of a deliberate job search — a printed resume on
       warm white paper with a soft highlighter sweep across the headline, a
       black gel pen, a paper shortlist checklist with a few boxes ticked in
       ink, and a smartphone propped at the edge showing a clean job-listing
       page. A small coffee cup anchors the corner of the desk.
Environment: A tidy home desk with a warm oak surface in soft daylight. No people,
           no laptop open — the phone is the only screen.
Narrative: A search run with intention — resume, shortlist, checklist, and one
          listing on screen. The scene says "organized, one step at a time."
Emotion: Calm control and quiet optimism — preparation as a form of confidence.
Lighting: Soft diffused window light from camera-left, even top-down illumination,
         gentle warm shadows under each object.
Camera: Directly overhead (top-down), flat and true.
Lens: 40mm f/5.6, deep focus across the desk.
Composition: The resume dominates the lower-left with the highlighter and pen at
            its edge; the checklist and phone form a diagonal in the upper-right.
            20% negative space upper-left for headline.
Color palette: Warm white paper #FFFFFF, canvas #F5F1EC wood tones, surface-2
              #EBE7E1 in the checklist paper and the phone-case shadow, ink
              #111111 text and tick marks, accent #FF5600 highlighter sweep and
              listing highlights.
Materials: Paper (resume, checklist), plastic (highlighter, pen barrel), glass
          (phone screen), ceramic (mug), warm oak (desk).
Textures: 3% film grain, subtle paper grain on the resume, faint highlighter
         bleed along the sweep.
Rendering style: Editorial top-down still-life photography, warm neutral grade,
                matching the digest shoot.
Quality: 8K, crisp printed type and highlighter detail.
Aspect ratio: 16:9
Negative: No people, no hands, no faces, no staged-office desk clichés, no cold
         blue screen glow dominating, no visible monitor.
```

**Primary prompt (`blog-cover-culture-2026.png` — workplace culture trends):**
```
Subject: Two empty wooden chairs pulled close to one side of a small round table,
       angled toward each other as if two people were mid-conversation. Between
       them, a shared open notebook with handwritten notes and a ceramic coffee
       cup. Morning light falls through window blinds, drawing soft stripes of
       warmth over the table and the notebook.
Environment: A warm collaborative corner — cream walls, a window with light
           wooden blinds, a small sideboard with a plant. No people.
Narrative: Belonging and human connection — the two chairs turned toward each
          other say "we talk here." The shared notebook is the work of a
          partnership, not a row of solo desks.
Emotion: Warm belonging, quiet companionship, psychological safety.
Lighting: Soft morning sunlight through the blinds from camera-right, casting
         gentle striped shadows, with warm fill from the room.
Camera: Slightly low three-quarter angle at table height, the chairs in the
        foreground.
Lens: 35mm f/2.8.
Composition: The two chairs form a V opening toward the camera, the notebook and
            coffee at the pivot point between them. 25% negative space upper-left
            for headline.
Color palette: Warm cream walls and canvas #F5F1EC, surface-2 #EBE7E1 in the
              notebook paper and chair shadows, ink #111111 handwritten notes,
              accent #FF5600 on the coffee cup and one notebook tab, warm wood
              tones.
Materials: Wood (chairs, table), linen (chair seats), paper (notebook), ceramic
          (cup), glass (window).
Textures: 3% film grain, subtle linen weave on the seats, soft wood grain.
Rendering style: Editorial still-life photography, warm natural grade, the same
                light signature as the rest of the digest shoot.
Quality: 8K, window-light stripes crisp, fabric weave visible.
Aspect ratio: 16:9
Negative: No people, no faces, no handshakes, no staged-office clichés, no
         empty-cubicle tropes, no cold blue cast.
```

**Primary prompt (`blog-cover-remote-2026.png` — remote work landscape):**
```
Subject: A sunlit home-office corner — a closed laptop angled on a warm wooden
       desk, a cushioned over-ear headset beside it, and a window behind the
       desk with a green plant on the sill. A small canvas travel bag rests
       against the desk leg, hinting at work-from-anywhere.
Environment: A bright home office by a large window with sheer curtains and
           morning sun. A soft rug, a mug, and a stack of notebooks keep it
           human. No people.
Narrative: Flexibility and balance — the work lives in this room, the bag says
          it can also live anywhere. The closed laptop says the day belongs to
          its owner.
Emotion: Easy, calm flexibility — freedom without chaos.
Lighting: Bright warm morning window light from behind the laptop, a gentle flare
         on the sheer curtain, warm ambient fill in the room.
Camera: Three-quarter eye-level view, slightly above the desk line.
Lens: 35mm f/2.0.
Composition: Laptop center with the headset to its left, window and plant in the
            upper-right, the travel bag anchoring the lower-left. 20% negative
            space upper-left for headline.
Color palette: Canvas #F5F1EC walls and sheers, surface-2 #EBE7E1 in the rug and
              bag, ink #111111 laptop and headset, accent #FF5600 on a notebook
              edge and the plant-pot detail, warm wood desk tones.
Materials: Anodized aluminum (laptop), leather and foam (headset), linen and
          canvas (bag, curtain), terracotta (pot), wood (desk).
Textures: 3% film grain, soft linen weave on the curtain, subtle leather grain.
Rendering style: Editorial still-life photography, warm sunlit grade matching the
                digest shoot.
Quality: 8K, fabric and plant detail sharp.
Aspect ratio: 16:9
Negative: No people, no faces, no staged videoconference clichés, no open laptop
         with a webcam, no cold blue screen glow, no sterile setups.
```

**Primary prompt (`blog-cover-ai-2026.png` — AI at work):**
```
Subject: A laptop on a warm wooden desk showing a clean, minimal interface — a
       soft pale dashboard with simple card shapes and a single accent-orange
       highlight — with a thin human notebook beside it filled with handwritten
       notes and a small coffee cup. A very subtle warm glow emanates from the
       screen.
Environment: A quiet home study in warm daylight, a plant at the edge of the
           frame, cream walls, the desk surface catching soft window light.
           No people.
Narrative: Augmentation, not replacement — the machine renders the clean
          interface while the handwritten notebook beside it holds the human
          decisions. They work together on the same desk.
Emotion: Steady reassurance — technology as a calm tool, not a threat.
Lighting: Soft window light from camera-left with a gentle warm bloom from the
         screen toward the notebook.
Camera: Slightly elevated three-quarter view, desk-level intimacy.
Lens: 50mm f/2.8.
Composition: Laptop on the left with the notebook overlapping its right edge,
            coffee in the lower-right corner, the screen glow bridging the two.
            20% negative space upper-right for headline.
Color palette: Warm white interface cards #FFFFFF on a canvas #F5F1EC screen
              background, surface-2 #EBE7E1 in the keyboard and notebook cover,
              ink #111111 interface text and handwriting, accent #FF5600 on the
              interface highlight and the mug.
Materials: Anodized aluminum (laptop), paper (notebook), ink, ceramic (mug),
          wood (desk), glass (screen).
Textures: 3% film grain, paper grain on the notebook, subtle screen-glass sheen.
Rendering style: Editorial still-life photography, warm grade, identical light
                signature to the other digest covers.
Quality: 8K, screen pixels and handwriting legible.
Aspect ratio: 16:9
Negative: No people, no faces, no robotic or sci-fi imagery, no staged-office
         clichés, no cold blue interface glow, no dystopian tones.
```

---
