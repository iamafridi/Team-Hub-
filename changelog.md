# Changelog

## [Unreleased]

### Fixed
- Rate limiting increased from 100 to 300 req/15min to prevent 429 errors on dashboard load
- Dashboard stat cards now use `bg-surface` instead of `bg-white` for dark mode support
- Profile dropdown in sidebar now uses `bg-surface` instead of `bg-white` for dark mode support
- Avatar in profile button now uses `bg-accent text-white` for consistent visibility in both themes

### Added
- Data visibility middleware for role-based query filtering
  - ADMIN/MODERATOR: sees all items in workspace
  - MEMBER: sees only own items
  - Dev mode bypasses filters
- Applied visibility filter to goals, actions, and announcements GET routes

### Changed
- Updated .gitignore to track plan.md and changelog.md
