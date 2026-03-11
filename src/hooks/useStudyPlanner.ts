import { useState, useCallback, useEffect } from 'react';
import { Subject, StudyTask, StudySettings, StreakData } from '@/lib/types';
import { storage } from '@/lib/storage';
import { generateStudyPlan, rescheduleUnfinished } from '@/lib/studyPlannerEngine';

export function useStudyPlanner() {
  const [subjects, setSubjects] = useState<Subject[]>(storage.getSubjects);
  const [tasks, setTasks] = useState<StudyTask[]>(storage.getTasks);
  const [settings, setSettings] = useState<StudySettings>(storage.getSettings);
  const [streak, setStreak] = useState<StreakData>(storage.getStreak);

  useEffect(() => storage.setSubjects(subjects), [subjects]);
  useEffect(() => storage.setTasks(tasks), [tasks]);
  useEffect(() => storage.setSettings(settings), [settings]);
  useEffect(() => storage.setStreak(streak), [streak]);

  const addSubject = useCallback((subject: Omit<Subject, 'id' | 'completed_topics'>) => {
    const newSubject: Subject = {
      ...subject,
      id: `subj-${Date.now()}`,
      completed_topics: 0,
    };
    setSubjects((prev) => [...prev, newSubject]);
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.filter((t) => t.subject_id !== id));
  }, []);

  const generatePlan = useCallback(() => {
    const newTasks = generateStudyPlan(subjects, settings);
    setTasks(newTasks);
  }, [subjects, settings]);

  const completeTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );

      // Update subject completed_topics
      const task = prev.find((t) => t.id === taskId);
      if (task) {
        const isNowCompleted = !task.completed;
        setSubjects((prevSubjects) =>
          prevSubjects.map((s) =>
            s.id === task.subject_id
              ? {
                  ...s,
                  completed_topics: s.completed_topics + (isNowCompleted ? 1 : -1),
                }
              : s
          )
        );

        // Update streak
        if (isNowCompleted) {
          const today = new Date().toLocaleDateString('en-CA');
          setStreak((prev) => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString('en-CA');

            let newCurrent = prev.current_streak;
            if (prev.last_study_date === today) {
              // Already studied today
            } else if (prev.last_study_date === yesterdayStr || prev.last_study_date === null) {
              newCurrent += 1;
            } else {
              newCurrent = 1;
            }

            return {
              current_streak: newCurrent,
              longest_streak: Math.max(prev.longest_streak, newCurrent),
              last_study_date: today,
            };
          });
        }
      }

      return updated;
    });
  }, []);

  const doReschedule = useCallback(() => {
    setTasks((prev) => rescheduleUnfinished(prev, subjects, settings));
  }, [subjects, settings]);

  const updateSettings = useCallback((newSettings: StudySettings) => {
    setSettings(newSettings);
  }, []);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayTasks = tasks.filter((t) => t.scheduled_date === todayStr);
  const totalCompleted = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  return {
    subjects,
    tasks,
    settings,
    streak,
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
