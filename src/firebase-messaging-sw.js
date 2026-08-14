importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId. Replace the following with your app's config when ready.
firebase.initializeApp({
  apiKey: 'AIzaSyBfZ_6CfvjxvejqsCG1Ql6y7ZZQyVGNzMI',
  authDomain: 'ideathonnotification.firebaseapp.com',
  projectId: 'ideathonnotification',
  storageBucket: 'ideathonnotification.appspot.com',
  messagingSenderId: '787367206809',
  appId: '1:787367206809:web:9f2d05fa4ff6b1fbc97d08'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = (payload.notification && payload.notification.title) || 'Background Message';
  const notificationOptions = {
    body: (payload.notification && payload.notification.body) || '',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url;
  if (url) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});
