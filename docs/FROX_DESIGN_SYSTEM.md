# Frox Design System - Extracted Design Tokens

Complete design token reference extracted from Frox v5.0 template for consailt integration.

## Overview

This document contains all design tokens, patterns, and component specifications from the Frox template to be integrated into the consailt React/Next.js application.

---

## Color System

### Gray Scale (Light Mode)

```css
--gray-0: #ffffff      /* Pure white */
--gray-100: #f5f5fa    /* Lightest gray - backgrounds */
--gray-200: #e2e2ea    /* Light gray - borders */
--gray-300: #c6cbd9    /* Medium-light gray */
--gray-400: #9a9aaf    /* Medium gray - disabled text */
--gray-500: #7e7e8f    /* Medium gray - secondary text */
--gray-600: #656575    /* Dark medium gray */
--gray-700: #535362    /* Dark gray */
--gray-800: #2e2e3a    /* Very dark gray */
--gray-850: #262631    /* Extra dark (custom) */
--gray-900: #262631    /* Almost black */
--gray-1000: #16161e   /* Near black */
--gray-1100: #07070c   /* Deepest dark */
```

### Gray Scale (Dark Mode)

```css
--dark-gray-0: #000000      /* Pure black */
--dark-gray-100: #0f0f12    /* Darkest */
--dark-gray-200: #1e1e24    /* Very dark */
--dark-gray-300: #2c2c35    /* Dark */
--dark-gray-400: #64646f    /* Medium dark */
--dark-gray-500: #8b8b93    /* Medium */
--dark-gray-600: #70707c    /* Medium light */
--dark-gray-700: #8a8a98    /* Light medium */
--dark-gray-800: #a9a9b7    /* Light */
--dark-gray-900: #d0d0da    /* Very light */
--dark-gray-1000: #eaeaf4   /* Lightest */
--dark-gray-1100: #f1f1f1   /* Nearly white */
```

### Accent Colors

```css
--blue-accent: #2775ff      /* Primary blue */
--green-accent: #50d1b2     /* Success/positive */
--violet-accent: #7747ca    /* Brand accent */
--orange-accent: #ec8c56    /* Warning/notification */
--yellow-accent: #ece663    /* Caution */
--indigo-accent: #5415f1    /* Deep brand */
--emerald-accent: #5eea8d   /* Growth/success */
--fuchsia-accent: #dd50d6   /* Highlight */
--red-accent: #e23738       /* Error/danger */
--sky-accent: #0bd6f4       /* Info/link */
--pink-accent: #fb7bb8      /* Special/featured */
--color-brands: #7364db     /* Main brand color */
--neutral-accent: #e8edf2   /* Neutral highlight */
```

### Semantic Colors

```css
--primary: #508fda     /* Primary actions */
--secondary: #8d99ae   /* Secondary actions */
--success: #06d6a0     /* Success states */
--danger: #ef476f      /* Error/danger states */
--warning: #ffd166     /* Warning states */
--info: #38a0c2        /* Informational states */
```

### Background Colors

```css
--bg-1: #eae4e9    /* Soft purple-gray */
--bg-2: #fff3ea    /* Soft orange */
--bg-3: #fde2e4    /* Soft pink */
--bg-4: #fad2e1    /* Soft pink-purple */
--bg-5: #dbece5    /* Soft green */
--bg-6: #bee1e6    /* Soft cyan */
--bg-7: #f0efeb    /* Soft beige */
--bg-8: #dfe7fd    /* Soft blue */
--bg-9: #d1ecfd    /* Soft sky blue */
--bg-10: #ddd3fa   /* Soft lavender */
```

### Neutral System Colors

```css
/* Light Mode */
--neutral-bg: #ffffff
--neutral-border: #ffffff

/* Dark Mode */
--dark-neutral-bg: #1f2128
--dark-neutral-border: #313442
```

---

## Typography

### Font Families

```css
/* Primary Font */
font-family: 'Noto Sans', system-ui, sans-serif
/* Weights: 400, 500, 600, 700, 800 */

/* Display/Headers Font */
font-family: 'Chivo', system-ui, sans-serif
/* Weights: 400, 700, 900 */

/* Fallback */
font-family: 'Poppins', system-ui, sans-serif
```

### Font Sizes & Line Heights

```javascript
{
  'header-1': ['40px', '60px'],      // h1 - Main page titles
  'header-2': ['32px', '39px'],      // h2 - Section titles
  'header-3': ['28px', '34px'],      // h3 - Subsection titles
  'header-4': ['28px', '34px'],      // h4 - Card titles
  'header-5': ['24px', '30px'],      // h5 - Component titles
  'header-6': ['20px', '18px'],      // h6 - Small titles
  'header-7': ['18px', '22px'],      // h7 - Tiny titles
  'normal': ['14px', '16px'],        // Body text
  'subtitle': ['16px', '16px'],      // Subtitle text
  'subtitle-semibold': ['16px', '20px'], // Emphasized subtitle
  'btn-label': ['16px', '16px'],     // Button text
  'mini-btn-label': ['14px', '12px'], // Small button text
  'desc': ['12px', '16px'],          // Descriptions
  'mini-desc': ['9px', '11px'],      // Very small text
}
```

### Font Weight Utilities

- **400** - Normal/Regular
- **500** - Medium
- **600** - Semi-bold
- **700** - Bold
- **800** - Extra-bold
- **900** - Black (Chivo only)

---

## Spacing & Sizing

### Grid System

```css
/* Main Layout Grid */
display: grid;
grid-template-columns: 257px 1fr;
grid-template-rows: auto 1fr;

/* Sidebar Width */
width: 257px;  /* Fixed sidebar width */
```

### Common Spacing Values (from Tailwind)

Frox uses Tailwind's default spacing scale:
- `p-[25px]` - Common padding for sidebar
- `px-[21px] py-[17px]` - Menu item padding
- `gap-[10px]` - Icon-to-text spacing
- `mb-10` - Logo margin bottom
- `pt-[106px] lg:pt-[35px]` - Menu top padding (responsive)

---

## Components

### Sidebar Structure

```html
<aside class="bg-white row-span-2 border-r border-neutral relative flex flex-col justify-between p-[25px] dark:bg-dark-neutral-bg dark:border-dark-neutral-border">
  <!-- Toggle Button -->
  <div class="absolute p-2 border-neutral right-0 border bg-white rounded-full cursor-pointer duration-300 translate-x-1/2 hover:opacity-75">
    <img src="icon-arrow-left.svg" alt="toggle">
  </div>

  <!-- Logo -->
  <a class="mb-10" href="/">
    <img class="logo-maximize" src="logo.svg" alt="Logo">
    <img class="logo-minimize ml-[10px]" src="favicon.svg" alt="Logo">
  </a>

  <!-- Menu Items -->
  <div class="pt-[106px] lg:pt-[35px] pb-[18px]">
    <!-- Expandable menu items -->
  </div>
</aside>
```

### Menu Item Pattern

```html
<div class="sidemenu-item rounded-xl relative">
  <!-- Hidden checkbox for state management -->
  <input class="sr-only peer" type="checkbox" value="dashboard" name="sidemenu" id="dashboard">

  <!-- Menu trigger label -->
  <label class="flex items-center justify-between w-full cursor-pointer py-[17px] px-[21px] focus:outline-none peer-checked:border-transparent" for="dashboard">
    <div class="flex items-center gap-[10px]">
      <img src="icon.svg" alt="icon">
      <span class="text-normal font-semibold text-gray-500 sidemenu-title dark:text-gray-dark-500">
        Dashboard
      </span>
    </div>
  </label>

  <!-- Caret icon -->
  <img class="absolute right-2 transition-all duration-150 caret-icon pointer-events-none peer-checked:rotate-180 top-[22px]" src="icon-arrow-down.svg" alt="caret">

  <!-- Child menu (hidden by default) -->
  <div class="hidden peer-checked:block">
    <ul class="text-gray-300 child-menu z-10 pl-[53px]">
      <li class="pb-2 transition-opacity duration-150 hover:opacity-75">
        <a class="text-normal" href="/link">Link</a>
      </li>
    </ul>
  </div>
</div>
```

### Card Component Pattern

```html
<div class="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-neutral-bg dark:border-dark-neutral-border">
  <!-- Card content -->
</div>
```

### Button Patterns

```html
<!-- Primary Button -->
<button class="px-6 py-3 bg-color-brands text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
  Button Text
</button>

<!-- Secondary Button -->
<button class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
  Button Text
</button>

<!-- Outline Button -->
<button class="px-6 py-3 border-2 border-color-brands text-color-brands rounded-lg font-semibold hover:bg-color-brands hover:text-white transition-all">
  Button Text
</button>
```

---

## Dark Mode

### Implementation

Frox uses class-based dark mode:

```javascript
// Tailwind config
darkMode: 'class'
```

### Usage Pattern

```html
<html class="dark">
  <!-- All dark mode styles applied via dark: prefix -->
  <div class="bg-white dark:bg-dark-neutral-bg">
    <!-- Content -->
  </div>
</html>
```

### Common Dark Mode Patterns

```css
/* Backgrounds */
.bg-white dark:bg-dark-neutral-bg
.bg-gray-100 dark:bg-dark-gray-100

/* Text */
.text-gray-900 dark:text-dark-gray-900
.text-gray-500 dark:text-dark-gray-500

/* Borders */
.border-neutral dark:border-dark-neutral-border
.border-gray-200 dark:border-dark-gray-200
```

---

## Responsive Breakpoints

### Custom Breakpoints

```javascript
screens: {
  xs: '500px',
  // Tailwind defaults:
  // sm: '640px',
  // md: '768px',
  // lg: '1024px',
  // xl: '1280px',
  // 2xl: '1536px',
}
```

### Responsive Patterns in Frox

```html
<!-- Mobile-first approach -->
<div class="pt-[106px] lg:pt-[35px]">
  <!-- Padding reduces on larger screens -->
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Responsive grid -->
</div>
```

---

## Animation & Transitions

### Common Transitions

```css
/* Hover opacity */
.hover\:opacity-75
.transition-opacity
.duration-150

/* Rotation (carets) */
.transition-all
.duration-150
.rotate-180

/* Color transitions */
.transition-colors
.duration-300
```

### Animation Variables

```css
--animate-duration: 1s;
--animate-delay: 1s;
--animate-repeat: 1;
```

---

## Utilities & Plugins

### DaisyUI Integration

```javascript
// package.json
"daisyui": "^2.24.0"

// tailwind.config.js
daisyui: {
  themes: false, // Disabled - using custom theme
}
```

### Additional Plugins

```javascript
plugins: [
  require('@tailwindcss/line-clamp'),
  require('tailwind-scrollbar-hide'),
  require('daisyui')
]
```

### Custom Utilities

```css
/* Filter utilities */
.filter-black {
  filter: brightness(0%);
}

.filter-white {
  filter: brightness(0) invert(1);
}

/* Header utility */
.header-1 {
  @apply text-header-1 font-bold;
}
```

---

## Icons

### Icon System

Frox uses **Flaticon UIcons** icon system:
- Regular Rounded variant: `uicons-regular-rounded.css`
- Regular Straight variant: `uicons-regular-straight.css`

### Icon Usage Pattern

```html
<!-- Image-based icons -->
<img src="assets/images/icons/icon-name.svg" alt="description">

<!-- Icon sizing typically 20x20 or 24x24 -->
```

---

## Layout Patterns

### Main Dashboard Layout

```html
<body class="w-screen relative overflow-x-hidden min-h-screen bg-gray-100 scrollbar-hide dark:bg-[#000]">
  <div class="wrapper mx-auto text-gray-900 font-normal grid scrollbar-hide grid-cols-[257px,1fr] grid-rows-[auto,1fr]">
    <!-- Sidebar (257px, full height) -->
    <aside class="row-span-2">...</aside>

    <!-- Header (full width minus sidebar) -->
    <header>...</header>

    <!-- Main Content (full width minus sidebar) -->
    <main>...</main>
  </div>
</body>
```

### Content Area Pattern

```html
<main class="px-8 py-6">
  <div class="max-w-7xl mx-auto">
    <!-- Page content -->
  </div>
</main>
```

---

## Migration Strategy for Consailt

### Phase 1: Tailwind Config Update

Create custom Tailwind configuration that extends current consailt config with Frox tokens:

```javascript
// tailwind.config.ts
const froxColors = {
  gray: {
    0: 'var(--gray-0)',
    100: 'var(--gray-100)',
    // ... all Frox gray values
  },
  // ... all accent colors
}

const froxTypography = {
  'header-1': ['40px', '60px'],
  // ... all font sizes
}

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: froxColors,
      fontSize: froxTypography,
      // ... other Frox tokens
    }
  }
}
```

### Phase 2: CSS Variables

Add Frox CSS variables to global CSS:

```css
/* apps/web/app/globals.css */
@layer base {
  :root {
    /* Frox color variables */
    --gray-0: #ffffff;
    /* ... all color variables */
  }

  html.dark {
    /* Dark mode overrides if needed */
  }
}
```

### Phase 3: Component Adaptation

Map Frox patterns to React + Shadcn/ui components:

| Frox Component | Consailt Component | Approach |
|----------------|-------------------|----------|
| Sidebar | Create new FroxSidebar.tsx | New component |
| Menu items | Adapt existing navigation | Update styles |
| Cards | Extend Shadcn Card | Add Frox variants |
| Buttons | Extend Shadcn Button | Add Frox variants |
| Modals | Shadcn Dialog | Restyle |
| Tables | Shadcn Table | Restyle |

---

## Key Differences: Frox vs Current Consailt

| Aspect | Frox Template | Current Consailt | Migration Action |
|--------|---------------|------------------|------------------|
| Color System | Custom gray scale (0-1100) | Tailwind default | Extend with Frox colors |
| Typography | Noto Sans + Chivo | Default sans | Add Google Fonts |
| Sidebar Width | 257px fixed | Variable | Update to 257px |
| Dark Mode | Class-based ✓ | Class-based ✓ | Sync colors |
| Grid Layout | CSS Grid (2-column) | Flexbox | Migrate to Grid |
| Menu Pattern | Checkbox + peer | React state | Port to React |
| Icon System | Flaticon UIcons | Lucide React | Keep Lucide, match styles |

---

## Implementation Checklist

- [ ] Add Frox color variables to globals.css
- [ ] Update Tailwind config with Frox tokens
- [ ] Add Google Fonts (Noto Sans, Chivo)
- [ ] Create FroxSidebar component
- [ ] Create FroxHeader component
- [ ] Update Card component with Frox styling
- [ ] Update Button component with Frox variants
- [ ] Implement 257px sidebar layout
- [ ] Port menu collapse/expand logic to React
- [ ] Test dark mode with Frox colors
- [ ] Update dashboard grid layout
- [ ] Migrate responsive breakpoints
- [ ] Add Frox-style transitions
- [ ] Test mobile responsiveness

---

## Resources

- **Template Location**: `Frox_v5.0_Unzip-First/`
- **Source Files**: `Source_for_development/src/`
- **HTML Examples**: `HTML_Template/`
- **Tailwind Config**: `Source_for_development/tailwind.config.js`
- **Main CSS**: `Source_for_development/src/assets/styles/css/main.css`

---

## Notes

1. **Keep consailt logo**: Replace Frox logo with consailt branding
2. **Public pages unchanged**: Only apply Frox to authenticated dashboard
3. **Preserve functionality**: Maintain all existing consailt features
4. **Progressive enhancement**: Apply Frox styles without breaking current features
5. **Type safety**: Ensure all Tailwind classes are typed correctly in TypeScript

