# Frox Component Audit - Consailt Integration Analysis

Complete component-by-component comparison between Frox template patterns and existing Shadcn/ui components in consailt.

**Last Updated**: Phase 1.1 - Design System Setup Complete

---

## Executive Summary

| Category | Frox Components | Consailt (Shadcn) | Action Required |
|----------|-----------------|-------------------|-----------------|
| **Layout** | Sidebar, Header, Grid | Custom layouts | ⚠️ **NEW** - Build Frox layouts |
| **Navigation** | Collapsible Menu, Breadcrumbs | Basic | ⚠️ **NEW** - Build Frox navigation |
| **Cards** | Stat cards, Metric cards | Generic Card | ✅ **EXTEND** - Add Frox variants |
| **Buttons** | Primary, Secondary, Outline | Full variant system | ✅ **RESTYLE** - Apply Frox aesthetics |
| **Forms** | Custom inputs, selects | Full form system | ✅ **RESTYLE** - Apply Frox styling |
| **Modals** | Custom dialogs | Radix Dialog | ✅ **RESTYLE** - Apply Frox styling |
| **Tables** | Data tables | Need to check | ⚠️ **TBD** - Assess table component |
| **Dropdowns** | DaisyUI dropdowns | Radix Dropdown | ✅ **ADAPT** - Frox dropdown styles |
| **Badges** | Notification badges | Badge component | ✅ **EXTEND** - Add Frox variants |
| **Progress** | Charts with Chart.js | Progress component | ✅ **ENHANCE** - Add chart integration |

**Legend:**
- ⚠️ **NEW**: Build from scratch
- ✅ **EXTEND**: Add new variants to existing component
- ✅ **RESTYLE**: Update styling to match Frox
- ✅ **ADAPT**: Port patterns to React

---

## 1. Layout Components

### 1.1 Sidebar Navigation

**Frox Pattern:**
```html
<aside class="bg-white row-span-2 border-r border-neutral relative flex flex-col justify-between p-[25px] dark:bg-dark-neutral-bg dark:border-dark-neutral-border">
  <!-- Fixed width: 257px -->
  <!-- Collapsible with transform -->
  <!-- Categories section -->
  <!-- Upgrade card at bottom -->
  <!-- Dark mode toggle -->
</aside>
```

**Consailt Status:** ❌ No dedicated Frox-style sidebar component

**Key Features:**
- **Fixed Width**: 257px (collapsible to ~80px)
- **Collapse Button**: Circular button on right edge with transform
- **Menu Structure**: Checkbox + peer pattern for expand/collapse
  ```html
  <input class="sr-only peer" type="checkbox" id="menu-item">
  <label for="menu-item">...</label>
  <div class="hidden peer-checked:block"><!-- submenu --></div>
  ```
- **Logo Section**: Dual logos (maximized/minimized states)
- **Category List**: Below main menu with badges
- **Upgrade Card**: Promotional section with illustration
- **Bottom Controls**: Dark mode toggle + expand/collapse

**Action Items:**
- [ ] Create `FroxSidebar.tsx` component
- [ ] Create `FroxSidebarItem.tsx` for menu items
- [ ] Convert checkbox + peer to React useState
- [ ] Create `useSidebarState` hook for collapse/expand
- [ ] Add logo state management
- [ ] Build category list section
- [ ] Create upgrade card component

**Shadcn Components to Use:**
- `ScrollArea` - For scrollable menu
- `Separator` - For dividing sections
- None of the existing components map directly

**Styling Notes:**
- Menu item padding: `py-[17px] px-[21px]`
- Icon-text gap: `gap-[10px]`
- Submenu indent: `pl-[53px]`
- Rounded: `rounded-xl`
- Hover: `hover:opacity-75`
- Active state: Custom class `.active`

---

### 1.2 Header / Top Navigation

**Frox Pattern:**
```html
<header class="flex items-center justify-between flex-wrap bg-neutral-bg p-5 gap-5 md:py-6 md:pl-[25px] md:pr-[38px] dark:bg-dark-neutral-bg">
  <!-- Logo (hidden on desktop with sidebar) -->
  <!-- Search bar -->
  <!-- Browse dropdown -->
  <!-- Notification icons -->
  <!-- Profile dropdown -->
</header>
```

**Consailt Status:** ❌ Custom header exists but not Frox-styled

**Key Features:**
- **Search Bar**: Gray background, microphone icon
  - Classes: `bg-gray-100 rounded-xl py-[14px] px-[18px] dark:bg-gray-dark-100`
  - Width: `xl:w-[360px]`
- **Browse Dropdown**: With custom caret
- **Notification Badges**: Dot indicators on icons
  ```html
  <div class="w-2 h-2 bg-fuchsia rounded-full absolute right-[1px] top-[-1px]"></div>
  ```
- **Dropdown Menus**: Arrow pointer at top
  ```html
  <div class="border-solid border-b-8 border-x-transparent border-x-8 border-t-0 absolute w-[14px] top-[-7px] border-b-color-brands"></div>
  ```
- **Profile Avatar**: Clickable with dropdown menu

**Action Items:**
- [ ] Create `FroxHeader.tsx` component
- [ ] Create `FroxSearchBar.tsx`
- [ ] Create `FroxNotificationBadge.tsx`
- [ ] Create `FroxDropdownMenu.tsx` with arrow pointer
- [ ] Create `FroxProfileMenu.tsx`

**Shadcn Components to Use:**
- `DropdownMenu` - For dropdowns
- `Input` - For search (restyled)
- `Popover` - Alternative to dropdown

**Styling Notes:**
- Gap between items: `gap-[30px] xl:gap-[48px]`
- Search input: Transparent background, gray placeholder
- Dropdown arrow: CSS border triangle trick
- Notification dot: 8px diameter (`w-2 h-2`)

---

### 1.3 Breadcrumb Navigation

**Frox Pattern:**
```html
<div class="flex items-center text-xs gap-x-[11px]">
  <div class="flex items-center gap-x-1">
    <img src="icon-home.svg" alt="home">
    <span class="text-gray-500 dark:text-gray-dark-500">Home</span>
  </div>
  <img src="icon-arrow-right.svg" alt="arrow">
  <span class="text-color-brands">Dashboard</span>
</div>
```

**Consailt Status:** ❌ No breadcrumb component

**Action Items:**
- [ ] Create `FroxBreadcrumb.tsx` component
- [ ] Add home icon + arrow separator pattern
- [ ] Active item in brand color

**Shadcn Components to Use:**
- None directly - build from scratch
- Consider using existing navigation patterns

---

## 2. Card Components

### 2.1 Generic Card

**Frox Pattern:**
```html
<div class="border bg-neutral-bg border-neutral dark:bg-dark-neutral-bg dark:border-dark-neutral-border p-7 rounded-2xl">
  <!-- Content -->
</div>
```

**Consailt Status:** ✅ Card component exists

**Current Implementation:**
```tsx
// packages/ui/components/card.tsx
<Card className="rounded-lg border bg-card text-card-foreground shadow-sm" />
```

**Action Items:**
- [ ] Add **Frox variant** to existing Card component:
  ```tsx
  variants: {
    style: {
      default: "rounded-lg border bg-card...",
      frox: "rounded-2xl border border-neutral bg-neutral-bg dark:bg-dark-neutral-bg dark:border-dark-neutral-border"
    }
  }
  ```
- [ ] Update CardHeader, CardContent padding to match Frox
- [ ] Add `p-7` default for Frox variant

**No Breaking Changes:** Keep existing default variant

---

### 2.2 Stat/Metric Cards

**Frox Pattern:**
```html
<div class="flex flex-col gap-y-4 bg-neutral-bg border border-neutral-accent p-5 rounded-2xl dark:bg-dark-neutral-bg dark:border-dark-neutral-border">
  <div class="flex items-center justify-between">
    <!-- Icon + Value -->
    <div class="flex gap-x-2 items-center">
      <img class="p-2 rounded-lg bg-green" src="icon.svg">
      <span class="text-gray-1100 font-bold text-[16px]">1,528</span>
    </div>
    <!-- Mini Chart -->
    <canvas id="chart"></canvas>
    <!-- Dropdown Menu -->
    <div class="dropdown">...</div>
  </div>
  <div class="flex items-center justify-between">
    <span class="text-gray-500 text-xs">Label</span>
    <!-- Trend Indicator -->
    <div class="flex items-center gap-x-[7px]">
      <img src="icon-export-green.svg">
      <span class="text-green font-medium">34.7%</span>
    </div>
  </div>
</div>
```

**Consailt Status:** ❌ No stat card component

**Action Items:**
- [ ] Create `FroxStatCard.tsx` component
  - Props: `value`, `label`, `icon`, `iconBgColor`, `trend`, `trendValue`, `chartData`, `dropdownActions`
- [ ] Create `FroxTrendIndicator.tsx`
  - Props: `value`, `direction` ('up'|'down'), `color`
- [ ] Integrate with Chart.js or Recharts

**Usage Example:**
```tsx
<FroxStatCard
  value="1,528"
  label="Articles"
  icon="/icon-bag-happy.svg"
  iconBgColor="bg-green"
  trend="up"
  trendValue="34.7%"
  chartData={[...]}
  dropdownActions={[...]}
/>
```

---

## 3. Button Components

**Frox Pattern:**
```html
<!-- Primary -->
<button class="btn bg-color-brands hover:bg-color-brands hover:border-[#B2A7FF] px-5 py-[7px] border-4 border-neutral dark:border-dark-neutral-border">
  Button
</button>

<!-- Secondary -->
<button class="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
  Button
</button>

<!-- Outline -->
<button class="btn border-2 border-color-brands text-color-brands hover:bg-color-brands hover:text-white">
  Button
</button>
```

**Consailt Status:** ✅ Button component with CVA variants exists

**Current Implementation:**
```tsx
// packages/ui/components/button.tsx
const buttonVariants = cva("...", {
  variants: {
    variant: { default, destructive, outline, secondary, ghost, link },
    size: { default, sm, lg, icon }
  }
})
```

**Action Items:**
- [ ] Add **Frox variants** without breaking existing:
  ```tsx
  variant: {
    // Existing variants (preserved)
    default: "bg-primary text-primary-foreground...",
    destructive: "...",
    // NEW Frox variants
    froxPrimary: "bg-color-brands text-white hover:border-[#B2A7FF] border-4 border-neutral dark:border-dark-neutral-border",
    froxSecondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-dark-100",
    froxOutline: "border-2 border-color-brands text-color-brands hover:bg-color-brands hover:text-white"
  }
  ```
- [ ] Add **Frox sizes**:
  ```tsx
  size: {
    default: "h-10 px-4 py-2",
    frox: "px-5 py-[7px] min-h-fit h-fit"
  }
  ```

**Usage:**
```tsx
<Button variant="froxPrimary" size="frox">Save</Button>
```

---

## 4. Form Components

### 4.1 Input Fields

**Frox Pattern:**
```html
<input class="input w-full bg-transparent outline-none pl-2 h-5 text-gray-300 placeholder:text-gray-300 placeholder:font-semibold dark:placeholder:text-gray-dark-300" type="text" placeholder="Search">
```

**Consailt Status:** ✅ Input component exists

**Current Implementation:**
```tsx
// packages/ui/components/input.tsx
<input className="..." />
```

**Action Items:**
- [ ] Add **Frox variant**:
  ```tsx
  const inputVariants = cva("...", {
    variants: {
      variant: {
        default: "...",
        frox: "bg-transparent text-gray-500 dark:text-gray-dark-500 placeholder:text-gray-300 placeholder:font-semibold dark:placeholder:text-gray-dark-300 border-gray-200 dark:border-gray-dark-200"
      }
    }
  })
  ```
- [ ] Add `froxSearch` variant with icon support
- [ ] Consider wrapper component `FroxSearchInput.tsx` with microphone icon

---

### 4.2 Select Dropdowns

**Frox Pattern:**
Uses DaisyUI dropdown pattern with custom styling.

**Consailt Status:** ✅ Select component exists (Radix)

**Action Items:**
- [ ] Restyle existing Select to match Frox aesthetic
- [ ] Update dropdown arrow to Frox style
- [ ] Match padding and rounded corners

---

### 4.3 Toggle/Switch

**Frox Pattern:**
```html
<input class="sr-only peer" type="checkbox" id="theme-toggle">
<div class="block rounded-full w-[48px] h-[16px] bg-gray-300 peer-checked:bg-[#B2A7FF]"></div>
<div class="dot absolute rounded-full h-[24px] w-[24px] top-[-4px] left-[-4px] bg-[#B2A7FF] peer-checked:bg-color-brands"></div>
```

**Consailt Status:** ✅ Switch component exists

**Action Items:**
- [ ] Add **Frox variant** with different colors
- [ ] Larger switch size (48x16 vs default)
- [ ] Custom dot styling

---

## 5. Modal/Dialog Components

**Frox Pattern:**
Modals appear throughout for compose, share, etc. Standard overlay + centered content.

**Consailt Status:** ✅ Dialog component with Radix primitives

**Action Items:**
- [ ] Restyle DialogContent to match Frox:
  - `rounded-2xl` instead of `rounded-lg`
  - Border color: `border-neutral dark:border-dark-neutral-border`
  - Padding adjustments
  - Update close button styling
- [ ] Keep Radix primitives (they work well)

---

## 6. Dropdown Menu Components

**Frox Pattern:**
```html
<div class="dropdown dropdown-end">
  <label class="cursor-pointer dropdown-label" tabindex="0">
    <img src="avatar.png">
  </label>
  <ul class="dropdown-content" tabindex="0">
    <div class="menu rounded-box dropdown-shadow min-w-[237px] bg-neutral-bg dark:bg-dark-neutral-bg">
      <!-- Arrow pointer -->
      <div class="border-solid border-b-8 border-x-transparent border-x-8 border-t-0 absolute w-[14px] top-[-7px] border-b-neutral-bg"></div>
      <li class="text-gray-500 hover:text-gray-1100 hover:bg-gray-100 rounded-lg group p-[15px] pl-[21px]">
        <a>Item</a>
      </li>
    </div>
  </ul>
</div>
```

**Consailt Status:** ✅ DropdownMenu component exists (Radix)

**Action Items:**
- [ ] Create `FroxDropdownMenu.tsx` wrapper
  - Add CSS border triangle arrow
  - Position arrow dynamically
  - Apply Frox styling (padding, colors, hover states)
- [ ] Keep Radix for accessibility
- [ ] Add icon + text pattern to menu items

**Key Styling:**
- Menu item padding: `p-[15px] pl-[21px]`
- Hover: `hover:bg-gray-100 dark:hover:bg-gray-dark-100`
- Text hover: `hover:text-gray-1100`
- Arrow: CSS triangle using borders

---

## 7. Badge Components

**Frox Pattern:**
```html
<!-- Notification badge -->
<div class="w-2 h-2 bg-fuchsia rounded-full absolute right-[1px] top-[-1px]"></div>

<!-- Count badge -->
<div class="grid place-items-center rounded w-[18px] h-[18px] bg-yellow">
  <p class="font-medium text-gray-1100 text-[11px]">8</p>
</div>
```

**Consailt Status:** ✅ Badge component exists

**Action Items:**
- [ ] Add **notification dot variant**:
  ```tsx
  variant: {
    default: "...",
    froxDot: "w-2 h-2 rounded-full absolute"
  }
  ```
- [ ] Add **count badge variant**:
  ```tsx
  variant: {
    froxCount: "grid place-items-center rounded w-[18px] h-[18px] text-[11px] font-medium"
  }
  ```
- [ ] Add color variants: `bg-yellow`, `bg-orange`, `bg-pink`, `bg-green`

---

## 8. Progress & Chart Components

**Frox Pattern:**
Uses **Chart.js 3.9** for data visualization with custom theming.

**Consailt Status:** ⚠️ Progress component exists, but no Chart.js integration

**Action Items:**
- [ ] Add Chart.js integration (already have Recharts?)
- [ ] Create `FroxChart.tsx` wrapper components:
  - `FroxLineChart`
  - `FroxBarChart`
  - `FroxDoughnutChart`
- [ ] Apply Frox color palette to charts
- [ ] Match chart dimensions from Frox (e.g., `max-h-[34px]` for inline charts)

**Alternative:** Use Recharts with Frox theming

---

## 9. Table Components

**Frox Pattern:**
Standard table with Frox styling (need to examine table HTML examples).

**Consailt Status:** ❓ Unknown - needs assessment

**Action Items:**
- [ ] Check if Table component exists in `packages/ui`
- [ ] If exists: Add Frox styling variant
- [ ] If not: Create `FroxTable.tsx` component
- [ ] Features needed:
  - Sortable columns
  - Pagination
  - Row selection
  - Responsive (horizontal scroll)
  - Dark mode support

---

## 10. Accordion/Collapsible Components

**Frox Pattern:**
Used for sidebar menu items with checkbox + peer pattern.

**Consailt Status:** ✅ Accordion component exists (Radix)

**Action Items:**
- [ ] Keep existing Accordion for content areas
- [ ] Sidebar uses custom checkbox pattern (not Accordion)

---

## 11. Separator/Divider Components

**Frox Pattern:**
```html
<div class="w-full bg-neutral h-[1px] dark:bg-dark-neutral-border"></div>
```

**Consailt Status:** ✅ Separator component exists

**Action Items:**
- [ ] Add **Frox variant**:
  ```tsx
  variant: {
    default: "...",
    frox: "w-full bg-neutral h-[1px] dark:bg-dark-neutral-border"
  }
  ```

---

## 12. Avatar Components

**Frox Pattern:**
```html
<img class="w-9 h-9 rounded-full" src="avatar.png">

<!-- Stacked avatars -->
<a class="block rounded-full border-neutral overflow-hidden border-[1.4px] w-9 h-9 z-50 translate-x-[-10px]">
  <img src="avatar.png">
</a>
```

**Consailt Status:** ❓ Unknown - needs check

**Action Items:**
- [ ] Check for Avatar component
- [ ] If not: Create `FroxAvatar.tsx`
  - Round variant (default)
  - Stacked variant (with negative margin)
  - Border support
  - Size variants (sm, md, lg)

---

## 13. Tooltip/Popover Components

**Frox Pattern:**
Basic tooltips (not heavily used in examples).

**Consailt Status:** ✅ Popover component exists

**Action Items:**
- [ ] Restyle to match Frox aesthetic
- [ ] Update arrow pointer if needed

---

## 14. Toast/Notification Components

**Frox Pattern:**
Not explicitly shown in examined files.

**Consailt Status:** ❓ Check if Sonner or Toast component exists

**Action Items:**
- [ ] If exists: Restyle with Frox colors
- [ ] If not: Add toast library (Sonner recommended)
- [ ] Match Frox notification style

---

## 15. Loading/Skeleton Components

**Frox Pattern:**
Not explicitly shown.

**Consailt Status:** ✅ Skeleton component exists

**Action Items:**
- [ ] Update colors to match Frox gray scale
- [ ] Use `bg-gray-200 dark:bg-gray-dark-200`

---

## Implementation Priority Matrix

### Phase 1.2 - Core UI Components (Week 1-2)

**Priority 1 - Critical (Build First):**
1. ⚠️ **FroxSidebar** - Completely new component
2. ⚠️ **FroxHeader** - Completely new component
3. ⚠️ **FroxBreadcrumb** - New component
4. ⚠️ **FroxStatCard** - New component for dashboard metrics

**Priority 2 - High (Extend Existing):**
5. ✅ **Card** - Add Frox variant
6. ✅ **Button** - Add Frox variants
7. ✅ **Input** - Add Frox variant
8. ✅ **Badge** - Add Frox dot and count variants

**Priority 3 - Medium (Restyle):**
9. ✅ **Dialog** - Restyle with Frox aesthetics
10. ✅ **DropdownMenu** - Add arrow pointer, restyle
11. ✅ **Switch** - Add Frox variant
12. ✅ **Separator** - Add Frox variant

**Priority 4 - Low (Nice to Have):**
13. ⚠️ **FroxChart** - Chart.js or Recharts wrapper
14. ⚠️ **FroxAvatar** - If not exists
15. ⚠️ **FroxTable** - If not exists

---

## Component File Structure

Recommended structure for new Frox components:

```
packages/ui/components/
├── frox/
│   ├── frox-sidebar.tsx
│   ├── frox-sidebar-item.tsx
│   ├── frox-header.tsx
│   ├── frox-search-bar.tsx
│   ├── frox-breadcrumb.tsx
│   ├── frox-stat-card.tsx
│   ├── frox-trend-indicator.tsx
│   ├── frox-dropdown-menu.tsx
│   ├── frox-notification-badge.tsx
│   └── frox-profile-menu.tsx
├── button.tsx (add Frox variants)
├── card.tsx (add Frox variants)
├── input.tsx (add Frox variants)
├── badge.tsx (add Frox variants)
└── ... (existing components)
```

Or flat structure with `frox-` prefix:
```
packages/ui/components/
├── button.tsx
├── card.tsx
├── frox-sidebar.tsx
├── frox-header.tsx
└── ...
```

---

## Styling Conventions

### Frox-Specific Classes

**Padding:**
- Sidebar: `p-[25px]`
- Menu item: `py-[17px] px-[21px]`
- Card: `p-7` or `p-5`
- Header: `p-5 md:py-6 md:pl-[25px] md:pr-[38px]`

**Gaps:**
- Icon-text: `gap-[10px]`
- Header items: `gap-[30px] xl:gap-[48px]`
- Card items: `gap-y-4`

**Rounded Corners:**
- Cards: `rounded-2xl`
- Buttons: `rounded-lg` or `rounded-xl`
- Menu items: `rounded-xl`
- Inputs: `rounded-xl`

**Borders:**
- Width: `border` or `border-[1.4px]` for avatars
- Color: `border-neutral dark:border-dark-neutral-border`
- Separator: `h-[1px]`

**Hover States:**
- Opacity: `hover:opacity-75`
- Background: `hover:bg-gray-100 dark:hover:bg-gray-dark-100`
- Text: `hover:text-gray-1100 dark:hover:text-gray-dark-1100`

---

## Testing Checklist

After implementing each component, verify:

- [ ] Light mode styling matches Frox
- [ ] Dark mode styling matches Frox
- [ ] Responsive behavior (mobile, tablet, desktop)
- [ ] Hover states work correctly
- [ ] Focus states are accessible
- [ ] TypeScript types are correct
- [ ] No breaking changes to existing components
- [ ] Storybook story created (if applicable)
- [ ] Component tested in dashboard context

---

## Migration Guidelines

### For Existing Components

**DO:**
- Add new variants using CVA
- Preserve existing variants
- Maintain backward compatibility
- Use composition for complex changes

**DON'T:**
- Remove existing variants
- Break existing component APIs
- Change default behavior
- Force Frox styles on all components

### Example - Button Migration

**Before:**
```tsx
<Button variant="default">Click</Button>
```

**After (still works):**
```tsx
<Button variant="default">Click</Button> {/* ✅ Still works */}
<Button variant="froxPrimary">Click</Button> {/* ✅ New Frox variant */}
```

---

## Summary

**Total Components Analyzed:** 15 component categories

**Status Breakdown:**
- ⚠️ **NEW (Build from scratch):** 4 components (Sidebar, Header, Breadcrumb, StatCard)
- ✅ **EXTEND (Add variants):** 6 components (Card, Button, Input, Badge, Switch, Separator)
- ✅ **RESTYLE (Update styling):** 3 components (Dialog, DropdownMenu, Popover)
- ❓ **TBD (Need assessment):** 2 components (Table, Avatar, Toast)

**Next Steps:**
1. Complete Phase 1.1 (Design System Setup) ✅
2. Start Phase 1.2 - Build Priority 1 components
3. Test components in dashboard context
4. Iterate based on feedback

