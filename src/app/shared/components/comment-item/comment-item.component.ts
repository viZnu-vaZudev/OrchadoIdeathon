import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommentWithAuthor } from '../../../core/models/comment.model';
import { FriendlyDatePipe } from '../../pipes/friendly-date.pipe';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [FormsModule, FriendlyDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li class="comment-item">
      <div class="comment-item__header">
        <span class="comment-item__author">{{ comment.author?.username ?? 'Unknown' }}</span>
        <span class="comment-item__date">{{ comment.created_at | friendlyDate }}</span>
      </div>

      @if (editing()) {
        <div class="comment-item__edit">
          <label class="sr-only" [attr.for]="'edit-comment-' + comment.id">Edit comment</label>
          <textarea
            [id]="'edit-comment-' + comment.id"
            class="textarea"
            rows="3"
            maxlength="1000"
            [(ngModel)]="draft"
          ></textarea>
          <div class="comment-item__edit-actions">
            <button type="button" class="btn btn--ghost" (click)="cancelEdit()">Cancel</button>
            <button
              type="button"
              class="btn btn--primary"
              [disabled]="!draft.trim()"
              (click)="saveEdit()"
            >
              Save
            </button>
          </div>
        </div>
      } @else {
        <p class="comment-item__text">{{ comment.comment }}</p>
      }

      @if (isOwner && !editing()) {
        <div class="comment-item__actions">
          <button type="button" class="link-btn" (click)="startEdit()">Edit</button>
          <button type="button" class="link-btn is-danger" (click)="delete.emit(comment)">Delete</button>
        </div>
      }
    </li>
  `,
  styles: [
    `
      .comment-item {
        list-style: none;
        padding: 0.9rem 0;
        border-bottom: 1px solid var(--color-border-subtle);
      }
      .comment-item:last-child {
        border-bottom: none;
      }
      .comment-item__header {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        margin-bottom: 0.3rem;
      }
      .comment-item__author {
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--color-text);
      }
      .comment-item__date {
        font-size: 0.78rem;
        color: var(--color-text-faint);
      }
      .comment-item__text {
        margin: 0;
        font-size: 0.9rem;
        color: var(--color-text);
        line-height: 1.55;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .comment-item__actions {
        display: flex;
        gap: 0.9rem;
        margin-top: 0.4rem;
      }
      .comment-item__edit {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .comment-item__edit-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
    `
  ]
})
export class CommentItemComponent {
  @Input({ required: true }) comment!: CommentWithAuthor;
  @Input() isOwner = false;
  @Output() update = new EventEmitter<{ comment: CommentWithAuthor; text: string }>();
  @Output() delete = new EventEmitter<CommentWithAuthor>();

  readonly editing = signal(false);
  draft = '';

  startEdit(): void {
    this.draft = this.comment.comment;
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  saveEdit(): void {
    const text = this.draft.trim();
    if (!text) return;
    this.update.emit({ comment: this.comment, text });
    this.editing.set(false);
  }
}
