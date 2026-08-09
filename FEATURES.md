# HireHub Community

A modern job board platform connecting talent with opportunity. Built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Purpose

HireHub Community is a hiring platform where job seekers discover curated tech roles and employers find qualified candidates. It serves as both a job marketplace and a community hub with career resources.

## Features

### For Job Seekers

- **Browse Jobs** — Explore 30+ listings with filters by category, seniority, location, and remote preference
- **URL-Synced Search** — The job board state lives in the URL (`/jobs?search=react&location=austin&category=Engineering&sort=salary_high`). Search, filters, and sort are shareable, bookmarkable, and survive refresh; typing is debounced (300ms) so results update as you type
- **Facet-Driven Filters** — Filter sidebar (desktop) and drawer (mobile) built from live facet counts (`GET /jobs/facets`): category, seniority, location, and remote, with active-filter chips to clear individual filters
- **Flexible Sorting** — Most recent, best match (relevance via Postgres full-text `ts_rank`), highest/lowest salary, and remote-first
- **Cursor Pagination** — "Load more" infinite-scroll pagination keyed on an opaque cursor, so result sets scale without page-number drift
- **Tag Search API** — Autocomplete-ready tag lookup (`GET /jobs/tags/search?q=`) with a `useJobTags` query hook wired for UI integration
- **Job Details** — View full descriptions, requirements, responsibilities, salary ranges, and company info
- **Save Jobs** — Bookmark interesting roles with a heart toggle; revisit them anytime from your dashboard
- **Apply** — Submit applications with cover letter, portfolio, and contact info via an accessible modal form
- **Track Applications** — Monitor submission status (applied, under review, interviewing, offer, rejected)
- **Dashboard** — Central hub for saved jobs and application history

### For Employers

- **Post Jobs** — Create listings with title, description, requirements, salary, and category
- **Employer Dashboard** — View your job listings with applicant counts at a glance
- **Applicant Management** — Review candidate applications, update statuses (reviewing, interviewing, make offer, reject)
- **Pricing** — Three tiers (Starter, Pro, Enterprise) with feature breakdowns

### Community

- **Blog** — Career insights, industry articles with category filtering and featured posts
- **About** — Company story, mission, and values
- **Contact** — Get in touch via a contact form

### Design

- Animated page transitions and scroll reveals via Framer Motion
- Responsive across mobile, tablet, and desktop
- Accessible with keyboard navigation, ARIA labels, skip-to-content link
- SEO meta tags on every page for discoverability

## Tech Stack

React 19, TypeScript, Tailwind CSS 3, Framer Motion, Radix UI, react-hook-form + Zod, TanStack Query, Lucide icons, Vite

## Search Engine

Job search runs on a Postgres full-text engine (`websearch_to_tsquery` + `ts_rank` over title, company, description, tags, category, seniority, location, requirements, and responsibilities) shared across hirehub-backend and loft-backend:

- **Combined filters** — `search`, `location`, `category`, `seniority`, `remote`, `salaryMin`, `salaryMax`, `featured`, and `sort` compose into a single SQL query
- **Keyset pagination** — Cursor encodes the last row's sort tuple (`id`, `postedDate`, `salaryMax`, `remote`, or `rank`), so ordering stays stable across pages
- **Canonical envelope** — Every list response is `{ success, data, pagination: { total, cursor } }`
- **Facets & tags** — `GET /jobs/facets` returns category/seniority/location/remote counts; `GET /jobs/tags/search?q=` returns matching tags ordered by frequency
