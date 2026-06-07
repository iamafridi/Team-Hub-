# FredoCloud Development Plan

## Current Issues & Fixes

### 1. Rate Limiting (429 Errors)
- **Problem**: Backend rate limiter at 100 req/15min is too low. Dashboard page fires 6-8 parallel API calls on load, hitting the limit.
- **Fix**: Increase general limiter to 300 req/15min.

### 2. Data Visibility & Scoping
- **Problem**: All workspace members see all items regardless of role.
- **Fix**: Create visibility middleware that filters queries based on role:
  - ADMIN/MODERATOR: see all items in workspace
  - MEMBER: see only own items (ownerId/assigneeId)
  - Dev mode (ALLOW_DEV_AUTH): see all items

### 3. Dark Mode Issues
#### 3a. Dashboard Stat Cards
- **Problem**: Cards use hardcoded `bg-white` which doesn't adapt to dark mode
- **Fix**: Replace `bg-white` with `bg-surface`

#### 3b. Profile Dropdown in Sidebar
- **Problem**: Profile button and dropdown menu use hardcoded `bg-white`
- **Fix**: Replace `bg-white` with `bg-surface`; use `bg-accent text-white` for avatar

### 4. Demo vs Real User Data
- **Fix**: Visibility middleware handles this — dev mode bypasses filters, real users get role-based scoping

## Database Schema (Existing)
- User, Workspace, WorkspaceMember (with Role: ADMIN/MODERATOR/MEMBER)
- Goals, Actions, Announcements all scoped to workspace + owner

## Completed Tasks
- Clerk auth migration (frontend + backend)
- RBAC middleware and permissions system
- Auth tests rewritten for Clerk
- Stale JWT artifacts cleaned up
- /login redirect added
