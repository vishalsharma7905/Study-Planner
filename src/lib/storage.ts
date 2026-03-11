import { Subject, StudyTask, StudySettings, StreakData } from './types';

const KEYS = {
  subjects: 'studyplanner_subjects',
  tasks: 'studyplanner_tasks',
  settings: 'studyplanner_settings',
  streak: 'studyplanner_streak',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  getSubjects: (): Subject[] => load(KEYS.subjects, []),
  setSubjects: (s: Subject[]) => save(KEYS.subjects, s),

  getTasks: (): StudyTask[] => load(KEYS.tasks, []),
  setTasks: (t: StudyTask[]) => save(KEYS.tasks, t),

  getSettings: (): StudySettings => {
    const defaultSettings = {
      hours_available_per_day: 3,
      preferred_study_days_per_week: 5,
      start_date: new Date().toLocaleDateString('en-CA'),
      custom_holidays: [0, 6], // Default to Saturday and Sunday as breaks
    };
    const loaded = load<StudySettings>(KEYS.settings, defaultSettings);
    if (!loaded.custom_holidays) {
      loaded.custom_holidays = [0, 6];
    }
    return loaded;
  },
  setSettings: (s: StudySettings) => save(KEYS.settings, s),

  getStreak: (): StreakData =>
    load(KEYS.streak, { current_streak: 0, longest_streak: 0, last_study_date: null }),
  setStreak: (s: StreakData) => save(KEYS.streak, s),
};
