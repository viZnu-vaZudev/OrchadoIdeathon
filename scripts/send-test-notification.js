#!/usr/bin/env node
// Usage: node scripts/send-test-notification.js <registration_token> '<title>' '<body>' '<url>'

const admin = require('firebase-admin');
const fs = require('fs');

if (process.argv.length < 3) {
  console.error('Usage: node scripts/send-test-notification.js <registration_token> [title] [body] [url]');
  process.exit(1);
}

const token = process.argv[2];
const title = process.argv[3] || 'Test Notification';
const body = process.argv[4] || 'This is a test push message.';
const url = process.argv[5] || '/';

// Prefer service account via environment variables for CI/servers. If not set,
// fall back to a local JSON file at scripts/firebase-service-account.json (local testing only).
const svcPath = 'scripts/firebase-service-account.json';
let serviceAccount = null;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  console.log('Using Firebase service account from environment variables');
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || undefined,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID || undefined,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_URL || undefined
  };
} else if (fs.existsSync(svcPath)) {
  console.warn('Using local service account JSON. Do NOT commit this file to git.');
  serviceAccount = require('../' + svcPath);
} else {
  console.error('No Firebase service account available. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment, or place a local JSON at scripts/firebase-service-account.json for testing.');
  process.exit(2);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const message = {
  token,
  notification: {
    title,
    body
  },
  data: { url }
};

admin
  .messaging()
  .send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.error('Error sending message:', error);
  });
