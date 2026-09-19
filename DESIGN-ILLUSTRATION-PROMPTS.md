# HireHub Community — Illustration Prompts (ChatGPT / DALL-E 3)

> Cartoon-style illustrations for HireHub's UI. Warm, friendly, community-driven.
> Style: Flat Cartoon with soft 3D touches — rounded shapes, warm palette, minimal detail.
> Palette: Canvas `#f5f1ec` | Accent `#ff5600` | Ink `#111111` | Surface `#ffffff` | Surface-2 `#ebe7e1`
> Shape language: Soft & Friendly — rounded corners, large simplified forms, no sharp edges.

---

## Illustration DNA (shared across all prompts)

```
Style: Flat cartoon illustration with soft dimensional shading. Rounded, friendly shapes.
       Clean vector-style linework with subtle gradient fills for depth.
       Warm color palette anchored to cream #f5f1ec and orange #ff5600.
       No hard outlines — use color contrast and soft shadows for definition.
       3% subtle grain overlay for warmth. Characters are simplified and stylized
       (1:3.5 head-to-body ratio), not realistic. Diverse, inclusive representation.
Background: Transparent or solid cream #f5f1ec unless otherwise specified.
Quality: Clean, professional, art-directed. Looks designed for this product, not generic.
```

---

## 1. Empty State — Saved Jobs

**Page:** `/dashboard` → Saved Jobs tab (when empty)
**Concept:** A character curiously browsing a floating gallery of job cards, but none have been picked yet — the gallery is waiting to be filled.
**UI context:** Centered in a content area, below a tab bar. Needs text-safe space above for the tab and below for a CTA button.

**Prompt:**
```
A warm, friendly cartoon illustration of a person standing in front of a floating
gallery of job listing cards. The person is casually dressed, with one hand on their
chin in a thoughtful pose, looking at the cards with gentle curiosity. The cards are
simple rounded rectangles with tiny colored dots representing company logos — they
float in a gentle arc around the character. A small heart icon floats near the
character's other hand, suggesting they're about to save one. The scene is calm and
inviting, not overwhelming. Soft cream background, warm orange accent on the heart
and one card highlight. Flat cartoon style with subtle dimensionality, rounded shapes,
no harsh outlines. The character should feel relatable and approachable — a real job
seeker browsing thoughtfully.
```

**Negative:** No photorealism, no text inside the image, no complex backgrounds, no cluttered scenes, no cold blue tones, no sharp geometric shapes.

**UI integration:** Transparent background. Character centered, cards arc above and around. Reserve top 25% for "No saved jobs yet" heading and bottom 20% for description text and CTA button.

---

## 2. Empty State — My Applications

**Page:** `/dashboard` → Applications tab (when empty)
**Concept:** A character holding a clipboard with a single checkmark, looking hopeful — the journey is just starting.
**UI context:** Same centered layout as Saved Jobs empty state.

**Prompt:**
```
A warm, friendly cartoon illustration of a person holding a clipboard with a
confident, hopeful expression. The clipboard has a clean document with one green
checkmark at the top and several empty lines below, suggesting applications yet
to be submitted. The person stands in a relaxed, upright posture with a slight
smile — they're ready to get started, not discouraged. A small arrow icon points
upward from the clipboard, suggesting forward momentum. Soft cream background,
warm orange accent on the clipboard clip and the arrow. Flat cartoon style with
soft shading, rounded friendly shapes, simplified character with warm skin tone
and casual-professional clothing. The mood is encouraging and forward-looking.
```

**Negative:** No photorealism, no text, no complex scenes, no sad or disappointed expressions, no cold colors, no sharp edges.

**UI integration:** Transparent background. Character centered. Reserve space above for heading and below for CTA.

---

## 3. Empty State — No Search Results

**Page:** `/jobs` → Job board (when filters return no results)
**Concept:** A character looking through a magnifying glass at an empty but friendly landscape — the search was thorough, just nothing matched yet.
**UI context:** Centered in the job listing area, replacing the job grid.

**Prompt:**
```
A warm, friendly cartoon illustration of a person holding a large magnifying glass
and looking through it with a slightly puzzled but not worried expression. They're
standing in a gentle, abstract landscape made of soft rounded shapes — small
floating circles and rounded rectangles in cream and light beige tones that suggest
a search space. A few tiny sparkle dots float nearby, suggesting something is about
to be found. The character's posture is relaxed, one foot slightly forward as if
they're mid-exploration. Soft cream background, warm orange accent on the magnifying
glass handle and one sparkle. Flat cartoon style, rounded shapes, friendly and
approachable. The mood says "keep looking, something's out there" rather than
"nothing exists."
```

**Negative:** No photorealism, no text, no sad expressions, no empty voids, no dark or gloomy tones, no sharp geometric elements.

**UI integration:** Transparent background. Character centered. Reserve top area for "No jobs found" heading and filter reset options.

---

## 4. Empty State — No Featured Jobs

**Page:** `/home` → FeaturedJobs section (when no featured jobs exist)
**Concept:** A welcoming scene of an empty but beautiful stage — curtains open, spotlight on, waiting for the show to begin.

**Prompt:**
```
A warm, friendly cartoon illustration of a small welcoming stage with soft
curtains pulled to the sides and a gentle spotlight shining down on an empty
center. The stage has a rounded, friendly shape — more like a soft platform than
a literal theater stage. A few tiny star shapes float in the spotlight beam,
adding warmth and anticipation. Below the stage, two small silhouetted figures
look up expectantly, suggesting an audience waiting. The overall feeling is
"the show is about to start" — hopeful and inviting. Soft cream background,
warm orange accent on the spotlight beam and curtain trim. Flat cartoon style,
rounded shapes, minimal detail. The mood is welcoming, not empty.
```

**Negative:** No photorealism, no text, no dark theater, no spooky lighting, no sharp edges, no cold tones.

**UI integration:** Transparent background. Centered. Reserve space above and below for "No featured jobs right now" text.

---

## 5. Success State — Application Submitted

**Page:** `/apply/landing` → After submitting a job application
**Concept:** A character walking through a doorway into a bright, warm light — the application has been sent and a new chapter begins.
**UI context:** Centered below a green checkmark icon and "Application Submitted!" heading.

**Prompt:**
```
A warm, friendly cartoon illustration of a person stepping through an open
doorway into a bright, warm glow. The person is seen from a slight angle,
one foot already through the door, looking forward with a calm, satisfied
expression. The doorway is simple and rounded — a soft arch shape rather
than a literal door frame. Warm light spills through from the other side,
casting a gentle glow on the character. A small document or paper floats
gently behind them, suggesting the application they just submitted. The
scene conveys completion and forward momentum. Soft cream background
with warm orange accent on the door frame and the light glow. Flat cartoon
style, rounded shapes, friendly and encouraging. The mood is "well done,
what's next."
```

**Negative:** No photorealism, no text, no confetti or celebration graphics, no cold colors, no sharp edges, no complex backgrounds.

**UI integration:** Transparent background. Character and doorway centered. Reserve space above for success icon/heading and below for next-step CTAs.

---

## 6. Success State — Onboarding Complete

**Page:** `/onboarding` → Final step of the onboarding wizard
**Concept:** A character standing proudly next to a completed profile card, giving a thumbs-up — setup is done, they're ready.

**Prompt:**
```
A warm, friendly cartoon illustration of a person standing next to a large,
simplified profile card with a satisfied thumbs-up gesture. The profile card
is a rounded rectangle with placeholder lines suggesting a completed form —
a small circular avatar area at the top, horizontal lines for name and details,
and a few small pill shapes representing skill tags. The character looks happy
and accomplished, with relaxed posture. A small green checkmark floats near
the top of the card. The scene feels like a finish line crossed. Soft cream
background, warm orange accent on the card border and the character's clothing
detail. Flat cartoon style, rounded shapes, simplified character, warm and
encouraging. The mood is "you're all set, let's go."
```

**Negative:** No photorealism, no text inside image, no confetti, no complex backgrounds, no cold colors, no sharp edges.

**UI integration:** Transparent background. Character and card centered. Reserve space above for completion heading and below for "Go to dashboard" CTA.

---

## 7. Homepage — Value Props ("For Talent", "For Employers", "For Teams")

**Page:** `/home` → ValueProps section
**Concept:** Three small vignettes showing the three audiences — each a tiny character scene in a rounded frame.

**Prompt (For Talent):**
```
A small, warm cartoon illustration of a person sitting at a desk with a laptop,
looking at the screen with a pleased expression. The laptop screen shows a
simplified job listing with a star icon, suggesting a great match has been found.
A small lightbulb icon floats above the character's head. The scene is contained
within a soft rounded circle. Soft cream background, warm orange accent on the
star and lightbulb. Flat cartoon style, minimal detail, friendly and inviting.
```

**Prompt (For Employers):**
```
A small, warm cartoon illustration of a person standing next to a simplified
hiring pipeline — three rounded rectangles stacked vertically with arrows
between them, the top one highlighted in orange. The person gestures toward
the pipeline with a confident, professional expression. The scene is contained
within a soft rounded circle. Soft cream background, warm orange accent on the
pipeline arrows and the person's clothing detail. Flat cartoon style, minimal
detail, professional and approachable.
```

**Prompt (For Teams):**
```
A small, warm cartoon illustration of three simplified characters standing
together, each holding a different colored puzzle piece. They're looking at
each other with friendly expressions, one piece already connected. The scene
is contained within a soft rounded circle. Soft cream background, warm orange
accent on one puzzle piece and the connection point. Flat cartoon style,
minimal detail, collaborative and warm.
```

**Negative:** No photorealism, no text, no complex backgrounds, no cold colors, no sharp edges, no detailed faces.

**UI integration:** Each illustration sits inside a card, centered above the card heading. 1:1 aspect ratio, roughly 120x120px rendered size.

---

## 8. Homepage — Why Us (AI Matching, Curated Listings, Culture Insights, Fast Apply)

**Page:** `/home` → WhyUs section
**Concept:** Four small icon-style illustrations, each a simple visual metaphor for one feature.

**Prompt (AI Matching):**
```
A small, simple cartoon illustration of a magnifying glass with a tiny brain
or gear icon inside it, hovering over a row of three simplified person icons.
One person icon is highlighted in orange with a small connection line to the
magnifying glass, suggesting a smart match. The style is flat, friendly, and
minimal — more icon than scene. Soft cream background, warm orange accent on
the match connection. Rounded shapes, no harsh outlines.
```

**Prompt (Curated Listings):**
```
A small, simple cartoon illustration of a clipboard with a document that has
three lines — two are gray and one is highlighted in orange with a small
checkmark. A tiny shield icon sits in the corner of the clipboard, suggesting
verification and quality. Flat, friendly, minimal style. Soft cream background,
warm orange accent on the verified listing. Rounded shapes, no harsh outlines.
```

**Prompt (Culture Insights):**
```
A small, simple cartoon illustration of two overlapping speech bubbles — one
in cream and one in light orange — with tiny heart and star icons floating
between them. The bubbles suggest conversation and insight. Below them, a
small simplified building icon represents a company. Flat, friendly, minimal
style. Soft cream background, warm orange accent on one bubble. Rounded
shapes, no harsh outlines.
```

**Prompt (Fast Apply):**
```
A small, simple cartoon illustration of a lightning bolt inside a rounded
rectangle (suggesting a button or form), with a small arrow pointing forward.
The lightning bolt is orange, the rectangle is cream with a soft border. The
entire icon suggests speed and one-click action. Flat, friendly, minimal
style. Soft cream background, warm orange accent on the bolt. Rounded shapes,
no harsh outlines.
```

**Negative:** No photorealism, no text, no complex scenes, no cold colors, no sharp geometric shapes, no detailed faces.

**UI integration:** Each illustration is 48x48px SVG, centered inside a circular icon container (`bg-accent/5`). Must read clearly at small sizes.

---

## 9. 404 Page — Not Found

**Page:** `/*` → NotFoundPage
**Concept:** A character standing at a friendly crossroads with a signpost pointing A small, simple cartoon illustration of a clipboard with a document that has
three lines — two are gray and one is highlighted in orange with a small
checkmark. A tiny shield icon sits in the corner of the clipboard, suggesting
verification and quality. Flat, friendly, minimal style. Soft cream background,
warm orange accent on the verified listing. Rounded shapes, no harsh outlines.in multiple directions — lost but not worried.
**UI context:** Full-screen centered layout with "404" heading and "Go home" link.

**Prompt:**
```
A warm, friendly cartoon illustration of a person standing at a simple
crossroads signpost with three rounded arrow signs pointing in different
directions. The person has one hand on their hip and the other scratching
their head with a mildly confused but amused expression — not worried,
just taking a moment to reorient. The signpost is soft and rounded, more
whimsical than literal. A small path winds away into a gentle background
of soft cream hills. The overall feeling is "wrong turn, but it's fine."
Soft cream background, warm orange accent on one sign arrow and the person's
shoe detail. Flat cartoon style, rounded shapes, friendly and disarming.
The mood is warm recovery — you're lost, but you'll find your way.
```

**Negative:** No photorealism, no text, no scary or dark elements, no sharp edges, no cold colors, no dead ends or barriers.

**UI integration:** Transparent background. Character and signpost centered in the lower 60%. Reserve top 40% for "404" heading and "Page not found" text.

---

## 10. Onboarding — Step 1: Basics

**Page:** `/onboarding` → SeekerBasicsStep
**Concept:** A character at a desk filling in a form, looking focused but relaxed — the first step is easy.

**Prompt:**
```
A warm, friendly cartoon illustration of a person sitting at a simple desk,
writing on a form with a pen. The form is a simplified rounded rectangle
with a few horizontal lines. The person looks focused but relaxed — a slight
smile, comfortable posture. A small progress bar (one segment filled in
orange) floats above the scene, suggesting this is step one of a journey.
A coffee cup sits on the desk. Soft cream background, warm orange accent on
the progress bar and the pen. Flat cartoon style, rounded shapes, friendly
and encouraging. The mood is "this is easy, keep going."
```

**Negative:** No photorealism, no text, no complex backgrounds, no cold colors, no sharp edges, no stress or frustration.

**UI integration:** Transparent background. Scene centered. Reserve space above for progress bar and below for form fields.

---

## 11. Onboarding — Step 2: Resume Upload

**Page:** `/onboarding` → SeekerResumeStep
**Concept:** A character placing a document into a folder or tray — a simple, satisfying action.

**Prompt:**
```
A warm, friendly cartoon illustration of a person dropping a document (a
simplified paper with lines) into an open folder or tray. The document is
mid-float, just about to land — capturing the satisfying moment of the
drop. The person has a casual, pleased expression. A small cloud upload
icon floats nearby, suggesting digital upload. Soft cream background, warm
orange accent on the folder edge and the upload icon. Flat cartoon style,
rounded shapes, friendly and simple. The mood is "drop it in, you're done."
```

**Negative:** No photorealism, no text, no complex scenes, no cold colors, no sharp edges.

**UI integration:** Transparent background. Scene centered. This step is optional — the illustration should feel light and low-pressure.

---

## 12. Onboarding — Step 3: Skills

**Page:** `/onboarding` → SeekerSkillsStep
**Concept:** A character surrounded by floating skill tags/pills — they're choosing which ones apply.

**Prompt:**
```
A warm, friendly cartoon illustration of a person standing with arms slightly
open, surrounded by floating pill-shaped tags in various soft colors. The
tags represent skills — some are closer to the character (already selected,
highlighted in orange), others float further away (not yet chosen, in cream
and light gray). The character looks engaged and thoughtful, like they're
picking their favorites from a menu. Soft cream background, warm orange
accent on selected tags. Flat cartoon style, rounded shapes, friendly and
playful. The mood is "show us what you're good at."
```

**Negative:** No photorealism, no text inside tags, no complex backgrounds, no cold colors, no sharp edges.

**UI integration:** Transparent background. Character centered, tags floating around them. Reserve space above for step heading and below for input field.

---

## 13. Onboarding — Step 4: Preferences

**Page:** `/onboarding` → SeekerPreferencesStep
**Concept:** A character adjusting sliders or toggles — setting their preferences with ease.

**Prompt:**
```
A warm, friendly cartoon illustration of a person reaching toward a set of
three simplified horizontal sliders or toggle switches. The sliders are at
different positions — one in the middle, one near the top, one near the
bottom — suggesting salary range, job type, and remote preference. The
person has a relaxed, confident expression, one hand casually adjusting
a slider. Soft cream background, warm orange accent on the active slider
positions. Flat cartoon style, rounded shapes, friendly and minimal. The
mood is "tailor it to you."
```

**Negative:** No photorealism, no text, no complex UI mockups, no cold colors, no sharp edges.

**UI integration:** Transparent background. Scene centered. This step is optional — illustration should feel low-pressure and customizable.

---

## 14. Blog Cover — Illustrated Style (Job Market)

**Page:** `/blog` → Blog post covers (illustrated alternative to photography)
**Concept:** A stylized cityscape with upward-trending lines — abstract representation of economic momentum.

**Prompt:**
```
A warm, editorial cartoon illustration of a simplified cityscape seen from
a slight isometric angle. The buildings are soft rounded rectangles in cream
and light beige tones. A bold orange line weaves through the skyline like a
trend chart — it rises steadily, curves gently, and continues upward. Small
dots mark key points along the line. A few tiny simplified figures walk the
streets below, suggesting real people in a real economy. The sky is a warm
cream gradient. The style is clean, editorial, and sophisticated — more
magazine illustration than children's book. Flat with subtle dimensionality.
Soft cream palette with warm orange as the only strong color. The mood is
measured optimism — growth is happening, but it's steady, not frantic.
```

**Negative:** No photorealism, no text, no stock chart clichés, no cold blue tones, no harsh outlines, no complex detail.

**UI integration:** Full-bleed cover image, 16:9. Text-safe zone in upper-right 40% for blog title overlay.

---

## 15. Blog Cover — Illustrated Style (Remote Work)

**Page:** `/blog` → Blog post covers
**Concept:** A split scene — home on one side, office on the other, connected by a warm orange line.

**Prompt:**
```
A warm, editorial cartoon illustration showing a split scene: on the left,
a cozy home desk with a laptop, a coffee cup, and a small plant; on the
right, a modern office desk with a monitor and a notebook. A warm orange
line connects the two scenes, flowing smoothly from one side to the other
like a bridge. The line has small nodes along it suggesting connectivity.
Both scenes are rendered in soft, rounded shapes with cream and beige tones.
A few small figures — one at each desk — suggest work happening in both
spaces. The style is clean and editorial. The mood is flexibility — work
happens wherever you are, and the connection between spaces is seamless.
```

**Negative:** No photorealism, no text, no video call clichés, no cold colors, no sharp edges, no sterile office imagery.

**UI integration:** Full-bleed cover image, 16:9. Text-safe zone in upper-left 40%.

---

## 16. Blog Cover — Illustrated Style (AI at Work)

**Page:** `/blog` → Blog post covers
**Concept:** A character and a friendly robot working side by side at a desk — collaboration, not replacement.

**Prompt:**
```
A warm, editorial cartoon illustration of a person and a small, friendly
robot sitting side by side at a desk. The person is writing in a notebook
while the robot sorts through a stack of simplified documents. They're not
competing — they're collaborating, each doing what they do best. The robot
is rounded, soft, and approachable — more assistant than sci-fi. A small
lightbulb icon floats between them, suggesting shared ideas. The desk has
a coffee cup and a small plant. Soft cream background, warm orange accent
on the lightbulb and the robot's chest panel. Flat cartoon style, editorial
and sophisticated. The mood is partnership — AI as a helpful colleague,
not a threat.
```

**Negative:** No photorealism, no text, no dystopian imagery, no cold blue tones, no menacing robots, no sharp edges.

**UI integration:** Full-bleed cover image, 16:9. Text-safe zone in upper-right 40%.

---

## 17. Employers Page — Feature Illustration

**Page:** `/employers` → EmployerFeatures section
**Concept:** A bird's-eye view of a hiring pipeline — simplified cards flowing through stages.

**Prompt:**
```
A warm, friendly cartoon illustration seen from a slightly elevated angle
showing a simplified hiring pipeline. Three columns of rounded cards flow
from left to right — the left column has several gray cards (applicants),
the middle column has fewer cards with one highlighted in orange (in review),
and the right column has one card with a small green checkmark (hired). A
simplified character stands at the bottom, looking up at the pipeline with
a satisfied expression. Small arrow icons connect the columns. The scene
conveys organized, efficient hiring. Soft cream background, warm orange
accent on the review-stage card and arrows. Flat cartoon style, rounded
shapes, clean and professional. The mood is "your hiring process, under
control."
```

**Negative:** No photorealism, no text, no complex UI mockups, no cold colors, no sharp edges, no Kanban board clichés.

**UI integration:** Transparent or cream background. Scene centered. Reserve space above for feature heading and description.

---

## 18. Messaging — Empty Conversation

**Page:** `/dashboard` → Messages tab (no conversation selected)
**Concept:** Two speech bubbles facing each other, waiting for a conversation to begin.

**Prompt:**
```
A warm, friendly cartoon illustration of two rounded speech bubbles facing
each other — one slightly larger on the left, one smaller on the right.
They're separated by a small gap, suggesting a conversation that's about
to start. A few tiny dots float in the gap between them, like typing
indicators or connection sparks. The bubbles are soft and rounded, with
subtle dimensionality. Below them, a small simplified envelope icon adds
context. Soft cream background, warm orange accent on one bubble and the
connecting dots. Flat cartoon style, minimal and clean. The mood is
"your next conversation is waiting."
```

**Negative:** No photorealism, no text inside bubbles, no complex scenes, no cold colors, no sharp edges.

**UI integration:** Transparent background. Centered. Reserve space above for heading and below for conversation list.

---

## 19. Employer Dashboard — No Applicants Yet

**Page:** `/employer/dashboard` → Applicants tab (when empty)
**Concept:** A character looking through binoculars at a horizon — talent is out there, just needs to be found.

**Prompt:**
```
A warm, friendly cartoon illustration of a person looking through a pair of
binoculars toward a distant horizon. The horizon has a few small simplified
figure silhouettes in the distance, suggesting candidates are out there. The
person has a determined, optimistic expression — they're actively searching,
not passively waiting. A small magnifying glass icon floats near the
binoculars. Soft cream background, warm orange accent on the binoculars and
the distant figures. Flat cartoon style, rounded shapes, friendly and
motivating. The mood is "your next great hire is out there."
```

**Negative:** No photorealism, no text, no empty voids, no sad expressions, no cold colors, no sharp edges.

**UI integration:** Transparent background. Character centered. Reserve space above for "No applicants yet" heading.

---

## 20. Error State — Generic Error

**Page:** Any page → ErrorState component
**Concept:** A character holding a wrench next to a small, friendly gear — something needs fixing, but it's minor.

**Prompt:**
```
A warm, friendly cartoon illustration of a person holding a small wrench
next to a slightly wobbly gear. The person has a calm, capable expression —
not panicked, just focused on fixing something. The gear is rounded and
friendly-looking, not industrial. A small "retry" arrow icon floats nearby,
suggesting the fix is simple. Soft cream background, warm orange accent on
the wrench and the retry arrow. Flat cartoon style, rounded shapes, friendly
and reassuring. The mood is "something went wrong, but we're on it."
```

**Negative:** No photorealism, no text, no alarming imagery, no red warning colors dominating, no broken objects, no sharp edges.

**UI integration:** Transparent background. Scene centered. Reserve space above for error message and below for "Try again" button.

---

## 21. Help Center — No Search Results

**Page:** `/help` → HelpCenterPage (when search returns nothing)
**Concept:** A character looking at an open book with a question mark floating above — the answer is in here somewhere.

**Prompt:**
```
A warm, friendly cartoon illustration of a person looking at an open book
with a curious, slightly puzzled expression. A large question mark floats
above the book, rendered in soft orange. The person has one finger on their
chin, thinking. A few small page-like shapes float nearby, suggesting
other resources. The scene is calm and intellectual — "let's find the
answer together." Soft cream background, warm orange accent on the question
mark and book edge. Flat cartoon style, rounded shapes, friendly and
helpful. The mood is curiosity, not frustration.
```

**Negative:** No photorealism, no text, no frustration or confusion, no cold colors, no sharp edges.

**UI integration:** Transparent background. Centered. Reserve space above for "No results found" text.

---

## 22. Contact Page — Ambient Illustration

**Page:** `/contact` → ContactInfo
**Concept:** A warm, abstract scene of two hands reaching toward each other — connection and communication.

**Prompt:**
```
A warm, friendly cartoon illustration of two hands reaching toward each
other from opposite sides of the frame. The hands are simplified and
rounded — not realistic, more like soft, stylized shapes. They're almost
touching, with a small cluster of warm orange dots and soft lines between
them suggesting connection and communication. The background is a soft
cream gradient. The scene conveys reaching out, making contact, bridging
a gap. Flat cartoon style, rounded shapes, warm and inviting. The mood
is "we're here, reach out."
```

**Negative:** No photorealism, no text, no complex backgrounds, no cold colors, no sharp edges, no religious imagery.

**UI integration:** Semi-transparent, positioned behind or beside the contact form. Low opacity (15-20%) so it doesn't compete with form fields.

---

## 23. FAQ Page — Ambient Illustration

**Page:** `/faq` → FAQSection
**Concept:** Floating question marks in soft, rounded shapes — curiosity as a warm visual texture.

**Prompt:**
```
A warm, friendly abstract illustration of several rounded question marks
floating at different heights and sizes. The question marks are soft and
rounded — more like gentle curves than sharp punctuation. They're rendered
in varying opacities of cream, light beige, and one in soft orange. The
overall effect is a calm, curious atmosphere — like thought bubbles
drifting upward. Soft cream background, warm orange accent on the largest
question mark. Flat style, rounded shapes, minimal and atmospheric. The
mood is "we've got answers."
```

**Negative:** No photorealism, no text, no sharp question marks, no cold colors, no high contrast, no cluttered arrangement.

**UI integration:** Semi-transparent background element, 10-15% opacity. Positioned behind the FAQ accordion.

---

## 24. Employer Pricing — Feature Highlight

**Page:** `/employers` → PricingSection
**Concept:** A small character standing next to a tiered platform — three levels, the middle one highlighted.

**Prompt:**
```
A warm, friendly cartoon illustration of a simplified three-tiered platform
or podium. The bottom tier is wide and cream-colored, the middle tier is
medium and highlighted in warm orange, and the top tier is small and cream.
A small character stands on the middle tier with a confident posture, one
hand raised slightly as if presenting. Small star icons float around the
highlighted tier. The scene suggests choosing the right plan. Soft cream
background, warm orange accent on the middle tier and stars. Flat cartoon
style, rounded shapes, clean and professional. The mood is "pick what
fits."
```

**Negative:** No photorealism, no text, no dollar signs, no complex pricing tables, no cold colors, no sharp edges.

**UI integration:** Transparent background. Scene centered above pricing cards. Small scale — decorative, not dominant.

---

## Generation Notes

### Style consistency rules
- All characters share the same simplified proportions (1:3.5 head-to-body)
- Same warm skin tone range across all illustrations
- Same level of detail — nothing hyper-detailed while others are minimal
- Same color palette — never introduce colors outside the HireHub brand
- Same line weight and shadow treatment across the set

### DALL-E 3 specific tips
- Use `--ar 1:1` for card illustrations, `--ar 16:9` for hero/cover images
- DALL-E 3 handles natural language well — these paragraph-style prompts work directly
- If the first generation is too detailed, add "minimal, flat, clean" to the prompt
- If colors are off, emphasize "warm cream and orange palette, no blue tones"
- Generate 2-3 variations and select the best — DALL-E 3 varies significantly between runs

### Post-generation checklist
- [ ] Does the illustration communicate the concept at a glance?
- [ ] Does it feel native to HireHub's warm, community-driven identity?
- [ ] Does it work on both light and dark backgrounds?
- [ ] Does it survive being scaled down to card size?
- [ ] Is there enough negative space for text overlay?
- [ ] Are the colors consistent with the brand palette?
- [ ] Does the character feel inclusive and relatable?
- [ ] Is the mood appropriate for the context (encouraging, not alarming)?
