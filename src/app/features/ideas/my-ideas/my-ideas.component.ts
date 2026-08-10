import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IdeaService } from '../../../core/services/idea.service';
import { IdeaWithAuthor } from '../../../core/models/idea.model';
import { IdeaCardComponent } from '../../../shared/components/idea-card/idea-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-ideas',
  standalone: true,
  imports: [RouterLink, IdeaCardComponent, EmptyStateComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1 class="page__title">My Ideas</h1>

      @if (loading()) {
        <p class="status-text">Loading ideas...</p>
      } @else if (errorMessage()) {
        <p class="status-text status-text--error">{{ errorMessage() }}</p>
      } @else if (ideas().length) {
        <div class="idea-grid">
          @for (idea of ideas(); track idea.id) {
            <app-idea-card [idea]="idea" [isOwner]="true" (edit)="editIdea(idea)" (delete)="requestDelete(idea)" />
          }
        </div>
      } @else {
        <app-empty-state title="No ideas yet" message="Be the first person on your team to share an idea.">
          <a routerLink="/create-idea" class="btn btn--primary">+ Create Idea</a>
        </app-empty-state>
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
      .page__title {
        font-size: 1.35rem;
        font-weight: 700;
        margin: 0 0 1.5rem;
        letter-spacing: -0.01em;
      }
      .idea-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1rem;
      }
    `
  ]
})
export class MyIdeasComponent implements OnInit {
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly ideas = signal<IdeaWithAuthor[]>([]);
  readonly pendingDelete = signal<IdeaWithAuthor | null>(null);
  readonly deleting = signal(false);

  constructor(private readonly auth: AuthService, private readonly ideaService: IdeaService, private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const userId = this.auth.currentUserId();
    if (!userId) return;

    this.loading.set(true);
    this.errorMessage.set('');
    try {
      this.ideas.set(await this.ideaService.getUserIdeas(userId));
    } catch {
      this.errorMessage.set('Something went wrong while loading your ideas. Please try again.');
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
}
