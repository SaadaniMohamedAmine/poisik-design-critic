---
name: Luxe Intelligence Audit
colors:
  surface: '#0f141b'
  surface-dim: '#0f141b'
  surface-bright: '#353942'
  surface-container-lowest: '#090e15'
  surface-container-low: '#171c23'
  surface-container: '#1b2027'
  surface-container-high: '#252a32'
  surface-container-highest: '#30353d'
  on-surface: '#dee2ed'
  on-surface-variant: '#c2c6d2'
  inverse-surface: '#dee2ed'
  inverse-on-surface: '#2c3139'
  outline: '#8c919c'
  outline-variant: '#424750'
  surface-tint: '#a6c8ff'
  primary: '#a6c8ff'
  on-primary: '#00315f'
  primary-container: '#6294da'
  on-primary-container: '#002b56'
  inverse-primary: '#275fa2'
  secondary: '#bfc7d9'
  on-secondary: '#29313f'
  secondary-container: '#3f4756'
  on-secondary-container: '#adb5c7'
  tertiary: '#f3bf4f'
  on-tertiary: '#402d00'
  tertiary-container: '#b98b1d'
  on-tertiary-container: '#3a2800'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a6c8ff'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#004786'
  secondary-fixed: '#dbe3f5'
  secondary-fixed-dim: '#bfc7d9'
  on-secondary-fixed: '#141c29'
  on-secondary-fixed-variant: '#3f4756'
  tertiary-fixed: '#ffdea2'
  tertiary-fixed-dim: '#f3bf4f'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#5c4200'
  background: '#0f141b'
  on-background: '#dee2ed'
  surface-variant: '#30353d'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  xxl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The design system is built for a senior-level AI auditing platform. The brand personality is authoritative, precise, and sophisticated—mirroring the expertise of a high-end design consultant. The target audience consists of product leads, senior designers, and stakeholders who value clarity over decoration.

The style is **Dark Luxe Minimalism**. It leverages a monochromatic navy-based palette to create a focused, low-fatigue environment. Visual hierarchy is established through meticulous control of luminance and whitespace rather than color. The emotional response should be one of "calm confidence"—the interface recedes to let the AI-driven insights and user content take center stage.

## Colors

The palette is a curated spectrum of deep navy and slate greys, ensuring high legibility while maintaining a premium dark-mode aesthetic. 

- **Backgrounds:** Use `#0a0f16` for the main canvas to ground the experience. Layered panels use `#0d131c` to create subtle structural separation.
- **Accents:** The "Signal Blue" (`#6294da`) is reserved strictly for interactive elements and primary actions. 
- **AI Influence:** A subtle glow (`#5f9cf2`) is used exclusively for AI-generated highlights or "suggested" changes, differentiating automated insights from static system data.
- **Contrast:** Maintain a high contrast ratio for primary text (`#e3e9f2`) against the dark base to ensure accessibility in professional environments.

## Typography

This design system utilizes **Inter** exclusively to maintain a systematic, utilitarian aesthetic. 

- **Headings:** Use tight tracking (letter-spacing) and a slightly heavier weight to create a "locked-in" professional look. Large displays should feel architectural.
- **Body:** Prioritize readability with a generous 1.6x line height. This creates the "airy" feel necessary for long-form audit reports.
- **Wordmark:** The word "poisik" must always be lowercase, Inter, with tight tracking to emphasize the technical, streamlined nature of the tool.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** for internal content (1280px max-width) while utilizing fluid sidebars for navigation. 

- **Rhythm:** An 8px linear scale is used for all layout decisions, but "Luxe" is achieved by opting for the higher end of the scale (e.g., using 48px or 80px gaps between major sections).
- **Safe Margins:** Use a minimum of 32px external padding on desktop to prevent content from feeling "cramped" against the viewport edges.
- **Mobile:** Reflow content into a single column, reducing margins to 16px and utilizing the `headline-lg-mobile` token to ensure titles do not wrap awkwardly.

## Elevation & Depth

In this design system, depth is conveyed through **Tonal Layering** and **Low-Contrast Outlines**. 

- **Tiers:** Content should feel like it is "sunk" or "resting" rather than floating. The background base is the lowest tier. Use the `background_elevated` for secondary panels. 
- **Borders:** Instead of shadows, use 1px solid borders (`#1d2b3f`). This defines structure without the "muddiness" of dark-mode shadows.
- **Hover States:** Interactive surfaces should lift slightly by transitioning to a lighter surface hex (`#162131`) and a stronger border (`#263954`).
- **Inner Glow:** For AI-specific components, a subtle 1px inner stroke using the `accent_glow` at 20% opacity can be used to suggest "active intelligence."

## Shapes

The shape language is **Soft** but disciplined. 

- **Standard Radius:** 0.25rem (4px) is the default for most components (inputs, small buttons) to maintain a precise, technical feel.
- **Large Components:** Cards and audit panels use a 0.75rem (12px) radius to soften the overall interface and provide a more modern, "app-like" container.
- **Icons:** Use **Lucide** icons with a 1.5px stroke weight. The thinner stroke complements the Inter typeface and contributes to the high-end, bespoke aesthetic.

## Components

- **Buttons:** Primary buttons use a solid `#6294da` background with white or very light text. Secondary buttons are "ghost" style with the `border_default` and `text_secondary`.
- **Audit Chips:** Small status indicators (e.g., "Critical," "Pass") should use the `accent_soft_background` (`#182639`) with colored text, avoiding heavy fills to keep the UI light.
- **Input Fields:** Use the `background_elevated` color for field fills with a 1px border. Focus state must strictly use a 1px `accent_signal` border—never a glow or shadow.
- **Audit Cards:** These are the core of the tool. They should feature generous internal padding (24px) and use `text_muted` for meta-information (e.g., timestamps) to keep the focus on the audit result.
- **AI Insight Panel:** A specialized component with a very subtle gradient border using `accent_glow` to highlight AI-suggested UX improvements.
- **Selection Controls:** Checkboxes and radios should be minimal, utilizing the `accent_signal` only when in the "checked" state.