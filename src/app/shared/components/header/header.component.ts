import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <header class="topbar">

      <!-- ==================== BRAND ==================== -->
      <div class="topbar__left">

        <a
          routerLink="/dashboard"
          class="brand"
          (click)="menuOpen.set(false)"
        >

          <div class="brand__logo">
            <span>i</span>
          </div>

          <div class="brand__text">
            <span class="brand__name">
              Orchado IdeaHub
            </span>

            <span class="brand__label">
              Innovation workspace
            </span>
          </div>

        </a>

      </div>


      <!-- ==================== DESKTOP NAV ==================== -->
      <nav
        class="desktop-nav"
        aria-label="Primary navigation"
      >

        <a
          routerLink="/dashboard"
          routerLinkActive="is-active"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          Dashboard
        </a>

        <a
          routerLink="/my-ideas"
          routerLinkActive="is-active"
        >
          My Ideas
        </a>

        <a
          routerLink="/create-idea"
          routerLinkActive="is-active"
        >
          Create Idea
        </a>

      </nav>


      <!-- ==================== RIGHT SIDE ==================== -->
      <div class="topbar__right">

        <!-- Notification -->
        <button
          type="button"
          class="icon-button"
          aria-label="Notifications"
        >

          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
            />

            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
            />
          </svg>

          <span class="notification-dot"></span>

        </button>


        <!-- Profile -->
        <div class="profile">

          <div class="profile__avatar">
            {{ getInitials(auth.profile()?.username ?? 'U') }}
          </div>

          <div class="profile__info">

            <!-- <span class="profile__name">
              {{ auth.profile()?.username ?? 'User' }}
            </span>

            <span class="profile__role">
              Team member
            </span> -->
            <button type="button" class="btn btn--ghost" (click)="logout()">Logout</button>

          </div>

          <svg
            class="profile__chevron"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>

        </div>


        <!-- Mobile menu -->
        <button
          type="button"
          class="menu-button"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="mobile-nav"
          aria-label="Toggle navigation menu"
        >

          @if (menuOpen()) {

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>

          } @else {

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>

          }

        </button>

      </div>


      <!-- ==================== MOBILE NAV ==================== -->
      <nav
        id="mobile-nav"
        class="mobile-nav"
        [class.mobile-nav--open]="menuOpen()"
        aria-label="Mobile navigation"
      >

        <div class="mobile-nav__links">

          <a
            routerLink="/dashboard"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="menuOpen.set(false)"
          >

            <span class="mobile-nav__icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                />

                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                />

                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                />

                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                />
              </svg>
            </span>

            <span>Dashboard</span>

          </a>


          <a
            routerLink="/my-ideas"
            routerLinkActive="is-active"
            (click)="menuOpen.set(false)"
          >

            <span class="mobile-nav__icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
                />
              </svg>
            </span>

            <span>My Ideas</span>

          </a>


          <a
            routerLink="/create-idea"
            routerLinkActive="is-active"
            (click)="menuOpen.set(false)"
          >

            <span class="mobile-nav__icon mobile-nav__icon--create">
              +
            </span>

            <span>Create Idea</span>

          </a>

        </div>


        <!-- Mobile user section -->
        <div class="mobile-nav__user">

          <div class="mobile-nav__profile">

            <div class="profile__avatar">
              {{ getInitials(auth.profile()?.username ?? 'U') }}
            </div>

            <div class="profile__info">

              <span class="profile__name">
                {{ auth.profile()?.username ?? 'User' }}
              </span>

              <span class="profile__role">
                Team member
              </span>

            </div>

          </div>


          <button
            type="button"
            class="logout-button"
            (click)="logout()"
          >

            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
              />
            </svg>

            <span>Logout</span>

          </button>

        </div>

      </nav>

    </header>
  `,

  styles: [`
    /* ============================================================
       HEADER
       ============================================================ */

    :host {
      --header-primary: #0f9f91;
      --header-primary-dark: #087f74;
      --header-primary-light: #e7f7f5;

      --header-text: #172b2b;
      --header-muted: #708080;

      --header-border: #e6ecec;

      display: block;
      position: relative;
      z-index: 100;
    }


    /* ============================================================
       TOPBAR
       ============================================================ */

    .topbar {
      position: sticky;
      top: 0;
      z-index: 100;

      width: 100%;
      height: 72px;

      display: flex;
      align-items: center;

      padding: 0 clamp(1rem, 4vw, 3.5rem);

      background: rgba(255, 255, 255, 0.96);

      border-bottom:
        1px solid var(--header-border);

      box-shadow:
        0 1px 3px rgba(20, 45, 45, 0.025);

      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }


    /* ============================================================
       LEFT / BRAND
       ============================================================ */

    .topbar__left {
      flex: 1;
      min-width: 0;
    }


    .brand {
      display: inline-flex;
      align-items: center;

      gap: 11px;

      color: inherit;
      text-decoration: none;
    }


    .brand__logo {
      width: 37px;
      height: 37px;

      display: grid;
      place-items: center;

      flex: 0 0 auto;

      border-radius: 10px;

      color: white;

      background:
        linear-gradient(
          135deg,
          var(--header-primary),
          var(--header-primary-dark)
        );

      box-shadow:
        0 6px 15px rgba(15, 159, 145, 0.2);
    }


    .brand__logo span {
      font-size: 20px;
      line-height: 1;

      font-weight: 800;
      font-style: italic;
    }


    .brand__text {
      display: flex;
      flex-direction: column;

      gap: 1px;
    }


    .brand__name {
      color: var(--header-text);

      font-size: 15px;
      font-weight: 750;

      line-height: 1.2;

      letter-spacing: -0.025em;
    }


    .brand__label {
      color: var(--header-muted);

      font-size: 9px;
      font-weight: 500;

      line-height: 1.2;
    }


    /* ============================================================
       DESKTOP NAV
       ============================================================ */

    .desktop-nav {
      display: flex;
      align-items: center;

      gap: 4px;

      margin-right: 28px;
    }


    .desktop-nav a {
      position: relative;

      display: inline-flex;
      align-items: center;

      min-height: 40px;

      padding: 0 13px;

      color: var(--header-muted);

      text-decoration: none;

      border-radius: 9px;

      font-size: 11px;
      font-weight: 650;

      transition:
        color 0.18s ease,
        background 0.18s ease;
    }


    .desktop-nav a::after {
      content: '';

      position: absolute;

      left: 50%;
      bottom: 2px;

      width: 0;
      height: 2px;

      border-radius: 2px;

      background: var(--header-primary);

      transform: translateX(-50%);

      transition:
        width 0.2s ease;
    }


    .desktop-nav a:hover {
      color: var(--header-text);
      background: #f7fafa;
    }


    .desktop-nav a.is-active {
      color: var(--header-primary);

      background: var(--header-primary-light);
    }


    .desktop-nav a.is-active::after {
      width: 18px;
    }


    /* ============================================================
       RIGHT SIDE
       ============================================================ */

    .topbar__right {
      display: flex;
      align-items: center;

      gap: 14px;
    }


    /* ============================================================
       NOTIFICATION
       ============================================================ */

    .icon-button {
      position: relative;

      width: 38px;
      height: 38px;

      display: grid;
      place-items: center;

      padding: 0;

      border:
        1px solid var(--header-border);

      border-radius: 10px;

      background: white;

      color: var(--header-muted);

      cursor: pointer;

      transition:
        color 0.18s ease,
        border-color 0.18s ease,
        background 0.18s ease;
    }


    .icon-button:hover {
      color: var(--header-text);

      border-color: #d6e1e1;

      background: #fafcfc;
    }


    .notification-dot {
      position: absolute;

      top: 8px;
      right: 8px;

      width: 5px;
      height: 5px;

      border:
        1.5px solid white;

      border-radius: 50%;

      background: var(--header-primary);
    }


    /* ============================================================
       PROFILE
       ============================================================ */

    .profile {
      display: flex;
      align-items: center;

      gap: 9px;

      padding-left: 3px;
    }


    .profile__avatar {
      width: 36px;
      height: 36px;

      display: grid;
      place-items: center;

      flex: 0 0 auto;

      border-radius: 50%;

      color: var(--header-primary);

      background: var(--header-primary-light);

      font-size: 11px;
      font-weight: 750;
    }


    .profile__info {
      display: flex;
      flex-direction: column;

      min-width: 0;

      gap: 1px;
    }


    .profile__name {
      max-width: 120px;

      overflow: hidden;

      color: var(--header-text);

      font-size: 11px;
      font-weight: 700;

      line-height: 1.3;

      text-overflow: ellipsis;
      white-space: nowrap;
    }


    .profile__role {
      color: var(--header-muted);

      font-size: 9px;
      font-weight: 500;

      line-height: 1.3;
    }


    .profile__chevron {
      margin-left: 1px;

      color: var(--header-muted);
    }


    /* ============================================================
       MOBILE MENU BUTTON
       ============================================================ */

    .menu-button {
      display: none;

      width: 38px;
      height: 38px;

      align-items: center;
      justify-content: center;

      padding: 0;

      border:
        1px solid var(--header-border);

      border-radius: 10px;

      color: var(--header-text);

      background: white;

      cursor: pointer;
    }


    /* ============================================================
       MOBILE NAV
       ============================================================ */

    .mobile-nav {
      display: none;
    }


    /* ============================================================
       FOCUS
       ============================================================ */

    .brand:focus-visible,
    .desktop-nav a:focus-visible,
    .icon-button:focus-visible,
    .menu-button:focus-visible,
    .mobile-nav a:focus-visible,
    .logout-button:focus-visible {
      outline:
        2px solid var(--header-primary);

      outline-offset: 3px;
    }


    /* ============================================================
       MOBILE
       ============================================================ */

    @media (max-width: 767px) {

      .topbar {
        height: 64px;

        padding:
          0 16px;
      }


      .brand__label {
        display: none;
      }


      .desktop-nav {
        display: none;
      }


      .topbar__right {
        gap: 8px;
      }


      .profile {
        display: none;
      }


      .menu-button {
        display: inline-flex;
      }


      .mobile-nav {
        position: absolute;

        top: 100%;
        left: 0;
        right: 0;

        display: none;

        padding: 8px 16px 14px;

        background: rgba(255, 255, 255, 0.98);

        border-bottom:
          1px solid var(--header-border);

        box-shadow:
          0 12px 25px rgba(20, 45, 45, 0.08);

        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }


      .mobile-nav--open {
        display: block;
      }


      /* ---------------- Navigation links ---------------- */

      .mobile-nav__links {
        display: flex;
        flex-direction: column;

        gap: 3px;
      }


      .mobile-nav__links a {
        display: flex;
        align-items: center;

        gap: 11px;

        min-height: 46px;

        padding: 0 12px;

        border-radius: 10px;

        color: var(--header-muted);

        text-decoration: none;

        font-size: 12px;
        font-weight: 650;

        transition:
          color 0.18s ease,
          background 0.18s ease;
      }


      .mobile-nav__links a:hover {
        color: var(--header-text);

        background: #f7fafa;
      }


      .mobile-nav__links a.is-active {
        color: var(--header-primary);

        background: var(--header-primary-light);
      }


      .mobile-nav__icon {
        width: 30px;
        height: 30px;

        display: grid;
        place-items: center;

        flex: 0 0 auto;

        border-radius: 8px;

        background: #f4f7f7;

        color: var(--header-muted);
      }


      .mobile-nav__links a.is-active
      .mobile-nav__icon {
        color: var(--header-primary);

        background: white;
      }


      .mobile-nav__icon--create {
        font-size: 19px;
        font-weight: 400;
      }


      /* ---------------- User ---------------- */

      .mobile-nav__user {
        display: flex;
        align-items: center;
        justify-content: space-between;

        gap: 12px;

        margin-top: 8px;
        padding-top: 12px;

        border-top:
          1px solid var(--header-border);
      }


      .mobile-nav__profile {
        display: flex;
        align-items: center;

        gap: 9px;

        min-width: 0;
      }


      .logout-button {
        display: inline-flex;
        align-items: center;

        gap: 6px;

        min-height: 34px;

        padding: 0 10px;

        border:
          1px solid #f0dddd;

        border-radius: 8px;

        color: #b94a4a;

        background: #fff8f8;

        font-size: 10px;
        font-weight: 650;

        cursor: pointer;
      }


      .logout-button:hover {
        color: #a63c3c;

        background: #fff1f1;
      }

    }


    /* ============================================================
       SMALL MOBILE
       ============================================================ */

    @media (max-width: 400px) {

      .topbar {
        padding: 0 12px;
      }


      .brand__name {
        font-size: 14px;
      }


      .brand__logo {
        width: 35px;
        height: 35px;
      }


      .icon-button,
      .menu-button {
        width: 36px;
        height: 36px;
      }

    }


    /* ============================================================
       REDUCED MOTION
       ============================================================ */

    @media (prefers-reduced-motion: reduce) {

      *,
      *::before,
      *::after {
        transition: none !important;
      }

    }
  `]
})
export class HeaderComponent {

  readonly menuOpen = signal(false);


  constructor(
    readonly auth: AuthService,
    private readonly router: Router
  ) {}


  async logout(): Promise<void> {

    await this.auth.logout();

    await this.router.navigate([
      '/login'
    ]);

  }


  getInitials(
    username: string
  ): string {

    if (!username) {
      return 'U';
    }


    const parts =
      username
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();

    }


    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  }

}