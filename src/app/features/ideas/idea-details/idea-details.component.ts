import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IdeaService } from '../../../core/services/idea.service';
import { CommentService } from '../../../core/services/comment.service';
import { IdeaWithAuthor } from '../../../core/models/idea.model';
import { CommentWithAuthor } from '../../../core/models/comment.model';
import { FriendlyDatePipe } from '../../../shared/pipes/friendly-date.pipe';
import { CommentItemComponent } from '../../../shared/components/comment-item/comment-item.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

const COMMENT_MAX = 1000;

@Component({
  selector: 'app-idea-details',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    FriendlyDatePipe,
    CommentItemComponent,
    EmptyStateComponent,
    ConfirmDialogComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
   <div class="page page--narrow">
    <a routerLink="/dashboard" class="back-link">← Back</a>

    @if (loading()) {
      <p class="status-text">Loading idea...</p>
    } @else if (errorMessage() && !idea()) {
      <p class="status-text status-text--error">{{ errorMessage() }}</p>
    } @else {
      @if (idea(); as ideaValue) {
        <article class="idea-detail">
          <div class="idea-detail__top">
            <h1 class="idea-detail__title">
              {{ ideaValue.title }}
            </h1>

            @if (isOwner()) {
              <div class="idea-detail__owner-actions">
                <a
                  [routerLink]="['/ideas', ideaValue.id, 'edit']"
                  class="btn btn--ghost"
                >
                  Edit
                </a>

                <button
                  type="button"
                  class="btn btn--ghost is-danger"
                  (click)="confirmingDelete.set(true)"
                >
                  Delete
                </button>
              </div>
            }
          </div>

          <p class="idea-detail__meta">
            Created by {{ ideaValue.author?.username ?? 'Unknown' }}
            ·
            {{ ideaValue.created_at | friendlyDate }}
          </p>

          <h2 class="idea-detail__section-title">
            Description
          </h2>

          <p class="idea-detail__description">
            {{ ideaValue.description }}
          </p>

          <hr class="idea-detail__divider" />

          <h2 class="idea-detail__section-title">
            Comments
          </h2>

          @if (commentsLoading()) {
            <p class="status-text">Loading comments...</p>
          } @else if (comments().length) {
            <ul class="comment-list">
              @for (comment of comments(); track comment.id) {
                <app-comment-item
                  [comment]="comment"
                  [isOwner]="comment.user_id === auth.currentUserId()"
                  (update)="updateComment($event)"
                  (delete)="deleteComment($event)"
                />
              }
            </ul>
          } @else {
            <app-empty-state
              title="No comments yet"
              message="Start the discussion."
            />
          }

          <div class="comment-form">
            <h2 class="idea-detail__section-title">
              Add a comment
            </h2>

            <label
              class="sr-only"
              for="new-comment"
            >
              Write your comment
            </label>

            <textarea
              id="new-comment"
              class="textarea"
              rows="3"
              placeholder="Write your comment..."
              [attr.maxlength]="commentMax"
              [(ngModel)]="newComment"
            ></textarea>

            @if (commentError()) {
              <p class="form-error" role="alert">
                {{ commentError() }}
              </p>
            }

            <div class="comment-form__actions">
              <button
                type="button"
                class="btn btn--primary"
                [disabled]="!newComment.trim() || postingComment()"
                (click)="postComment()"
              >
                {{
                  postingComment()
                    ? 'Posting comment...'
                    : 'Comment'
                }}
              </button>
            </div>
          </div>
        </article>
      }
    }

    @if (confirmingDelete()) {
      @if (idea(); as ideaToDelete) {
        <app-confirm-dialog
          title="Delete idea?"
          message="This will also remove all comments associated with this idea."
          [busy]="deletingIdea()"
          (cancel)="confirmingDelete.set(false)"
          (confirm)="deleteIdea(ideaToDelete)"
        />
      }
    }
  `,
  styles: [
    `
      .page--narrow {
        max-width: 700px;
      }
      .back-link {
        display: inline-block;
        color: var(--color-text-muted);
        text-decoration: none;
        font-size: 0.875rem;
        margin-bottom: 1.25rem;
      }
      .back-link:hover {
        color: var(--color-text);
      }
      .idea-detail__top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }
      .idea-detail__title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        line-height: 1.3;
      }
      .idea-detail__owner-actions {
        display: flex;
        gap: 0.5rem;
        flex-shrink: 0;
      }
      .idea-detail__owner-actions .is-danger {
        color: var(--color-danger);
        border-color: var(--color-danger);
      }
      .idea-detail__meta {
        margin: 0.5rem 0 0;
        color: var(--color-text-faint);
        font-size: 0.85rem;
      }
      .idea-detail__section-title {
        font-size: 0.95rem;
        font-weight: 600;
        margin: 1.75rem 0 0.75rem;
      }
      .idea-detail__description {
        margin: 0;
        color: var(--color-text);
        line-height: 1.6;
        white-space: pre-wrap;
      }
      .idea-detail__divider {
        border: none;
        border-top: 1px solid var(--color-border);
        margin: 2rem 0 0;
      }
      .comment-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .comment-form {
        margin-top: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .comment-form__actions {
        display: flex;
        justify-content: flex-end;
      }
    `
  ]
})
export class IdeaDetailsComponent implements OnInit {
  readonly commentMax = COMMENT_MAX;

  readonly loading = signal(true);
  readonly commentsLoading = signal(true);
  readonly errorMessage = signal('');
  readonly idea = signal<IdeaWithAuthor | null>(null);
  readonly comments = signal<CommentWithAuthor[]>([]);
  readonly postingComment = signal(false);
  readonly commentError = signal('');
  readonly confirmingDelete = signal(false);
  readonly deletingIdea = signal(false);
  newComment = '';

  private ideaId!: number;

  constructor(
    readonly auth: AuthService,
    private readonly ideaService: IdeaService,
    private readonly commentService: CommentService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  isOwner(): boolean {
    return this.idea()?.created_by === this.auth.currentUserId();
  }

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.ideaId = Number(idParam);
    await this.loadIdea();
    await this.loadComments();
  }

  private async loadIdea(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const idea = await this.ideaService.getIdeaById(this.ideaId);
      if (!idea) {
        this.errorMessage.set('This idea could not be found.');
        return;
      }
      this.idea.set(idea);
    } catch {
      this.errorMessage.set('Something went wrong while loading this idea. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadComments(): Promise<void> {
    this.commentsLoading.set(true);
    try {
      const comments = await this.commentService.getCommentsForIdea(this.ideaId);
      this.comments.set(comments);
    } catch {
      this.commentError.set('Something went wrong while loading comments.');
    } finally {
      this.commentsLoading.set(false);
    }
  }

  async postComment(): Promise<void> {
    const text = this.newComment.trim();
    const userId = this.auth.currentUserId();
    if (!text || !userId || this.postingComment()) return;

    this.postingComment.set(true);
    this.commentError.set('');

    try {
      const comment = await this.commentService.createComment(this.ideaId, userId, text);
      this.comments.set([...this.comments(), comment]);
      this.newComment = '';
      const current = this.idea();
      if (current) {
        this.idea.set({ ...current, commentCount: (current.commentCount ?? 0) + 1 });
      }
    } catch {
      this.commentError.set('Something went wrong while posting your comment. Please try again.');
    } finally {
      this.postingComment.set(false);
    }
  }

  async updateComment(event: { comment: CommentWithAuthor; text: string }): Promise<void> {
    try {
      const updated = await this.commentService.updateComment(event.comment.id, event.text);
      this.comments.set(this.comments().map((c) => (c.id === updated.id ? updated : c)));
    } catch {
      this.commentError.set('Something went wrong while updating your comment. Please try again.');
    }
  }

  async deleteComment(comment: CommentWithAuthor): Promise<void> {
    try {
      await this.commentService.deleteComment(comment.id);
      this.comments.set(this.comments().filter((c) => c.id !== comment.id));
      const current = this.idea();
      if (current) {
        this.idea.set({ ...current, commentCount: Math.max(0, (current.commentCount ?? 1) - 1) });
      }
    } catch {
      this.commentError.set('Something went wrong while deleting this comment. Please try again.');
    }
  }

  async deleteIdea(idea: IdeaWithAuthor): Promise<void> {
    this.deletingIdea.set(true);
    try {
      await this.ideaService.deleteIdea(idea.id);
      await this.router.navigate(['/dashboard']);
    } catch {
      this.errorMessage.set('Something went wrong while deleting this idea. Please try again.');
      this.confirmingDelete.set(false);
    } finally {
      this.deletingIdea.set(false);
    }
  }
}
