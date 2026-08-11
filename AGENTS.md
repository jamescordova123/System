# System — School Management (Laravel + Inertia + React + TS)

## Stack
- Laravel 13.7, Inertia 3, React + TypeScript, Spatie Permission 8, Fortify, Pulse, Reverb, Scout, Wayfinder
- Frontend bundler: Vite 8 (rolldown-based). Build needs the `@rolldown/binding-linux-x64-gnu` native optional dep; in sandboxes without it, install it explicitly (`npm install @rolldown/binding-linux-x64-gnu@<ver> --no-save`).
- Full `vite build` also runs `php artisan wayfinder:generate`, so PHP must be on PATH or the build fails at the Wayfinder plugin step (pre-existing env limitation, not a code error).
- Type check: `npm run types:check` (tsc). Wayfinder-generated `@/routes` and `@/actions/*` modules are absent until a real build runs, so those `TS2307` errors are expected/pre-existing.

## Theme
- Maroon (#800000) / gold (#FFD700) brand. CSS tokens are oklch values stored in raw vars (`--border`, `--popover`, `--chart-1..5`), referenced as `var(--token)` (NOT `hsl(var(--token))`). Tailwind `@theme` maps `--color-*` to them.
- Chart palette lives in `resources/js/components/school/charts.tsx`.

## Analytics module (added)
- Backend: `app/Services/DescriptiveAnalyticsService.php` (registrar/cashier/admin aggregations), `app/Services/DelinquencyRiskService.php` (Random Forest), `app/MachineLearning/{DecisionTree,RandomForest}.php` (pure-PHP CART ensemble).
- Controller: `app/Http/Controllers/AnalyticsController.php` — `registrar()`, `cashier()`, `admin()`, `cashierRisk()`.
- Routes (routes/web.php): `/registrar/analytics`, `/cashier/analytics`, `/cashier/risk-analytics` (repointed from CashierController), `/admin/analytics`.
- Artisan: `analytics:predict-delinquency` (scheduled daily 02:00 in routes/console.php) trains the RF and persists `RiskPrediction` rows with `model_used = random-forest-v1`.
- Frontend pages: `pages/{Registrar,Cashier,Admin}/Analytics/Index.tsx` + rewritten `pages/Cashier/RiskAnalytics/Index.tsx`. Reusable charts in `components/school/charts.tsx` (Bar/Line/Pie/HorizontalBar + ChartCard + EmptyChart).
- Sidebar: `components/app-sidebar.tsx` — Analytics nav item added to Registrar/Cashier/Admin groups.

## Permissions (from RolesAndPermissionsSeeder)
- Registrar: `manage students`; Cashier: `manage billing`; Admin: `view school overview`, `view risk analytics`.
- Route middleware uses these; analytics routes are gated accordingly.

## Conventions
- Package manager: pnpm workspace, but `npm install` works (pnpm times out in this sandbox).
- PHP is NOT installed in the default sandbox; verify PHP via `php -l` only if available.
