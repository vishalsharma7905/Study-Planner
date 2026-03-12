import { Subject, StudyTask, StudySettings, StreakData } from './types';
import { supabase } from './supabase';

export const storage = {
  getSubjects: async (): Promise<Subject[]> => {
    const { data, error } = await supabase.from('subjects').select('*');
    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
    return data || [];
  },
  
  setSubjects: async (subjects: Subject[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const subjectsWithUser = subjects.map(s => ({ ...s, user_id: user.id }));
    const { error } = await supabase.from('subjects').upsert(subjectsWithUser);
    if (error) console.error('Error saving subjects:', error);
  },

  getTasks: async (): Promise<StudyTask[]> => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    return data || [];
  },

  setTasks: async (tasks: StudyTask[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tasksWithUser = tasks.map(t => ({ ...t, user_id: user.id }));
    const { error } = await supabase.from('tasks').upsert(tasksWithUser);
    if (error) console.error('Error saving tasks:', error);
  },

  getSettings: async (): Promise<StudySettings> => {
    const defaultSettings: StudySettings = {
      hours_available_per_day: 3,
      preferred_study_days_per_week: 5,
      start_date: new Date().toLocaleDateString('en-CA'),
      custom_holidays: [0, 6],
    };

    const { data, error } = await supabase.from('settings').select('*').single();
    if (error || !data) {
      if (error && error.code !== 'PGRST116') console.error('Error fetching settings:', error);
      return defaultSettings;
    }
    return data;
  },

  setSettings: async (settings: StudySettings) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const settingsWithUser = { ...settings, user_id: user.id };
    const { error } = await supabase.from('settings').upsert(settingsWithUser);
    if (error) console.error('Error saving settings:', error);
  },

  getStreak: async (): Promise<StreakData> => {
    const defaultStreak: StreakData = { current_streak: 0, longest_streak: 0, last_study_date: null };
    const { data, error } = await supabase.from('streaks').select('*').single();
    if (error || !data) {
      if (error && error.code !== 'PGRST116') console.error('Error fetching streak:', error);
      return defaultStreak;
    }
    return data;
  },

  setStreak: async (streak: StreakData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const streakWithUser = { ...streak, user_id: user.id };
    const { error } = await supabase.from('streaks').upsert(streakWithUser);
    if (error) console.error('Error saving streak:', error);
  },
};
