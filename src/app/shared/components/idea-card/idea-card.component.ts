import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IdeaWithAuthor } from '../../../core/models/idea.model';
import { FriendlyDatePipe } from '../../pipes/friendly-date.pipe';

@Component({
  selector: 'app-idea-card',
  standalone: true,
  imports: [RouterLink, FriendlyDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="idea-card">

      <!-- Header -->
      <div class="idea-card__header">

        <div class="author">
          <div
            class="author__avatar"
            [style.background]="avatarColor"
          >
            {{ initials }}
          </div>

          <div class="author__info">
            <span class="author__name">
              {{ idea.author?.username ?? 'Unknown' }}
            </span>

            <span class="author__date">
              {{ idea.created_at | friendlyDate }}
            </span>
          </div>
        </div>

        @if (isOwner) {
          <div class="idea-card__menu">

            <button
              type="button"
              class="menu-trigger"
              (click)="menuOpen.set(!menuOpen())"
              [attr.aria-expanded]="menuOpen()"
              aria-label="Idea actions"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            @if (menuOpen()) {
              <div class="menu-panel" role="menu">

                <button
                  type="button"
                  role="menuitem"
                  (click)="onEdit()"
                >
                  <span class="menu-icon">✎</span>
                  Edit
                </button>

                <button
                  type="button"
                  role="menuitem"
                  class="is-danger"
                  (click)="onDelete()"
                >
                  <span class="menu-icon">⌫</span>
                  Delete
                </button>

              </div>
            }

          </div>
        }

      </div>


      <!-- Idea content -->
      <div class="idea-card__content">

        <a
          [routerLink]="['/ideas', idea.id]"
          class="idea-card__link"
        >
          <h3 class="idea-card__title">
            {{ idea.title }}
          </h3>

          <p class="idea-card__description">
            {{ idea.description }}
          </p>
        </a>

      </div>


      <!-- Footer -->
      <div class="idea-card__footer">

        <div class="idea-card__status">
          <span class="status-dot"></span>
          Idea
        </div>

        <div class="idea-card__stats">

          <div class="comment-count">
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
              <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.65 9.65 0 0 1-4-.8L3 21l1.8-4.4A8.2 8.2 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/>
            </svg>

            <span>
              {{ idea.commentCount ?? 0 }}
            </span>

            <span class="comment-label">
              {{ (idea.commentCount ?? 0) === 1 ? 'comment' : 'comments' }}
            </span>
          </div>

          <span class="view-arrow">
            →
          </span>

        </div>

      </div>

    </article>
  `,

  styles: [
    `
      /* =========================
         CARD
      ========================= */

      .idea-card {
        position: relative;
        display: flex;
        flex-direction: column;
        min-height: 220px;

        padding: 1.25rem;

        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;

        transition:
          transform 0.18s ease,
          border-color 0.18s ease,
          box-shadow 0.18s ease;
      }

      .idea-card:hover {
        transform: translateY(-2px);
        border-color: var(--color-border-strong);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
      }


      /* =========================
         HEADER
      ========================= */

      .idea-card__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .author {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        min-width: 0;
      }

      .author__avatar {
        width: 38px;
        height: 38px;

        flex: 0 0 38px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 50%;

        color: white;
        font-size: 0.78rem;
        font-weight: 700;

        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,0.2);
      }

      .author__info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        min-width: 0;
      }

      .author__name {
        color: var(--color-text);
        font-size: 0.85rem;
        font-weight: 600;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .author__date {
        color: var(--color-text-faint);
        font-size: 0.72rem;
      }


      /* =========================
         CONTENT
      ========================= */

      .idea-card__content {
        flex: 1;

        margin-top: 1.15rem;
      }

      .idea-card__link {
        display: block;

        color: inherit;
        text-decoration: none;
      }

      .idea-card__title {
        margin: 0;

        color: var(--color-text);

        font-size: 1.05rem;
        font-weight: 650;
        line-height: 1.4;

        letter-spacing: -0.01em;

        transition: color 0.15s ease;
      }

      .idea-card:hover .idea-card__title {
        color: var(--color-accent);
      }

      .idea-card__description {
        margin: 0.55rem 0 0;

        color: var(--color-text-muted);

        font-size: 0.84rem;
        line-height: 1.55;

        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;

        overflow: hidden;
      }


      /* =========================
         FOOTER
      ========================= */

      .idea-card__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin-top: 1.2rem;
        padding-top: 0.9rem;

        border-top: 1px solid var(--color-border);
      }

      .idea-card__status {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;

        color: var(--color-text-faint);

        font-size: 0.73rem;
        font-weight: 500;
      }

      .status-dot {
        width: 6px;
        height: 6px;

        border-radius: 50%;

        background: var(--color-accent);
      }

      .idea-card__stats {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .comment-count {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;

        color: var(--color-text-muted);

        font-size: 0.75rem;
        font-weight: 500;
      }

      .comment-count svg {
        color: var(--color-text-faint);
      }

      .comment-label {
        margin-left: 1px;
      }

      .view-arrow {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 26px;
        height: 26px;

        border-radius: 50%;

        color: var(--color-text-muted);
        background: var(--color-surface-muted);

        font-size: 0.9rem;

        transition:
          transform 0.15s ease,
          background 0.15s ease;
      }

      .idea-card:hover .view-arrow {
        transform: translateX(2px);
        background: var(--color-border);
      }


      /* =========================
         MENU
      ========================= */

      .idea-card__menu {
        position: relative;
        z-index: 5;
      }

      .menu-trigger {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;

        width: 32px;
        height: 32px;

        padding: 0;

        border: 1px solid transparent;
        border-radius: 8px;

        background: transparent;

        cursor: pointer;
      }

      .menu-trigger:hover {
        background: var(--color-surface-muted);
        border-color: var(--color-border);
      }

      .menu-trigger span {
        width: 3px;
        height: 3px;

        border-radius: 50%;

        background: var(--color-text-muted);
      }

      .menu-panel {
        position: absolute;

        top: 38px;
        right: 0;

        min-width: 140px;

        padding: 0.3rem;

        background: var(--color-surface);

        border: 1px solid var(--color-border);
        border-radius: 10px;

        box-shadow: var(--shadow-md);

        overflow: hidden;
      }

      .menu-panel button {
        width: 100%;

        display: flex;
        align-items: center;
        gap: 0.55rem;

        padding: 0.55rem 0.65rem;

        border: none;
        border-radius: 6px;

        background: transparent;

        color: var(--color-text);

        font-size: 0.8rem;
        text-align: left;

        cursor: pointer;
      }

      .menu-panel button:hover {
        background: var(--color-surface-muted);
      }

      .menu-panel button.is-danger {
        color: var(--color-danger);
      }

      .menu-icon {
        width: 18px;
        text-align: center;
        opacity: 0.7;
      }


      /* =========================
         MOBILE
      ========================= */

      @media (max-width: 600px) {

        .idea-card {
          padding: 1rem;
          min-height: 200px;
          border-radius: 14px;
        }

        .author__avatar {
          width: 34px;
          height: 34px;
          flex-basis: 34px;
          font-size: 0.7rem;
        }

        .idea-card__title {
          font-size: 0.98rem;
        }

        .idea-card__description {
          font-size: 0.82rem;
        }

        .comment-label {
          display: none;
        }

      }
    `
  ]
})
export class IdeaCardComponent {

  @Input({ required: true }) idea!: IdeaWithAuthor;

  @Input() isOwner = false;

  @Output() edit = new EventEmitter<IdeaWithAuthor>();

  @Output() delete = new EventEmitter<IdeaWithAuthor>();

  readonly menuOpen = signal(false);


  /**
   * Generate initials from username
   * Example:
   * john.doe -> JD
   * john -> J
   */
  get initials(): string {

    const username = this.idea.author?.username?.trim();

    if (!username) {
      return '?';
    }

    const parts = username
      .split(/[\s._-]+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) +
        parts[1].charAt(0)
      ).toUpperCase();
    }

    return username
      .substring(0, 2)
      .toUpperCase();
  }


  /**
   * Generate a consistent avatar color
   * based on the username.
   *
   * So the same user always gets
   * the same avatar color.
   */
  get avatarColor(): string {

    const username =
      this.idea.author?.username ?? 'unknown';

    let hash = 0;

    for (let i = 0; i < username.length; i++) {
      hash =
        username.charCodeAt(i) +
        ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;

    return `
      linear-gradient(
        135deg,
        hsl(${hue} 70% 55%),
        hsl(${(hue + 35) % 360} 70% 45%)
      )
    `;
  }


  onEdit(): void {
    this.menuOpen.set(false);
    this.edit.emit(this.idea);
  }


  onDelete(): void {
    this.menuOpen.set(false);
    this.delete.emit(this.idea);
  }
}