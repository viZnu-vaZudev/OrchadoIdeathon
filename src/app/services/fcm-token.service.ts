import { inject, Injectable, signal } from '@angular/core';
import { getMessaging, getToken } from 'firebase/messaging';
import { getApp } from 'firebase/app';
import { vapidKey } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FcmTokenService {
  token = signal<string | null>(null);

  private attempts = 0;

  async requestPermissionAndToken(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('Notification permission denied');
        return null;
      }

      return await this.retrieveTokenWithRetries();
    } catch (err) {
      console.error('Error requesting notification permission', err);
      return null;
    }
  }

  private async retrieveTokenWithRetries(): Promise<string | null> {
    try {
      const messaging = getMessaging(getApp());
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        this.token.set(currentToken);
        console.log('FCM token obtained',currentToken);
        return currentToken;
      }
      console.error('No token returned from getToken');
      return null;
    } catch (err) {
      console.error('Error getting FCM token:', err);
      return null;
    }
  }
}
