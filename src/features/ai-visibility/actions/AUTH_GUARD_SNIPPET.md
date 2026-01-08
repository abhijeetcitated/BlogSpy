# AI Visibility Server Actions Auth Guard Snippet

This directory uses Supabase server auth gating for any server action that can perform paid/privileged work.

Required top-of-function guard pattern (as per security directive):

```ts
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  return { success: false, error: "Unauthorized: Please login first." };
}
```

Notes:
- The guard must be the **first logic** inside each exported server action.
- Import `createClient` from `@/lib/supabase/server`.
