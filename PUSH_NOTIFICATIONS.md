# Push Notifications (FCM) Setup

- Add your Firebase web app credentials to `src/environments/environment.ts` and `src/environments/environment.prod.ts` by replacing values in `firebaseConfig`.
- Add your VAPID key to `vapidKey` in the same files.

Generating a VAPID key:

1. Use the Firebase Console > Project Settings > Cloud Messaging > Web Push certificates to generate a VAPID key pair. Copy the public key into `vapidKey`.

Service worker:

- The repository includes `src/firebase-messaging-sw.js`. Build the app and this file will be copied to the `dist/` root (configured in `angular.json`).
- The service worker must be registered in the client. Place the registration call in a startup area (for example, `main.ts` or a top-level component):

```ts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(reg => console.log('SW registered', reg))
    .catch(err => console.error('SW register failed', err));
}
```

Foreground vs background:

- Foreground: `NotificationService` listens for messages via `onMessage()` and displays a simple in-app toast. Clicking the toast navigates to the `data.url` if present.
- Background: The service worker handles `onBackgroundMessage` and displays a system notification. Clicking that notification will open/focus the URL in `notification.data.url`.

Testing notifications:

- Get a device token by clicking "Enable Notifications" in the app UI. Copy the token.
- Use the `scripts/send-test-notification.js` script to send a message from a server environment. Place your Firebase service account JSON at `scripts/firebase-service-account.json` and run:

```bash
node scripts/send-test-notification.js <TOKEN> "Title" "Body" "/some/path"
```

Token persistence and backend flow:

- Typically you would POST the token to your backend tied to an authenticated user record. Store it in a table keyed by `userId` and `token`.
- When you want to push a notification to a user, look up tokens for that user and call Firebase Admin `messaging().send()` or `sendMulticast()`.
- Rotate tokens: handle `messaging` responses that indicate invalid tokens and remove them from your DB.

Notes & caveats:

- Replace placeholder Firebase config and VAPID keys before production use.
- Ensure your site is served over HTTPS (except `localhost`) for service workers and push to work.
