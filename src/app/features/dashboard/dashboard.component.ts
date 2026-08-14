import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
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
  imports: [RouterLink, IdeaCardComponent, EmptyStateComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <section class="dashboard-hero">
        <div class="dashboard-hero__card">
          <span class="dashboard-hero__eyebrow">Dashboard</span>
          <h1 class="dashboard-hero__title">
            {{ greeting }}, <span class="dashboard-hero__name">{{ auth.profile()?.username ?? 'there' }}</span>
          </h1>
          <p class="dashboard-hero__subtitle">What's your next idea?</p>
          <a routerLink="/create-idea" class="btn btn--primary">
            <span class="btn__icon" aria-hidden="true">+</span> Create Idea
          </a>
        </div>
      </section>

      @if (loading()) {
        <section class="dashboard-section">
          <div class="skeleton-eyebrow"></div>
          <div class="idea-grid">
            @for (i of [1,2,3]; track i) {
              <div class="skeleton-card">
                <div class="skeleton-line skeleton-line--title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line skeleton-line--short"></div>
              </div>
            }
          </div>
        </section>
      } @else if (errorMessage()) {
        <p class="status-text status-text--error">{{ errorMessage() }}</p>
      } @else {
        <section class="dashboard-section">
          <div class="dashboard-section__header">
            <span class="dashboard-section__eyebrow">01 — Fresh</span>
            <h2 class="dashboard-section__title">Latest Ideas</h2>
          </div>
          @if (latestIdeas().length) {
            <div class="idea-grid">
              @for (idea of latestIdeas(); track idea.id) {
                <app-idea-card
                  [idea]="idea"
                  [isOwner]="idea.created_by === auth.currentUserId()"
                  (edit)="editIdea(idea)"
                  (delete)="requestDelete(idea)"
                />
              }
            </div>
          } @else {
            <app-empty-state title="No ideas yet" message="Be the first person on your team to share an idea.">
              <a routerLink="/create-idea" class="btn btn--primary">+ Create Idea</a>
            </app-empty-state>
          }
        </section>

        <div class="dashboard-columns">
          <section class="dashboard-section">
            <div class="dashboard-section__header">
              <span class="dashboard-section__eyebrow">02 — Yours</span>
              <div class="dashboard-section__header-row">
                <h2 class="dashboard-section__title">My Ideas</h2>
                <a routerLink="/my-ideas" class="link-btn">View all <span aria-hidden="true">→</span></a>
              </div>
            </div>
            @if (myIdeas().length) {
              <div class="idea-grid idea-grid--single">
                @for (idea of myIdeas(); track idea.id) {
                  <app-idea-card
                    [idea]="idea"
                    [isOwner]="true"
                    (edit)="editIdea(idea)"
                    (delete)="requestDelete(idea)"
                  />
                }
              </div>
            } @else {
              <app-empty-state title="You haven't shared an idea yet" message="Your ideas will show up here." />
            }
          </section>

          <section class="dashboard-section">
            <div class="dashboard-section__header">
              <span class="dashboard-section__eyebrow">03 — Team</span>
              <h2 class="dashboard-section__title">Other Ideas</h2>
            </div>
            @if (otherIdeas().length) {
              <div class="idea-grid idea-grid--single">
                @for (idea of otherIdeas(); track idea.id) {
                  <app-idea-card [idea]="idea" [isOwner]="false" />
                }
              </div>
            } @else {
              <app-empty-state title="No other ideas yet" message="Ideas from your teammates will appear here." />
            }
          </section>
        </div>
      }
    </div>

    @if (pendingDelete(); as idea) {
      <app-confirm-dialog
        title="Delete idea?"
        message="This will also remove all comments associated with this idea."
        [busy]="deleting()"
        (cancel)="pendingDelete.set(null)"
        (confirm)="confirmDelete(idea)"
      />
    }
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

      :host {
        --db-bg: #071c1f;
        --db-bg-soft: #0d2b2e;
        --db-surface: #f3fbfa;
        --db-surface-dim: #e5f6f3;
        --db-ink: #0d2b2b;
        --db-ink-muted: #5f7a79;
        --db-accent: #17b8ac;
        --db-accent-soft: #7fe4d6;
        --db-line: rgba(255, 255, 255, 0.09);
        --db-line-soft: rgba(13, 43, 43, 0.1);
        --db-error: #d97757;
        --db-radius-lg: 20px;
        --db-radius-md: 14px;
        --db-shadow: 0 20px 45px -20px rgba(0, 0, 0, 0.55);

        display: block;
        font-family: 'Inter', var(--font-sans, system-ui), sans-serif;
        color-scheme: dark;
      }

      .page {
        background: radial-gradient(ellipse 120% 60% at 50% -10%, #0f3538 0%, var(--db-bg) 55%);
        min-height: 100%;
        padding: clamp(1.25rem, 3vw, 3rem) clamp(1rem, 4vw, 3.5rem) 4rem;
        color: #e3f5f3;
      }

      /* ---------- Hero ---------- */
      .dashboard-hero {
        margin-bottom: clamp(2rem, 4vw, 3.5rem);
      }

      .dashboard-hero__card {
        position: relative;
        background: linear-gradient(180deg, var(--db-surface) 0%, var(--db-surface-dim) 100%);
        color: var(--db-ink);
        border-radius: var(--db-radius-lg);
        padding: clamp(1.75rem, 4vw, 2.75rem) clamp(1.5rem, 5vw, 3rem);
        box-shadow: var(--db-shadow);
        overflow: hidden;
        animation: rise-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .dashboard-hero__card::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 4px;
        background: linear-gradient(90deg, var(--db-accent), var(--db-accent-soft) 60%, transparent);
      }

      .dashboard-hero__eyebrow {
        display: inline-block;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--db-accent);
        margin-bottom: 0.85rem;
      }

      .dashboard-hero__title {
        font-family: 'Fraunces', Georgia, serif;
        font-weight: 500;
        font-size: clamp(1.65rem, 3.4vw, 2.5rem);
        line-height: 1.15;
        letter-spacing: -0.01em;
        margin: 0 0 0.5rem;
      }

      .dashboard-hero__name {
        color: var(--db-accent);
        font-style: italic;
      }

      .dashboard-hero__subtitle {
        margin: 0 0 1.75rem;
        color: var(--db-ink-muted);
        font-size: 1rem;
      }

      /* ---------- Buttons ---------- */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        border-radius: 999px;
        font-weight: 600;
        font-size: 0.9rem;
        text-decoration: none;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        border: none;
      }

      .btn--primary {
        background: linear-gradient(135deg, var(--db-accent) 0%, #0f8a80 100%);
        color: #04211e;
        padding: 0.75rem 1.5rem;
        box-shadow: 0 10px 24px -10px rgba(23, 184, 172, 0.65);
      }

      .btn--primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 16px 28px -12px rgba(23, 184, 172, 0.75);
      }

      .btn--primary:focus-visible {
        outline: 2px solid var(--db-accent-soft);
        outline-offset: 3px;
      }

      .btn__icon {
        font-size: 1.05rem;
        line-height: 1;
      }

      .link-btn {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--db-accent-soft);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        transition: gap 0.2s ease, color 0.2s ease;
      }

      .link-btn:hover {
        gap: 0.5rem;
        color: var(--db-accent);
      }

      .link-btn:focus-visible {
        outline: 2px solid var(--db-accent-soft);
        outline-offset: 3px;
        border-radius: 4px;
      }

      /* ---------- Sections ---------- */
      .dashboard-section {
        margin-bottom: clamp(2rem, 4vw, 2.75rem);
        animation: rise-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        animation-delay: 0.08s;
      }

      .dashboard-section__header {
        margin-bottom: 1.1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--db-line);
      }

      .dashboard-section__header-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
      }

      .dashboard-section__eyebrow {
        display: block;
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--db-accent-soft);
        margin-bottom: 0.4rem;
      }

      .dashboard-section__title {
        font-family: 'Fraunces', Georgia, serif;
        font-size: 1.2rem;
        font-weight: 500;
        letter-spacing: -0.01em;
        margin: 0;
        color: #eafaf7;
      }

      .dashboard-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem;
      }

      .idea-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.1rem;
      }

      .idea-grid--single {
        grid-template-columns: 1fr;
      }

      /* ---------- Status / skeleton ---------- */
      .status-text {
        font-size: 0.95rem;
        color: #a9c4c1;
      }

      .status-text--error {
        color: var(--db-error);
        background: rgba(217, 119, 87, 0.1);
        border: 1px solid rgba(217, 119, 87, 0.3);
        padding: 0.85rem 1.1rem;
        border-radius: var(--db-radius-md);
      }

      .skeleton-eyebrow {
        width: 90px;
        height: 10px;
        border-radius: 4px;
        margin-bottom: 1.1rem;
        background: linear-gradient(90deg, var(--db-bg-soft) 25%, #163b3d 50%, var(--db-bg-soft) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.6s infinite;
      }

      .skeleton-card {
        border-radius: var(--db-radius-md);
        padding: 1.25rem;
        background: var(--db-bg-soft);
        border: 1px solid var(--db-line);
      }

      .skeleton-line {
        height: 10px;
        border-radius: 4px;
        margin-bottom: 0.6rem;
        background: linear-gradient(90deg, #163b3d 25%, #1d4a4c 50%, #163b3d 75%);
        background-size: 200% 100%;
        animation: shimmer 1.6s infinite;
      }

      .skeleton-line--title {
        width: 70%;
        height: 14px;
      }

      .skeleton-line--short {
        width: 40%;
        margin-bottom: 0;
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      @keyframes rise-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce) {
        .dashboard-hero__card,
        .dashboard-section,
        .btn--primary,
        .skeleton-eyebrow,
        .skeleton-line {
          animation: none;
          transition: none;
        }
      }

      /* ---------- Responsive ---------- */
      @media (max-width: 900px) {
        .dashboard-columns {
          grid-template-columns: 1fr;
          gap: 2.25rem;
        }
      }

      @media (max-width: 640px) {
        .page {
          padding: 1.25rem 1rem 3rem;
        }

        .dashboard-hero__card {
          padding: 1.5rem 1.25rem;
          border-radius: var(--db-radius-md);
        }

        .btn--primary {
          width: 100%;
          justify-content: center;
          padding: 0.85rem 1.5rem;
        }

        .dashboard-section__header-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.4rem;
        }

        .idea-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class DashboardComponent implements OnInit {
  readonly greeting = this.getGreeting();
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly latestIdeas = signal<IdeaWithAuthor[]>([]);
  readonly myIdeas = signal<IdeaWithAuthor[]>([]);
  readonly otherIdeas = signal<IdeaWithAuthor[]>([]);
  readonly pendingDelete = signal<IdeaWithAuthor | null>(null);
  readonly deleting = signal(false);

  constructor(
    readonly auth: AuthService,
    private readonly ideaService: IdeaService,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const userId = this.auth.currentUserId();
    if (!userId) return;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const [latest, mine, others] = await Promise.all([
        this.ideaService.getLatestIdeas(6),
        this.ideaService.getUserIdeas(userId, 3),
        this.ideaService.getOtherIdeas(userId, 4)
      ]);
      this.latestIdeas.set(latest);
      this.myIdeas.set(mine);
      this.otherIdeas.set(others);
    } catch {
      this.errorMessage.set('Something went wrong while loading ideas. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  editIdea(idea: IdeaWithAuthor): void {
    void this.router.navigate(['/ideas', idea.id, 'edit']);
  }

  requestDelete(idea: IdeaWithAuthor): void {
    this.pendingDelete.set(idea);
  }

  async confirmDelete(idea: IdeaWithAuthor): Promise<void> {
    this.deleting.set(true);
    try {
      await this.ideaService.deleteIdea(idea.id);
      this.pendingDelete.set(null);
      await this.load();
    } catch {
      this.errorMessage.set('Something went wrong while deleting this idea. Please try again.');
    } finally {
      this.deleting.set(false);
    }
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}