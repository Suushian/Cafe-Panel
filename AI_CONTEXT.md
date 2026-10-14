# AI Context — Cafe Panel

## Project
پنل تحت وب لوکال برای کافه.

## Goal
مدیریت منو، مشتریان، سفارش و گزارش فروش. لوکال، بدون اینترنت، ریسپانسیو.

## Status
Phase 13 Complete — 13 Phases, 62 Tasks

## Tech Stack
- Next.js 16.3.8 (App Router + Turbopack)
- React 19.3.0 + TypeScript 5.6
- Tailwind CSS 3.4 (darkMode: class + CSS variables)
- Prisma 7.10.0 + SQLite (libsql adapter)
- Node.js 22 یا 24 LTS (نه 26 — ABI پکیج‌های native رو تغییر می‌ده)
- bcryptjs + Lucide React + Vazirmatn

## Local Environment
- OS: Windows
- Path: D:\0 - WORK\PROJECTS\cafe-panel
- Node.js: v24.16.0

## Launcher
پوشه‌ی launch/. Install.bat, Start.bat, Start-Silent.vbs, Stop.bat,
Build-Icon.ps1, Create-Shortcuts.ps1.

## Authentication
- Single admin، رمز bcrypt
- /setup → /login → (panel)
- Session در DB، کوکی HTTP-only، ۱۲ ساعت
- Rate limiting

## Customer System
- Customer model: name, subscriptionCode (unique), phone?
- Order.customerId (nullable, SetNull on delete)
- /customers page with search + CRUD
- CustomerPicker با searchable dropdown (انیمیشن ورود/خروج)
- Report filter + CSV columns

## Order Features
- orderType: dine_in | takeaway | delivery (Lucide icons)
- discountType: none | percent | amount
- Quick reorder + Edit (open orders only، /orders/[id]/edit)
- Undo delete
- updateOrder: $transaction + replace-all items

## Maintenance
- /maintenance با ۴ checkbox
- type-to-confirm (کلمه‌ی DELETE)
- backup خودکار قبل از اجرا
- آیتم‌های منو فقط اگر در سفارش استفاده نشده باشند

## UX Features
- Keyboard: N, G+M/O/R/C, ?, Esc
- Search در منو و مشتریان
- Dark mode (localStorage + useServerInsertedHTML)
- Toast با action
- Modal/Dropdown با انیمیشن ورود/خروج (300ms/200ms)
- Sidebar Collapse (240px ↔ 76px، localStorage)
- Mobile Drawer (<1024px، slide از راست)
- Theme alignment: --danger / --danger-soft in 8 files

## Routes (13)
- / → /welcome
- /welcome (public)
- /setup, /login
- /menu, /orders, /orders/new, /orders/[id]/edit
- /customers, /reports, /reports/export, /maintenance
- (panel)/* → محافظت‌شده

## Data Model (6)
- MenuItem: id, name, price, category, isAvailable, createdAt
- Customer: id, name, subscriptionCode (unique), phone?, createdAt, updatedAt
- Order: id, totalPrice, status, orderType, discountType, discountValue, discountAmount, customerId?, createdAt
- OrderItem: id, orderId, menuItemId, quantity, unitPrice
- Admin: id, passwordHash, createdAt, updatedAt
- Session: id, token, expiresAt, createdAt

## Business Rules
- totalPrice در سرور، unitPrice در لحظه‌ی سفارش
- discountAmount = clamp(value, 0, subtotal)
- finalPrice = totalPrice - discountAmount
- MenuItem استفاده‌شده قابل حذف نیست
- Customer حذف شد → SetNull روی سفارش
- فقط سفارش‌های open قابل ویرایش
- resetDatabase: backup اول، سپس transaction

## UI System
### Theme
- light + dark از طریق .dark روی html
- localStorage key: "cafe-theme"
- ThemeScript با useServerInsertedHTML (React 19 safe)
- CSS variables برای همه‌ی رنگ‌ها
- .alert-error کلاس مشترک برای خطاها

### Animation
- CSS keyframes در tailwind.config.js
- duration-180, 200, 250, 300, 400, 600
- ease-out-expo برای همه‌ی transition
- hooks: use-tilt, use-count-up, use-keyboard-shortcuts
- Modal/Dropdown: mounted + visible pattern
- Sidebar: transition-all duration-300

### Layout
- PanelShell: manager state (collapse, mobile)
- MobileMenuContext: provider + hook
- Sidebar: collapsed prop + onToggle
- Header: hamburger در lg:hidden

### Modal
- components/Modal.tsx — React Portal + lifecycle animation

### Toast
- components/ToastProvider.tsx — Portal + context

### Icons
- Lucide React
- OrderTypeIcon (mapper)

## Conventions
- RTL سراسری
- همه‌ی متن‌ها فارسی
- Server Actions برای mutation
- Server Component برای data fetching
- PowerShell helper: scripts/ps-helpers.ps1
- بعد از schema change: npx prisma migrate dev + npx prisma generate
- بعد از migration: Remove-Item .\.next -Recurse
- Breakpoints: sm=640، lg=1024

## UI Palette
روشن: bg #FAF7F2, surface #FFFFFF, primary #6F4E37, text #2E2A26, danger #9B3A2E
تیره: bg #1A1613, surface #2A231D, primary #A67C5B, text #F0E9DE, danger #D68270

## Key Modules
### Core
- src/lib/prisma.ts, auth.ts, logout-action.ts, backup.ts

### Domain
- src/lib/discount.ts, order-type.ts, order-status.ts, categories.ts

### Utils
- src/lib/format.ts, date-range.ts

### Hooks
- src/lib/use-tilt.ts, use-count-up.ts, use-keyboard-shortcuts.ts

### Components
- Modal, ToastProvider, EmptyState, KeyboardShortcuts,
  KeyboardHelpDialog, ThemeToggle, ThemeScript, Sidebar,
  Header, LogoutButton, Reveal, PageTransition, OrderTypeIcon,
  PanelShell, MobileMenuContext

## Known Constraints
- تک‌کاربر، تک‌کامپیوتر
- Prisma 7.10.0 pin
- Accepted risk: deepmerge-ts, mysql2 در devDeps prisma
- backup بدون encryption

## Development
- npm run dev / build / start
- npx prisma migrate dev --name <name>
- npx prisma generate
- npx prisma studio