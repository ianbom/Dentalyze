# DESIGN.md — Health Care Dashboard UI Reference

## 1. Design Overview

This design is a modern **health care analytics dashboard** with a clean SaaS-style interface. It combines a soft medical color palette, rounded cards, subtle shadows, spacious white surfaces, and bright blue/cyan gradient accents.

The interface should feel:

- Clean and professional
- Medical and trustworthy
- Light, airy, and easy to scan
- Modern SaaS dashboard inspired
- Soft, friendly, and approachable
- Data-focused but not visually heavy

The layout uses a large dashboard container placed on top of a soft blue/white gradient background. Inside the dashboard, the UI is divided into:

1. A slim vertical icon sidebar
2. A wider secondary navigation sidebar
3. A main dashboard content area
4. A right analytics/statistics column

The design should avoid harsh borders, dark heavy shadows, saturated backgrounds, and dense spacing.

---

## 2. Overall Page Composition

### Canvas / Background

The full page background uses a soft abstract gradient with large blurred organic shapes.

Recommended background style:

```css
body {
  background:
    radial-gradient(circle at 8% 10%, rgba(46, 151, 255, 0.55), transparent 32%),
    radial-gradient(circle at 88% 92%, rgba(73, 231, 210, 0.45), transparent 34%),
    linear-gradient(135deg, #f8fcff 0%, #eef7ff 45%, #ffffff 100%);
}
```

Background visual rules:

- Use very light blue, cyan, mint, and white tones.
- Add large soft abstract shapes in the background.
- Avoid strong patterns.
- Keep the background quiet so the dashboard stays the main focus.
- Use enough padding around the dashboard container.

### Main Dashboard Container

The central application frame is a large white rounded rectangle with a subtle shadow.

Recommended style:

```css
.dashboard-shell {
  width: min(90vw, 1120px);
  min-height: 680px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 28px 70px rgba(34, 111, 205, 0.16);
  overflow: hidden;
}
```

Rules:

- Border radius: `16px` to `22px`
- Shadow: soft, wide, blue-tinted
- No hard black shadow
- Dashboard should look like it is floating above the background
- Internal layout should use a fixed sidebar and flexible main content

---

## 3. Layout Structure

### Recommended Grid

```css
.app-layout {
  display: grid;
  grid-template-columns: 48px 220px 1fr;
  min-height: 680px;
}
```

Inside the `1fr` main area:

```css
.content-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  gap: 16px;
  padding: 24px 26px 18px;
}
```

### Main Areas

| Area | Width | Purpose |
|---|---:|---|
| Primary icon rail | 48px | App-level navigation icons |
| Secondary sidebar | 220px | Section navigation, hospital profile, settings |
| Main content | Flexible | Header, chart, table |
| Right column | 240–260px | KPI cards and donut chart |

### Spacing System

Use an 8-point spacing system.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
```

Common spacing:

- Page padding around shell: `40px` to `70px`
- Main content padding: `22px` to `28px`
- Card padding: `16px` to `20px`
- Gap between cards: `12px` to `18px`
- Gap between table rows: use internal row padding instead of large gaps

---

## 4. Typography

The design uses a clean geometric sans-serif font with rounded, modern letterforms.

Recommended fonts:

1. **Inter** — best default choice
2. **Poppins** — closer to the rounded UI feel
3. **Nunito Sans** — softer and friendlier
4. **DM Sans** — modern dashboard alternative

Recommended implementation:

```css
:root {
  --font-sans: "Inter", "Poppins", "Segoe UI", Arial, sans-serif;
}

body {
  font-family: var(--font-sans);
}
```

### Typography Scale

| Element | Size | Weight | Color |
|---|---:|---:|---|
| Page title / section title | 16px | 600 | `#25345D` |
| Card title | 12px–13px | 600 | `#34426B` |
| Sidebar item | 12px–13px | 500 | `#54658F` |
| Active sidebar item | 12px–13px | 600 | `#FFFFFF` |
| KPI number | 22px–26px | 700 | `#26345F` |
| KPI label | 11px–12px | 500 | `#9AA8C7` |
| Table header | 10px–11px | 600 uppercase | `#A5B0C9` |
| Table body | 12px | 500 | `#3F4D78` |
| Small metadata | 10px–11px | 400 | `#B2BDD3` |

### Typography Rules

- Use compact dashboard typography.
- Avoid very large headings.
- Use dark navy for important text, not pure black.
- Use muted blue-gray for secondary text.
- Use uppercase only for table headers or tiny labels.
- Keep line-height around `1.4` to `1.6`.

Recommended CSS:

```css
h1, h2, h3, h4 {
  color: #25345D;
  letter-spacing: -0.01em;
}

p, span, td {
  color: #526184;
}
```

---

## 5. Color Palette

### Primary Palette

| Token | Hex | Usage |
|---|---:|---|
| `--primary-blue` | `#1599F5` | Active navigation, main chart line, primary accent |
| `--primary-blue-dark` | `#0878E8` | Active card gradient, hover state |
| `--primary-blue-soft` | `#E9F5FF` | Soft active backgrounds, selected states |
| `--cyan` | `#49E1DA` | Secondary chart line, medical accent |
| `--cyan-soft` | `#E7FCFA` | Soft cyan backgrounds |
| `--nav-blue` | `#1E8DF2` | Primary icon rail background |
| `--deep-navy` | `#25345D` | Headings and strong numbers |

### Neutral Palette

| Token | Hex | Usage |
|---|---:|---|
| `--white` | `#FFFFFF` | Main app shell, card surfaces |
| `--page-blue` | `#F4FAFF` | Page background inside dashboard |
| `--surface-soft` | `#F8FBFF` | Light content surface |
| `--sidebar-bg` | `#FBFDFF` | Secondary sidebar background |
| `--border-soft` | `#EEF3FA` | Card borders and dividers |
| `--border-medium` | `#E4ECF8` | Table lines, input borders |
| `--text-main` | `#25345D` | Primary text |
| `--text-body` | `#526184` | Normal body text |
| `--text-muted` | `#9AA8C7` | Labels, inactive text |
| `--text-faint` | `#C2CCE0` | Placeholder, disabled text |

### Supporting Accent Colors

| Token | Hex | Usage |
|---|---:|---|
| `--orange` | `#FF9A5C` | KPI icon/card accent |
| `--orange-soft` | `#FFF1E8` | Orange icon background |
| `--purple` | `#8B78F6` | Donut chart segment |
| `--pink` | `#FF7C9B` | Donut chart segment |
| `--green` | `#35D0A5` | Positive dot, success marker |
| `--blue-gradient-start` | `#13B8FF` | Gradient card |
| `--blue-gradient-end` | `#0878E8` | Gradient card |

### CSS Variables

```css
:root {
  --primary-blue: #1599F5;
  --primary-blue-dark: #0878E8;
  --primary-blue-soft: #E9F5FF;
  --cyan: #49E1DA;
  --cyan-soft: #E7FCFA;
  --nav-blue: #1E8DF2;

  --white: #FFFFFF;
  --page-blue: #F4FAFF;
  --surface-soft: #F8FBFF;
  --sidebar-bg: #FBFDFF;
  --border-soft: #EEF3FA;
  --border-medium: #E4ECF8;

  --text-main: #25345D;
  --text-body: #526184;
  --text-muted: #9AA8C7;
  --text-faint: #C2CCE0;

  --orange: #FF9A5C;
  --purple: #8B78F6;
  --pink: #FF7C9B;
  --green: #35D0A5;
}
```

---

## 6. Border, Radius, and Shadow Rules

### Border Radius

| Component | Radius |
|---|---:|
| Main dashboard shell | `18px` |
| Cards | `14px`–`16px` |
| Active nav pills | `10px`–`12px` |
| Search input | `20px`–`24px` |
| Icon squares | `10px`–`14px` |
| Avatar | `50%` |
| Table row highlight | `8px` |

### Borders

Use very subtle borders. Avoid high-contrast gray or black borders.

```css
.card {
  border: 1px solid #EEF3FA;
}
```

Border rules:

- Default border: `1px solid #EEF3FA`
- Table divider border: `1px solid #F0F4FA`
- Sidebar divider: `1px solid #EEF3FA`
- Do not use thick borders except for charts or active visual indicators

### Shadows

The UI uses very soft shadows to create depth.

```css
--shadow-card: 0 10px 28px rgba(36, 104, 180, 0.08);
--shadow-card-hover: 0 16px 38px rgba(36, 104, 180, 0.12);
--shadow-active: 0 10px 22px rgba(21, 153, 245, 0.25);
--shadow-shell: 0 28px 70px rgba(34, 111, 205, 0.16);
```

Rules:

- Shadows should be blue-tinted, not black.
- Cards should look slightly elevated.
- Active blue elements can have stronger glow-like shadows.
- Do not overuse shadows inside tables.

---

## 7. Primary Icon Rail

The far-left vertical rail is a solid blue gradient sidebar.

### Visual Style

```css
.icon-rail {
  width: 48px;
  background: linear-gradient(180deg, #109AF6 0%, #2D80F3 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 0;
}
```

### Icon Rules

- Icons are white or very light blue.
- Inactive icons: `rgba(255, 255, 255, 0.45)`
- Active icon: white icon inside a lighter blue rounded square.
- Icon size: `14px` to `17px`
- Active icon background: `rgba(255, 255, 255, 0.16)` or slightly brighter blue
- Active icon container: `32px x 32px`, radius `10px`
- Vertical spacing between icons: `20px` to `24px`

### Logo

At the top of the icon rail, use a small white outlined mark or square logo.

```css
.logo-mark {
  width: 20px;
  height: 20px;
  color: #ffffff;
}
```

---

## 8. Secondary Sidebar

The secondary sidebar contains the product area name, section navigation, hospital profile card, and settings link.

### Sidebar Container

```css
.sidebar {
  background: #FBFDFF;
  border-right: 1px solid #EEF3FA;
  padding: 18px 14px;
}
```

### Top Brand / Category Pill

The top item is a rounded light-blue pill labelled `Health Care`.

```css
.brand-pill {
  height: 48px;
  border-radius: 12px;
  background: #EDF5FF;
  color: #1599F5;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
}
```

Rules:

- Use a heart/health icon.
- Use blue text.
- Use a very pale blue background.
- Include a small collapse arrow near the sidebar boundary.

### Navigation Items

The navigation list has two levels:

1. Parent items such as `Hospital Performance`
2. Nested child items such as `Dashboard`, `Departments`, `Task Board`, `Reports`

Inactive item style:

```css
.nav-item {
  height: 36px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-radius: 10px;
  color: #7F8DAA;
  font-size: 12px;
  font-weight: 500;
}
```

Active item style:

```css
.nav-item.active {
  background: linear-gradient(135deg, #13B8FF 0%, #0878E8 100%);
  color: #FFFFFF;
  box-shadow: 0 10px 22px rgba(21, 153, 245, 0.25);
}
```

Navigation rules:

- Active item is a bright blue gradient pill.
- Active item has white text and icon.
- Inactive icons are light gray-blue.
- Parent sections may use slightly darker text.
- Nested items are indented by `12px` to `18px`.
- Use consistent height between `34px` and `38px`.

### Hospital Profile Card

The sidebar includes a promotional/profile card with an illustration, hospital name, phone number, and button.

```css
.profile-card {
  margin-top: 28px;
  padding: 16px 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, #F1F8FF 0%, #DCEEFF 100%);
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}
```

Profile card rules:

- Use a soft medical illustration with doctors and heart/health icon.
- Illustration height: around `110px` to `130px`.
- Hospital name: dark navy, `13px`, weight `600`.
- Phone text: muted blue-gray, `11px`.
- Button text: uppercase, blue, `11px`, weight `700`.
- Keep the card soft and friendly.

### Settings Link

At the bottom, use a muted icon and label.

```css
.settings-link {
  color: #A7B3C9;
  font-size: 11px;
}
```

---

## 9. Top Content Header

The main content top row contains the page title, search input, and user avatar.

### Header Layout

```css
.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
```

### Page Title

- Text: `Departments`
- Font size: `16px`
- Font weight: `600`
- Color: `#25345D`

### Search Input

The search input is centered in the header.

```css
.search-input {
  width: 330px;
  height: 36px;
  border-radius: 22px;
  border: 1px solid #F1F5FA;
  background: #FFFFFF;
  padding: 0 38px 0 18px;
  color: #526184;
  font-size: 12px;
  box-shadow: 0 8px 20px rgba(36, 104, 180, 0.04);
}
```

Search rules:

- Placeholder text should be very faint.
- Use a small search icon on the right.
- Avoid thick input borders.
- Keep height compact.

### Avatar

- Size: `34px` to `38px`
- Shape: circular
- Border: `2px solid #FFFFFF`
- Shadow: `0 6px 16px rgba(36, 104, 180, 0.16)`
- Use a small profile photo or neutral doctor avatar.

---

## 10. Card System

All main dashboard blocks use a consistent card style.

```css
.card {
  background: #FFFFFF;
  border: 1px solid #EEF3FA;
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(36, 104, 180, 0.08);
  padding: 16px;
}
```

Card rules:

- Use white card backgrounds.
- Use soft blue-gray borders.
- Keep card corners rounded.
- Use minimal, subtle shadows.
- Use compact but breathable padding.
- Avoid large saturated card backgrounds except for the active KPI card.

---

## 11. Overview Line Chart Card

The top main card is an `Overview` analytics chart.

### Structure

- Card title: `Overview`
- Legend items:
  - `Av. Cost` with blue dot
  - `#Patient Admissions` with cyan dot
- Line chart with two smooth curved lines
- Vertical selected-date marker at the center
- Tooltip floating above selected point
- Highlighted vertical blue translucent band

### Chart Card Style

```css
.overview-card {
  min-height: 260px;
  padding: 16px 18px;
}
```

### Chart Visual Rules

- Use a white chart background.
- Use horizontal grid lines in very faint gray-blue.
- Do not use heavy axis lines.
- Chart lines should be smooth curves.
- Blue line: main metric
- Cyan line: secondary metric
- Use subtle glow/shadow under the lines.
- Use a faint area gradient under each line if possible.
- Use small circular markers on the selected date.
- Use a vertical dashed line for the selected point.
- Add a translucent blue vertical selection band behind the selected point.

Recommended colors:

```css
.chart-blue-line { stroke: #1599F5; }
.chart-cyan-line { stroke: #49E1DA; }
.chart-grid { stroke: #EEF3FA; }
.chart-selected-band { fill: rgba(21, 153, 245, 0.12); }
.chart-selected-line { stroke: rgba(37, 52, 93, 0.35); stroke-dasharray: 4 4; }
```

### Tooltip Style

```css
.chart-tooltip {
  background: #FFFFFF;
  border: 1px solid #EEF3FA;
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(36, 104, 180, 0.14);
  padding: 10px 12px;
  font-size: 10px;
}
```

Tooltip rules:

- Include date as bold title.
- Include metric rows with small colored dots.
- Keep tooltip compact.
- Use soft shadow.

---

## 12. KPI Statistic Cards

The right top section has a 2x2 grid of KPI cards.

### KPI Grid

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
```

### Default KPI Card

```css
.kpi-card {
  min-height: 112px;
  padding: 14px;
  border-radius: 14px;
  background: #FFFFFF;
  border: 1px solid #EEF3FA;
  box-shadow: 0 10px 24px rgba(36, 104, 180, 0.08);
}
```

### KPI Icon

```css
.kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #FFFFFF;
}
```

Icon background examples:

- Departments: cyan/green gradient
- Total Patient: blue/purple gradient
- Average patient per department: orange gradient
- Average doctors per department: soft blue icon inside active blue card

### KPI Text

```css
.kpi-label {
  margin-top: 12px;
  font-size: 11px;
  line-height: 1.35;
  color: #9AA8C7;
  font-weight: 500;
}

.kpi-value {
  margin-top: 4px;
  font-size: 22px;
  line-height: 1;
  color: #25345D;
  font-weight: 700;
}
```

### Active KPI Card

One KPI card uses a strong blue gradient background.

```css
.kpi-card.active {
  background: linear-gradient(135deg, #13B8FF 0%, #0878E8 100%);
  color: #FFFFFF;
  box-shadow: 0 16px 34px rgba(21, 153, 245, 0.28);
}

.kpi-card.active .kpi-label,
.kpi-card.active .kpi-value {
  color: #FFFFFF;
}
```

Active card rules:

- Use white typography.
- Use brighter blue gradient.
- Icon can have a lighter translucent square background.
- This card should stand out as the selected/important metric.

---

## 13. Department Overview Table

The lower main card contains a clean data table titled `Department Overview`.

### Card Header

- Left: title `Department Overview`
- Right: small rounded `Sort by` dropdown

```css
.table-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
```

Sort dropdown:

```css
.sort-button {
  height: 28px;
  padding: 0 12px;
  border-radius: 16px;
  border: 1px solid #EEF3FA;
  background: #FFFFFF;
  color: #9AA8C7;
  font-size: 10px;
  box-shadow: 0 8px 18px rgba(36, 104, 180, 0.05);
}
```

### Table Style

```css
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  font-size: 10px;
  color: #A5B0C9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding: 12px 10px;
}

td {
  font-size: 12px;
  color: #3F4D78;
  font-weight: 500;
  padding: 13px 10px;
  border-top: 1px solid #F0F4FA;
}
```

### Table Content

Columns shown in the design:

1. Diagnosis Name
2. # Patients
3. # Manpower
4. Avg. Cost
5. Avg. Days Admitted

Example rows:

- Orthopedics
- Dermatology
- Surgery
- Cardiology
- Neurology

### Table Row Highlight

One row has a subtle light-blue selected state.

```css
tr.highlighted {
  background: #F5FAFF;
}
```

### Mini Progress Bars

The last column includes small horizontal progress indicators.

```css
.mini-bar {
  width: 44px;
  height: 3px;
  border-radius: 99px;
  background: #E7EEF8;
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1599F5, #49E1DA);
}
```

Rules:

- Table should be readable but compact.
- Do not use heavy zebra striping.
- Use only one soft highlighted row if needed.
- Keep numbers aligned and easy to compare.

---

## 14. Donut Chart Card

The bottom-right card shows `Admission by Division`.

### Card Structure

- Title at top: `Admission by Division`
- Donut chart centered
- Tooltip/pill label near chart segment
- Center value: `930`
- Center label: `Total Patients`
- Legend at bottom using colored dots

### Donut Card Style

```css
.donut-card {
  min-height: 290px;
  padding: 18px 16px;
  border-radius: 16px;
  background: #FFFFFF;
  border: 1px solid #EEF3FA;
  box-shadow: 0 10px 28px rgba(36, 104, 180, 0.08);
}
```

### Donut Chart Rules

- Use thick rounded donut segments.
- Segment thickness: `10px` to `14px`
- Inner hole should be large enough to hold the number and label.
- Use multiple bright but soft segment colors: cyan, blue, purple, orange, pink.
- Use white gaps between segments.
- Keep the chart centered.

Recommended segment colors:

```css
--segment-orthopedics: #49E1DA;
--segment-cardiology: #1599F5;
--segment-surgery: #8B78F6;
--segment-dermatology: #FF9A5C;
--segment-neurology: #FF7C9B;
```

### Donut Center Text

```css
.donut-value {
  font-size: 26px;
  font-weight: 700;
  color: #25345D;
}

.donut-label {
  font-size: 11px;
  color: #9AA8C7;
}
```

### Donut Tooltip Pill

```css
.donut-tooltip {
  background: #FFFFFF;
  border: 1px solid #EEF3FA;
  border-radius: 999px;
  box-shadow: 0 8px 20px rgba(36, 104, 180, 0.12);
  padding: 5px 9px;
  font-size: 10px;
  color: #526184;
}
```

### Legend Rules

- Use two or three columns if width is limited.
- Dot size: `5px` to `7px`
- Label size: `10px` to `11px`
- Muted label color.
- Keep legend spacing compact.

---

## 15. Icons and Illustration Style

### Icon Style

Icons should be simple line or filled-line icons with rounded edges.

Recommended icon libraries:

- Lucide React
- Heroicons
- Phosphor Icons
- Remix Icons

Icon rules:

- Stroke width: `1.75px` to `2px`
- Rounded caps and joins
- Size: `14px` to `18px` for navigation
- Size: `18px` to `22px` for KPI icons
- Use white icons on colored backgrounds
- Use muted blue-gray icons for inactive navigation

### Illustration Style

The hospital profile card uses a soft flat vector illustration.

Illustration rules:

- Medical/doctor characters
- Blue and white dominant colors
- Soft gradients
- Friendly proportions
- No realistic or detailed illustration
- Keep illustration minimal and dashboard-friendly

---

## 16. Interaction States

### Hover

```css
.card:hover {
  box-shadow: 0 16px 38px rgba(36, 104, 180, 0.12);
  transform: translateY(-1px);
}
```

Rules:

- Hover movement should be subtle: `-1px` to `-2px`.
- Avoid aggressive animation.
- Transition duration: `160ms` to `220ms`.

### Active Navigation

- Use blue gradient background.
- Use white text/icon.
- Add soft blue shadow.

### Focus States

```css
:focus-visible {
  outline: 3px solid rgba(21, 153, 245, 0.24);
  outline-offset: 2px;
}
```

### Disabled / Muted

- Text: `#C2CCE0`
- Icon: `rgba(127, 141, 170, 0.45)`
- No strong shadow

---

## 17. Responsive Behavior

### Desktop First

The reference image is desktop-focused. The default target should be desktop dashboard layout.

Recommended breakpoints:

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

### Large Desktop

- Keep icon rail and sidebar visible.
- Use two-column main content plus right analytics column.
- Max dashboard width around `1120px` to `1240px`.

### Tablet

- Collapse secondary sidebar or make it narrower.
- Right analytics column can move below the chart.
- KPI cards remain in 2-column grid.

### Mobile

- Hide primary icon rail or convert it to bottom navigation.
- Convert sidebar to drawer.
- Use single-column layout.
- KPI cards can become 2-column or single-column depending on width.
- Charts should be horizontally responsive.

---

## 18. Component Checklist for AI Agent

When generating the website, include these components:

1. Full-page soft abstract gradient background
2. Centered white dashboard shell with rounded corners and blue-tinted shadow
3. Left primary icon rail with blue gradient background
4. Secondary sidebar with:
   - Health Care pill
   - Navigation items
   - Active Departments nav item
   - Hospital profile card
   - Settings link
5. Main header with:
   - `Departments` title
   - Search input
   - User avatar
6. Overview chart card with:
   - Two smooth lines
   - Legend
   - Tooltip
   - Selected date marker
7. KPI card grid with four stats:
   - Number of Departments: `05`
   - Total Patient: `12903`
   - Av. Patient per Department: `32`
   - Av. Doctors per Department: `12`
8. Department overview table with five rows
9. Admission by Division donut chart card
10. Footer text inside dashboard, very small and muted

---

## 19. Implementation Guidance for React / Tailwind

### Tailwind Style Direction

Use classes similar to:

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-100 flex items-center justify-center p-10">
  <div className="w-full max-w-6xl min-h-[680px] bg-white rounded-[18px] shadow-[0_28px_70px_rgba(34,111,205,0.16)] overflow-hidden grid grid-cols-[48px_220px_1fr]">
    {/* Icon Rail */}
    {/* Sidebar */}
    {/* Main Content */}
  </div>
</div>
```

Preferred Tailwind values:

- `rounded-[14px]`, `rounded-[16px]`, `rounded-[18px]`
- `border border-[#EEF3FA]`
- `text-[#25345D]`
- `text-[#9AA8C7]`
- `bg-[#FBFDFF]`
- `shadow-[0_10px_28px_rgba(36,104,180,0.08)]`
- `bg-gradient-to-br from-[#13B8FF] to-[#0878E8]`

### Chart Library Recommendation

Use **Recharts** for React implementation:

- `LineChart` for overview chart
- `Area` or gradient fill under lines if desired
- `PieChart` with `innerRadius` for donut chart
- Custom tooltip components
- Use rounded line caps when possible

---

## 20. Do and Don't

### Do

- Use white surfaces with soft borders.
- Use blue and cyan as the main brand colors.
- Use dark navy text instead of black.
- Use rounded cards and pills.
- Use subtle shadows with blue tint.
- Keep data visualizations clean and readable.
- Use compact typography.
- Keep the overall interface spacious.

### Don't

- Do not use harsh black shadows.
- Do not use pure black text.
- Do not use thick borders.
- Do not make the layout too dense.
- Do not use overly saturated colors everywhere.
- Do not mix too many font families.
- Do not use sharp square card corners.
- Do not make the sidebar dark except for the primary blue icon rail.

---

## 21. Final Visual Goal

The final website should look like a polished medical SaaS analytics dashboard. It should communicate clarity, trust, and modern digital health professionalism. The visual hierarchy should guide the user from sidebar navigation, to the page title, to the overview chart, to KPI cards, and finally to detailed table/chart analytics.

The design should feel lightweight, premium, and calm, with the blue gradient navigation and cards acting as the main visual identity.
