import { Profile } from './profile.model';

export interface Idea {
  id: number;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface IdeaWithAuthor extends Idea {
  author?: Profile;
  commentCount?: number;
}
