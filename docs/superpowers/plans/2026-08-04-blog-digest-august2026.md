# Blog Digest — August 2026 (5 Posts + Visual Prompts)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the compiled industry digest (`/home/jacobp/Desktop/Projecs/hirehub-frontend/jobs_hiring_culture_industry_news_august_2026.md`) as five well-designed blog posts on HireHub, and add the on-brand cover-image prompts to the project visual-context docs so the covers get generated next.

**Architecture:** Two independent tasks. Task 1 seeds 5 blog posts into the backend seed data (`hirehub-backend/src/prisma/seed.ts` `blogPostsData` array), each a rewrite of one digest section into the paragraph format the blog renderer supports. Task 2 appends a "Blog Covers — August 2026 Digest" prompt section (5 covers, design-intelligence 13-stage pipeline, HireHub brand tokens) to the two visual-context docs, and registers the covers in the Priority Generation Order + Export Specification. No frontend component code changes, no new packages.

**Tech Stack:** Backend Node/Express + Prisma + TypeScript; frontend React 19 + Vite; docs are markdown artifacts only.

## Global Constraints

- **Git discipline:** the working tree contains pre-existing uncommitted agent artifacts. NEVER run `git add -A`/`git add .`; only `git add` the exact files each task lists, then `git commit -m "..."`.
- Backend blog posts live ONLY in `hirehub-backend/src/prisma/seed.ts` `blogPostsData` (not `hirehub-backend/prisma/seed.ts` — that file is a 58-line role-only seed). The seed does `blogPost.deleteMany()` at line 16 then `create`s each entry (lines 1342-1344), so `blogPostsData` entries must always be complete/valid; re-seeding is destructive.
- Blog content rendering: `BlogPostPage.tsx` splits content on `\n\n` and renders each block as a plain `<p>` (or as an `<img>` if the block is exactly `![alt](src)`). There is NO markdown support — no headings, no bullet lists, no tables, no links. All digest structure must be rewritten into flowing prose paragraphs; do not emit `#`, `-`, `|`, `[`/`](`, `>` characters.
- Blog categories are hard-coded in `BlogPage.tsx` line 11: `['All', 'Hiring Tips', 'Company Culture', 'Career Advice', 'Industry News']`. Posts must use exactly one of: `Hiring Tips`, `Company Culture`, `Career Advice`, `Industry News`. Do NOT use `Company News` (already an existing inconsistency, don't add to it).
- Visual-prompt format must match `public/DESIGN-VISUAL-CONTEXT.md` exactly: each section = `## Section: <Name>`, an **Emotional objective:** line, a **Primary prompt (<ratio> <style>):** code fence with the field lines used by neighboring sections. Use brand tokens verbatim from `DESIGN.md`: canvas `#F5F1EC`, surface-2 `#EBE7E1`, accent `#FF5600`, ink `#111111`. Do not introduce new assets, no code changes.
- The existing featured blog post is `remote-hiring-best-practices` (`featured: true`). Exactly one post must be featured after Task 1 — flip that one to `featured: false` and set the new anchor post featured.
- Commands: backend `npm run build` (tsc compile) must stay green; frontend `npm run lint` must stay 0 errors (no lint-able code changes expected).

---

## File Structure

| File | Change | Responsibility |
|------|--------|----------------|
| `hirehub-backend/src/prisma/seed.ts` | Modify | Add 5 digest posts to `blogPostsData`; flip featured flag |
| `hirehub-frontend/public/DESIGN-VISUAL-CONTEXT.md` | Modify | Append Blog Covers section + priority/export rows |
| `hirehub-frontend/DESIGN-VISUAL-CONTEXT-ADDED.md` | Modify | Append identical section (byte-identical blocks) |

---

## Task 1: Seed the 5 digest blog posts

**Location:** `hirehub-backend/src/prisma/seed.ts`, array `blogPostsData` (starts line 1238). Each entry shape (match existing entries exactly):

```
{ slug, title, excerpt, content, image, category, authorName, authorAvatar, authorRole, date, readTime, featured }
```

**Source content:** `/home/jacobp/Desktop/Projecs/hirehub-frontend/jobs_hiring_culture_industry_news_august_2026.md` — a compiled digest (Compiled: August 4, 2026) with 5 sections. Read it fully. Create exactly one post per section:

1. Section 1 "Job Market & Industry News" → category `Industry News`
   - slug: `us-labor-market-2026-outlook`
   - Keep: unemployment 4.6% (Nov 2025, highest since mid-2021), ~41,000 jobs lost Oct+Nov combined, healthcare 47.5% of 2025 job growth, Fed projection peak 4.5% → 4.4% by end of 2026, Indeed Hiring Lab "low-hire, low-fire" characterization, remote-work stabilization stats (23.7% of US workdays, 52% hybrid / 26% fully remote / 21% on-site, 47% tech fully remote, project management #1 remote occupation), remote wage premium (12% average, 35.2% unadjusted), top remote roles (Senior Project Manager $136K, Cloud Architect $142K, Data Engineer $135K), flexibility valuations (hybrid ≈ 8% raise, 37% would take 10% pay cut, 66% would accept 95%+ salary for remote). Mention sources by name in prose ("Indeed Hiring Lab projects…", "Gable's analysis of Bureau of Labor Statistics data shows…").
2. Section 2 "Hiring Tips & Job Search Strategies" → category `Hiring Tips`
   - slug: `practical-job-search-plan-2026`
   - Keep the 4-step plan (targeted focus: one role/two industries/one location strategy; resume around outcomes; one proof-of-work artifact with IT/data examples; smarter outreach to alumni and career-pivot people for 10-minute conversations), the ATS context (80%+ of US companies use ATS, ~1 in 4 resumes reaches a human), and the on-site shift (fully in-office roles 65% Q4 2025 → 87% Q2 2026 per Robert Half, 36% of employers increasing on-site requirements, 46% of professionals looking or planning to look in H2 2026, 39% cite remote flexibility as motivation, 64% would switch for work-life balance/remote options). Mention sources by name.
3. Section 3 "Company Culture Trends" → category `Company Culture`
   - slug: `workplace-culture-trends-2026`
   - Keep the 5 O.C. Tanner trends (teams inspire — 68% have an inspiring coworker; AI makes human connection matter — 63% fear less personal, 70% want responsible AI in recognition; process over programs — 72% of culture initiatives no improvement, 57% felt worse, 26% trust rise when leaders change behavior; prove ROI — AWS recognition +59% retention, innovation +3%, career growth +64%, Wellstar $13M A/R reduction; recognition builds belonging — 65% inspired by others' accomplishments, 11x more inclusive teams), plus the Emtrain empathy-recession findings (~10% increase in observed conflict, eroding psychological safety, 40% leadership quality), plus Randstad values alignment (nearly half decline offers on values, 29% left roles over leadership mismatch). Mention sources by name.
4. Section 4 "Remote Work Landscape" → category `Career Advice`
   - slug: `remote-work-landscape-2026`
   - Keep the 10 trends as woven prose (RTO mandates vs 76% who'd quit; hybrid default ~28% require 3 days, 13% four days; AI productivity tools; outcome-based performance replacing butts-in-seats; cybersecurity premium $1.07M; digital nomad mainstreaming; remote work hubs; wellbeing non-negotiable; upskilling; sustainability), retention data (90% maintain/expand remote, 85% of seekers cite remote/hybrid as primary factor, only 30% require five-day in-office, $6K–$12K savings per remote employee), and the four-day week pilots. Mention sources by name.
5. Section 5 "AI & Technology Impact on Work" → category `Industry News`
   - slug: `ai-impact-on-work-2026`
   - Keep: 54% of workers have used AI at work, AI reduces coordination overhead for distributed teams, fastest-growing remote specializations (AI engineering, cybersecurity, cloud architecture, data analytics), Gartner 80%+ of enterprises using gen AI by 2026, WEF displacement/creation by 2027, the 5 leadership actions, DEI-as-performance data (top-quartile gender diversity 25% more likely above-average profitability, ethnic diversity 36%). Mention sources by name.

**Content formatting rules (critical):**
- `content` = 5-9 paragraphs separated by `\n\n` (i.e. literal `\n\n` inside the quoted string). First paragraph is a lede that frames the topic and ties it to a job seeker / employer (HireHub audience). Weave every preserved stat into a sentence with its source named inline ("According to…", "Robert Half data shows…"). No markdown syntax characters anywhere in the prose. Do NOT use `\u2014` em-dashes excessively — plain prose is fine, but stay consistent with existing entries which do use `\u2014`. No inline image tokens needed.
- `excerpt`: one 1-2 sentence summary (the card teaser), no trailing period issues, plain text.
- `image`: use the exact planned cover paths (Task 2 will produce these files in the frontend `public/`): `/blog-cover-us-labor-2026.png`, `/blog-cover-job-search-2026.png`, `/blog-cover-culture-2026.png`, `/blog-cover-remote-2026.png`, `/blog-cover-ai-2026.png`. The `image` field is a URL string starting with `/`.
- `authorName`/`authorRole`: use a HireHub editorial voice — `authorName: "HireHub Editorial"`, `authorRole: "HireHub Editorial Team"`, `authorAvatar: "https://i.pravatar.cc/150?u=hirehub-editorial"` for all 5.
- `date: new Date("2026-08-04")` for all 5.
- `readTime`: `Math.max(4, Math.round(wordCount(content) / 200))`.
- `featured`: exactly one `true` — set it on post 1 (`us-labor-market-2026-outlook`). Flip the existing `remote-hiring-best-practices` entry from `featured: true` to `featured: false`. No other entry changes.

**Verify:**
- `cd /home/jacobp/Desktop/Projecs/hirehub-backend && npm run build` → green (tsc).
- Grep the diff to confirm: 5 new entries added before the closing `];` of `blogPostsData`; exactly one `featured: true` in the whole array; no `#`, `|`, `[`, `](` sequences inside any new content strings; `company news` not introduced as a category.
- Do NOT commit. Report the per-post slug, category, readTime, and the exact `featured` state of every entry in the array.

## Task 2: Blog Covers — August 2026 Digest visual prompts

**Location:** two files, appended with **byte-identical** blocks:
- `hirehub-frontend/public/DESIGN-VISUAL-CONTEXT.md` (insert the new `## Section: Blog Covers — August 2026 Digest` right before line 774's `## Priority Generation Order`, and add 5 rows to both the Priority Generation Order list and the Export Specification table).
- `hirehub-frontend/DESIGN-VISUAL-CONTEXT-ADDED.md` (append the identical section at the end, following however that file lists previous additions; no priority/export edits there — only the section block).

**Design brief (internal, drive all 5 prompts):**
- Brand: HireHub — warm, professional, human, accessible. Warm neutral canvas `#F5F1EC`, white surfaces `#FFFFFF`, hairline borders, orange accent `#FF5600`, ink `#111111`. Editorial still-life and warm abstract styles (see the existing "Section: Blog Featured Post" at `public/DESIGN-VISUAL-CONTEXT.md` line 378 for the editorial voice — match its realism/quality bar but do NOT copy its exact scene).
- Audience: job seekers and hiring professionals. Emotional goal per cover: curiosity → then trust in the data's usefulness.
- The 5 covers (16:9 editorial, distinct scenes, ONE coherent "photomyself" feel across all — one photoshoot, warm grade):
  1. `blog-cover-us-labor-2026.png` — Job market / economic outlook: a market/economic scene — e.g., a quiet financial-district street with a newspaper or a whiteboard of a rising-then-plateauing trend line; communicate cautious, steady outlook ("low-hire, low-fire"). No faces.
  2. `blog-cover-job-search-2026.png` — Job-search strategy: a desk top-down scene — printed resume, highlighter, shortlist checklist on paper, phone with a job listing; communicates a deliberate, organized search plan. No faces.
  3. `blog-cover-culture-2026.png` — Workplace culture trends: a warm collaborative office moment — e.g., two empty chairs pulled close to a table with a shared notebook and coffee, sunlight through blinds; communicates belonging and human connection. No faces.
  4. `blog-cover-remote-2026.png` — Remote work landscape: a sunlit home office / hybrid scene — laptop, headset, a window with a plant, maybe a travel bag hinting at work-from-anywhere; communicates flexibility and balance. No faces.
  5. `blog-cover-ai-2026.png` — AI at work: a desk scene with a laptop showing a clean abstract interface and a human notebook beside it, subtle warm glow; communicates augmentation not replacement. No faces.
- Field lines per prompt (match neighboring sections' field names): Subject, Environment, Narrative, Emotion, Lighting, Camera, Lens, Composition, Color palette, Materials, Textures, Rendering style, Quality, Aspect ratio (`16:9`), Negative. Include the `**Component rules (from <file>):**` block style ONLY if neighboring sections use it (check `Section: Blog Featured Post` and `Section: Dashboard Profile Card` — replicate the local convention, e.g. hex tokens + do/don't list).
- Brand tokens must appear in every palette line: canvas `#F5F1EC`, surface-2 `#EBE7E1`, accent `#FF5600`, ink `#111111`.
- Every prompt must include a `Negative:` line banning people/faces, staged-office clichés, and cold blue casts (match the existing blog-featured negative phrasing style).

**Priority Generation Order + Export Specification updates (public doc only):**
- Append to the Priority list: `20. Blog covers ×5 (Aug 2026 digest)        -> topic covers for digest posts`.
- Add 5 rows to the Export Specification table: `Blog cover: job market | 3840x2160 | WebP | No | lossy 85% | @2x` and the matching 4 rows for job-search, culture, remote, ai covers.

**Verify:**
- `git diff --stat` on the two files shows only markdown additions.
- The two files contain byte-identical section text for the Blog Covers block (diff the extracted block between files).
- `npm run lint` (frontend) still 0 errors (no code touched).
- Do NOT commit. Report the byte-count of the added block per file and confirm equality.

---

## Wrap-Up

After both tasks: frontend `npm run test:run` full suite + `npm run lint` + `npm run build` to confirm nothing regressed; backend `npm run build` green. Per-feature commits: Task 1 commit the single backend seed file; Task 2 commit the two docs files. Note in the final report that the 5 cover PNGs must still be generated from the prompts and dropped into `hirehub-frontend/public/` for the image paths in Task 1 to resolve; until then the posts will 404 their covers.
