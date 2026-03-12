import { useState, useCallback, useEffect } from 'react';
import { Subject, StudyTask, StudySettings, StreakData } from '@/lib/types';
import { storage } from '@/lib/storage';
import { generateStudyPlan, rescheduleUnfinished } from '@/lib/studyPlannerEngine';

export function useStudyPlanner() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [settings, setSettings] = useState<StudySettings | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [s, t, set, str] = await Promise.all([
      storage.getSubjects(),
      storage.getTasks(),
      storage.getSettings(),
      storage.getStreak(),
    ]);
    setSubjects(s);
    setTasks(t);
    setSettings(set);
    setStreak(str);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addSubject = useCallback(async (subject: Omit<Subject, 'id' | 'completed_topics'>) => {
    const newSubject: Subject = {
      ...subject,
      id: `subj-${Date.now()}`,
      completed_topics: 0,
    };
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    await storage.setSubjects(updated);
  }, [subjects]);

  const deleteSubject = useCallback(async (id: string) => {
    const updatedSubjects = subjects.filter((s) => s.id !== id);
    const updatedTasks = tasks.filter((t) => t.subject_id !== id);
    setSubjects(updatedSubjects);
    setTasks(updatedTasks);
    await Promise.all([
      storage.setSubjects(updatedSubjects),
      storage.setTasks(updatedTasks),
    ]);
  }, [subjects, tasks]);

  const generatePlan = useCallback(async () => {
    if (!settings) return;
    const newTasks = generateStudyPlan(subjects, settings);
    setTasks(newTasks);
    await storage.setTasks(newTasks);
  }, [subjects, settings]);

  const completeTask = useCallback(async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isNowCompleted = !task.completed;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: isNowCompleted } : t
    );
    
    const updatedSubjects = subjects.map((s) =>
      s.id === task.subject_id
        ? {
            ...s,
            completed_topics: s.completed_topics + (isNowCompleted ? 1 : -1),
          }
        : s
    );

    setTasks(updatedTasks);
    setSubjects(updatedSubjects);

    const promises: Promise<void>[] = [
      storage.setTasks(updatedTasks),
      storage.setSubjects(updatedSubjects),
    ];

    if (isNowCompleted && streak) {
      const today = new Date().toLocaleDateString('en-CA');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      let newCurrent = streak.current_streak;
      if (streak.last_study_date === today) {
        // Already studied today
      } else if (streak.last_study_date === yesterdayStr || streak.last_study_date === null) {
        newCurrent += 1;
      } else {
        newCurrent = 1;
      }

      const updatedStreak = {
        current_streak: newCurrent,
        longest_streak: Math.max(streak.longest_streak, newCurrent),
        last_study_date: today,
      };
      setStreak(updatedStreak);
      promises.push(storage.setStreak(updatedStreak));
    }

    await Promise.all(promises);
  }, [tasks, subjects, streak]);

  const doReschedule = useCallback(async () => {
    if (!settings) return;
    const updatedTasks = rescheduleUnfinished(tasks, subjects, settings);
    setTasks(updatedTasks);
    await storage.setTasks(updatedTasks);
  }, [tasks, subjects, settings]);

  const updateSettings = useCallback(async (newSettings: StudySettings) => {
    setSettings(newSettings);
    await storage.setSettings(newSettings);
  }, []);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayTasks = tasks.filter((t) => t.scheduled_date === todayStr);
  const totalCompleted = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  return {
    subjects,
    tasks,
    settings: settings || {
      hours_available_per_day: 3,
      preferred_study_days_per_week: 5,
      start_date: new Date().toLocaleDateString('en-CA'),
      custom_holidays: [0, 6],
    },
    streak: streak || { current_streak: 0, longest_streak: 0, last_study_date: null },
    loading,
    todayTasks,
    totalCompleted,
    totalTasks,
    addSubject,
    deleteSubject,
    generatePlan,
    completeTask,
    doReschedule,
    updateSettings,
  };
}
