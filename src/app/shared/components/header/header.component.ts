import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header">
      <div class="header__bar">
        <a routerLink="/dashboard" class="header__brand">IdeaHub</a>

        <button
          type="button"
          class="header__toggle"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="primary-nav"
          aria-label="Toggle navigation menu"
        >
          <span class="header__toggle-icon" aria-hidden="true">☰</span>
        </button>

        <nav id="primary-nav" class="header__nav" [class.header__nav--open]="menuOpen()">
          <a routerLink="/dashboard" routerLinkActive="is-active" (click)="menuOpen.set(false)">Dashboard</a>
          <a routerLink="/my-ideas" routerLinkActive="is-active" (click)="menuOpen.set(false)">My Ideas</a>
          <a routerLink="/create-idea" routerLinkActive="is-active" (click)="menuOpen.set(false)">Create Idea</a>

          <div class="header__user">
            <span class="header__username">{{ auth.profile()?.username ?? 'You' }}</span>
            <button type="button" class="btn btn--ghost" (click)="logout()">Logout</button>
          </div>
        </nav>
      </div>
    </header>
  `,
  styles: [
    `
      .header {
        border-bottom: 1px solid var(--color-border);
        background: var(--color-surface);
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .header__bar {
        max-width: 1120px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.85rem 1.25rem;
        gap: 1rem;
      }
      .header__brand {
        font-weight: 700;
        font-size: 1.05rem;
        color: var(--color-text);
        text-decoration: none;
        letter-spacing: -0.01em;
      }
      .header__toggle {
        display: none;
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        width: 2.25rem;
        height: 2.25rem;
        font-size: 1.1rem;
        color: var(--color-text);
        cursor: pointer;
      }
      .header__nav {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }
      .header__nav a {
        color: var(--color-text-muted);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        padding: 0.35rem 0;
        border-bottom: 2px solid transparent;
      }
      .header__nav a:hover,
      .header__nav a.is-active {
        color: var(--color-text);
        border-bottom-color: var(--color-accent);
      }
      .header__user {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-left: 0.5rem;
        padding-left: 1rem;
        border-left: 1px solid var(--color-border);
      }
      .header__username {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text);
      }

      @media (max-width: 767px) {
        .header__toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .header__nav {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          flex-direction: column;
          align-items: stretch;
          gap: 0;
          padding: 0.5rem 1.25rem 1rem;
          display: none;
        }
        .header__nav--open {
          display: flex;
        }
        .header__nav a {
          padding: 0.65rem 0;
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .header__user {
          border-left: none;
          border-top: 1px solid var(--color-border);
          margin-left: 0;
          padding-left: 0;
          padding-top: 0.75rem;
          margin-top: 0.5rem;
          justify-content: space-between;
        }
      }
    `
  ]
})
export class HeaderComponent {
  readonly menuOpen = signal(false);

  constructor(readonly auth: AuthService, private readonly router: Router) {}

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
