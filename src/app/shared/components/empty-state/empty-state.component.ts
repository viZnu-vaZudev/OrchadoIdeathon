import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <p class="empty-state__title">{{ title }}</p>
      @if (message) {
        <p class="empty-state__message">{{ message }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .empty-state {
        text-align: center;
        padding: 2.5rem 1.5rem;
        border: 1px dashed var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface);
      }
      .empty-state__title {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--color-text);
        margin: 0 0 0.35rem;
      }
      .empty-state__message {
        color: var(--color-text-muted);
        font-size: 0.875rem;
        margin: 0 0 1rem;
      }
    `
  ]
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input() message = '';
}
