# Kidzee Brand DNA Research

> **Purpose:** Distill the essence of the Kidzee parent brand (kidzee.com) without copying it. This document informs all design decisions for Kidzee Polichalur.
>
> **Source:** SiteSucker dump at `sitesucker/www.kidzee.com/` (CSS, HTML, 97 image assets, 4 font files)
>
> **Date:** 2026-03-29

---

## 1. Brand DNA — The 7 Non-Negotiables

These elements make anything *feel* like Kidzee. Without them, it's just another preschool site.

### 1.1 Purple `#65318E` as the Anchor Color
The single most repeated color in the parent CSS. Used for headings (`.chain_text`, `.title`, `.sub_title`), active states (`.activeTab`), navigation, and CTAs. Purple = Kidzee.

**Polichalur status: ALIGNED** — `--color-primary: #65318E`

### 1.2 Sniglet as the Body/Paragraph Font
The parent site declares `body { font-family: Sniglet !important }` and `p, li { font-family: Sniglet !important }`. Sniglet's rounded, bubbly letterforms are the most distinctive typographic choice — it's what makes Kidzee text *look* like Kidzee text even without the logo.

**Polichalur status: CRITICAL GAP** — Sniglet is loaded via Google Fonts but `--font-body` is set to `"Lato"`. Sniglet is only declared as `--font-accent` and never used in any component.

### 1.3 Fredoka for Display/Headings
Parent uses Fredoka Bold (weight 700/900) for `.title`, `.banner_title`, `.chain_text`, `.whiteTitle`. Both the parent and Polichalur app use the same font files.

**Polichalur status: ALIGNED** — `--font-display: "Fredoka"`

### 1.4 Lavender `#EBE1FF` Section Backgrounds
The parent site's most distinctive layout pattern: alternating white and lavender (`#EBE1FF`) section backgrounds. This light purple wash appears on ~40% of all content sections and is the visual signature of "Kidzee space."

**Polichalur status: DIVERGENT** — Uses warm cream `#FFFBF5` everywhere. No lavender anywhere.

### 1.5 Asymmetric Button Border-Radius
Parent's `.grey_btn` uses `border-radius: 15px 5px` — an asymmetric blob shape that feels hand-drawn and child-friendly. This is NOT a standard pill or rounded rect. It's distinctive.

**Polichalur status: DIVERGENT** — All buttons use `rounded-full` (pill shape, 9999px).

### 1.6 Purple-Tinted Shadows
Shadows should carry the brand color, not neutral gray. This creates a subtle cohesion.

**Polichalur status: ALIGNED** — Already uses `rgba(101, 49, 142, ...)` for all shadow tokens.

### 1.7 Decorative Character Illustrations
The parent site is rich with positioned decorative elements: monkey mascots, butterflies, fish, birds, balloons, school supplies, waves. These create a sense of wonder and playfulness.

**Polichalur status: MISSING** — Zero decorative elements. The app uses emoji in cards but has no illustrations, SVGs, or decorative imagery.

---

## 2. Token Comparison Table

| Token | Parent (kidzee.com) | Polichalur (kidzee.css) | Status | Action |
|-------|-------------------|----------------------|--------|--------|
| **Primary** | `#65318E` | `#65318E` | Aligned | None |
| **Primary dark** | `#6D2A93` | `#4A2366` | Close | Keep Polichalur's — darker works better for CTA gradients |
| **Primary light** | — | `#8B5CB8` | Enhanced | Keep — parent lacks this token |
| **Accent yellow** | `#FFC720` (hover) | `#FFF200` (vivid), `#FFC107` (warm) | Partial | Keep both — `#FFF200` for badges, `#FFC107` for buttons |
| **Secondary** | — | `#FD7E14` (orange) | Enhanced | Keep |
| **Tertiary** | `#E685B5` (pink) | `#E91E8C` (hot pink) | Divergent | Keep Polichalur's — more vibrant |
| **Page background** | White `#FFFFFF` | Cream `#FFFBF5` | Divergent | **Keep cream** — local warmth identity |
| **Section background** | Lavender `#EBE1FF` | Cream `#FFFBF5` (same as page) | **Missing** | **Add `--color-bg-brand: #EBE1FF`** |
| **Card background** | White `#FFFFFF` | White `#FFFFFF` | Aligned | None |
| **Text** | `#212529` / `#282828` | `#282828` | Aligned | None |
| **Text secondary** | `#6C757D` | `#6C757D` | Aligned | None |
| **Border** | `#DEE2E6` | `#C4A882` (warm tan) | Divergent | Keep warm — matches cream bg |
| **Display font** | Fredoka Bold | Fredoka | Aligned | None |
| **Body font** | **Sniglet** | **Lato** | **Critical gap** | **Switch to Sniglet** |
| **Accent font** | Lato (secondary) | Sniglet (unused) | Swapped | Swap roles — Sniglet=body, Lato=accent/fallback |
| **Button radius** | `15px 5px` (asymmetric) | `9999px` (pill) | Divergent | Add asymmetric variant for CTAs |
| **Card radius** | `10-15px` | `0.75-1.5rem` (12-24px) | Close | Keep — rounder is fine |
| **Hero gradient** | Purple-based sections | Gold-to-orange-to-pink | **Divergent** | **Shift to purple-primary** |
| **CTA gradient** | — | Purple-to-dark-purple | Aligned | Keep |
| **Shadows** | Bootstrap neutral | Purple-tinted | Enhanced | Keep — better than parent |
| **Easing** | Standard | Bouncy `cubic-bezier(0.34, 1.56, 0.64, 1)` | Enhanced | Keep — more playful |
| **Decorative elements** | 15+ illustrations | None | **Missing** | **Add selectively** |

---

## 3. What Polichalur Should Keep Different (Local Identity)

These divergences are **intentional and valuable** — don't "fix" them.

### 3.1 Warm Cream Page Background (`#FFFBF5`)
The parent uses plain white. The cream tone gives Polichalur a warmer, more nurturing, local feel. However, use lavender `#EBE1FF` for *alternating section backgrounds* (like the parent does) to get the best of both.

### 3.2 Modern Tech Stack
Parent: Bootstrap 5.3 + Angular + Owl/Slick carousels.
Polichalur: Next.js 16 + Tailwind CSS + @zoo/design-tokens.
No reason to match the parent's tech choices.

### 3.3 Activity-Focused Content Model
Parent is a corporate franchise brand site (programs, franchising, teacher training).
Polichalur is a local franchise activity showcase + admin tool.
The ActivityCard, YearSelector, and SocialShareButton are unique to this use case.

### 3.4 Mobile-First Design
Parent is desktop-focused with responsive fallbacks. Polichalur's target audience (parents checking kids' activities) is primarily mobile. Keep the mobile-first approach.

### 3.5 Social Media Integration
Parent has none. Polichalur's built-in social scheduling (Instagram/Facebook) is a competitive advantage for the franchise.

### 3.6 Enhanced Tokens
Purple-tinted shadows, bouncy easing, and the richer token set (primary-light, secondary, tertiary) are improvements over the parent. Keep them.

---

## 4. Priority Recommendations

### P0 — Critical Brand Alignment (must do)

| # | Change | Impact | File |
|---|--------|--------|------|
| 1 | **Activate Sniglet for body text** — change `--font-body` from `"Lato"` to `"Sniglet"` | Highest single-change impact on "Kidzee feel" | `packages/design-tokens/themes/kidzee.css` |
| 2 | **Add lavender section backgrounds** — add `--color-bg-brand: #EBE1FF`, use for alternating sections | Creates the signature Kidzee spatial rhythm | `kidzee.css` + `page.tsx` + `activities/page.tsx` |
| 3 | **Shift hero gradient to purple-primary** — `linear-gradient(135deg, #65318E, #8B5CB8, #EBE1FF)` | Anchors first impression in the brand | `kidzee.css` (`--gradient-hero`) |
| 4 | **Add asymmetric button radius** — `--radius-blob: 15px 5px` for primary CTAs | Matches parent's most distinctive UI element | `kidzee.css` + button components |

### P1 — Brand Enhancement (high value)

| # | Change | Impact | Source |
|---|--------|--------|--------|
| 5 | **Add decorative illustrations** — butterfly, fish, balloon as positioned elements | Creates the whimsical Kidzee environment | `sitesucker/.../btrfly_img.png`, `fish_img.png`, `baloon.png` |
| 6 | **Use official Kidzee logo** — replace GraduationCap icon with `kidzee_logo.svg` | Instant brand recognition | `sitesucker/.../kidzee_logo.svg` → `public/` |
| 7 | **Align card colors to purple family** — shift from rainbow gradients to purple/lavender tones | Cards feel "Kidzee" instead of generic | `activity-card.tsx` CARD_COLORS array |
| 8 | **White cards on lavender pattern** — activities grid on lavender bg with white cards | Parent's most common content layout | `activities/page.tsx` |

### P2 — Refinement (when time permits)

| # | Change | Impact |
|---|--------|--------|
| 9 | Standardize accent yellow to `#FFC720` (parent's hover color) | Token consistency |
| 10 | SVG wave section dividers (parent uses `mobileWaves.png`) | Organic, playful transitions |
| 11 | Header to solid purple (vs current gold-to-pink gradient) | Matches parent nav pattern |
| 12 | Fix hardcoded Tailwind colors → use CSS var tokens | Maintainability |

---

## 5. Implementation Impact Map

| File | P0 | P1 | P2 | Changes |
|------|:--:|:--:|:--:|---------|
| `packages/design-tokens/themes/kidzee.css` | 1,2,3,4 | | 9 | Font swap, new tokens, gradient update |
| `src/app/page.tsx` | 2,3 | 5,8 | 10,11 | Hero gradient, section bgs, decorative elements |
| `src/components/header.tsx` | | 6 | 11 | Logo swap, gradient change |
| `src/components/footer.tsx` | | 6 | | Logo swap |
| `src/components/activity-card.tsx` | | 7 | 12 | Card color palette, token refs |
| `src/app/activities/page.tsx` | 2 | 8 | 12 | Lavender section bg |
| `src/app/activities/[year]/page.tsx` | 2 | 8 | 12 | Lavender section bg, fix hardcoded colors |
| `public/` | | 5,6 | | Add logo SVG, decorative PNGs |

---

## 6. Asset Inventory (from SiteSucker dump)

### Usable Brand Assets
All paths relative to `sitesucker/www.kidzee.com/`

**Logo:**
- `assets/img/new-kidzee/kidzee_logo.svg` — official vector logo
- `kidzee_logo.ad9653e32eef47bf.svg` — same logo (Angular hashed filename)

**Decorative Illustrations (high priority):**
- `assets/img/new-kidzee/btrfly_img.png` — butterfly
- `assets/img/new-kidzee/fish_img.png` — fish
- `assets/img/new-kidzee/more_fish.png` — additional fish
- `assets/img/new-kidzee/yellow_fish_color.png` — yellow fish
- `assets/img/new-kidzee/baloon.png` — balloons
- `assets/img/new-kidzee/bird.png` — bird

**Character Illustrations:**
- `assets/img/new-kidzee/dall_girl.png` — girl illustration
- `assets/img/new-kidzee/girl_img.png` — child illustration
- `assets/img/new-kidzee/three_child.png` / `threeChild.png` — group of children
- `assets/img/new-kidzee/walk-img.png` — walking children

**PentaMind Program Icons:**
- `assets/img/new-kidzee/con-mind.png` — Constructive Mind
- `assets/img/new-kidzee/foc-mind.png` — Focused Mind
- `assets/img/new-kidzee/inv-mind.png` — Inventive Mind
- `assets/img/new-kidzee/ana-mind.png` — Analytical Mind
- `assets/img/new-kidzee/pantamind_new_img.svg` — PentaMind combined SVG

**UI Elements:**
- `assets/img/new-kidzee/circal.png` — decorative circle
- `assets/img/new-kidzee/right_circal.png` — right circle accent
- `assets/img/new-kidzee/yellow_bg.png` — yellow background shape
- `assets/img/new-kidzee/bottom_img.png` — bottom section illustration
- `faq_bg.d4808f593b537767.svg` — FAQ background pattern

**Navigation/UI Icons:**
- `assets/img/new-kidzee/home_icon.png` — home
- `assets/img/new-kidzee/teacher.png` — teacher
- `assets/img/new-kidzee/support.png` — support
- `assets/img/new-kidzee/admission_icon.png` — admission

**Program Images:**
- `assets/img/new-kidzee/nursery.png` — nursery program
- `assets/img/new-kidzee/playgroup.png` — playgroup program

**Fonts (TTF):**
- `Fredoka-Bold.b10b943099d1beb7.ttf`
- `Fredoka-Light.37b38c82bb847260.ttf`
- `Lato-Regular.c44e96b6632c6d83.ttf`
- `Sniglet-Regular.11787626bc8f32c7.ttf`

---

## 7. Parent CSS Key Declarations (Evidence)

Extracted from `styles.9a0d132faf16ae8d.css` (minified, ~89KB, Angular compiled):

```css
/* Body font — THE critical declaration */
body { font-family: Sniglet !important }
p, li { font-family: Sniglet !important }

/* Headings */
.title, .banner_title, .chain_text, .whiteTitle { font-family: Fredoka }

/* Brand purple */
.chain_text { color: #65318E }
.title { color: #65318E }
.sub_title { color: #90228D }

/* Lavender sections */
background-color: #EBE1FF  /* ~40 occurrences in HTML */

/* Asymmetric buttons */
.grey_btn { border-radius: 15px 5px }

/* Hover accent */
.grey_btn:hover { border-color: #FFC720 }

/* Card shadows */
box-shadow: 0 0 20px rgba(0,0,0,0.3)

/* Cascade slider animation */
transition: 0.6s
transform: scale(0.3) → scale(1)
```

---

## 8. Design Philosophy: "Distill, Don't Copy"

| Principle | Parent Does | Polichalur Should |
|-----------|------------|-------------------|
| **Color identity** | Purple + lavender everywhere | Use purple as anchor, lavender for rhythm, cream for warmth |
| **Typography** | Sniglet body, Fredoka headers | Same fonts, but modern sizing/spacing (Tailwind scale) |
| **Illustration** | Dense decoration on every section | 2-3 key decorative elements, positioned with restraint |
| **Layout** | Bootstrap grid, desktop-first | Tailwind, mobile-first, modern patterns |
| **Interactivity** | Carousels, sliders | Modern transitions, lazy loading, social integration |
| **Buttons** | Asymmetric blob shape | Use blob for primary CTAs, keep pill for secondary |
| **Overall feel** | Corporate franchise (trust & scale) | Local franchise (warmth & community) |

The goal is: **a parent visiting kidzee.com and then Kidzee Polichalur should feel they're in the same family, but Polichalur feels more personal, warmer, and modern.**
