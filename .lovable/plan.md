## Migrating to a New Supabase Project

Yes, we can shift the whole project to a new Supabase database. Here's how it works and what's needed.

### What needs to move

Current Supabase project ref: `difcubncnwkibisjmqtr`

The project depends on Supabase for:
1. **Auth** — email/password signup & login (`src/hooks/useAuth.tsx`)
2. **Database tables** — `profiles`, `calorie_history`, `meal_plans` (with RLS, triggers, and a `handle_new_user` function that auto-creates a profile row)
3. **Edge Function** — `generate-meal-plan` (calls Gemini, writes to `meal_plans`)
4. **Edge Function secret** — `GEMINI_API_KEY`

### How the switch happens

Lovable connects to one Supabase project at a time per Lovable project. To move:

1. **You disconnect the current Supabase project** from this Lovable project (Project Settings → Supabase → Disconnect).
2. **You connect the new Supabase project** (same settings panel). Lovable will then:
   - Auto-update `.env` with the new `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - Auto-update `src/integrations/supabase/client.ts` and `supabase/config.toml`
   - Regenerate `src/integrations/supabase/types.ts` once tables exist
3. **I re-run the schema migration** on the new project to recreate:
   - `profiles`, `calorie_history`, `meal_plans` tables
   - RLS policies, GRANTs
   - `update_updated_at_column` trigger function
   - `handle_new_user` trigger on `auth.users`
   - The `meal_plans.meal_type` regex check constraint
4. **I redeploy** the `generate-meal-plan` edge function automatically (just by leaving the file in place; deploy is automatic).
5. **You re-add the `GEMINI_API_KEY` secret** in the new project (Edge Function secrets don't transfer across projects). I'll prompt for it via `add_secret`.

### What does NOT carry over

- Existing user accounts in `auth.users` (everyone signs up again on the new project), unless you manually export/import users from the old project via the Supabase dashboard.
- Existing rows in `profiles`, `calorie_history`, `meal_plans` (manual SQL export/import from old → new if you want them).
- Storage buckets (none in use here, so nothing to move).

If preserving existing users/data matters, that's a separate manual export/import step in the Supabase dashboard — Lovable can't do it across two projects.

### Order of operations on the next turn

After you confirm and connect the new Supabase project:
1. Run schema migration (tables + RLS + grants + triggers + constraint)
2. Add `GEMINI_API_KEY` secret
3. Verify edge function is deployed and history flow works

### Question before I proceed

Do you want to **preserve existing user accounts and meal-plan history**, or is a **fresh start on the new database** fine? That determines whether we need to plan an export/import step.
