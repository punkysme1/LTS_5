import { createClient } from '@supabase/supabase-js';
import { Manuscript, BlogPost, Comment, GuestbookEntry } from './types';

// Mendefinisikan tipe Database untuk type-safety dengan Supabase
export interface Database {
  public: {
    Tables: {
      manuscripts: {
        Row: Manuscript;
        Insert: Omit<Manuscript, 'id' | 'created_at'>;
        Update: Partial<Omit<Manuscript, 'id' | 'created_at'>>;
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Omit<BlogPost, 'id' | 'created_at' | 'comments'>;
        Update: Partial<Omit<BlogPost, 'id' | 'created_at' | 'comments'>>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at'>;
        Update: Partial<Omit<Comment, 'id' | 'created_at'>>;
      };
      guestbook_entries: {
        Row: GuestbookEntry;
        Insert: Omit<GuestbookEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<GuestbookEntry, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
