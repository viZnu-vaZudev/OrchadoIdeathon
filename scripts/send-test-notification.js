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

// Expect a service account JSON at scripts/firebase-service-account.json
const svcPath = 'scripts/firebase-service-account.json';
if (!fs.existsSync(svcPath)) {
  console.error('Service account JSON not found at scripts/firebase-service-account.json');
  console.error('Place your Firebase service account JSON at that path before running.');
  process.exit(2);
}

const serviceAccount = require('../' + svcPath);

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
