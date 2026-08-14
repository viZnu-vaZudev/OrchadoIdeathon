// // Supabase Edge Function (Deno) - sendNotifications
// // Deploy with `supabase functions deploy sendNotifications`.

// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.27.0?target=deno';
// import { importPKCS8, SignJWT } from 'https://esm.sh/jose@4.14.4?target=deno';

// const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
// const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID')!;
// const FIREBASE_CLIENT_EMAIL = Deno.env.get('FIREBASE_CLIENT_EMAIL')!;
// const FIREBASE_PRIVATE_KEY = Deno.env.get('FIREBASE_PRIVATE_KEY')!; // literal newlines encoded as \n

// if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
//   console.warn('Supabase env vars not set');
// }

// const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// async function getAccessToken() {
//   // Create a signed JWT to exchange for an access token
//   const key = await importPKCS8(FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), 'RS256');
//   const now = Math.floor(Date.now() / 1000);
//   const jwt = await new SignJWT({ scope: 'https://www.googleapis.com/auth/firebase.messaging' })
//     .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
//     .setIssuedAt(now)
//     .setIssuer(FIREBASE_CLIENT_EMAIL)
//     .setSubject(FIREBASE_CLIENT_EMAIL)
//     .setAudience('https://oauth2.googleapis.com/token')
//     .setExpirationTime(now + 3600)
//     .sign(key as CryptoKey);

//   const body = new URLSearchParams();
//   body.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
//   body.set('assertion', jwt);

//   const res = await fetch('https://oauth2.googleapis.com/token', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//     body: body.toString()
//   });
//   if (!res.ok) throw new Error('Failed to obtain access token: ' + (await res.text()));
//   const json = await res.json();
//   return json.access_token as string;
// }

// export default async function handler(req: Request): Promise<Response> {
//   try {
//     if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
//     const body = await req.json();
//     const { ideaId, excludeUserId, title, body: text, url } = body;
//     if (!ideaId) return new Response(JSON.stringify({ error: 'ideaId required' }), { status: 400 });

//     // fetch tokens
//     const { data: tokens, error } = await supabase
//       .from('device_tokens')
//       .select('token, user_id')
//       .neq('user_id', excludeUserId)
//       .eq('is_active', true);

//     if (error) throw error;
//     if (!tokens || tokens.length === 0) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

//     const accessToken = await getAccessToken();

//     // send to each token (FCM HTTP v1: one message per request)
//     let successCount = 0;
//     let failureCount = 0;
//     const invalidTokens: string[] = [];

//     for (const t of tokens) {
//       try {
//         const message = {
//           message: {
//             token: t.token,
//             notification: { title: title || 'New idea', body: text || 'A new idea was posted' },
//             data: { url: url || `/ideas/${ideaId}` }
//           }
//         };
//         const res = await fetch(`https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`, {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(message)
//         });
//         if (res.ok) successCount++; else {
//           failureCount++;
//           const textRes = await res.text();
//           if (textRes.includes('NotRegistered') || textRes.includes('InvalidRegistration')) {
//             invalidTokens.push(t.token);
//           }
//         }
//       } catch (e) {
//         console.error('send error', e);
//         failureCount++;
//       }
//     }

//     if (invalidTokens.length) {
//       await supabase.from('device_tokens').update({ is_active: false }).in('token', invalidTokens);
//     }

//     return new Response(JSON.stringify({ successCount, failureCount }), { status: 200 });
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
//   }
// }
