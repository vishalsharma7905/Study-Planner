export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Subject {
  id: string;
  name: string;
  difficulty: Difficulty;
  exam_date: string; // ISO date string
  total_topics: number;
  completed_topics: number;
  topic_titles?: string[];
}

export interface StudyTask {
  id: string;
  subject_id: string;
  topic_number: number;
  topic_title?: string;
  scheduled_date: string; // ISO date string
  completed: boolean;
  estimated_minutes: number;
}

export interface StudySettings {
  hours_available_per_day: number;
  max_topics_per_day?: number;
  preferred_study_days_per_week: number; // Keeping for legacy/display purposes
  start_date: string;
  custom_holidays?: number[]; // Array of day indices to skip (0 = Sunday, 1 = Monday, etc)
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
}
