import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CommentWithAuthor } from '../models/comment.model';

const COMMENT_SELECT = 'id, idea_id, user_id, comment, created_at, author:profiles(id, username, email, created_at)';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private readonly supabase: SupabaseService) {}

  async getCommentsForIdea(ideaId: number): Promise<CommentWithAuthor[]> {
    const { data, error } = await this.supabase.client
      .from('comments')
      .select(COMMENT_SELECT)
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as CommentWithAuthor[];
  }

  async createComment(ideaId: number, userId: string, text: string): Promise<CommentWithAuthor> {
    const { data, error } = await this.supabase.client
      .from('comments')
      .insert({ idea_id: ideaId, user_id: userId, comment: text })
      .select(COMMENT_SELECT)
      .single();

    if (error) throw error;
    return data as unknown as CommentWithAuthor;
  }

  async updateComment(id: number, text: string): Promise<CommentWithAuthor> {
    const { data, error } = await this.supabase.client
      .from('comments')
      .update({ comment: text })
      .eq('id', id)
      .select(COMMENT_SELECT)
      .single();

    if (error) throw error;
    return data as unknown as CommentWithAuthor;
  }

  async deleteComment(id: number): Promise<void> {
    const { error } = await this.supabase.client.from('comments').delete().eq('id', id);
    if (error) throw error;
  }

  async getCommentCount(ideaId: number): Promise<number> {
    const { count, error } = await this.supabase.client
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('idea_id', ideaId);

    if (error) throw error;
    return count ?? 0;
  }
}
