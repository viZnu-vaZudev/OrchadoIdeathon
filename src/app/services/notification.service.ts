import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private router: Router) {
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      console.log('NotificationService init');
      const supported = await isSupported();
      console.log('isSupported:', supported);
      if (!supported) {
        console.warn('Firebase Messaging is not supported in this browser.');
        return;
      }

      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const messaging = getMessaging(app);
      console.log('Messaging instance created', messaging);

      // Ensure we request a token once (so the client is registered with FCM)
      this.registerForPushNotifications(messaging).catch((err) => console.error('Error registering for push notifications', err));

      onMessage(messaging, (payload) => {
        console.log('Foreground message received: ', payload);
        this.showToast(payload);
      });
    } catch (err) {
      console.error('NotificationService init error', err);
    }
  }
  private showToast(payload: any) {
    const title = payload?.notification?.title || 'Notification';
    const body = payload?.notification?.body || '';
    const url = payload?.data?.url;

    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.right = '16px';
    el.style.bottom = '16px';
    el.style.background = 'rgba(33,33,33,0.95)';
    el.style.color = '#fff';
    el.style.padding = '12px 16px';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    el.style.cursor = url ? 'pointer' : 'default';
    el.style.zIndex = '99999';
    el.innerText = `${title}\n${body}`;

    const timeout = setTimeout(() => {
      el.remove();
    }, 6000);

    el.addEventListener('click', () => {
      clearTimeout(timeout);
      el.remove();
      if (url) {
        void this.router.navigateByUrl(url).catch((e) => console.error(e));
      }
    });

    document.body.appendChild(el);
  }

  /**
   * Helper to trigger a local in-app toast (useful for testing).
   */
  notifyLocal(payload: { notification?: { title?: string; body?: string }; data?: any }): void {
    try {
      this.showToast(payload);
      this.showBrowserNotification(payload);
    } catch (e) {
      console.error('notifyLocal error', e);
    }
  }

   /**
   * Request browser notification permission
   * and get the FCM token.
   */
  private async registerForPushNotifications(messaging : any): Promise<void> {
    if (!messaging) {
      return;
    }

    // Ask browser permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('Notification permission was not granted.');
      return;
    }

    try {
      const token = await getToken(messaging, {
        vapidKey: vapidKey
      });

      if (!token) {
        console.warn('No FCM token was generated.');
        return;
      }

      console.log('FCM Token:', token);

      // TODO:
      // Save this token to Supabase against the logged-in user.
      //
      // Example:
      //
      // await this.saveTokenToSupabase(token);

    } catch (error) {
      console.error('Failed to get FCM token:', error);
    }
  }

  private showBrowserNotification(payload: any): void {
    debugger;
  const title =
    payload?.notification?.title || 'Notification';

  const body =
    payload?.notification?.body || '';

  const url =
    payload?.data?.url || '/';

  if (Notification.permission !== 'granted') {
    console.warn('Browser notification permission not granted');
    return;
  }

  const notification =   new Notification('Order Placed Successfully 🎉', {
      body: 'Your order #ORD-1001 has been placed successfully.',
      icon: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
    });

  notification.onclick = () => {
    window.focus();

    notification.close();

    if (url) {
      void this.router
        .navigateByUrl(url)
        .catch(error =>
          console.error('Navigation error:', error)
        );
    }
  };
}
}