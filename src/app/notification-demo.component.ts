import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FcmTokenService } from './services/fcm-token.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'notification-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position: fixed; left: 16px; bottom: 16px; z-index: 99998">
      <button (click)="enable()">Enable Notifications</button>
      <div *ngIf="token">
        <small>Token (copy to server):</small>
        <div style="max-width: 360px; word-break: break-all; background:#f3f3f3; padding:8px; border-radius:4px">{{ token }}</div>
      </div>
    </div>
  `
})
export class NotificationDemoComponent {
  token: string | null = null;

  constructor(private fcm: FcmTokenService, private ns: NotificationService) {
    // subscribe to signal - using simple polling via setInterval is ok here
    // but we can read synchronously
    this.token = this.fcm.token();
    // keep in sync
    setInterval(() => (this.token = this.fcm.token()), 500);
  }

  async enable() {
    const t = await this.fcm.requestPermissionAndToken();
    if (t) {
      this.token = t;
    }
  }
}
