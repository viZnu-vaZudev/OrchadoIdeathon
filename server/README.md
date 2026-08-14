Notify server deployment instructions

This small Express server sends FCM messages using `firebase-admin` and queries `device_tokens` in Supabase.

Required environment variables (set on your host/Render/Vercel):
- SUPABASE_URL (your Supabase project URL)
- SUPABASE_SERVICE_ROLE_KEY (Supabase service role key)
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY (replace newlines with literal `\n` when setting in env)
- PORT (optional)

Deploy on Render (example):
1. Create a new Web Service on Render.
2. Connect your GitHub repo and select `server/notify` as the root.
3. Set environment variables in the Render dashboard.
4. Set `Start Command` to `npm start`.

Deploy on Vercel (example):
1. Create a new Vercel project from this repo.
2. Configure the project to use the `server/notify` folder as the root for a Serverless Function or API.
3. Set environment variables in Vercel's dashboard.

Wiring frontend:
- After deploying, set `edgeFunctionUrl` in `src/environments/environment.ts` to the deployed `/send` endpoint and rebuild the Angular app.
- Alternatively, set `SUPABASE_EDGE_FUNCTION_URL` at runtime if you provide a runtime config.

Security:
- Do NOT commit service account keys. Use environment variables or secret managers.
- Revoke any leaked keys.
