# ZOO CRM — Master Design System

> **The white-labeling architecture for all ZOO CRM client apps.**
> Version 1.0 | March 29, 2026

---

## How It Works

```
┌─────────────────────────────────────────┐
│  base.css (Master — neutral defaults)   │  ← Universal foundation
│  ~120 CSS variables: colors, fonts,     │     Every app imports this
│  spacing, shadows, motion, layout       │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐  ┌────────▼────────┐
│  muzigal.css   │  │  kidzee.css     │  ← Brand overrides (~20 vars each)
│  Navy + Blue   │  │  Purple + Yellow │     Only what's different
│  Inter font    │  │  Fredoka font   │
│  Sharp radius  │  │  Round radius   │
└───────┬────────┘  └────────┬────────┘
        │                    │
┌───────▼────────┐  ┌────────▼────────┐
│  apps/crm/     │  │  apps/kidzee-   │  ← App imports base + theme
│  globals.css   │  │  polichalur/    │
│                │  │  globals.css    │
└────────────────┘  └─────────────────┘
```

**Key principle:** Base defines ~120 variables with neutral defaults. Each theme overrides ~20 variables. The app inherits everything else. Change one variable → the entire app rebrands.

---

## Quick Start: Adding a New Client

```bash
# 1. Copy the template
cp packages/design-tokens/themes/_template.css \
   packages/design-tokens/themes/newclient.css

# 2. Fill in brand colors, fonts, personality
vim packages/design-tokens/themes/newclient.css

# 3. In the app's globals.css, import base + theme
#    (or copy the variables into the app's :root)
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
| Vibe | "Serious music academy" |

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
| Vibe | "Fun preschool" |

---

## Token Categories

### Colors (26 tokens)
```
Brand:     --color-primary, -dark, -light, --color-accent, -warm
Semantic:  --color-success, -warning, -error, -info (+ -light variants)
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

---

## Rules

1. **Never hardcode hex values in components.** Always use `var(--color-*)`.
2. **Base defines, themes override.** Don't duplicate base values in themes.
3. **Semantic over literal.** Use `--color-error` not `--color-red`. Use `--color-primary` not `--color-purple`.
4. **Themes are thin.** A theme should be ~20 overrides, not 120 copies.
5. **Test with both themes.** If a component looks wrong in one theme, the component is using literal values instead of tokens.

---

## File Structure

```
packages/design-tokens/
├── base.css                  ← Master foundation (~120 tokens)
├── DESIGN-SYSTEM.md          ← This document
├── themes/
│   ├── _template.css         ← Copy this for new clients
│   ├── muzigal.css           ← Muzigal Music Academy
│   └── kidzee.css            ← Kidzee Polichalur
```

---

*This is a living document. Update when adding tokens, themes, or clients.*
