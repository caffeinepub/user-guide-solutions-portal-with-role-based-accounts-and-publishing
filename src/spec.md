# Specification

## Summary
**Goal:** Ensure a default Admin account exists with username "Rushikesh" and password "123", and allow signing in via the existing username/password login flow.

**Planned changes:**
- Seed/set a default Admin user in the backend with username "Rushikesh" and password "123", storing a secure (non-plaintext) password representation.
- Implement a safe, non-destructive policy on upgrade so existing admin credentials are not overwritten (only seed when no admin user exists).
- Update/verify the frontend login flow to support signing in with the seeded username/password credentials (not Internet Identity) and keep all login UI text in English.

**User-visible outcome:** On a fresh deployment, an administrator can sign in using username "Rushikesh" and password "123" through the username/password login path, and Admin access is granted after login.
