export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          created_at: string
          title: string
          type: string
          status: 'todo' | 'in-progress' | 'done' | 'not-started' | 'to-submit'
          date: string
          class_id: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          type: string
          status: 'todo' | 'in-progress' | 'done' | 'not-started' | 'to-submit'
          date: string
          class_id: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          type?: string
          status?: 'todo' | 'in-progress' | 'done' | 'not-started' | 'to-submit'
          date?: string
          class_id?: string
          user_id?: string
        }
      }
      classes: {
        Row: {
          id: string
          created_at: string
          name: string
          code: string
          color: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          code: string
          color: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          code?: string
          color?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 