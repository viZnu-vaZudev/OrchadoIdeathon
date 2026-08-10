import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-card__title">IdeaHub</h1>
        <p class="auth-card__subtitle">Log in to see what your team is working on.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              [attr.aria-invalid]="showError('email')"
              [attr.aria-describedby]="showError('email') ? 'email-error' : null"
            />
            @if (showError('email')) {
              <p class="field__error" id="email-error">Enter a valid email address.</p>
            }
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              [attr.aria-invalid]="showError('password')"
              [attr.aria-describedby]="showError('password') ? 'password-error' : null"
            />
            @if (showError('password')) {
              <p class="field__error" id="password-error">Enter your password.</p>
            }
          </div>

          @if (errorMessage()) {
            <p class="form-error" role="alert">{{ errorMessage() }}</p>
          }

          <button type="submit" class="btn btn--primary btn--block" [disabled]="submitting()">
            {{ submitting() ? 'Logging in...' : 'Log in' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: var(--color-bg);
      }
      .auth-card {
        width: 100%;
        max-width: 380px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 2rem 1.75rem;
        box-shadow: var(--shadow-sm);
      }
      .auth-card__title {
        margin: 0 0 0.35rem;
        font-size: 1.4rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      .auth-card__subtitle {
        margin: 0 0 1.5rem;
        color: var(--color-text-muted);
        font-size: 0.9rem;
      }
      .btn--block {
        width: 100%;
        margin-top: 0.25rem;
      }
    `
  ]
})
export class LoginComponent {
  readonly form: FormGroup;

  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly router: Router) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  showError(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();
    const result = await this.auth.login(email, password);

    this.submitting.set(false);

    if (!result.success) {
      this.errorMessage.set(result.error ?? 'Something went wrong while logging in. Please try again.');
      return;
    }

    await this.router.navigate(['/dashboard']);
  }
}
