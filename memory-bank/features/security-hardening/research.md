# Security Research: Authentication & Best Practices (2026)

**Date:** February 10, 2026
**Scope:** Next.js 16, Supabase SSR, React 19, Server Actions
**Status:** Synthesized

## Executive Summary
Research confirms that the most critical security imperative for our stack is avoiding `getSession()` in server contexts in favor of `getUser()`. Next.js 16 requires `@supabase/ssr` for correct cookie handling, specifically utilizing Middleware for token refreshes. React 19's Taint API offers a new mechanism to prevent data leakage.

## 1. Supabase SSR & Authentication Flows

### The `getSession` vs `getUser` Critical Vulnerability
- **Vulnerability:** `supabase.auth.getSession()` reads the JWT (access token) from the cookie and verifies its signature locally. It **does not** contact the Supabase Auth server.
- **Risk:** If a user is banned, deleted, or the session is revoked (e.g., rigid logout), `getSession()` will still return a valid session until the JWT expires.
- **Remediation:** Always use **`supabase.auth.getUser()`** in server-side code (Server Components, Server Actions, Middleware). This method sends the token to Supabase Auth, validating it against the active session table.

### Cookie Management in Next.js 16
- **Server Components:** Read-only access to cookies. They cannot set new tokens.
- **Middleware:** The critical bridge. Middleware must call `supabase.auth.getUser()` (or `updatesSession`) to ensure the session is active and, crucially, to **refresh the auth token** and set the new `Set-Cookie` header on the response if needed.
- **Pattern:**
  - **Browser Client:** `createBrowserClient` (Client Components)
  - **Server Client:** `createServerClient` (Server Actions, Route Handlers, Middleware)

## 2. Server Actions Security

### "Public Endpoint" Mental Model
Server Actions are effectively public POST endpoints accessible via ID. They are not private internal functions.

### Security Checklist
1.  **Authentication Guard:** First line of every action:
    ```typescript
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Unauthorized");
    ```
2.  **Input Validation (Zod):** Trust no arguments.
    ```typescript
    const parsed = schema.safeParse(rawInput);
    if (!parsed.success) throw new Error("Invalid input");
    ```
3.  **Authorization:** Check Row Level Security (RLS) or explicit role checks after auth. Do not assume if a user is logged in they own the resource.

## 3. React 19 Security Features

### Server-Only Data Tainting
React 19 introduces the Taint API to prevent sensitive data payload leaks to the client info.

- **`experimental_taintUniqueValue`**: Prevent a specific string (like an API secret) from being passed to the client.
- **`experimental_taintObjectReference`**: Prevent an entire object instance (like a full UserDB model with hashed password fields) from being passed.

**Best Practice:**
In the data access layer (DAL), taint sensitive objects immediately after retrieval.

```typescript
import { experimental_taintObjectReference } from 'react';

export async function getUser(id: string) {
  const user = await db.user.findUnique({ id });
  if (user) {
    experimental_taintObjectReference(
      "Do not pass the full user object to the client",
      user
    );
  }
  return user;
}
```

## 4. References
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Security](https://nextjs.org/blog/security-nextjs-server-components-actions)
- [React Taint API Docs](https://react.dev/reference/react/experimental_taintObjectReference)
