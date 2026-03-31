# PRD: ScOp Portfolio Meeting App

**Author:** Zi / ScOp Venture Capital
**Date:** March 28, 2026
**Status:** Final v2 — Ready for Implementation

---

## 1. Overview

A custom internal web app for ScOp VC's weekly Wednesday portfolio meeting. The app replaces the current spreadsheet-driven workflow with a purpose-built interface that makes it fast to review ~28 portfolio companies, take notes, reference previous weeks, and generate post-meeting action items for the team.

The app is the primary interface during meetings, with Google Sheets as the persistent data layer. Both stay in sync: edits made in the app are pushed to the sheet on save, and edits made in the sheet are pulled into the app on load.

---

## 2. Users and Access

**Primary user:** Zi (sole operator during meetings)

**Access model:** Single shared session, no user accounts. A simple password gate protects the URL — one password entered once per browser session (stored in a cookie). No Google OAuth, no team logins.

**Team members referenced in the system:** Zi, Jeff, James, Mike, Kevin, Cormac, Drew, Ivan

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Hosting | Vercel (connected to GitHub repo, auto-deploy on push) |
| Data layer | Google Sheets API v4 |
| Auth to Sheets | Google Cloud Service Account (credentials stored as Vercel env vars) |
| App protection | Simple password middleware (env var `APP_PASSWORD`) |
| Styling | CSS modules or inline styles, matching ScOp brand aesthetic |
| State management | React useState/useReducer (no external state library) |
| Icons | Lucide React |
| Font | Outfit (Google Fonts) — closest match to Aktiv Grotesk used on scopvc.com |

---

## 4. Data Source: Google Sheets

**Sheet URL:** `https://docs.google.com/spreadsheets/d/1PiMVtuZZB0KlwBPNCwyhxCZHygxzdLK74JSQIgb3ySs/`

**Sheet structure:**

| Row | Content |
|---|---|
| Rows 1-3 | General team notes (not company-specific) — mapped to "General Notes of the Day" |
| Row 4 | Action Items — compiled action items written here on Save |
| Row 5 | Header row: "PortCos", "Analyst", "Partner", then date columns (e.g., "10/29/2025", "3/25", "4/1") |
| Rows 6+ | Individual portfolio companies, one per row |

| Column | Content |
|---|---|
| A | PortCo name |
| B | Analyst (team member assigned) |
| C | Partner (partner assigned) |
| D onward | Meeting date columns — notes per company per date |

**Service account setup:**
1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account, download JSON key
4. Share the Google Sheet with the service account email (Editor access)
5. Store credentials as Vercel environment variables:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (with \n preserved)
   - `GOOGLE_SHEET_ID` = `1PiMVtuZZB0KlwBPNCwyhxCZHygxzdLK74JSQIgb3ySs`

---

## 5. Core Features

### 5.1 Meeting Date Management

- Meetings happen every Wednesday
- The app reads all existing date columns from the sheet on load
- A date tab bar at the top lets the user switch between any historical meeting date
- The most recent date is selected by default
- **"New Week" button:** A green-accented button at the end of the date tab bar. Clicking it:
  1. Calculates the next Wednesday after the last existing date
  2. Creates the new date in the app state
  3. Adds empty note entries for all companies
  4. Switches to the new date as the active tab
  5. On Save, this new date is written to the Google Sheet as a new column (date header in row 5, empty cells for all company rows)
- This is how new columns appear in the Google Sheet — either via the "New Week" button followed by Save, or via auto-generation if the app is opened on/after a Wednesday that doesn't exist yet

### 5.2 General Notes of the Day

A dedicated collapsible section above the main company list/detail area for team-wide notes not affiliated with any particular company.

- Displayed for each meeting date (switches with the date tabs)
- Editable textarea, same styling as company notes
- Synced to Google Sheets (maps to rows 1-3 in the sheet, consolidated into a single text block per date)
- Examples: "UCSB professor visiting Friday", "ScOp Swag update", "Analyst as Board Observers assignments"
- Collapsible to save space during company review
- Included in the Save & Sync operation

### 5.3 Company List (Left Panel, 380px)

A scrollable list of all portfolio companies, showing:

- Company name (bold, 14px, weight 500)
- Analyst and Partner names with User/Users icons
- Status indicator dot:
  - **Green** (with glow) — notes exist for the current meeting date
  - **Amber** — notes exist for last week but not this week (stale)
  - **Red** (dimmed) — no notes for 2+ consecutive weeks (inactive)
- Truncated preview of this week's notes (if any)
- Row index number (01, 02, 03...) in muted text
- Search/filter bar at the top (with Search icon) to filter by company name, analyst, or partner
- "Add Company" button (dashed border, Plus icon) below search
- Progress indicator in header: "X/28 reviewed" with thin progress bar
- "N pending" counter in list footer
- Selected company gets a left-edge accent bar (2px cream) and elevated background
- Company order matches Google Sheet order exactly

### 5.4 Company Detail Panel (Right Panel, fluid width)

When a company is selected from the list:

1. **Header row** — Company name (28px, weight 600). Analyst and Partner badges below the name with User/Users icons (14px).
2. **This week's notes** — Large editable textarea with Clock icon label. Pre-populated with existing data. Changes update local state immediately.
3. **Previous week's notes** — Read-only reference block below, left border accent (2px cream-12), slightly dimmed. Shows last week's notes for context.
4. **Full history accordion** — Expandable section with ChevronRight/ChevronDown toggle. Shows all historical notes by date (newest first). Collapsed by default.

**Note:** Action items are NOT shown per-company. They are generated globally after Save (see 5.5).

### 5.5 Action Items Summary (Main Page, Generated on Save)

Action items are parsed and generated globally after the user clicks Save. This matches the real workflow: review all companies, take notes, then generate the summary.

**Trigger:** Clicking "Save & Sync" parses ALL company notes for the current meeting date, extracts action items, and displays the summary.

**Display:** A prominent banner section on the main page (above the company list/detail area, below General Notes). Appears with a slide-down animation after Save. Uses a CSS Grid layout (auto-fill, minmax 300px).

**Format — Grouped by team member:**
```
*Zi*
- Call with Alex Friday, post article (Pangram)
- Get lifeguard email, contact Maya (Lifeguard)

*Jeff*
- Post Artiphishell blog (Artiphishell)
- On article (HealthArc)
```

Each person gets a card (surface-3 background, shadow-sm) with their name, item count, and bulleted action items with company tags in uppercase muted text.

**Copy to Clipboard:** A "Copy for Slack" button (ghost style) that copies the full text in Slack-compatible markdown (`*Name*` for bold, `-` for bullets, company name in parentheses). A close button (X) to dismiss the banner.

**Sync to Google Sheet — Row 4:** On Save, the compiled action items text is also written to Row 4 of the Google Sheet in the current date's column. Same plain-text format so it's readable in the spreadsheet.

### 5.6 Save & Sync

- "Save & Sync" button in the header (cream bg, black text — primary button style)
- Button states: default → loading (spinner icon, "Saving...") → success (green bg, check icon, "Saved") → resets
- On click:
  1. Pushes all edited company notes for the current meeting date to the Google Sheet
  2. Pushes the General Notes of the Day to rows 1-3
  3. Parses all notes, generates action items, writes compiled text to Row 4
  4. If current date column doesn't exist in sheet (new week), creates the column first
  5. Displays the action items summary banner
  6. Shows success toast notification ("Notes saved & synced to Google Sheets")
- On app load:
  1. Fetches all data from the Google Sheet
  2. Populates local state
  3. If a new Wednesday has arrived, auto-generates the new date
  4. If Row 4 has existing action items for the current date, displays them

### 5.7 Add New Company

- "Add Company" button in the left panel (dashed border, Plus icon)
- Opens a modal (400px, surface-2 bg, shadow-lg, blur backdrop overlay):
  - Company Name text input (required)
  - Analyst dropdown (from team list)
  - Partner dropdown (from team list)
  - Cancel (ghost) and Add Company (primary) buttons
- On submit:
  1. New company added to the **top** of the company list in the app
  2. New row inserted at row 6 in Google Sheet (pushing existing companies down)
  3. Column A = name, B = analyst, C = partner, all date columns = empty
  4. Auto-selects the new company
  5. Toast notification: "Company added to portfolio"

---

## 6. Branding and Assets

### 6.1 ScOp Logo

- **Header logo:** ScOp logo from `https://scopvc.com/wp-content/uploads/2025/08/logo-1.png` (dark version)
- Rendered at 28px height in the top-left corner
- CSS filter applied to tint it cream (#F3F0E7) for the dark background: `filter: brightness(0) invert(0.94) sepia(0.08) saturate(0.3) hue-rotate(15deg)`
- Positioned left of a vertical separator, followed by "Portfolio Meeting" text

### 6.2 Company Logos

Company logos are NOT displayed in the detail panel (removed for cleaner layout). Logo URLs from scopvc.com/companies/ are retained in the codebase data for potential future use but are not rendered in v1.

---

## 7. Design System

Extracted from live inspection of scopvc.com. See the working prototype at `scop-meeting.jsx` for reference implementation.

**Font:** Outfit (Google Fonts) — closest free match to Aktiv Grotesk (scopvc.com's font). Single family, weight variations: 300/400/500/600/700.

**Color palette (exact from scopvc.com):**

| Token | Value | Usage |
|---|---|---|
| `--black` | #000000 | Page background |
| `--surface-1` | #0a0a0a | Header, date bar |
| `--surface-2` | #131313 | Textareas, banners, modals |
| `--surface-3` | #1a1a1a | Cards within elevated areas |
| `--cream` | #F3F0E7 | Primary text |
| `--cream-80/60/40/20/12/08/04` | rgba variants | Opacity levels for hierarchy |
| `--muted` | rgb(104, 109, 109) | Secondary text |
| `--green` | #6fcf6f | Updated status, success, new week button |
| `--amber` | #e0ad3a | Stale status |
| `--red` | #e06060 | Inactive status, warnings |

**Typography scale:**

| Element | Size | Weight | Letter-spacing |
|---|---|---|---|
| Company detail name | 28px | 600 | -0.8px |
| Logo text | 17px | 600 | -0.4px |
| Company list name | 14px | 500 | -0.02em |
| Body / notes textarea | 16px | 400 | -0.01em |
| Previous notes / history | 15px | 400 | normal |
| Nav / header labels | 13px | 400-500 | 0.02em |
| Section labels (uppercase) | 11px | 600 | 0.06em |
| Meta / muted | 11-12px | 400 | 0.01-0.02em |

**Button styles:**

| Type | Background | Text | Border | Radius |
|---|---|---|---|---|
| Primary | #F3F0E7 (cream) | black | none | 0 (sharp) |
| Ghost | transparent | cream-60 | 1px cream-12 | 0 |
| Success | #6fcf6f (green) | black | none | 0 |
| New Week | green-dim (15%) | green | 1px green-20 | 0 |

All buttons: hover lightens, active scale(0.98), disabled 30% opacity + no pointer.

**Shadows (dark mode depth):**

| Token | Value |
|---|---|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3) |
| `--shadow-md` | 0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4) |
| `--shadow-lg` | 0 12px 40px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5) |

**Interaction states:** Default → Hovered (+4% cream bg, text brightens) → Pressed (scale 0.98, darken) → Disabled (30% opacity). Loading: Loader2 spinner with CSS rotation. Transitions: 150ms ease.

---

## 8. Page Structure

```
+--------------------------------------------------------------+
| [ScOp Logo]  |  Portfolio Meeting  |  14/28 ████  |  [Save]  |
+--------------------------------------------------------------+
| Jan 28  Feb 4  ...  Mar 25  | [+ New Week]                   |
+--------------------------------------------------------------+
| ▼ General Notes · Mar 25                                      |
| [Team-wide notes textarea...]                                 |
+--------------------------------------------------------------+
| [Action Items Banner - appears after Save]                    |
| Zi (3)         | Jeff (4)        | James (2)     | [Copy][X] |
| - item (Co)    | - item (Co)     | - item (Co)   |           |
+------------------+-------------------------------------------+
| 🔍 Search...     |                                           |
| [+ Add Company]  |  Company Name                             |
+------------------+  Analyst: X  Partner: Y                   |
| 01 ● Pangram     |                                           |
| 02 ● Snag        |  THIS WEEK · Mar 25                       |
| 03 ● SuiteOp     |  +-------------------------------------+ |
| 04 ○ Rogo        |  | Editable textarea...                | |
| ...              |  +-------------------------------------+ |
|                  |                                           |
| 28 companies     |  PREVIOUS WEEK · Mar 18                   |
| 14 pending       |  │ Read-only reference notes...          | |
|                  |                                           |
|                  |  ▸ Full History                            |
+------------------+-------------------------------------------+
```

---

## 9. API Routes (Next.js)

### `GET /api/sheet`
- Fetches all data from the Google Sheet
- Returns: `{ companies: [...], dates: [...], generalNotes: {...}, actionItems: {...} }`
- Parses row 5 headers to identify date columns
- Reads rows 1-3 for general notes, row 4 for action items, rows 6+ for companies
- Called on app load

### `POST /api/sheet/sync`
- Accepts: `{ date: "4/1", notes: { "Pangram": "note text", ... }, generalNotes: "...", actionItems: "compiled text" }`
- If the date column doesn't exist, creates it first (header in row 5)
- Writes general notes to rows 1-3
- Writes compiled action items to row 4
- Writes company notes to rows 6+
- Uses `batchUpdate` for efficiency (single API call)
- Returns: `{ success: true, updatedCells: N }`

### `POST /api/sheet/add-company`
- Accepts: `{ name: "NewCo", analyst: "Zi", partner: "Mike" }`
- Inserts a new row at position 6 (top of company rows)
- Populates A (name), B (analyst), C (partner), empty cells for all date columns
- Returns: `{ success: true, company: {...} }`

### `POST /api/auth`
- Accepts: `{ password: "..." }`
- Validates against `APP_PASSWORD` env var
- Sets httpOnly cookie on success
- Returns: `{ authenticated: true }`

### Middleware
- All routes except `/api/auth` check for the auth cookie
- Unauthenticated requests redirect to password entry page

---

## 10. Google Sheets Sync Logic

**On load (read):**
1. Fetch entire sheet range (A1:ZZ100 or dynamic range)
2. Parse row 5 as headers to identify date columns
3. Read rows 1-3 for general notes per date
4. Read row 4 for action items per date
5. For each company row (6+), map company name + analyst + partner + notes per date
6. Return structured JSON

**On save (write):**
1. Find column index for target date
2. If column doesn't exist, append new column with date header in row 5
3. Write general notes to rows 1-3 in target date's column
4. Parse all company notes, generate action items, write compiled text to row 4
5. For each company with updated notes, write to the corresponding cell (rows 6+)
6. Use `batchUpdate` for efficiency (single API call)

**New week creation flow:**
1. User clicks "New Week" → app calculates next Wednesday
2. New date appears in date tabs, auto-selected
3. User takes notes during meeting
4. User clicks "Save & Sync" → API creates new column in sheet, writes all data
5. Sheet now has the new date column with all notes

---

## 11. Action Item Parser

Extracts action items from free-text notes using pattern matching.

**Recognized patterns:**
- `[Name] to [verb phrase]` → "Jeff to post article"
- `[Name] on [noun phrase]` → "Zi on partnerships"
- `[Name] check/reach out/send/post/coordinate/continue/meet/contact/write/talk/sync/pass/start/get/download [...]`
- `Everyone [action]` → assigned to all team members

**Known names:** Zi, Jeff, James, Mike, Kevin, Cormac, Drew, Ivan

**Deduplication:** Actions are keyed by `owner:action_prefix` to prevent duplicates.

**Output per action:**
```json
{ "owner": "Zi", "action": "Call with Alex Friday", "company": "Pangram" }
```

---

## 12. Deployment & Setup

### Prerequisites
- GitHub repository (new, private)
- Vercel account connected to GitHub
- Google Cloud project with Sheets API enabled
- Service account JSON key

### Environment Variables (Vercel)
```
APP_PASSWORD=<chosen password>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account@project.iam.gserviceaccount.com>
GOOGLE_PRIVATE_KEY=<private key from JSON, with \n preserved>
GOOGLE_SHEET_ID=1PiMVtuZZB0KlwBPNCwyhxCZHygxzdLK74JSQIgb3ySs
```

### Deployment Flow
1. Push code to GitHub `main` branch
2. Vercel auto-deploys
3. Custom domain optional (e.g., `meeting.scopvc.com`)

---

## 13. Implementation Phases

### Phase 1: Project Setup & Static UI
- Initialize Next.js project with App Router
- Set up project structure, CSS, font loading (Outfit from Google Fonts)
- Build all UI components with static/mock data (from prototype JSX)
- Implement: header, date tabs, company list, detail panel, general notes section, action items banner, add company modal, toast notifications
- All button states, hover effects, animations
- Password gate page (static, no backend yet)
- **Deliverable:** Fully functional frontend with hardcoded data, deployable to Vercel

### Phase 2: Google Sheets Integration
- Set up Google Cloud service account
- Implement `GET /api/sheet` — fetch and parse sheet data
- Implement `POST /api/sheet/sync` — write notes, general notes, action items to sheet
- Implement `POST /api/sheet/add-company` — insert new row
- Replace hardcoded data with API calls
- Loading states on app startup
- Error handling and toast notifications for API failures
- **Deliverable:** App reads/writes to Google Sheet, Save syncs bidirectionally

### Phase 3: New Week + Auth + Polish
- Implement "New Week" button → creates new column in sheet on Save
- Auto-detection of new Wednesdays on app load
- Implement `POST /api/auth` and middleware
- Password entry page with cookie-based session
- Action items parser refinements (test against real notes data)
- Copy-to-clipboard Slack formatting
- Action items written to Row 4 on save
- Edge case handling (empty notes, special characters, very long text)
- Performance optimization (debounced saves, optimistic updates)
- **Deliverable:** Complete v1, production-ready

---

## 14. Future Enhancements (Out of Scope for v1)

- Direct Slack integration via webhook
- Pre-meeting digest (auto-summary of last week's open action items)
- Timer per company discussion
- Multi-user editing with presence indicators
- Mobile responsive layout
- AI meeting transcript parsing (Zoom/Otter)
- Historical analytics (update frequency, action item completion rates)

---

## 15. Success Criteria

1. Zi can run a full Wednesday meeting using only the app (no spreadsheet tab-switching)
2. Notes sync reliably to Google Sheets after clicking Save
3. New week creation in the app correctly adds a column to the Google Sheet
4. Action items are accurately parsed and the Slack copy-paste format works cleanly
5. Company logos display correctly from scopvc.com
6. The app loads in under 2 seconds and feels snappy during note-taking
7. The design feels like it belongs to ScOp's brand

---

## 16. Resolved Decisions

| Question | Decision |
|---|---|
| Row 1-3 general notes | "General Notes of the Day" — editable, synced, per-date |
| Row 4 | Action Items — compiled and written on Save |
| "Received 2026 Numbers?" column | Deleted from sheet — no longer relevant |
| Note formatting | Plain text only |
| Company ordering | Match Google Sheet order exactly |
| Authentication | Service account for Sheets, simple password gate for app |
| Meeting date creation | "New Week" button + auto-generate on load |
| New week → Sheet | New column created in Google Sheet on Save |
| Action items display | NOT per-company. Global banner after Save, grouped by person |
| Action items output | Slack-compatible markdown, copy-to-clipboard |
| Users | Single user (Zi), no multi-user |
| Company logos | Removed from detail panel — cleaner layout, URLs retained in codebase for future use |
| ScOp logo | From scopvc.com, cream-tinted via CSS filter, 28px height in header |

---

## 17. Reference Files

| File | Description |
|---|---|
| `scop-meeting.jsx` | Working React prototype with all UI, data, and interactions |
| `PRD — ScOp Portfolio Meeting App.md` | This document |
| Google Sheet | `1PiMVtuZZB0KlwBPNCwyhxCZHygxzdLK74JSQIgb3ySs` |
