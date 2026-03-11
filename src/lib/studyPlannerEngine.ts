import { Subject, StudyTask, StudySettings } from './types';

const DIFFICULTY_WEIGHT: Record<string, number> = {
  hard: 3,
  medium: 2,
  easy: 1,
};

const TOPICS_PER_SESSION = 1;
const MINUTES_PER_TOPIC: Record<string, number> = {
  hard: 45,
  medium: 30,
  easy: 20,
};

function getStudyDays(startDate: Date, endDate: Date, customHolidays: number[]): Date[] {
  const days: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    if (!customHolidays.includes(current.getDay())) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateStudyPlan(
  subjects: Subject[],
  settings: StudySettings
): StudyTask[] {
  if (subjects.length === 0) return [];

  const startDate = new Date(settings.start_date);
  startDate.setHours(0, 0, 0, 0);

  // Find the latest exam date
  const latestExam = new Date(
    Math.max(...subjects.map((s) => new Date(s.exam_date).getTime()))
  );

  const studyDays = getStudyDays(startDate, latestExam, settings.custom_holidays || [0, 6]);
  if (studyDays.length === 0) return [];

  const totalMinutesPerDay = settings.hours_available_per_day * 60;
  const tasks: StudyTask[] = [];
  let taskId = 1;

  // Build a queue of sessions per subject
  type Session = { subject: Subject; topicNumber: number; priority: number };
  const sessions: Session[] = [];

  for (const subject of subjects) {
    const remainingTopics = subject.total_topics - subject.completed_topics;
    const daysRemaining = Math.max(
      1,
      Math.ceil(
        (new Date(subject.exam_date).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const weight = DIFFICULTY_WEIGHT[subject.difficulty] || 1;
    const priorityScore = weight / daysRemaining;

    for (let i = 0; i < remainingTopics; i++) {
      sessions.push({
        subject,
        topicNumber: subject.completed_topics + i + 1,
        priority: priorityScore,
      });
    }
  }

  // Sort by priority (highest first)
  sessions.sort((a, b) => b.priority - a.priority);

  // Distribute sessions across study days
  const dayMinutesUsed: Record<string, number> = {};

  for (const session of sessions) {
    const examDate = new Date(session.subject.exam_date);
    // Find the first available study day before exam with capacity
    const estimatedMinutes = MINUTES_PER_TOPIC[session.subject.difficulty] || 30;

    for (const day of studyDays) {
      if (day > examDate) continue;
      const dateStr = toDateStr(day);
      const used = dayMinutesUsed[dateStr] || 0;
      if (used + estimatedMinutes <= totalMinutesPerDay) {
        dayMinutesUsed[dateStr] = used + estimatedMinutes;
        tasks.push({
          id: `task-${taskId++}`,
          subject_id: session.subject.id,
          topic_number: session.topicNumber,
          scheduled_date: dateStr,
          completed: false,
          estimated_minutes: estimatedMinutes,
        });
        break;
      }
    }
  }

  // Sort tasks by date, then by priority
  tasks.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));

  return tasks;
}

export function rescheduleUnfinished(
  tasks: StudyTask[],
  subjects: Subject[],
  settings: StudySettings
): StudyTask[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  const missedTasks = tasks.filter(
    (t) => !t.completed && t.scheduled_date < todayStr
  );
  const futureTasks = tasks.filter(
    (t) => t.completed || t.scheduled_date >= todayStr
  );

  if (missedTasks.length === 0) return tasks;

  const latestExam = new Date(
    Math.max(...subjects.map((s) => new Date(s.exam_date).getTime()))
  );
  const studyDays = getStudyDays(today, latestExam, settings.custom_holidays || [0, 6]);
  const totalMinutesPerDay = settings.hours_available_per_day * 60;

  // Calculate existing usage per day
  const dayMinutesUsed: Record<string, number> = {};
  for (const t of futureTasks) {
    if (!t.completed) {
      dayMinutesUsed[t.scheduled_date] = (dayMinutesUsed[t.scheduled_date] || 0) + t.estimated_minutes;
    }
  }

  // Reschedule missed tasks
  for (const missed of missedTasks) {
    for (const day of studyDays) {
      const dateStr = toDateStr(day);
      const used = dayMinutesUsed[dateStr] || 0;
      if (used + missed.estimated_minutes <= totalMinutesPerDay) {
        dayMinutesUsed[dateStr] = used + missed.estimated_minutes;
        missed.scheduled_date = dateStr;
        break;
      }
    }
  }

  return [...futureTasks, ...missedTasks].sort(
    (a, b) => a.scheduled_date.localeCompare(b.scheduled_date)
  );
}
