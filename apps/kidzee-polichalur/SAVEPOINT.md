# Kidzee Polichalur — Session Savepoint

**Last Updated**: 2026-03-29
**Version**: 1.1.1
**Session Summary**: Comprehensive MVP 1 test suite (267 tests), UAT execution, 4 production bugs found and fixed, deployed
**Machine**: Mac Mini (aldrin-mac-mini)
**Git Branch**: main
**Git Commit**: 57deef8 — pulse: auto-save 21:00 Mar 29

---

## This Session (2026-03-29) — MVP 1 Testing & Bug Fixes

### What Was Done

**Comprehensive Test Documentation:**
1. Created `docs/MVP1-TEST-CASES.md` — 267 test cases covering:
   - 168 functional tests (homepage, activities, detail, category, year, auth, admin, API, SEO, nav, cards, social share)
   - 66 UX/UI tests (brand DNA compliance, responsive 4 breakpoints, animations, visual consistency, image handling, states)
   - 25 accessibility tests (keyboard nav, screen reader, contrast, touch targets)
   - 8 UAT end-to-end scenarios (parent browsing, admin content, first-time visitor, mobile, SEO crawler, social sharing, search, cross-browser)
2. Each test case has: ID, description, preconditions, steps, expected result, priority (P0/P1/P2), pass/fail column

**Test Execution (Automated):**
3. API endpoint tests — all 20 tests via curl (10 PASS, 10 EXPECTED FAIL on Vercel read-only FS)
4. SEO validation — all 12 tests (10 PASS, 2 FAIL: missing JSON-LD on detail pages)
5. Browser-based tests via Chrome DevTools MCP — homepage, activities, detail, category, admin, mobile, tablet
6. 12 test screenshots captured in `docs/test-screenshots/`
7. Created `docs/MVP1-TEST-RESULTS.md` — full execution report

**4 Production Bugs Found & Fixed:**
8. **Share URLs localhost** — `src/lib/social.ts` used `process.env.NEXT_PUBLIC_BASE_URL` (empty on client) with `localhost:3000` fallback. Fixed: use `window.location.origin` on client, env var on server. Also fixed URL format from `#activity-ID` hash to `/year/id` deep link.
9. **Title duplication** — `generateMetadata()` returned `"Title — Kidzee Polichalur"` but layout template `%s — Kidzee Polichalur` added another suffix. Fixed: return just the title, let template handle suffix.
10. **Missing JSON-LD** — `ActivityEventSchema` and `BreadcrumbSchema` components existed in `structured-data.tsx` but were never rendered on detail pages. Fixed: imported and rendered both in `[year]/[id]/page.tsx`.
11. **Social API 500** — `getSocialPosts()` crashed on Vercel because `ensureDataFile()` tried `fs.writeFile` on read-only FS. Fixed: wrapped in try/catch, returns `[]` gracefully.

**All 4 fixes deployed and verified on production.**

### Key Decisions
- Use `window.location.origin` for client-side URLs instead of relying on build-time env vars — more robust across environments
- Test results tracked in Markdown (not a test framework) — easy for client (Imtiaz) to review and check off
- EXPECTED FAIL for write APIs on Vercel — documented as known limitation, not a bug. Fix comes with MVP 2 Supabase migration.

### Files Changed
- `src/lib/social.ts` — share URL generation (window.location.origin + deep link fix)
- `src/app/activities/[year]/[id]/page.tsx` — title fix + JSON-LD schemas added
- `src/app/activities/category/[slug]/page.tsx` — title duplication fix
- `src/lib/social-posts.ts` — graceful fallback for read-only FS
- `docs/MVP1-TEST-CASES.md` — 267 test cases (new)
- `docs/MVP1-TEST-RESULTS.md` — test execution results (new)
- `docs/test-screenshots/*.png` — 12 screenshots (new)

### Learnings / Gotchas
- `process.env.NEXT_PUBLIC_*` vars are inlined at BUILD TIME by Next.js — if the env var wasn't set during the build, it's empty at runtime even if set in Vercel dashboard. Use `window.location.origin` for client-side URL resolution.
- Next.js metadata `title.template` in layout.tsx automatically appends `— Site Name` — don't also add it in `generateMetadata()`.
- Vercel serverless functions use read-only filesystem — any `fs.writeFile` call will crash with 500. Must handle gracefully until Supabase migration.
- Plan agents can hallucinate file paths and fabricate claims about missing features — always validate against Explore agent findings (saved to feedback memory).

---

## Current State

### Production URLs
| App | URL | Status |
|-----|-----|--------|
| Kidzee Polichalur | https://kidzee-polichalur.vercel.app | 200 Live |
| CRM (Muzigal) | https://zoo-crm-app.vercel.app | 200 Live |
| Muzigal Docs | https://muzigal-zoo.vercel.app | 307→200 Live |

### Routes (14 total)
```
/                              Homepage (hero, stats, activities, categories, years)
/activities                    All activities (search, filter, paginate)
/activities/[year]             Year-filtered activities
/activities/[year]/[id]        Activity detail (gallery, video, share, related)
/activities/category/[slug]    Category browsing (10 categories)
/admin                         Admin dashboard (3 tabs: Activities/Social/Analytics)
/admin/login                   Password-protected login
/api/activities                GET/POST/PATCH/DELETE
/api/auth                      POST login
/api/seed                      POST seed demo data
/api/social                    GET/POST/PATCH/DELETE
/sitemap.xml                   Dynamic sitemap
/robots.txt                    Crawl directives
```

### Test Coverage
- 267 test cases documented (docs/MVP1-TEST-CASES.md)
- 153 PASS / 0 FAIL / 25 EXPECTED FAIL / 66 NOT YET TESTED (need manual/interactive testing)
- 12 screenshots captured
- All 4 bugs found during testing have been fixed and verified

### Codebase
- 45 source files (pages, components, API routes, utilities)
- ~4,630 LOC TypeScript/TSX
- Dependencies: next 16.2.1, framer-motion, @phosphor-icons/react, lucide-react

### Environment
- ADMIN_PASSWORD=kidzee2024 (.env.local + Vercel)
- NEXT_PUBLIC_BASE_URL=https://kidzee-polichalur.vercel.app
- Vercel install: `rm -rf node_modules && cd ../.. && npm install`
- Vercel build: `npx next build`
- Vercel root directory: `apps/kidzee-polichalur`

---

## Resume Checklist (Next Session)
- [ ] Read this SAVEPOINT.md
- [ ] Check if Imtiaz responded to Batch 1 questionnaire (docs/stakeholder-questionnaire.md)
- [ ] If yes → send Batch 2 questions (docs/stakeholder-docs/MVP2-FOLLOWUP-QUESTIONS.md)
- [ ] Run remaining 66 untested test cases (interactive: lightbox, admin CRUD locally, cross-browser)
- [ ] MVP 2 Phase 1 ready to build (Supabase migration, image upload, Meta API)
- [ ] Check memory: kidzee-mvp2-phases.md for phase tracker
- [ ] `cd /Users/aldrin-mac-mini/zoo-crm && npm run dev --workspace=kidzee-polichalur`
- [ ] Replace picsum.photos placeholder images with real activity photos from Imtiaz

---

## Previous Sessions

### Session 1 (2026-03-29) — Visual Overhaul + Deep Features + Vercel Fix
**Version**: 1.1.0 | **Commit**: d4107be
- Brand DNA alignment (Sniglet font, lavender sections, purple hero, blob radius, Kidzee logo, Chennai illustrations)
- Visual overhaul (emoji→Phosphor icons, framer-motion, image-first cards)
- Deep features (5-level depth: detail pages, gallery lightbox, categories, search, pagination, admin tabs)
- SEO infrastructure (sitemap, robots, metadata, JSON-LD)
- Responsive overhaul (4 breakpoints, progressive containers)
- Vercel deployment fix (platform-specific binaries)
- Documentation (stakeholder review, MVP 2 PRD, follow-up questionnaire)
