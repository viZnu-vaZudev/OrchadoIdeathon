import { Injectable, signal, computed } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Profile } from '../models/profile.model';

export interface AuthResult {
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _session = signal<Session | null>(null);
  private readonly _profile = signal<Profile | null>(null);
  private readonly _initialized = signal(false);

  readonly session = this._session.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly initialized = this._initialized.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());
  readonly currentUserId = computed(() => this._session()?.user.id ?? null);

  private initPromise: Promise<void> | null = null;

  constructor(private readonly supabase: SupabaseService) {
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      if (session?.user) {
        void this.loadProfile(session.user);
      } else {
        this._profile.set(null);
      }
    });
  }

  /** Restores any persisted session on app startup. Call once, before the router activates guards. */
  init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.supabase.client.auth.getSession().then(async ({ data }) => {
        this._session.set(data.session);
        if (data.session?.user) {
          await this.loadProfile(data.session.user);
        }
        this._initialized.set(true);
      });
    }
    return this.initPromise;
  }

  private async loadProfile(user: User): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('id, username, email, created_at')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      this._profile.set(data as Profile);
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error || !data.session) {
      return { success: false, error: 'Incorrect email or password. Please try again.' };
    }

    this._session.set(data.session);
    await this.loadProfile(data.session.user);
    return { success: true };
  }

  async logout(): Promise<void> {
    await this.supabase.client.auth.signOut();
    this._session.set(null);
    this._profile.set(null);
  }
}
