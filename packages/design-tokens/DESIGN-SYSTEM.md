# ZOO CRM — Master Design System

> **The white-labeling architecture for all ZOO CRM client apps.**
> Version 3.0 | March 29, 2026 — WCAG 2.1 AA Compliant

---

## How It Works

```
┌─────────────────────────────────────────────────┐
│  @zoo/design-tokens                              │
│  ┌────────────────────────────────────────────┐  │
│  │  base.css (Master — neutral defaults)      │  │  ← 120 CSS variables
│  │  colors, fonts, spacing, shadows, motion   │  │
│  └──────────────────┬─────────────────────────┘  │
│                     │                            │
│  ┌──────────────────▼─────────────────────────┐  │
│  │  shadcn-bridge.css                         │  │  ← Maps zoo → shadcn names
│  │  --color-primary → --primary               │  │     So Tailwind classes work
│  │  --color-bg → --background                 │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │ muzigal.css│  │ kidzee.css │  │ default   │  │  ← ~20 overrides each
│  │ Navy+Blue  │  │ Purple+Yel │  │ Neutral   │  │
│  └────────────┘  └────────────┘  └───────────┘  │
└──────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  @zoo/ui                                         │
│  ┌────────────────────────────────────────────┐  │
│  │  globals.css                               │  │  ← @theme inline block
│  │  Registers all tokens as Tailwind utils    │  │     bg-primary, text-muted, etc.
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  Shared Components                         │  │  ← Card, Badge, Table, Modal,
│  │  cn() + statusColor() utilities            │  │     StatCard + utilities
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘

App globals.css (3 lines):
  @import "tailwindcss";
  @import "@zoo/ui/globals.css";
  @import "@zoo/design-tokens/themes/muzigal";
```

**Key principle:** Base defines ~120 variables with neutral defaults. Each theme overrides ~20 variables. The app inherits everything else. Change one theme import → the entire app rebrands.

---

## Quick Start: Adding a New Client

```bash
# 1. Copy the template
cp packages/design-tokens/themes/_template.css \
   packages/design-tokens/themes/newclient.css

# 2. Fill in brand colors, fonts, personality
vim packages/design-tokens/themes/newclient.css

# 3. In the app's globals.css:
@import "tailwindcss";
@import "@zoo/ui/globals.css";
@import "@zoo/design-tokens/themes/newclient";
```

---

## Token Reference

### Layer 1: Brand Identity (MUST override)

These define the brand. Every client needs unique values.

| Token | Base Default | Muzigal | Kidzee | What it controls |
|-------|-------------|---------|--------|-----------------|
| `--color-primary` | `#374151` | `#1a1a2e` | `#65318E` | Headers, CTAs, links, focus rings |
| `--color-primary-dark` | `#1f2937` | `#12121f` | `#4A2366` | Hover states, active elements |
| `--color-primary-light` | `#6b7280` | `#2d2d4a` | `#8B5CB8` | Subtle backgrounds, borders |
| `--color-accent` | `#3b82f6` | `#2563eb` | `#FFF200` | Highlights, badges, emphasis |
| `--color-accent-warm` | `#f59e0b` | `#3b82f6` | `#FFC107` | Secondary accent, warm touches |

### Layer 2: Personality (RECOMMENDED override)

These set the tone. Professional vs playful. Clean vs warm.

| Token | Base | Muzigal | Kidzee | Effect |
|-------|------|---------|--------|--------|
| `--font-display` | System | Inter | Fredoka | Heading personality |
| `--font-body` | System | Inter | Lato | Reading experience |
| `--color-bg` | `#ffffff` | `#ffffff` | `#FFFBF5` | Cool white vs warm cream |
| `--radius-xl` | `0.75rem` | `0.75rem` | `1rem` | Sharp=corporate, round=friendly |
| `--easing-default` | `ease-in-out` | `ease-in-out` | `bounce` | Subtle vs playful motion |

### Layer 3: Fine-tuning (OPTIONAL override)

Only override if the brand demands it.

| Token | Purpose |
|-------|---------|
| `--shadow-glow` | Brand-colored glow on focus/hover |
| `--gradient-hero` | Hero section gradient |
| `--gradient-cta` | CTA button gradient |
| `--color-border` | Warm vs cool border tones |
| `--chart-1..5` | Brand-derived chart palette |

---

## Shared UI Components (@zoo/ui)

All components use semantic tokens — they rebrand automatically with the theme.

| Component | Import | Replaces hardcoded... |
|-----------|--------|-----------------------|
| `Card` | `import { Card } from '@zoo/ui'` | `bg-white border-zinc-200` → `bg-card border-border` |
| `StatCard` | `import { StatCard } from '@zoo/ui'` | `bg-blue-50 text-blue-600` → `bg-primary/10 text-primary` |
| `Badge` | `import { Badge } from '@zoo/ui'` | `bg-zinc-100 text-zinc-600` → `bg-muted text-muted-foreground` |
| `Table` | `import { Table } from '@zoo/ui'` | `border-zinc-200 text-zinc-700` → `border-border text-foreground/80` |
| `Modal` | `import { Modal } from '@zoo/ui'` | `bg-white text-zinc-900` → `bg-card text-foreground` |
| `SkipNav` | `import { SkipNav } from '@zoo/ui'` | Skip-to-content link for keyboard users |

**Utilities & Hooks:**
```ts
import { cn, statusColor } from '@zoo/ui';
import { useFocusTrap } from '@zoo/ui';

cn('px-4 py-2', isActive && 'bg-primary')  // clsx + tailwind-merge
statusColor('Active')  // → token-based WCAG AA verified classes
useFocusTrap(ref, open) // trap Tab cycling inside a container
```

---

## Current Themes

### Muzigal (`themes/muzigal.css`)
| Aspect | Value |
|--------|-------|
| Personality | Professional, clean, musical, trustworthy |
| Primary | Dark navy `#1a1a2e` |
| Accent | Blue `#2563eb` |
| Font | Inter (clean sans-serif) |
| Radius | Sharp (0.5-0.75rem) |
| Shadows | Subtle, barely visible |
| Background | Pure white |

### Kidzee (`themes/kidzee.css`)
| Aspect | Value |
|--------|-------|
| Personality | Playful, warm, child-friendly, colorful |
| Primary | Purple `#65318E` (from kidzee.com) |
| Accent | Yellow `#FFF200` (from kidzee.com) |
| Font | Fredoka (rounded, playful) |
| Radius | Round (1-1.5rem) |
| Shadows | Purple-tinted, warmer |
| Background | Warm cream `#FFFBF5` |

---

## Token Categories

### Colors (46 tokens)
```
Brand:     --color-primary, -dark, -light, --color-accent, -warm
Semantic:  --color-success, -warning, -error, -info (+ -light variants)
On-color:  --color-on-primary, -on-accent, -on-success, -on-warning, -on-error, -on-info
Status:    --color-status-{success,warning,info,danger,neutral}-{bg,text,border}
Neutral:   --color-text, -secondary, -muted, -inverse
Surface:   --color-bg, -alt, -subtle, --color-surface, -hover
Border:    --color-border, -light, -strong
```

### Typography (14 tokens)
```
Fonts:     --font-display, -body, -accent, -mono
Scale:     --text-xs through --text-display (9 steps)
Weights:   --weight-light through --weight-black (6 steps)
Leading:   --leading-tight through --leading-loose (5 steps)
```

### Spacing (14 tokens)
```
--space-0 through --space-24 (4px base unit)
```

### Radius (8 tokens)
```
--radius-none through --radius-full
```

### Shadows (8 tokens)
```
--shadow-xs through --shadow-2xl, --shadow-inner, --shadow-glow
```

### Motion (12 tokens)
```
Duration:  --duration-instant through --duration-lazy (7 steps)
Easing:    --easing-default, -in, -out, -bounce, -smooth (5 curves)
```

### Layout (10 tokens)
```
Max-width: --max-width-sm through --max-width-2xl, --max-width-prose
Z-index:   --z-base through --z-toast (8 layers)
```

### Interactive States (16 tokens) — *New in v3.0*
```
State layers:  --state-hover-opacity, -focus, -pressed, -dragged, -selected (M3 pattern)
Disabled:      --disabled-opacity, -bg, -text, -border
Focus ring:    --focus-ring-color, -width, -offset, -style
Touch targets: --touch-target-min (44px), --touch-target-compact (36px)
```

### Form Field Tokens (6 tokens) — *New in v3.0*
```
--input-border, -border-focus, -border-error, -bg, -bg-disabled, -placeholder
```

### Overlay & Loading (4 tokens) — *New in v3.0*
```
--overlay-color, --overlay-blur, --skeleton-bg, --skeleton-shimmer
```

### Transition Shorthands (3 tokens) — *New in v3.0*
```
--transition-colors, --transition-transform, --transition-opacity
```

### Letter Spacing (5 tokens) — *New in v3.0*
```
--tracking-tight, -normal, -wide, -wider, -caps
```

---

## Accessibility Architecture (v3.0)

### On-Color Tokens (M3 Pattern)

Every colored background has a paired text token that guarantees WCAG AA contrast:

| Background | Text Token | Contrast |
|---|---|---|
| `--color-primary` | `--color-on-primary` | ≥ 4.5:1 (verified per theme) |
| `--color-accent` | `--color-on-accent` | ≥ 4.5:1 (verified per theme) |
| `--color-success-light` | `--color-on-success` | 7.2:1 |
| `--color-warning-light` | `--color-on-warning` | 5.4:1 |
| `--color-error-light` | `--color-on-error` | 5.9:1 |
| `--color-info-light` | `--color-on-info` | 5.6:1 |

**Usage:** `<button style="background: var(--color-primary); color: var(--color-on-primary)">`

### Status Tokens

Token-based status colors replace hardcoded Tailwind. Every status has `{bg, text, border}`:

```css
--color-status-success-bg / -text / -border
--color-status-warning-bg / -text / -border
--color-status-info-bg / -text / -border
--color-status-danger-bg / -text / -border
--color-status-neutral-bg / -text / -border
```

All pairs verified ≥ 4.5:1. Used by `statusColor()` in `@zoo/ui`.

### Focus Ring System

Token-driven focus ring applied to all interactive elements via `:focus-visible`:

```css
--focus-ring-color: var(--color-primary);  /* Adapts per theme */
--focus-ring-width: 2px;
--focus-ring-offset: 2px;
--focus-ring-style: solid;
```

### Motion Accessibility

All animations/transitions use duration tokens. `prefers-reduced-motion` zeroes them all:

```css
@media (prefers-reduced-motion: reduce) {
  :root { --duration-fast: 0ms; --duration-normal: 0ms; /* ...all durations */ }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Touch Targets

Minimum 44x44px for all interactive elements (WCAG 2.5.5):

```css
--touch-target-min: 44px;      /* Primary touch targets */
--touch-target-compact: 36px;  /* Dense UIs with spacing */
```

### Contrast Requirements

| Use Case | Minimum Ratio | Standard |
|---|---|---|
| Normal text (< 18px bold / < 24px) | 4.5:1 | WCAG 2.1 AA §1.4.3 |
| Large text (≥ 18px bold / ≥ 24px) | 3:1 | WCAG 2.1 AA §1.4.3 |
| UI components & borders | 3:1 | WCAG 2.1 AA §1.4.11 |
| Decorative borders | No minimum | Non-functional |

See `CONTRAST-MATRIX.md` for full per-theme verification.

---

## shadcn Bridge (`shadcn-bridge.css`)

Maps ZOO tokens to shadcn/ui expected variable names so that Tailwind classes like `bg-primary`, `text-muted-foreground`, `border-border` work automatically:

| shadcn Variable | ZOO Token |
|----------------|-----------|
| `--background` | `--color-bg` |
| `--foreground` | `--color-text` |
| `--primary` | `--color-primary` |
| `--primary-foreground` | `--color-text-inverse` |
| `--secondary` | `--color-bg-subtle` |
| `--muted` | `--color-bg-alt` |
| `--muted-foreground` | `--color-text-muted` |
| `--accent` | `--color-bg-subtle` |
| `--destructive` | `--color-error` |
| `--border` | `--color-border` |
| `--card` | `--color-surface` |
| `--sidebar-*` | `--color-surface/primary/border-light` |
| `--chart-1..5` | Brand-derived palette per theme |

---

## File Structure

```
packages/
├── design-tokens/              @zoo/design-tokens (pure CSS, zero JS)
│   ├── package.json            npm package with exports map
│   ├── base.css                Master foundation (~120 tokens)
│   ├── shadcn-bridge.css       Zoo → shadcn variable mapping
│   ├── index.css               Barrel: base + bridge
│   ├── DESIGN-SYSTEM.md        This document
│   ├── CONTRAST-MATRIX.md     Per-theme contrast verification
│   └── themes/
│       ├── _template.css       Copy for new clients
│       ├── default.css         Neutral unbranded theme
│       ├── muzigal.css         Muzigal Music Academy
│       └── kidzee.css          Kidzee Polichalur
│
└── ui/                         @zoo/ui (shared React components)
    ├── package.json            Deps: clsx, tailwind-merge, lucide-react
    ├── globals.css             @theme inline block (registers tokens as Tailwind utils)
    ├── ACCESSIBILITY.md       Per-component accessibility spec
    └── src/
        ├── index.ts            Barrel export
        ├── lib/utils.ts        cn() + statusColor()
        ├── lib/use-focus-trap.ts  Reusable focus trap hook
        └── components/         Card, StatCard, Badge, Table, Modal, SkipNav
```

---

## Rules

1. **Never hardcode hex values in components.** Always use `var(--color-*)` or Tailwind semantic classes.
2. **Base defines, themes override.** Don't duplicate base values in themes.
3. **Semantic over literal.** Use `--color-error` not `--color-red`. Use `--color-primary` not `--color-purple`.
4. **Themes are thin.** A theme should be ~20 overrides, not 120 copies.
5. **Use @zoo/ui components.** Import Card/Badge/Table/Modal from `@zoo/ui`, not local copies.
6. **Test with both themes.** If a component looks wrong in one theme, it's using literal values instead of tokens.
7. **App-specific components stay in apps.** Sidebar, TopBar, AppShell depend on routing/auth — keep them local.
8. **On-color tokens are mandatory.** Every theme must define `--color-on-primary` and `--color-on-accent` with verified contrast.
9. **Status colors use tokens, not Tailwind.** Use `statusColor()` from `@zoo/ui` — never hardcode `text-green-700` etc.
10. **Verify contrast before shipping.** Use the accessibility checklist in `_template.css` and `CONTRAST-MATRIX.md`.

---

## Related Documentation

- **[CONTRAST-MATRIX.md](CONTRAST-MATRIX.md)** — Per-theme contrast ratio verification for all foreground/background pairs
- **[ACCESSIBILITY.md](../ui/ACCESSIBILITY.md)** — Per-component keyboard, ARIA, and screen reader specifications
- **[_template.css](themes/_template.css)** — New client theme template with accessibility checklist

---

*This is a living document. Update when adding tokens, themes, components, or clients.*
