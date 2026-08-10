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
        <div>
          <h1 class="dashboard-hero__title">{{ greeting }}, {{ auth.profile()?.username ?? 'there' }}</h1>
          <p class="dashboard-hero__subtitle">What's your next idea?</p>
        </div>
        <a routerLink="/create-idea" class="btn btn--primary">+ Create Idea</a>
      </section>

      @if (loading()) {
        <p class="status-text">Loading ideas...</p>
      } @else if (errorMessage()) {
        <p class="status-text status-text--error">{{ errorMessage() }}</p>
      } @else {
        <section class="dashboard-section">
          <h2 class="dashboard-section__title">Latest Ideas</h2>
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
              <h2 class="dashboard-section__title">My Ideas</h2>
              <a routerLink="/my-ideas" class="link-btn">View all my ideas →</a>
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
            <h2 class="dashboard-section__title">Other Ideas</h2>
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
      .dashboard-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 2rem;
      }
      .dashboard-hero__title {
        margin: 0 0 0.25rem;
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      .dashboard-hero__subtitle {
        margin: 0;
        color: var(--color-text-muted);
      }
      .dashboard-section {
        margin-bottom: 2.25rem;
      }
      .dashboard-section__header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
      }
      .dashboard-section__title {
        font-size: 1.05rem;
        font-weight: 600;
        margin: 0 0 1rem;
      }
      .dashboard-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
      .idea-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1rem;
      }
      .idea-grid--single {
        grid-template-columns: 1fr;
      }

      @media (max-width: 900px) {
        .dashboard-columns {
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
