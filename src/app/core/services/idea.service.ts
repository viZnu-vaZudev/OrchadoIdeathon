import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Idea, IdeaWithAuthor } from '../models/idea.model';
import { environment } from '../../../environments/environment';

const IDEA_SELECT = 'id, title, description, created_by, created_at, updated_at, author:profiles(id, username, email, created_at), comments(count)';

interface IdeaRow extends Idea {
  author: { id: string; username: string; email?: string; created_at: string } | null;
  comments: { count: number }[];
}

function mapRow(row: IdeaRow): IdeaWithAuthor {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: row.author ?? undefined,
    commentCount: row.comments?.[0]?.count ?? 0
  };
}

@Injectable({ providedIn: 'root' })
export class IdeaService {
  constructor(private readonly supabase: SupabaseService) {}

  /** Newest ideas across the whole team, most recent first. */
  async getLatestIdeas(limit = 6): Promise<IdeaWithAuthor[]> {
    const { data, error } = await this.supabase.client
      .from('ideas')
      .select(IDEA_SELECT)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as unknown as IdeaRow[]).map(mapRow);
  }

  /** Ideas created by the given user, most recent first. */
  async getUserIdeas(userId: string, limit?: number): Promise<IdeaWithAuthor[]> {
    let query = this.supabase.client
      .from('ideas')
      .select(IDEA_SELECT)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as IdeaRow[]).map(mapRow);
  }

  /** Ideas created by teammates other than the given user. */
  async getOtherIdeas(userId: string, limit?: number): Promise<IdeaWithAuthor[]> {
    let query = this.supabase.client
      .from('ideas')
      .select(IDEA_SELECT)
      .neq('created_by', userId)
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as IdeaRow[]).map(mapRow);
  }

  async getIdeaById(id: number): Promise<IdeaWithAuthor | null> {
    const { data, error } = await this.supabase.client
      .from('ideas')
      .select(IDEA_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRow(data as unknown as IdeaRow) : null;
  }

  async createIdea(title: string, description: string, userId: string): Promise<Idea> {
    const { data, error } = await this.supabase.client
      .from('ideas')
      .insert({ title, description, created_by: userId })
      .select('id, title, description, created_by, created_at, updated_at')
      .single();

    if (error) throw error;
    // Trigger notification via Supabase Edge Function if configured
    try {
      const fnUrl = environment.edgeFunctionUrl || (window as any)?.__env__?.SUPABASE_EDGE_FUNCTION_URL;
      if (fnUrl) {
        // fire-and-forget
        fetch(fnUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ideaId: data.id, excludeUserId: userId, title: data.title, body: data.description, url: `/ideas/${data.id}` })
        }).catch((e) => console.error('Edge function notify error', e));
      }
    } catch (e) {
      console.warn('Could not trigger edge function', e);
    }
    return data as Idea;
  }

  async updateIdea(id: number, title: string, description: string): Promise<Idea> {
    const { data, error } = await this.supabase.client
      .from('ideas')
      .update({ title, description, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, title, description, created_by, created_at, updated_at')
      .single();

    if (error) throw error;
    return data as Idea;
  }

  async deleteIdea(id: number): Promise<void> {
    const { error } = await this.supabase.client.from('ideas').delete().eq('id', id);
    if (error) throw error;
  }
}
