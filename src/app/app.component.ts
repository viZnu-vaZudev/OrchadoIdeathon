import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { NotificationDemoComponent } from './notification-demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NotificationDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.isAuthenticated()) {
      <app-header />
    }
    <main class="app-shell" [class.app-shell--bare]="!auth.isAuthenticated()">
      <router-outlet />
    </main>
    <notification-demo />
  `
})
export class AppComponent implements OnInit {
  constructor(readonly auth: AuthService) {}

  ngOnInit(): void {
    void this.auth.init();
  }
}
