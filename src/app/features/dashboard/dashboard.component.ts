import { ChangeDetectionStrategy, Component, OnInit, signal,computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IdeaService } from '../../core/services/idea.service';
import { IdeaWithAuthor } from '../../core/models/idea.model';
import { IdeaCardComponent } from '../../shared/components/idea-card/idea-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    IdeaCardComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    DatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">

      <!-- ==================== MAIN ==================== -->
      <main class="main">

        <!-- ==================== WELCOME ==================== -->
        <section class="welcome">
          <div class="welcome__content">
            <span class="welcome__eyebrow">
              YOUR WORKSPACE
            </span>

            <h1 class="welcome__title">
              {{ greeting }},
              <span>{{ auth.profile()?.username ?? 'there' }}</span>
            </h1>

            <p class="welcome__description">
              Share your ideas, discover what your team is building,
              and help turn great concepts into reality.
            </p>
          </div>

          <a
            routerLink="/create-idea"
            class="create-button"
          >
            <span class="create-button__icon">+</span>
            <span>Create Idea</span>
          </a>
        </section>


        <!-- ==================== STATS ==================== -->
        @if (!loading() && !errorMessage()) {
          <section class="stats">

            <div class="stat-card">
              <div class="stat-card__top">
                <div class="stat-card__icon stat-card__icon--blue">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                  </svg>
                </div>

                <span class="stat-card__trend">Ideas</span>
              </div>

              <div class="stat-card__value">
                {{ latestIdeas().length + myIdeas().length }}
              </div>

              <div class="stat-card__label">
                Total ideas
              </div>
            </div>


            <div class="stat-card">
              <div class="stat-card__top">
                <div class="stat-card__icon stat-card__icon--purple">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                <span class="stat-card__trend">Yours</span>
              </div>

              <div class="stat-card__value">
                {{ myIdeas().length }}
              </div>

              <div class="stat-card__label">
                My ideas
              </div>
            </div>


            <div class="stat-card">
              <div class="stat-card__top">
                <div class="stat-card__icon stat-card__icon--green">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>

                <span class="stat-card__trend">Team</span>
              </div>

              <div class="stat-card__value">
                {{ otherIdeas().length }}
              </div>

              <div class="stat-card__label">
                Team ideas
              </div>
            </div>


            <div class="stat-card">
              <div class="stat-card__top">
                <div class="stat-card__icon stat-card__icon--orange">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="m12 2 3.09 6.26L22 9.27l-5 4.87
                      1.18 6.88L12 17.77l-6.18 3.25L7
                      14.14 2 9.27l6.91-1.01L12 2Z"
                    />
                  </svg>
                </div>

                <span class="stat-card__trend">Rating</span>
              </div>

              <div class="stat-card__value">
                <span>—</span>
              </div>

              <div class="stat-card__label">
                Average rating
              </div>
            </div>

          </section>
        }


        <!-- ==================== LOADING ==================== -->
        @if (loading()) {

          <section class="content-section">
            <div class="section-heading">
              <div>
                <div class="skeleton skeleton--small"></div>
                <div class="skeleton skeleton--heading"></div>
              </div>
            </div>

            <div class="idea-grid">
              @for (i of [1, 2, 3]; track i) {
                <div class="idea-skeleton">
                  <div class="idea-skeleton__top">
                    <div class="skeleton skeleton--avatar"></div>
                    <div class="skeleton skeleton--tiny"></div>
                  </div>

                  <div class="skeleton skeleton--title"></div>

                  <div class="skeleton skeleton--line"></div>
                  <div class="skeleton skeleton--line skeleton--short"></div>

                  <div class="idea-skeleton__bottom">
                    <div class="skeleton skeleton--tiny"></div>
                    <div class="skeleton skeleton--rating"></div>
                  </div>
                </div>
              }
            </div>
          </section>

        }


        <!-- ==================== ERROR ==================== -->
        @else if (errorMessage()) {

          <div class="error-state">
            <div class="error-state__icon">
              !
            </div>

            <div>
              <strong>Something went wrong</strong>
              <p>{{ errorMessage() }}</p>
            </div>
          </div>

        }


        <!-- ==================== CONTENT ==================== -->
        @else {

          <!-- ==================== LATEST IDEAS ==================== -->
          <section class="content-section">

            <div class="section-heading">
              <div>
                <span class="section-heading__eyebrow">
                  RECENT ACTIVITY
                </span>

                <h2 class="section-heading__title">
                  Latest ideas
                </h2>

                <p class="section-heading__description">
                  See what your team has been thinking about recently.
                </p>
              </div>

              <a
                routerLink="/ideas"
                class="view-link"
              >
                View all
                <span>→</span>
              </a>
            </div>


            @if (latestIdeas().length) {

              <div class="idea-grid">
                @for (idea of latestIdeas(); track idea.id) {

                  <div class="idea-wrapper">
                    <app-idea-card
                      [idea]="idea"
                      [isOwner]="idea.created_by === auth.currentUserId()"
                      (edit)="editIdea(idea)"
                      (delete)="requestDelete(idea)"
                    />
                  </div>

                }
              </div>

            } @else {

              <div class="empty-container">
                <app-empty-state
                  title="No ideas yet"
                  message="Be the first person on your team to share an idea."
                >
                  <a
                    routerLink="/create-idea"
                    class="create-button create-button--small"
                  >
                    <span class="create-button__icon">+</span>
                    Create Idea
                  </a>
                </app-empty-state>
              </div>

            }

          </section>


          <!-- ==================== LOWER GRID ==================== -->
          <div class="lower-grid">

            <!-- ==================== MY IDEAS ==================== -->
            <section class="content-section content-section--compact">

              <div class="section-heading section-heading--compact">

                <div>
                  <span class="section-heading__eyebrow">
                    YOUR CONTRIBUTIONS
                  </span>

                  <h2 class="section-heading__title">
                    My ideas
                  </h2>
                </div>

                <a
                  routerLink="/my-ideas"
                  class="view-link"
                >
                  View all
                  <span>→</span>
                </a>

              </div>


              @if (myIdeas().length) {

                <div class="vertical-ideas">

                  @for (idea of myIdeas(); track idea.id) {

                    <div class="mini-idea">
                      <div class="mini-idea__content">

                        <div class="mini-idea__title">
                          {{ idea.title }}
                        </div>

                        <div class="mini-idea__meta">
                          <span>
                            {{ idea.created_at | date:'MMM d, yyyy' }}
                          </span>
                        </div>

                      </div>

                      <div class="mini-idea__actions">

                        <button
                          type="button"
                          class="mini-action"
                          aria-label="Edit idea"
                          (click)="editIdea(idea)"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          class="mini-action mini-action--danger"
                          aria-label="Delete idea"
                          (click)="requestDelete(idea)"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v5" />
                            <path d="M14 11v5" />
                          </svg>
                        </button>

                      </div>
                    </div>

                  }

                </div>

              } @else {

                <div class="simple-empty">
                  <div class="simple-empty__icon">+</div>

                  <h3>You haven't shared an idea yet</h3>

                  <p>
                    Your ideas will appear here once you create one.
                  </p>

                  <a
                    routerLink="/create-idea"
                    class="text-button"
                  >
                    Create your first idea →
                  </a>
                </div>

              }

            </section>


            <!-- ==================== TEAM IDEAS ==================== -->
            <section class="content-section content-section--compact">

  <div class="section-heading section-heading--compact">

    <div>
      <span class="section-heading__eyebrow">
        TEAM ACTIVITY
      </span>

      <h2 class="section-heading__title">
        Idea contribution
      </h2>
    </div>

    <span class="team-count">
      {{ otherIdeas().length }} ideas
    </span>

  </div>


  @if (ideaContributors().length) {

    <div class="contribution-card">

      <!-- Donut -->
      <div class="donut-wrapper">

        <svg
          class="donut"
          viewBox="0 0 120 120"
          aria-label="Team idea contribution chart"
        >

          <!-- Background -->
          <circle
            class="donut__background"
            cx="60"
            cy="60"
            r="45"
          />

          @for (
            contributor of ideaContributors();
            track contributor.username;
            let i = $index
          ) {

            <circle
              class="donut__segment"
              cx="60"
              cy="60"
              r="45"
              [attr.stroke]="contributor.color"
              [attr.stroke-dasharray]="
                contributor.dasharray
              "
              [attr.stroke-dashoffset]="
                contributor.dashoffset
              "
            />

          }

        </svg>


        <div class="donut-center">

          <strong>
            {{ otherIdeas().length }}
          </strong>

          <span>
            ideas
          </span>

        </div>

      </div>


      <!-- Contributors -->
      <div class="contributors">

        @for (
          contributor of ideaContributors();
          track contributor.username
        ) {

          <div class="contributor">

            <div
              class="contributor__avatar"
              [style.background]="contributor.color"
            >
              {{ contributor.initials }}
            </div>

            <div class="contributor__info">

              <span class="contributor__name">
                {{ contributor.username }}
              </span>

              <span class="contributor__ideas">
                {{ contributor.count }}
                {{ contributor.count === 1 ? 'idea' : 'ideas' }}
              </span>

            </div>

            <strong class="contributor__percentage">
              {{ contributor.percentage }}%
            </strong>

          </div>

        }

      </div>

    </div>

  } @else {

    <div class="simple-empty">

      <div class="simple-empty__icon simple-empty__icon--team">
        +
      </div>

      <h3>No team ideas yet</h3>

      <p>
        Ideas submitted by your teammates will appear here.
      </p>

    </div>

  }

</section>

          </div>

        }

      </main>


      <!-- ==================== DELETE DIALOG ==================== -->
      @if (pendingDelete(); as idea) {

        <app-confirm-dialog
          title="Delete idea?"
          message="This will also remove all comments associated with this idea."
          [busy]="deleting()"
          (cancel)="pendingDelete.set(null)"
          (confirm)="confirmDelete(idea)"
        />

      }

    </div>
  `,

  styles: [`
    /* ============================================================
       DESIGN TOKENS
       ============================================================ */

    :host {
      --primary: #0f9f91;
      --primary-dark: #087f74;
      --primary-light: #e7f7f5;

      --blue: #4f7cff;
      --blue-light: #eef2ff;

      --purple: #8b5cf6;
      --purple-light: #f3efff;

      --green: #10b981;
      --green-light: #e9f9f2;

      --orange: #f59e0b;
      --orange-light: #fff7e6;

      --danger: #ef4444;
      --danger-light: #fef2f2;

      --background: #f7f9fb;
      --surface: #ffffff;
      --surface-hover: #fafcfc;

      --text: #172b2b;
      --text-secondary: #5f7171;
      --text-muted: #8a9a9a;

      --border: #e6ecec;
      --border-dark: #dbe4e4;

      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 20px;

      display: block;
      min-height: 100%;
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      color: var(--text);
      background: var(--background);
    }


    /* ============================================================
       GLOBAL
       ============================================================ */

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }


    /* ============================================================
       DASHBOARD
       ============================================================ */

    .dashboard {
      min-height: 100vh;
      background:
        radial-gradient(
          circle at 85% 0%,
          rgba(15, 159, 145, 0.045),
          transparent 28%
        ),
        var(--background);
    }


    /* ============================================================
       TOPBAR
       ============================================================ */

    .topbar {
      position: sticky;
      top: 0;
      z-index: 50;

      height: 72px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 0 clamp(1rem, 4vw, 3.5rem);

      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);

      border-bottom: 1px solid var(--border);
    }


    .brand {
      display: flex;
      align-items: center;
      gap: 11px;
    }


    .brand__logo {
      width: 36px;
      height: 36px;

      display: grid;
      place-items: center;

      border-radius: 10px;

      color: white;
      background:
        linear-gradient(
          135deg,
          var(--primary),
          #087d72
        );

      box-shadow:
        0 5px 14px rgba(15, 159, 145, 0.22);
    }


    .brand__logo span {
      font-size: 20px;
      font-weight: 800;
      font-style: italic;
    }


    .brand__text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }


    .brand__name {
      font-size: 15px;
      font-weight: 750;
      letter-spacing: -0.02em;
    }


    .brand__label {
      color: var(--text-muted);
      font-size: 10px;
      font-weight: 500;
    }


    .topbar__right {
      display: flex;
      align-items: center;
      gap: 18px;
    }


    /* ============================================================
       ICON BUTTON
       ============================================================ */

    .icon-button {
      position: relative;

      width: 38px;
      height: 38px;

      display: grid;
      place-items: center;

      border: 1px solid var(--border);
      border-radius: 10px;

      background: white;
      color: var(--text-secondary);

      cursor: pointer;

      transition:
        background 0.18s ease,
        border-color 0.18s ease,
        color 0.18s ease;
    }


    .icon-button:hover {
      background: var(--surface-hover);
      border-color: var(--border-dark);
      color: var(--text);
    }


    .notification-dot {
      position: absolute;

      top: 8px;
      right: 8px;

      width: 5px;
      height: 5px;

      border-radius: 50%;
      background: var(--primary);

      border: 1px solid white;
    }


    /* ============================================================
       PROFILE
       ============================================================ */

    .profile {
      display: flex;
      align-items: center;
      gap: 9px;
    }


    .profile__avatar,
    .mini-idea__avatar {
      display: grid;
      place-items: center;

      flex: 0 0 auto;

      border-radius: 50%;

      background: var(--primary-light);
      color: var(--primary);

      font-weight: 700;
    }


    .profile__avatar {
      width: 36px;
      height: 36px;
      font-size: 12px;
    }


    .profile__info {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }


    .profile__name {
      max-width: 130px;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      font-size: 12px;
      font-weight: 700;
    }


    .profile__role {
      font-size: 10px;
      color: var(--text-muted);
    }


    .profile__chevron {
      color: var(--text-muted);
      margin-left: 2px;
    }


    /* ============================================================
       MAIN
       ============================================================ */

    .main {
      width: min(1380px, 100%);
      margin: 0 auto;

      padding:
        clamp(1.5rem, 4vw, 3rem)
        clamp(1rem, 4vw, 3.5rem)
        4rem;
    }


    /* ============================================================
       WELCOME
       ============================================================ */

    .welcome {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;

      gap: 2rem;

      margin-bottom: 28px;
    }


    .welcome__eyebrow,
    .section-heading__eyebrow {
      display: block;

      margin-bottom: 8px;

      color: var(--primary);

      font-size: 10px;
      font-weight: 750;

      letter-spacing: 0.13em;
      text-transform: uppercase;
    }


    .welcome__title {
      margin: 0;

      font-size: clamp(1.75rem, 3vw, 2.35rem);
      line-height: 1.15;

      font-weight: 750;
      letter-spacing: -0.045em;
    }


    .welcome__title span {
      color: var(--primary);
    }


    .welcome__description {
      max-width: 590px;

      margin: 10px 0 0;

      color: var(--text-secondary);

      font-size: 13px;
      line-height: 1.65;
    }


    /* ============================================================
       CREATE BUTTON
       ============================================================ */

    .create-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      gap: 8px;

      min-height: 42px;

      padding: 0 17px;

      border-radius: 10px;

      color: white;
      background:
        linear-gradient(
          135deg,
          var(--primary),
          var(--primary-dark)
        );

      text-decoration: none;

      font-size: 12px;
      font-weight: 700;

      white-space: nowrap;

      box-shadow:
        0 7px 18px rgba(15, 159, 145, 0.18);

      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease;
    }


    .create-button:hover {
      transform: translateY(-1px);

      box-shadow:
        0 10px 22px rgba(15, 159, 145, 0.24);
    }


    .create-button__icon {
      font-size: 18px;
      font-weight: 400;
      line-height: 1;
    }


    .create-button--small {
      min-height: 38px;
      font-size: 11px;
    }


    /* ============================================================
       STATS
       ============================================================ */

    .stats {
      display: grid;

      grid-template-columns:
        repeat(4, minmax(0, 1fr));

      gap: 13px;

      margin-bottom: 38px;
    }


    .stat-card {
      min-width: 0;

      padding: 17px 18px;

      background: var(--surface);

      border:
        1px solid var(--border);

      border-radius: var(--radius-lg);

      box-shadow:
        0 2px 5px rgba(21, 48, 48, 0.025);

      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease;
    }


    .stat-card:hover {
      transform: translateY(-2px);

      box-shadow:
        0 9px 24px rgba(21, 48, 48, 0.06);
    }


    .stat-card__top {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-bottom: 13px;
    }


    .stat-card__icon {
      width: 35px;
      height: 35px;

      display: grid;
      place-items: center;

      border-radius: 9px;
    }


    .stat-card__icon--blue {
      color: var(--blue);
      background: var(--blue-light);
    }


    .stat-card__icon--purple {
      color: var(--purple);
      background: var(--purple-light);
    }


    .stat-card__icon--green {
      color: var(--green);
      background: var(--green-light);
    }


    .stat-card__icon--orange {
      color: var(--orange);
      background: var(--orange-light);
    }


    .stat-card__trend {
      color: var(--text-muted);

      font-size: 9px;
      font-weight: 650;

      text-transform: uppercase;
      letter-spacing: 0.08em;
    }


    .stat-card__value {
      margin-bottom: 3px;

      color: var(--text);

      font-size: 24px;
      font-weight: 750;

      letter-spacing: -0.04em;
    }


    .stat-card__label {
      color: var(--text-muted);

      font-size: 11px;
      font-weight: 500;
    }


    /* ============================================================
       CONTENT SECTION
       ============================================================ */

    .content-section {
      margin-bottom: 40px;
    }


    .content-section--compact {
      margin-bottom: 0;
    }


    .section-heading {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;

      gap: 1rem;

      margin-bottom: 17px;
    }


    .section-heading--compact {
      align-items: center;
    }


    .section-heading__eyebrow {
      margin-bottom: 5px;

      font-size: 9px;
    }


    .section-heading__title {
      margin: 0;

      color: var(--text);

      font-size: 18px;
      font-weight: 750;

      letter-spacing: -0.035em;
    }


    .section-heading__description {
      margin: 5px 0 0;

      color: var(--text-muted);

      font-size: 11px;
      line-height: 1.5;
    }


    /* ============================================================
       VIEW LINK
       ============================================================ */

    .view-link {
      display: inline-flex;
      align-items: center;

      gap: 5px;

      color: var(--primary);

      text-decoration: none;

      font-size: 11px;
      font-weight: 700;

      white-space: nowrap;

      transition: gap 0.18s ease;
    }


    .view-link:hover {
      gap: 8px;
    }


    .view-link span {
      font-size: 15px;
    }


    .team-count {
      color: var(--text-muted);

      font-size: 10px;
      font-weight: 600;
    }


    /* ============================================================
       IDEA GRID
       ============================================================ */

    .idea-grid {
      display: grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap: 15px;
    }


    .idea-wrapper {
      min-width: 0;

      background: var(--surface);

      border-radius: var(--radius-lg);

      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    }


    .idea-wrapper:hover {
      transform: translateY(-2px);

      box-shadow:
        0 12px 28px rgba(21, 48, 48, 0.07);
    }


    /* ============================================================
       LOWER GRID
       ============================================================ */

    .lower-grid {
      display: grid;

      grid-template-columns:
        minmax(0, 1fr)
        minmax(0, 1fr);

      gap: 18px;
    }


    .lower-grid .content-section {
      min-width: 0;

      padding: 20px;

      background: var(--surface);

      border:
        1px solid var(--border);

      border-radius: var(--radius-xl);

      box-shadow:
        0 2px 5px rgba(21, 48, 48, 0.025);
    }


    /* ============================================================
       MINI IDEAS
       ============================================================ */

    .vertical-ideas {
      display: flex;
      flex-direction: column;
    }


    .mini-idea {
      display: flex;
      align-items: center;

      gap: 12px;

      min-height: 65px;

      padding: 10px 0;

      border-bottom:
        1px solid var(--border);
    }


    .mini-idea:last-child {
      border-bottom: none;
      padding-bottom: 2px;
    }


    .mini-idea:first-child {
      padding-top: 2px;
    }


    .mini-idea__content {
      flex: 1;
      min-width: 0;
    }


    .mini-idea__title {
      overflow: hidden;

      color: var(--text);

      font-size: 12px;
      font-weight: 700;

      line-height: 1.4;

      text-overflow: ellipsis;
      white-space: nowrap;
    }


    .mini-idea__meta {
      display: flex;
      align-items: center;

      gap: 6px;

      margin-top: 5px;

      color: var(--text-muted);

      font-size: 9px;
    }


    .dot {
      width: 3px;
      height: 3px;

      border-radius: 50%;

      background: var(--text-muted);
    }


    .mini-idea__avatar {
      width: 31px;
      height: 31px;

      font-size: 9px;
    }


    .mini-idea__actions {
      display: flex;
      align-items: center;

      gap: 4px;
    }


    .mini-action {
      width: 31px;
      height: 31px;

      display: grid;
      place-items: center;

      border: none;
      border-radius: 8px;

      color: var(--text-muted);
      background: transparent;

      cursor: pointer;

      transition:
        color 0.18s ease,
        background 0.18s ease;
    }


    .mini-action:hover {
      color: var(--primary);
      background: var(--primary-light);
    }


    .mini-action--danger:hover {
      color: var(--danger);
      background: var(--danger-light);
    }


    .team-arrow {
      color: var(--text-muted);

      font-size: 17px;

      transition:
        color 0.18s ease,
        transform 0.18s ease;
    }


    .mini-idea:hover .team-arrow {
      color: var(--primary);
      transform: translateX(2px);
    }


    /* ============================================================
       EMPTY STATE
       ============================================================ */

    .empty-container {
      padding: 20px;

      background: var(--surface);

      border:
        1px solid var(--border);

      border-radius: var(--radius-lg);
    }


    .simple-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      min-height: 190px;

      text-align: center;
    }


    .simple-empty__icon {
      width: 38px;
      height: 38px;

      display: grid;
      place-items: center;

      margin-bottom: 10px;

      border-radius: 11px;

      color: var(--primary);
      background: var(--primary-light);

      font-size: 20px;
      font-weight: 400;
    }


    .simple-empty__icon--team {
      font-size: 15px;
    }


    .simple-empty h3 {
      margin: 0;

      color: var(--text);

      font-size: 12px;
      font-weight: 700;
    }


    .simple-empty p {
      max-width: 280px;

      margin: 6px 0 12px;

      color: var(--text-muted);

      font-size: 10px;
      line-height: 1.5;
    }


    .text-button {
      color: var(--primary);

      text-decoration: none;

      font-size: 10px;
      font-weight: 700;
    }


    .text-button:hover {
      text-decoration: underline;
    }


    /* ============================================================
       ERROR
       ============================================================ */

    .error-state {
      display: flex;
      align-items: flex-start;

      gap: 12px;

      padding: 16px 18px;

      margin-bottom: 30px;

      border:
        1px solid #fecaca;

      border-radius: var(--radius-md);

      background: var(--danger-light);

      color: #991b1b;
    }


    .error-state__icon {
      width: 26px;
      height: 26px;

      flex: 0 0 auto;

      display: grid;
      place-items: center;

      border-radius: 50%;

      color: white;
      background: var(--danger);

      font-size: 12px;
      font-weight: 800;
    }


    .error-state strong {
      display: block;

      font-size: 12px;
    }


    .error-state p {
      margin: 3px 0 0;

      font-size: 10px;
      line-height: 1.5;
    }


    /* ============================================================
       SKELETON
       ============================================================ */

    .skeleton {
      position: relative;

      overflow: hidden;

      border-radius: 5px;

      background: #edf1f1;
    }


    .skeleton::after {
      content: '';

      position: absolute;
      inset: 0;

      transform: translateX(-100%);

      background:
        linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.75),
          transparent
        );

      animation: shimmer 1.4s infinite;
    }


    .skeleton--small {
      width: 90px;
      height: 8px;

      margin-bottom: 8px;
    }


    .skeleton--heading {
      width: 145px;
      height: 19px;
    }


    .idea-skeleton {
      padding: 18px;

      background: white;

      border:
        1px solid var(--border);

      border-radius: var(--radius-lg);
    }


    .idea-skeleton__top {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-bottom: 16px;
    }


    .skeleton--avatar {
      width: 30px;
      height: 30px;

      border-radius: 50%;
    }


    .skeleton--tiny {
      width: 60px;
      height: 8px;
    }


    .skeleton--title {
      width: 72%;
      height: 14px;

      margin-bottom: 13px;
    }


    .skeleton--line {
      width: 100%;
      height: 8px;

      margin-bottom: 7px;
    }


    .skeleton--short {
      width: 62%;
    }


    .idea-skeleton__bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-top: 22px;
    }


    .skeleton--rating {
      width: 45px;
      height: 8px;
    }
.contribution-card {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 2rem;

  padding: 1.5rem;

  border: 1px solid var(--color-border);
  border-radius: 16px;

  background: var(--color-surface);
}


/* =========================
   DONUT
========================= */

.donut-wrapper {
  position: relative;

  width: 170px;
  height: 170px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.donut {
  width: 170px;
  height: 170px;

  transform: rotate(-90deg);
}

.donut__background {
  fill: none;

  stroke: var(--color-surface-muted);
  stroke-width: 12;
}

.donut__segment {
  fill: none;

  stroke-width: 12;

  stroke-linecap: butt;

  transition:
    opacity 0.2s ease,
    stroke-width 0.2s ease;
}

.donut__segment:hover {
  stroke-width: 15;
}


/* =========================
   CENTER
========================= */

.donut-center {
  position: absolute;

  inset: 0;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  pointer-events: none;
}

.donut-center strong {
  color: var(--color-text);

  font-size: 1.7rem;
  font-weight: 700;

  line-height: 1;
}

.donut-center span {
  margin-top: 0.3rem;

  color: var(--color-text-faint);

  font-size: 0.7rem;
}


/* =========================
   CONTRIBUTORS
========================= */

.contributors {
  display: flex;
  flex-direction: column;

  justify-content: center;

  gap: 0.65rem;
}

.contributor {
  display: flex;
  align-items: center;

  gap: 0.7rem;

  padding: 0.45rem 0.5rem;

  border-radius: 9px;

  transition:
    background 0.15s ease;
}

.contributor:hover {
  background: var(--color-surface-muted);
}

.contributor__avatar {
  width: 32px;
  height: 32px;

  flex: 0 0 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: white;

  font-size: 0.68rem;
  font-weight: 700;
}

.contributor__info {
  display: flex;
  flex-direction: column;

  flex: 1;

  min-width: 0;
}

.contributor__name {
  color: var(--color-text);

  font-size: 0.8rem;
  font-weight: 600;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contributor__ideas {
  margin-top: 2px;

  color: var(--color-text-faint);

  font-size: 0.7rem;
}

.contributor__percentage {
  color: var(--color-text-muted);

  font-size: 0.75rem;
}


/* =========================
   MOBILE
========================= */

@media (max-width: 650px) {

  .contribution-card {
    grid-template-columns: 1fr;

    justify-items: center;

    gap: 1.25rem;
  }

  .contributors {
    width: 100%;
  }

}

    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }


    /* ============================================================
       RESPONSIVE - TABLET
       ============================================================ */

    @media (max-width: 1050px) {

      .idea-grid {
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
      }

      .stats {
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
      }

    }


    /* ============================================================
       RESPONSIVE - MOBILE
       ============================================================ */

    @media (max-width: 760px) {

      .topbar {
        height: 64px;

        padding:
          0 16px;
      }


      .brand__label,
      .profile__info,
      .profile__chevron {
        display: none;
      }


      .topbar__right {
        gap: 8px;
      }


      .profile__avatar {
        width: 34px;
        height: 34px;
      }


      .main {
        padding:
          22px 16px
          40px;
      }


      .welcome {
        align-items: flex-start;
        flex-direction: column;

        gap: 18px;

        margin-bottom: 24px;
      }


      .welcome__title {
        font-size: 1.75rem;
      }


      .welcome__description {
        font-size: 12px;
      }


      .create-button {
        width: 100%;
      }


      .stats {
        grid-template-columns:
          repeat(2, minmax(0, 1fr));

        gap: 9px;

        margin-bottom: 30px;
      }


      .stat-card {
        padding: 14px;
      }


      .stat-card__value {
        font-size: 21px;
      }


      .idea-grid {
        grid-template-columns: 1fr;
      }


      .lower-grid {
        grid-template-columns: 1fr;

        gap: 14px;
      }


      .lower-grid .content-section {
        padding: 16px;
      }


      .section-heading {
        align-items: flex-start;
      }


      .section-heading__description {
        display: none;
      }

    }


    /* ============================================================
       SMALL MOBILE
       ============================================================ */

    @media (max-width: 420px) {

      .brand__name {
        font-size: 14px;
      }


      .stats {
        gap: 8px;
      }


      .stat-card {
        padding: 12px;
      }


      .stat-card__icon {
        width: 31px;
        height: 31px;
      }


      .stat-card__trend {
        display: none;
      }


      .stat-card__value {
        margin-top: 2px;

        font-size: 20px;
      }


      .stat-card__label {
        font-size: 10px;
      }


      .section-heading__title {
        font-size: 16px;
      }


      .mini-idea {
        gap: 9px;
      }

    }


    /* ============================================================
       ACCESSIBILITY
       ============================================================ */

    .create-button:focus-visible,
    .view-link:focus-visible,
    .icon-button:focus-visible,
    .mini-action:focus-visible,
    .text-button:focus-visible {
      outline:
        2px solid var(--primary);

      outline-offset: 3px;
    }


    @media (prefers-reduced-motion: reduce) {

      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }

    }

  `]
})
export class DashboardComponent implements OnInit {

  readonly greeting = this.getGreeting();

  readonly loading = signal(true);

  readonly errorMessage = signal('');

  readonly latestIdeas =
    signal<IdeaWithAuthor[]>([]);

  readonly myIdeas =
    signal<IdeaWithAuthor[]>([]);

  readonly otherIdeas =
    signal<IdeaWithAuthor[]>([]);

  readonly pendingDelete =
    signal<IdeaWithAuthor | null>(null);

  readonly deleting =
    signal(false);


  constructor(
    readonly auth: AuthService,
    private readonly ideaService: IdeaService,
    private readonly router: Router
  ) {}


  async ngOnInit(): Promise<void> {
    await this.load();
  }


  private async load(): Promise<void> {

    const userId =
      this.auth.currentUserId();

    if (!userId) {
      return;
    }


    this.loading.set(true);

    this.errorMessage.set('');


    try {

      const [
        latest,
        mine,
        others
      ] = await Promise.all([

        this.ideaService.getLatestIdeas(6),

        this.ideaService.getUserIdeas(
          userId,
          3
        ),

        this.ideaService.getOtherIdeas(
          userId,
          4
        )

      ]);


      this.latestIdeas.set(latest);

      this.myIdeas.set(mine);

      this.otherIdeas.set(others);

    } catch {

      this.errorMessage.set(
        'Something went wrong while loading ideas. Please try again.'
      );

    } finally {

      this.loading.set(false);

    }

  }


  editIdea(
    idea: IdeaWithAuthor
  ): void {

    void this.router.navigate([
      '/ideas',
      idea.id,
      'edit'
    ]);

  }


  requestDelete(
    idea: IdeaWithAuthor
  ): void {

    this.pendingDelete.set(idea);

  }


  async confirmDelete(
    idea: IdeaWithAuthor
  ): Promise<void> {

    this.deleting.set(true);


    try {

      await this.ideaService.deleteIdea(
        idea.id
      );

      this.pendingDelete.set(null);

      await this.load();

    } catch {

      this.errorMessage.set(
        'Something went wrong while deleting this idea. Please try again.'
      );

    } finally {

      this.deleting.set(false);

    }

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
readonly ideaContributors = computed(() => {
debugger;
  const ideas = this.otherIdeas();

  const map = new Map<string, number>();

  for (const idea of ideas) {

    const username =
      idea.created_by ?? 'Unknown';

    map.set(
      username,
      (map.get(username) ?? 0) + 1
    );

  }

  const total = ideas.length;

  let accumulated = 0;

  const circumference = 2 * Math.PI * 45;

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([username, count], index) => {

      const percentage =
        Math.round((count / total) * 100);

      const length =
        (count / total) * circumference;

      const dashoffset = -accumulated;

      accumulated += length;

      return {
        username,

        count,

        percentage,

        initials: this.getInitials(username),

        color: this.getContributorColor(index),

        dasharray: `${length} ${circumference - length}`,

        dashoffset
      };

    });

});
getContributorColor(index: number): string {

  const colors = [
    '#6366f1',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6'
  ];

  return colors[index % colors.length];
}
  private getGreeting(): string {

    const hour =
      new Date().getHours();


    if (hour < 12) {
      return 'Good morning';
    }


    if (hour < 18) {
      return 'Good afternoon';
    }


    return 'Good evening';

  }

}