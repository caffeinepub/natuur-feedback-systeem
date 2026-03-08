# Natuur-Feedback Systeem

## Current State

The app has a full-stack feedback platform with:
- A teacher portal (public, no login needed)
- An admin dashboard behind Internet Identity (II) authentication
- The MixinAuthorization component uses Principal IDs to identify admins
- The first user to call `_initializeAccessControlWithSecret` with the correct token becomes admin
- Users are finding it impossible to get admin access because they cannot locate their Principal ID

## Requested Changes (Diff)

### Add
- A backend function `adminLogin(username: Text, password: Text) : async Bool` that validates hardcoded credentials and returns a session token (stored in stable var)
- A backend function `isSessionValid(token: Text) : async Bool` to verify session tokens
- A backend function `adminLogout(token: Text) : async ()` to invalidate sessions
- Frontend: simple username + password login form on /admin/login (no Internet Identity)
- Frontend: session token stored in localStorage, passed to admin API calls
- Frontend: a `useAdminSession` hook to manage the token-based session

### Modify
- `/admin/login` page: replace Internet Identity login UI with a username/password form
- Admin dashboard: use session token instead of Internet Identity identity for auth checks
- All admin backend calls: accept session token as auth parameter OR use a separate admin-gated path

### Remove
- Internet Identity dependency from the admin login flow
- The "first user becomes admin" message from the login page

## Implementation Plan

1. Add `adminLogin`, `isSessionValid`, `adminLogout` functions to `main.mo` using a hardcoded username ("admin") and a hardcoded password hash checked at runtime. Store active session tokens in a Map with expiry timestamps.
2. Add a `setAdminPassword(currentPassword: Text, newPassword: Text)` function so the admin can change the password from the dashboard later.
3. Update `AdminLogin.tsx`: replace II login button with a username + password form. On submit, call `adminLogin`, store the returned session token in localStorage.
4. Update `AdminDashboard.tsx`: on mount, read token from localStorage and call `isSessionValid`. If invalid, redirect to login. Replace all `useIsCallerAdmin` checks with token-based check.
5. Update `useQueries.ts`: add `useAdminLogin`, `useAdminLogout`, `useIsSessionValid` hooks.
6. The teacher portal stays completely unchanged (no login needed).
