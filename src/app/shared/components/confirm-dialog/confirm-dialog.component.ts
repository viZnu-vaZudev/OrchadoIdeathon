import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dialog-backdrop" (click)="cancel.emit()">
      <div
        class="dialog"
        role="alertdialog"
        aria-modal="true"
        [attr.aria-labelledby]="'dialog-title'"
        (click)="$event.stopPropagation()"
      >
        <h2 id="dialog-title" class="dialog__title">{{ title }}</h2>
        <p class="dialog__message">{{ message }}</p>
        <div class="dialog__actions">
          <button type="button" class="btn btn--ghost" (click)="cancel.emit()">Cancel</button>
          <button type="button" class="btn btn--danger" [disabled]="busy" (click)="confirm.emit()">
            {{ busy ? 'Deleting...' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.25rem;
        z-index: 50;
      }
      .dialog {
        width: 100%;
        max-width: 380px;
        background: var(--color-surface);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
      }
      .dialog__title {
        margin: 0 0 0.5rem;
        font-size: 1.05rem;
        font-weight: 600;
      }
      .dialog__message {
        margin: 0 0 1.25rem;
        color: var(--color-text-muted);
        font-size: 0.9rem;
        line-height: 1.5;
      }
      .dialog__actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.6rem;
      }
    `
  ]
})
export class ConfirmDialogComponent {
  @Input() title = 'Are you sure?';
  @Input() message = '';
  @Input() confirmLabel = 'Delete';
  @Input() busy = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
