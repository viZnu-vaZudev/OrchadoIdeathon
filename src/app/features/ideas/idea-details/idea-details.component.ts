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
    <main class="idea-page">

      @if (loading()) {
        <section class="state-card">
          <div class="state-card__spinner" aria-hidden="true"></div>
          <h2>Loading idea</h2>
          <p>Please wait while we load the idea details.</p>
        </section>
      } @else if (errorMessage() && !idea()) {
        <section class="state-card state-card--error" role="alert">
          <div class="state-card__icon">!</div>
          <h2>Unable to load idea</h2>
          <p>{{ errorMessage() }}</p>
          <a routerLink="/dashboard" class="btn btn--primary">Back to dashboard</a>
        </section>
      } @else {
        @if (idea(); as ideaValue) {

          <div class="page-shell">

            <a routerLink="/dashboard" class="back-link">
              <span class="back-link__icon" aria-hidden="true">←</span>
              <span>Back to ideas</span>
            </a>

            <article class="idea-card">

              <!-- Hero -->
              <header class="idea-hero">

                <div class="idea-hero__main">
                  <div class="idea-badge">
                    <span class="idea-badge__dot"></span>
                    Idea
                  </div>

                  <h1 class="idea-title">
                    {{ ideaValue.title }}
                  </h1>

                  <div class="idea-meta">
                    <div class="author">
                      <div class="author__avatar">
                        {{ (ideaValue.author?.username ?? 'U').charAt(0).toUpperCase() }}
                      </div>

                      <div class="author__details">
                        <span class="author__name">
                          {{ ideaValue.author?.username ?? 'Unknown' }}
                        </span>
                        <span class="author__label">Idea creator</span>
                      </div>
                    </div>

                    <span class="meta-separator">•</span>

                    <span class="idea-date">
                      {{ ideaValue.created_at | friendlyDate }}
                    </span>
                  </div>
                </div>

                @if (isOwner()) {
                  <div class="idea-actions">

                    <a
                      [routerLink]="['/ideas', ideaValue.id, 'edit']"
                      class="action-btn action-btn--secondary"
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
                        aria-hidden="true"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                      </svg>
                      Edit
                    </a>

                    <button
                      type="button"
                      class="action-btn action-btn--danger"
                      (click)="confirmingDelete.set(true)"
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
                        aria-hidden="true"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="m19 6-1 14H6L5 6" />
                        <path d="M10 11v5" />
                        <path d="M14 11v5" />
                      </svg>
                      Delete
                    </button>

                  </div>
                }
              </header>


              <!-- Description -->
              <section class="content-section">

                <div class="section-heading">
                  <div class="section-heading__icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                      <path d="M14 2v6h6" />
                      <path d="M8 13h8" />
                      <path d="M8 17h6" />
                    </svg>
                  </div>

                  <div>
                    <span class="section-heading__eyebrow">OVERVIEW</span>
                    <h2>Description</h2>
                  </div>
                </div>

                <div class="description-card">
                  <p>{{ ideaValue.description }}</p>
                </div>

              </section>


              <!-- Comments -->
              <section class="content-section comments-section">

                <div class="section-heading">
                  <div class="section-heading__icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8Z" />
                    </svg>
                  </div>

                  <div class="section-heading__copy">
                    <span class="section-heading__eyebrow">DISCUSSION</span>
                    <div class="section-heading__row">
                      <h2>Comments</h2>
                      <span class="comment-count">
                        {{ ideaValue.commentCount ?? comments().length }}
                      </span>
                    </div>
                  </div>
                </div>


                @if (commentsLoading()) {

                  <div class="comments-loading">
                    <div class="loading-line loading-line--wide"></div>
                    <div class="loading-line"></div>
                    <div class="loading-line loading-line--short"></div>
                  </div>

                } @else if (comments().length) {

                  <ul class="comment-list">
                    @for (comment of comments(); track comment.id) {
                      <li class="comment-list__item">
                        <app-comment-item
                          [comment]="comment"
                          [isOwner]="comment.user_id === auth.currentUserId()"
                          (update)="updateComment($event)"
                          (delete)="deleteComment($event)"
                        />
                      </li>
                    }
                  </ul>

                } @else {

                  <div class="empty-comments">
                    <app-empty-state
                      title="No comments yet"
                      message="Start the discussion and share your thoughts."
                    />
                  </div>

                }


                <!-- Add comment -->
                <div class="comment-composer">

                  <div class="composer__header">
                    <div class="composer__avatar">
                      {{ (auth.profile()?.username ?? 'U').charAt(0).toUpperCase() }}
                    </div>

                    <div>
                      <strong>Add to the discussion</strong>
                      <span>Share feedback, questions or suggestions.</span>
                    </div>
                  </div>

                  <label
                    class="sr-only"
                    for="new-comment"
                  >
                    Write your comment
                  </label>

                  <textarea
                    id="new-comment"
                    class="comment-input"
                    rows="4"
                    placeholder="Write your comment..."
                    [attr.maxlength]="commentMax"
                    [(ngModel)]="newComment"
                  ></textarea>

                  <div class="composer__footer">

                    <div class="composer__hint">
                      <span>{{ newComment.length }}</span>/{{ commentMax }}
                    </div>

                    @if (commentError()) {
                      <p class="form-error" role="alert">
                        {{ commentError() }}
                      </p>
                    }

                    <button
                      type="button"
                      class="comment-submit"
                      [disabled]="!newComment.trim() || postingComment()"
                      (click)="postComment()"
                    >
                      @if (postingComment()) {
                        <span class="button-spinner"></span>
                        Posting...
                      } @else {
                        <svg
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
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                        Comment
                      }
                    </button>

                  </div>

                </div>

              </section>

            </article>

          </div>
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

    </main>
  `,
  styles: [
    `
      :host {
        --idea-primary: #0f9f91;
        --idea-primary-dark: #087f74;
        --idea-primary-soft: #e9f7f5;
        --idea-text: #172b2b;
        --idea-muted: #708080;
        --idea-faint: #9aa9a9;
        --idea-border: #e5ecec;
        --idea-surface: #ffffff;
        --idea-page: #f7f9f9;
        --idea-danger: #c84c4c;
        display: block;
      }

      .idea-page {
        min-height: calc(100vh - 72px);
        padding: clamp(1.5rem, 4vw, 3rem) 1rem 4rem;
        background:
          radial-gradient(circle at 10% 0%, rgba(15, 159, 145, 0.06), transparent 28rem),
          var(--idea-page);
      }

      .page-shell {
        width: min(920px, 100%);
        margin: 0 auto;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        margin: 0 0 1rem 2px;
        color: var(--idea-muted);
        text-decoration: none;
        font-size: 0.78rem;
        font-weight: 650;
        transition: color .18s ease, transform .18s ease;
      }

      .back-link:hover {
        color: var(--idea-text);
        transform: translateX(-2px);
      }

      .back-link__icon {
        font-size: 1rem;
        line-height: 1;
      }

      .idea-card {
        overflow: hidden;
        border: 1px solid var(--idea-border);
        border-radius: 20px;
        background: var(--idea-surface);
        box-shadow: 0 18px 55px rgba(25, 55, 55, .07);
      }

      .idea-hero {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 2rem;
        padding: clamp(1.4rem, 4vw, 2.25rem);
        border-bottom: 1px solid var(--idea-border);
        background:
          linear-gradient(135deg, #fff 0%, #fbfdfd 70%, #f3faf9 100%);
      }

      .idea-hero__main {
        min-width: 0;
      }

      .idea-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        margin-bottom: .8rem;
        padding: 5px 9px;
        border-radius: 999px;
        color: var(--idea-primary-dark);
        background: var(--idea-primary-soft);
        font-size: .65rem;
        font-weight: 750;
        letter-spacing: .06em;
        text-transform: uppercase;
      }

      .idea-badge__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--idea-primary);
      }

      .idea-title {
        max-width: 700px;
        margin: 0;
        color: var(--idea-text);
        font-size: clamp(1.45rem, 3vw, 2rem);
        font-weight: 760;
        line-height: 1.2;
        letter-spacing: -.035em;
        overflow-wrap: anywhere;
      }

      .idea-meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 1.15rem;
      }

      .author {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .author__avatar,
      .composer__avatar {
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: var(--idea-primary-dark);
        background: var(--idea-primary-soft);
        font-weight: 750;
      }

      .author__avatar {
        width: 30px;
        height: 30px;
        font-size: .65rem;
      }

      .author__details {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      .author__name {
        color: var(--idea-text);
        font-size: .72rem;
        font-weight: 700;
      }

      .author__label,
      .idea-date {
        color: var(--idea-faint);
        font-size: .62rem;
        font-weight: 500;
      }

      .meta-separator {
        color: #c6d0d0;
        font-size: .7rem;
      }

      .idea-actions {
        display: flex;
        flex-shrink: 0;
        gap: 7px;
      }

      .action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        min-height: 34px;
        padding: 0 11px;
        border-radius: 9px;
        font-size: .68rem;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        transition: transform .18s ease, background .18s ease, border-color .18s ease;
      }

      .action-btn:hover {
        transform: translateY(-1px);
      }

      .action-btn--secondary {
        border: 1px solid var(--idea-border);
        color: var(--idea-text);
        background: #fff;
      }

      .action-btn--secondary:hover {
        border-color: #cfdada;
        background: #f8fafa;
      }

      .action-btn--danger {
        border: 1px solid #f0dada;
        color: var(--idea-danger);
        background: #fffafa;
      }

      .action-btn--danger:hover {
        border-color: #e7c3c3;
        background: #fff3f3;
      }

      .content-section {
        padding: clamp(1.35rem, 4vw, 2.1rem);
      }

      .comments-section {
        border-top: 1px solid var(--idea-border);
      }

      .section-heading {
        display: flex;
        align-items: center;
        gap: 11px;
        margin-bottom: 1rem;
      }

      .section-heading__icon {
        width: 35px;
        height: 35px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        border-radius: 10px;
        color: var(--idea-primary-dark);
        background: var(--idea-primary-soft);
      }

      .section-heading__eyebrow {
        display: block;
        margin-bottom: 2px;
        color: var(--idea-faint);
        font-size: .56rem;
        font-weight: 750;
        letter-spacing: .1em;
      }

      .section-heading h2 {
        margin: 0;
        color: var(--idea-text);
        font-size: .95rem;
        font-weight: 730;
        letter-spacing: -.015em;
      }

      .section-heading__row {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .comment-count {
        min-width: 19px;
        height: 19px;
        display: inline-grid;
        place-items: center;
        padding: 0 5px;
        border-radius: 999px;
        color: var(--idea-muted);
        background: #f1f4f4;
        font-size: .58rem;
        font-weight: 700;
      }

      .description-card {
        padding: 1.15rem 1.2rem;
        border: 1px solid var(--idea-border);
        border-radius: 13px;
        background: #fbfcfc;
      }

      .description-card p {
        margin: 0;
        color: #334747;
        font-size: .86rem;
        line-height: 1.75;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .comment-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .comment-list__item {
        padding: 0;
      }

      .empty-comments {
        padding: .25rem 0 .5rem;
      }

      .comments-loading {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: .8rem 0 1.1rem;
      }

      .loading-line {
        height: 10px;
        width: 72%;
        border-radius: 999px;
        background: linear-gradient(90deg, #edf2f2, #f7f9f9, #edf2f2);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      .loading-line--wide { width: 92%; }
      .loading-line--short { width: 45%; }

      @keyframes shimmer {
        from { background-position: 200% 0; }
        to { background-position: -200% 0; }
      }

      .comment-composer {
        margin-top: 1.5rem;
        padding: 1rem;
        border: 1px solid var(--idea-border);
        border-radius: 15px;
        background: #fafcfc;
      }

      .composer__header {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: .8rem;
      }

      .composer__avatar {
        width: 30px;
        height: 30px;
        flex: 0 0 auto;
        font-size: .62rem;
      }

      .composer__header div:last-child {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .composer__header strong {
        color: var(--idea-text);
        font-size: .7rem;
      }

      .composer__header span {
        color: var(--idea-faint);
        font-size: .61rem;
      }

      .comment-input {
        display: block;
        width: 100%;
        min-height: 100px;
        box-sizing: border-box;
        resize: vertical;
        padding: .85rem .9rem;
        border: 1px solid #dce5e5;
        border-radius: 10px;
        outline: none;
        color: var(--idea-text);
        background: #fff;
        font: inherit;
        font-size: .76rem;
        line-height: 1.55;
        transition: border-color .18s ease, box-shadow .18s ease;
      }

      .comment-input::placeholder {
        color: #a7b3b3;
      }

      .comment-input:focus {
        border-color: rgba(15, 159, 145, .55);
        box-shadow: 0 0 0 3px rgba(15, 159, 145, .09);
      }

      .composer__footer {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: .65rem;
      }

      .composer__hint {
        color: var(--idea-faint);
        font-size: .59rem;
      }

      .form-error {
        flex: 1;
        margin: 0;
        color: var(--idea-danger);
        font-size: .65rem;
        line-height: 1.4;
      }

      .comment-submit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        min-height: 35px;
        margin-left: auto;
        padding: 0 13px;
        border: 0;
        border-radius: 9px;
        color: #fff;
        background: linear-gradient(135deg, var(--idea-primary), var(--idea-primary-dark));
        box-shadow: 0 6px 14px rgba(15, 159, 145, .18);
        font-size: .67rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform .18s ease, opacity .18s ease, box-shadow .18s ease;
      }

      .comment-submit:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 18px rgba(15, 159, 145, .23);
      }

      .comment-submit:disabled {
        opacity: .45;
        cursor: not-allowed;
        box-shadow: none;
      }

      .button-spinner,
      .state-card__spinner {
        display: block;
        border: 2px solid rgba(255,255,255,.45);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin .7s linear infinite;
      }

      .button-spinner {
        width: 12px;
        height: 12px;
      }

      .state-card__spinner {
        width: 25px;
        height: 25px;
        color: var(--idea-primary);
        border-color: rgba(15,159,145,.2);
        border-top-color: var(--idea-primary);
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .state-card {
        width: min(520px, calc(100% - 2rem));
        margin: 5rem auto;
        padding: 2rem;
        text-align: center;
        border: 1px solid var(--idea-border);
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 18px 50px rgba(25,55,55,.06);
      }

      .state-card__spinner,
      .state-card__icon {
        margin: 0 auto 1rem;
      }

      .state-card__icon {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: var(--idea-danger);
        background: #fff0f0;
        font-weight: 800;
      }

      .state-card h2 {
        margin: 0;
        color: var(--idea-text);
        font-size: 1rem;
      }

      .state-card p {
        margin: .5rem 0 1.2rem;
        color: var(--idea-muted);
        font-size: .75rem;
        line-height: 1.55;
      }

      .state-card--error .btn {
        display: inline-flex;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 36px;
        padding: 0 13px;
        border-radius: 9px;
        text-decoration: none;
        font-size: .68rem;
        font-weight: 700;
      }

      .btn--primary {
        color: #fff;
        background: var(--idea-primary);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0,0,0,0);
        white-space: nowrap;
        border: 0;
      }

      @media (max-width: 700px) {
        .idea-page {
          min-height: calc(100vh - 64px);
          padding: 1rem .75rem 2.5rem;
        }

        .idea-card {
          border-radius: 15px;
        }

        .idea-hero {
          flex-direction: column;
          gap: 1.15rem;
          padding: 1.2rem;
        }

        .idea-actions {
          width: 100%;
        }

        .action-btn {
          flex: 1;
        }

        .content-section {
          padding: 1.2rem;
        }
      }

      @media (max-width: 420px) {
        .idea-meta {
          gap: 7px;
        }

        .idea-title {
          font-size: 1.35rem;
        }

        .composer__footer {
          flex-wrap: wrap;
        }

        .comment-submit {
          width: 100%;
          margin-left: 0;
        }

        .form-error {
          order: 3;
          flex-basis: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation: none !important;
          transition: none !important;
        }
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