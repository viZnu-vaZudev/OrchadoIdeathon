import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IdeaService } from '../../../core/services/idea.service';

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 4000;

@Component({
  selector: 'app-create-idea',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page--narrow">
      <h1 class="page__title">{{ ideaId ? 'Edit Idea' : 'Create Idea' }}</h1>

      @if (loadingIdea()) {
        <p class="status-text">Loading idea...</p>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="idea-form">
          <div class="field">
            <label for="title">Title</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              [attr.maxlength]="titleMax"
              [attr.aria-invalid]="showError('title')"
              [attr.aria-describedby]="showError('title') ? 'title-error' : null"
            />
            @if (showError('title')) {
              <p class="field__error" id="title-error">Title is required.</p>
            }
          </div>

          <div class="field">
            <label for="description">Description</label>
            <textarea
              id="description"
              rows="8"
              formControlName="description"
              [attr.maxlength]="descriptionMax"
              [attr.aria-invalid]="showError('description')"
              [attr.aria-describedby]="showError('description') ? 'description-error' : null"
            ></textarea>
            @if (showError('description')) {
              <p class="field__error" id="description-error">Description is required.</p>
            }
          </div>

          @if (errorMessage()) {
            <p class="form-error" role="alert">{{ errorMessage() }}</p>
          }

          <div class="idea-form__actions">
            <button type="button" class="btn btn--ghost" (click)="cancel()">Cancel</button>
            <button type="submit" class="btn btn--primary" [disabled]="submitting()">
              {{ submitting() ? (ideaId ? 'Saving...' : 'Creating...') : ideaId ? 'Save Changes' : 'Create Idea' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .page--narrow {
        max-width: 640px;
      }
      .page__title {
        font-size: 1.35rem;
        font-weight: 700;
        margin: 0 0 1.5rem;
        letter-spacing: -0.01em;
      }
      .idea-form {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
      }
      .idea-form__actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    `
  ]
})
export class CreateIdeaComponent implements OnInit {
  readonly titleMax = TITLE_MAX;
  readonly descriptionMax = DESCRIPTION_MAX;

  readonly form: FormGroup;

  readonly submitting = signal(false);
  readonly loadingIdea = signal(false);
  readonly errorMessage = signal('');
  ideaId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly ideaService: IdeaService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.form = this.fb.nonNullable.group({
      title: ['', [Validators.required, Validators.maxLength(TITLE_MAX)]],
      description: ['', [Validators.required, Validators.maxLength(DESCRIPTION_MAX)]]
    });
  }

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    this.ideaId = Number(idParam);
    this.loadingIdea.set(true);
    try {
      const idea = await this.ideaService.getIdeaById(this.ideaId);
      if (!idea || idea.created_by !== this.auth.currentUserId()) {
        await this.router.navigate(['/dashboard']);
        return;
      }
      this.form.setValue({ title: idea.title, description: idea.description });
    } catch {
      this.errorMessage.set('Something went wrong while loading this idea. Please try again.');
    } finally {
      this.loadingIdea.set(false);
    }
  }

  showError(controlName: 'title' | 'description'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const userId = this.auth.currentUserId();
    if (!userId) return;

    const title = this.form.controls['title'].value.trim();
    const description = this.form.controls['description'].value.trim();

    if (!title || !description) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      if (this.ideaId) {
        await this.ideaService.updateIdea(this.ideaId, title, description);
        await this.router.navigate(['/ideas', this.ideaId]);
      } else {
        const idea = await this.ideaService.createIdea(title, description, userId);
        await this.router.navigate(['/ideas', idea.id]);
      }
    } catch {
      this.errorMessage.set('Something went wrong while saving this idea. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  cancel(): void {
    void this.router.navigate(this.ideaId ? ['/ideas', this.ideaId] : ['/dashboard']);
  }
}
