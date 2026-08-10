# IdeaHub

A private discussion and idea-sharing app for a small team, built with Angular (standalone components, signals) and Supabase.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Add your Supabase credentials in `src/environments/environment.ts` and `environment.prod.ts`:
   ```ts
   export const environment = {
     production: false,
     supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
     supabaseAnonKey: 'YOUR_ANON_KEY'
   };
   ```
   Use the **anon/public** key only (Project Settings → API in Supabase). Never put the service role key here.
3. Run the app:
   ```
   npm start
   ```
   Then open http://localhost:4200.

## Supabase assumptions

The app assumes the existing schema you described:

- `profiles(id, username, email, created_at)`
- `ideas(id, title, description, created_by, created_at, updated_at)`
- `comments(id, idea_id, user_id, comment, created_at)`
- Foreign keys: `ideas.created_by → profiles.id`, `comments.idea_id → ideas.id`, `comments.user_id → profiles.id`
- RLS policies already in place so that: anyone on the team can read all ideas/comments/profiles, users can only insert ideas/comments as themselves, and users can only update/delete their own ideas and comments.

The app queries ideas and comments with embedded resource selects (e.g. `ideas.select('*, author:profiles(...), comments(count)')`), which relies on Postgres foreign keys existing between these tables (as described above) so PostgREST can resolve the join. If Supabase reports it can't find a relationship, the foreign keys may need to be (re)declared — that would be a schema question to confirm with you before changing anything.

## Structure

Standard Angular standalone-component layout: `core/` for guards, services, and models; `shared/` for reusable components and pipes; `features/` for routed pages (auth, dashboard, ideas). Routes are lazy-loaded and guarded by `authGuard`, which waits for `AuthService.init()` (session restore) before deciding.

## What's not included

This build was generated without a live Node/npm environment, so `npm install` and a production build have not been run against it yet. Run `npm install` and `npm start` locally to verify; if the Angular CLI version pinned in `package.json` needs adjusting to match your global CLI, update the `^18.2.0` versions accordingly.
