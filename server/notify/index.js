const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(bodyParser.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.warn('Supabase env vars not set. Server requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

function initFirebaseAdmin() {
  if (admin.apps && admin.apps.length) return admin.app();
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('Firebase admin env vars missing');
  }
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL
  };
  return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

app.post('/send', async (req, res) => {
  try {
    const { ideaId, excludeUserId, title, body, url } = req.body || {};
    if (!ideaId) return res.status(400).json({ error: 'ideaId required' });

    const { data: tokens, error } = await supabase
      .from('device_tokens')
      .select('token, user_id')
      .neq('user_id', excludeUserId)
      .eq('is_active', true);

    if (error) throw error;
    if (!tokens || tokens.length === 0) return res.status(200).json({ sent: 0 });

    initFirebaseAdmin();
    const messaging = admin.messaging();

    const message = {
      notification: { title: title || 'New idea', body: body || 'A new idea was posted' },
      data: { url: url || `/ideas/${ideaId}` }
    };

    const registrationTokens = tokens.map((t) => t.token).filter(Boolean);

    const response = await messaging.sendMulticast({ ...message, tokens: registrationTokens });

    const invalidTokens = [];
    response.responses.forEach((r, idx) => {
      if (!r.success) invalidTokens.push(registrationTokens[idx]);
    });
    if (invalidTokens.length) {
      await supabase.from('device_tokens').update({ is_active: false }).in('token', invalidTokens);
    }

    res.json({ successCount: response.successCount, failureCount: response.failureCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Notify server running on port ${PORT}`));
