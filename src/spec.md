# Specification

## Summary
**Goal:** Eliminate the runtime error `useAuth must be used within AuthProvider` by ensuring all `useAuth()` callers (including `RootComponent` in `frontend/src/App.tsx`) render under an `AuthProvider`, without changing immutable files like `frontend/src/main.tsx`.

**Planned changes:**
- Update `frontend/src/App.tsx` composition so the router/root component tree that calls `useAuth()` is wrapped by `AuthProvider` at runtime.
- Preserve existing authentication-gated routing behavior (unauthenticated users see the Login page; authenticated users see the AppLayout).
- Avoid modifications to immutable files (including `frontend/src/main.tsx` and `frontend/src/components/ui/*`).

**User-visible outcome:** The app launches without the `useAuth must be used within AuthProvider` error, and login-gated navigation continues to behave the same.
