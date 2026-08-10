import { Profile } from './profile.model';

export interface Comment {
  id: number;
  idea_id: number;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface CommentWithAuthor extends Comment {
  author?: Profile;
}
