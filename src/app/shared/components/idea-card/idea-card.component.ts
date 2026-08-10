import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
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
      <div class="idea-card__top">
        <h3 class="idea-card__title">
          <a [routerLink]="['/ideas', idea.id]" class="idea-card__link">{{ idea.title }}</a>
        </h3>

        @if (isOwner) {
          <div class="idea-card__menu">
            <button
              type="button"
              class="idea-card__menu-trigger"
              (click)="menuOpen.set(!menuOpen())"
              [attr.aria-expanded]="menuOpen()"
              aria-label="Idea actions"
            >
              ⋮
            </button>
            @if (menuOpen()) {
              <div class="idea-card__menu-panel" role="menu">
                <button type="button" role="menuitem" (click)="onEdit()">Edit</button>
                <button type="button" role="menuitem" class="is-danger" (click)="onDelete()">Delete</button>
              </div>
            }
          </div>
        }
      </div>

      <p class="idea-card__description">{{ idea.description }}</p>

      <div class="idea-card__meta">
        <span>Created by {{ idea.author?.username ?? 'Unknown' }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ idea.created_at | friendlyDate }}</span>
        <span class="idea-card__comments">💬 {{ idea.commentCount ?? 0 }} comment{{ (idea.commentCount ?? 0) === 1 ? '' : 's' }}</span>
      </div>
    </article>
  `,
  styles: [
    `
      .idea-card {
        position: relative;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface);
        padding: 1.1rem 1.15rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .idea-card:hover {
        border-color: var(--color-border-strong);
        box-shadow: var(--shadow-sm);
      }
      .idea-card__top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .idea-card__title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        line-height: 1.35;
      }
      .idea-card__link {
        color: var(--color-text);
        text-decoration: none;
      }
      .idea-card__link::after {
        content: '';
        position: absolute;
        inset: 0;
      }
      .idea-card__link:hover {
        color: var(--color-accent);
      }
      .idea-card__description {
        margin: 0;
        color: var(--color-text-muted);
        font-size: 0.875rem;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .idea-card__meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        color: var(--color-text-faint);
        margin-top: 0.25rem;
      }
      .idea-card__comments {
        margin-left: auto;
      }
      .idea-card__menu {
        position: relative;
        z-index: 2;
      }
      .idea-card__menu-trigger {
        background: none;
        border: 1px solid transparent;
        border-radius: var(--radius-sm);
        width: 1.75rem;
        height: 1.75rem;
        font-size: 1.05rem;
        line-height: 1;
        color: var(--color-text-muted);
        cursor: pointer;
      }
      .idea-card__menu-trigger:hover {
        border-color: var(--color-border);
        color: var(--color-text);
      }
      .idea-card__menu-panel {
        position: absolute;
        right: 0;
        top: 2rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-md);
        min-width: 8rem;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .idea-card__menu-panel button {
        background: none;
        border: none;
        text-align: left;
        padding: 0.55rem 0.85rem;
        font-size: 0.85rem;
        color: var(--color-text);
        cursor: pointer;
      }
      .idea-card__menu-panel button:hover {
        background: var(--color-surface-muted);
      }
      .idea-card__menu-panel button.is-danger {
        color: var(--color-danger);
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

  onEdit(): void {
    this.menuOpen.set(false);
    this.edit.emit(this.idea);
  }

  onDelete(): void {
    this.menuOpen.set(false);
    this.delete.emit(this.idea);
  }
}
