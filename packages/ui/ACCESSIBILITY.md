# @zoo/ui — Component Accessibility Specification

> All shared components meet WCAG 2.1 AA. This document specifies keyboard interactions, ARIA attributes, focus management, and screen reader expectations per component.

---

## Modal

**File:** `src/components/modal.tsx`

### ARIA
| Attribute | Value | Purpose |
|---|---|---|
| `role` | `"dialog"` | Identifies as dialog |
| `aria-modal` | `"true"` | Marks as modal (blocks background) |
| `aria-labelledby` | `{titleId}` | Links dialog to its heading |
| `aria-label` | `"Close"` | On close button |
| `aria-hidden` | `"true"` | On backdrop overlay |

### Keyboard
| Key | Action |
|---|---|
| `Tab` | Cycles through focusable elements (trapped) |
| `Shift+Tab` | Reverse cycle (trapped) |
| `Escape` | Closes the dialog |

### Focus Management
- On open: focus moves to first focusable element inside dialog
- On close: focus returns to the element that triggered the dialog
- Focus is trapped — cannot tab out to background content
- Implemented via `useFocusTrap` hook

### Touch Target
- Close button: `min-w-[44px] min-h-[44px]` — meets WCAG 2.5.5

---

## Table

**File:** `src/components/table.tsx`

### ARIA
| Attribute | Value | Purpose |
|---|---|---|
| `scope` | `"col"` | On all `<th>` elements — identifies column headers |
| `role` | `"button"` | On clickable rows only |
| `<caption>` | `className="sr-only"` | Optional screen-reader-only table description |

### Keyboard
| Key | Action |
|---|---|
| `Tab` | Moves to next clickable row |
| `Enter` | Activates clickable row |
| `Space` | Activates clickable row |

### Focus
- Clickable rows have `tabIndex={0}` and `focus-visible` outline
- Non-clickable rows have no tab stop

### Props
| Prop | Type | Purpose |
|---|---|---|
| `caption` | `string?` | Screen-reader-only table description |
| `onRowClick` | `(row: T) => void?` | Makes rows interactive with keyboard support |

---

## Card

**File:** `src/components/card.tsx`

### ARIA
| Attribute | Value | Purpose |
|---|---|---|
| `role` | `"region"` | When `title` is provided — creates a landmark |
| `aria-labelledby` | `{titleId}` | Links region to its heading |

### Semantic Headings
| Prop | Type | Default | Purpose |
|---|---|---|---|
| `headingLevel` | `"h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h3"` | Ensures proper heading hierarchy |

### Usage
- Always provide `title` for meaningful content cards
- Set `headingLevel` to match the page's heading hierarchy (e.g., `"h2"` if card is a top-level section)
- Cards without titles render as plain `<div>` with no landmark role

---

## StatCard

**File:** `src/components/stat-card.tsx`

### ARIA
| Attribute | Value | Purpose |
|---|---|---|
| `aria-label` | `"Up 12%"` / `"Down 5%"` | On trend text — conveys direction + magnitude |
| `role` | `"img"` | On icon container when `iconLabel` provided |
| `aria-label` | `{iconLabel}` | Describes the icon |
| `aria-hidden` | `"true"` | On icon container when no `iconLabel` (decorative) |

### Color Independence
- Trend colors use `--color-success` / `--color-error` tokens (WCAG AA verified)
- Direction is also conveyed via arrow symbols (`↑` / `↓`) — not color-only

### Props
| Prop | Type | Purpose |
|---|---|---|
| `iconLabel` | `string?` | Accessible name for the icon. Omit if decorative. |

---

## Badge

**File:** `src/components/badge.tsx`

### Accessibility
- Text size: `text-sm` (14px) — meets minimum readable size
- Padding: `py-1` — adequate touch/click target
- All status colors from `statusColor()` use token-based classes verified ≥ 4.5:1
- Optional `icon` prop enables non-color-only status indication

### Props
| Prop | Type | Purpose |
|---|---|---|
| `variant` | `string?` | Status name — maps to WCAG-verified color tokens |
| `icon` | `ReactNode?` | Visual indicator beyond color (marked `aria-hidden`) |

### Color Contrast (via statusColor)
| Status | Text Color | Background | Ratio |
|---|---|---|---|
| Active/Paid/Present/Enrolled | `#166534` | `#dcfce7` | 7.2:1 |
| Pending/Late | `#92400e` | `#fef3c7` | 5.4:1 |
| Demo Scheduled/Trial/New | `#1e40af` | `#dbeafe` | 7.2:1 |
| Overdue/Absent | `#991b1b` | `#fee2e2` | 5.9:1 |
| Cancelled/Inactive/Lost | `#374151` | `#f3f4f6` | 9.68:1 |

---

## SkipNav

**File:** `src/components/skip-nav.tsx`

### Behavior
- Visually hidden (`sr-only`) until focused via keyboard
- On focus: becomes visible at top-left of viewport
- Styled with primary color tokens for high visibility
- Links to `#main-content` by default (customizable via `targetId`)

### Props
| Prop | Type | Default | Purpose |
|---|---|---|---|
| `targetId` | `string` | `"main-content"` | ID of the main content element |
| `label` | `string` | `"Skip to main content"` | Visible/announced text |

### Integration
Add `<SkipNav />` as the first child of your app layout, and ensure `<main id="main-content">` exists.

---

## useFocusTrap Hook

**File:** `src/lib/use-focus-trap.ts`

### API
```tsx
useFocusTrap(containerRef: RefObject<HTMLElement | null>, enabled: boolean)
```

### Behavior
- Queries all focusable elements within container
- Traps `Tab` / `Shift+Tab` cycling within container
- On enable: saves current focus, moves focus to first focusable element
- On disable: restores focus to previously focused element
- Re-queries focusable elements on each Tab press (handles dynamic content)

### Focusable Selectors
`a[href]`, `button:not([disabled])`, `input:not([disabled])`, `select:not([disabled])`, `textarea:not([disabled])`, `[tabindex]:not([tabindex="-1"])`

---

## Global Accessibility Features

### Focus Ring System
All interactive elements use a consistent focus ring via `base.css`:
- Width: `2px` solid, offset `2px`
- Color: `--color-primary` (adapts per theme)
- Applied via `:focus-visible` (keyboard only, no mouse flash)

### Reduced Motion
`@media (prefers-reduced-motion: reduce)` zeroes all duration tokens and forces:
- `animation-duration: 0.01ms`
- `transition-duration: 0.01ms`
- `scroll-behavior: auto`

### Disabled States
All `[disabled]` and `[aria-disabled="true"]` elements get:
- `opacity: 0.38` (M3 standard)
- `cursor: not-allowed`
- `pointer-events: none`

### Screen Reader Utility
`.sr-only` class available for visually hidden but announced content.
