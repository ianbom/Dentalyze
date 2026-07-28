# Repository Guidelines

## Project Structure & Module Organization

This is a Laravel 13 + Inertia React app. Backend code lives in `app/`, routes in `routes/`, config in `config/`, and migrations/factories/seeders in `database/`. Frontend source lives in `resources/js/`: pages in `pages/`, shared components in `components/`, layouts in `layouts/`, hooks in `hooks/`, and typed Wayfinder output in `routes/`, `actions/`, and `wayfinder/`. Styles are in `resources/css/app.css`; the root Blade shell is `resources/views/app.blade.php`. Tests are in `tests/Feature` and `tests/Unit`.

## Build, Test, and Development Commands

- `composer setup`: install PHP/JS deps, create `.env`, generate app key, migrate, build assets.
- `composer dev`: run Laravel server, queue listener, and Vite together.
- `npm run dev`: start only the Vite frontend dev server.
- `npm run build`: build production frontend assets.
- `npm run build:ssr`: build client and SSR bundles.
- `composer test`: clear config, run Pint checks, then run Laravel/Pest tests.
- `composer ci:check`: run JS lint, Prettier check, TypeScript check, and tests.

## Coding Style & Naming Conventions

Use 4-space indentation, LF endings, final newlines, and trimmed trailing whitespace. PHP follows Laravel Pint (`laravel` preset). TypeScript/React uses Prettier with semicolons, single quotes, 80-column print width, and Tailwind class sorting. Run `composer lint` for PHP and `npm run format` plus `npm run lint` for frontend code. Name React components in PascalCase conceptually; existing filenames use kebab case such as `password-input.tsx`. Use generated Wayfinder helpers instead of hardcoded URLs.

## Testing Guidelines

Pest is the test framework. Put HTTP, auth, Inertia, and workflow coverage in `tests/Feature`; keep isolated logic tests in `tests/Unit`. Name files by behavior, for example `AuthenticationTest.php` or `ProfileUpdateTest.php`. Run `php artisan test` for tests only, or `composer test` before handoff. Add focused tests for new backend behavior and regressions.

## Commit & Pull Request Guidelines

Recent history uses short, lower-case summary commits, but messages should still be descriptive and scoped, for example `add patient report filters`. Keep commits focused. Pull requests should include a brief summary, test results (`composer test`, `npm run types:check`, relevant build command), linked issues when applicable, and screenshots or screen recordings for UI changes.

## Security & Configuration Tips

Do not commit `.env`, secrets, generated keys, or local storage files. Use `.env.example` for required configuration. For auth, 2FA, profile, or password flows, prefer Laravel Fortify conventions and cover changes with feature tests.
