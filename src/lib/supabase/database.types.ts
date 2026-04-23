import type { Json } from './json';

export interface Database {
  public: {
    Tables: {
      study_states: {
        Row: {
          user_id: string;
          study_state: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          study_state: Json;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          study_state?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
