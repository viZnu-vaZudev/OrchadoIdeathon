import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';
import { firebaseConfig } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private router: Router) {
    try {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

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
}