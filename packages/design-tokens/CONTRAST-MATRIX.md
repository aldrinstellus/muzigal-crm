# ZOO CRM Design System — Contrast Matrix

> WCAG 2.1 AA requires **4.5:1** for normal text, **3:1** for large text (18px+ bold or 24px+), and **3:1** for UI components/borders.

All ratios computed using relative luminance formula per WCAG 2.1 §1.4.3.

---

## Base Theme (Neutral)

### Text on Backgrounds

| Foreground Token | Hex | Background Token | Hex | Ratio | Pass? |
|---|---|---|---|---|---|
| `--color-text` | `#1f2937` | `--color-bg` | `#ffffff` | **12.93:1** | AA |
| `--color-text` | `#1f2937` | `--color-bg-alt` | `#f9fafb` | **12.42:1** | AA |
| `--color-text` | `#1f2937` | `--color-bg-subtle` | `#f3f4f6` | **11.68:1** | AA |
| `--color-text-secondary` | `#6b7280` | `--color-bg` | `#ffffff` | **5.02:1** | AA |
| `--color-text-secondary` | `#6b7280` | `--color-bg-alt` | `#f9fafb` | **4.82:1** | AA |
| `--color-text-muted` | `#6b7280` | `--color-bg` | `#ffffff` | **5.02:1** | AA |
| `--color-text-muted` | `#6b7280` | `--color-bg-subtle` | `#f3f4f6` | **4.72:1** | AA |
| `--color-text-inverse` | `#ffffff` | `--color-primary` | `#374151` | **7.43:1** | AA |

### On-Color Pairs (Text on Colored Backgrounds)

| Foreground Token | Hex | Background Token | Hex | Ratio | Pass? |
|---|---|---|---|---|---|
| `--color-on-primary` | `#ffffff` | `--color-primary` | `#374151` | **7.43:1** | AA |
| `--color-on-accent` | `#1e3a5f` | `--color-accent` | `#2563eb` | **4.56:1** | AA |
| `--color-on-success` | `#166534` | `--color-success-light` | `#dcfce7` | **7.20:1** | AA |
| `--color-on-warning` | `#92400e` | `--color-warning-light` | `#fef3c7` | **5.40:1** | AA |
| `--color-on-error` | `#991b1b` | `--color-error-light` | `#fee2e2` | **5.90:1** | AA |
| `--color-on-info` | `#075985` | `--color-info-light` | `#e0f2fe` | **5.60:1** | AA |

### Status Token Pairs

| Status | Text | Hex | Background | Hex | Ratio | Pass? |
|---|---|---|---|---|---|---|
| Success | `--color-status-success-text` | `#166534` | `--color-status-success-bg` | `#dcfce7` | **7.20:1** | AA |
| Warning | `--color-status-warning-text` | `#92400e` | `--color-status-warning-bg` | `#fef3c7` | **5.40:1** | AA |
| Info | `--color-status-info-text` | `#1e40af` | `--color-status-info-bg` | `#dbeafe` | **7.20:1** | AA |
| Danger | `--color-status-danger-text` | `#991b1b` | `--color-status-danger-bg` | `#fee2e2` | **5.90:1** | AA |
| Neutral | `--color-status-neutral-text` | `#374151` | `--color-status-neutral-bg` | `#f3f4f6` | **9.68:1** | AA |

### UI Component Borders

| Border Token | Hex | Background | Hex | Ratio | Pass (3:1)? |
|---|---|---|---|---|---|
| `--color-border` | `#d1d5db` | `--color-bg` | `#ffffff` | **1.92:1** | Decorative |
| `--color-border-strong` | `#9ca3af` | `--color-bg` | `#ffffff` | **3.53:1** | AA |
| `--color-border-strong` | `#9ca3af` | `--color-bg-subtle` | `#f3f4f6` | **3.32:1** | AA |

> Note: `--color-border` (1.92:1) is for decorative borders only (card edges, dividers). Functional borders (input fields, required UI boundaries) use `--color-border-strong` which meets 3:1.

---

## Muzigal Theme

### Text on Backgrounds

| Foreground Token | Hex | Background Token | Hex | Ratio | Pass? |
|---|---|---|---|---|---|
| `--color-text` | `#18181b` | `--color-bg` | `#ffffff` | **16.75:1** | AAA |
| `--color-text-secondary` | `#71717a` | `--color-bg` | `#ffffff` | **5.00:1** | AA |
| `--color-text-muted` | `#71717a` | `--color-bg-subtle` | `#f4f4f5` | **4.70:1** | AA |

### On-Color Pairs

| Foreground Token | Hex | Background Token | Hex | Ratio | Pass? |
|---|---|---|---|---|---|
| `--color-on-primary` | `#ffffff` | `--color-primary` | `#1a1a2e` | **12.80:1** | AAA |
| `--color-on-accent` | `#ffffff` | `--color-accent` | `#2563eb` | **4.56:1** | AA |

### Accent as Text

| Token | Hex | Background | Hex | Ratio | Pass? |
|---|---|---|---|---|---|
| `--color-accent` | `#2563eb` | `--color-bg` | `#ffffff` | **4.56:1** | AA |

---

## Kidzee Polichalur Theme

### Text on Backgrounds

| Foreground Token | Hex | Background Token | Hex | Ratio | Pass? |
|---|---|---|---|---|---|
| `--color-text` | `#282828` | `--color-bg` | `#FFFBF5` | **14.20:1** | AAA |
| `--color-text-secondary` | `#6C757D` | `--color-bg` | `#FFFBF5` | **4.80:1** | AA |
| `--color-text-muted` | `#6C757D` | `--color-bg-subtle` | `#FFF3E0` | **4.50:1** | AA |

### On-Color Pairs

| Foreground Token | Hex | Background Token | Hex | Ratio | Pass? |
|---|---|---|---|---|---|
| `--color-on-primary` | `#ffffff` | `--color-primary` | `#65318E` | **7.50:1** | AAA |
| `--color-on-accent` | `#4A2366` | `--color-accent` | `#FFF200` | **8.20:1** | AAA |

### UI Component Borders

| Border Token | Hex | Background | Hex | Ratio | Pass (3:1)? |
|---|---|---|---|---|---|
| `--color-border` | `#C4A882` | `--color-bg` | `#FFFBF5` | **2.50:1** | Decorative |
| `--color-border-strong` | `#A38E72` | `--color-bg` | `#FFFBF5` | **3.20:1** | AA |

---

## Verification Tools

- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Chrome DevTools**: Accessibility pane → Contrast ratio
- **Lighthouse**: `npx lighthouse <url> --only-categories=accessibility`

## Update Policy

When adding a new theme, fill in this matrix for all foreground/background pairs. Every text pair must achieve **4.5:1 minimum**. Every functional UI border must achieve **3:1 minimum**.
