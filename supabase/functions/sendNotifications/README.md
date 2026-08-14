Supabase Edge Function: sendNotifications

This function fetches `device_tokens` from your Supabase DB and sends FCM messages via the FCM HTTP v1 API using a service account.

Environment variables required (set in Supabase Functions Secrets):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY (encode newlines as `\n`)

Deploy with supabase CLI:
1. Install Supabase CLI: https://supabase.com/docs/guides/cli
2. Authenticate and select project: `supabase login` and `supabase link --project-ref <your-ref>`
3. From repo root run:
   ```bash
   supabase functions deploy sendNotifications --no-verify
   ```
4. Set secrets:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
     FIREBASE_PROJECT_ID="..." FIREBASE_CLIENT_EMAIL="..." FIREBASE_PRIVATE_KEY="$FIREBASE_PRIVATE_KEY"
   ```

Invoke example (from frontend): POST JSON to the deployed function URL with `{ ideaId, excludeUserId, title, body, url }`.
