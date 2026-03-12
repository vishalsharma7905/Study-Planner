import { Subject, StudyTask, StreakData } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Flame, TrendingUp, BookOpen } from 'lucide-react';
import WeeklyChart from './WeeklyChart';

interface DashboardProps {
  subjects: Subject[];
  todayTasks: StudyTask[];
  allTasks: StudyTask[];
  streak: StreakData;
  totalCompleted: number;
  totalTasks: number;
  onCompleteTask: (id: string) => void;
}

function getSubjectName(subjects: Subject[], id: string) {
  return subjects.find((s) => s.id === id)?.name || 'Unknown';
}

function getDifficultyColor(subjects: Subject[], id: string) {
  const diff = subjects.find((s) => s.id === id)?.difficulty;
  if (diff === 'hard') return 'bg-destructive/10 text-destructive';
  if (diff === 'medium') return 'bg-warning/10 text-warning';
  return 'bg-success/10 text-success';
}

export default function Dashboard({
  subjects,
  todayTasks,
  allTasks,
  streak,
  totalCompleted,
  totalTasks,
  onCompleteTask,
}: DashboardProps) {
  const upcomingExams = subjects
    .filter((s) => new Date(s.exam_date) >= new Date())
    .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())
    .slice(0, 4);

  const overallProgress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today's Tasks</p>
            <p className="text-2xl font-bold">{todayTasks.length}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Overall Progress</p>
            <p className="text-2xl font-bold">{overallProgress}%</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning/10">
            <Flame className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-bold">{streak.current_streak} days</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent">
            <CalendarDays className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Longest Streak</p>
            <p className="text-2xl font-bold">{streak.longest_streak} days</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's tasks */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Today's Study Plan</h2>
          {todayTasks.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No tasks scheduled for today. Generate a study plan to get started!
            </Card>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`p-4 flex items-center gap-4 transition-all ${task.completed ? 'opacity-60' : ''}`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => onCompleteTask(task.id)}
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                      {getSubjectName(subjects, task.subject_id)} – {task.topic_title || `Topic ${task.topic_number}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{task.estimated_minutes} min</p>
                  </div>
                  <Badge variant="secondary" className={getDifficultyColor(subjects, task.subject_id)}>
                    {subjects.find((s) => s.id === task.subject_id)?.difficulty}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming exams */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Upcoming Exams</h2>
          {upcomingExams.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground text-sm">
              No upcoming exams
            </Card>
          ) : (
            <div className="space-y-2">
              {upcomingExams.map((s) => {
                const daysLeft = Math.ceil(
                  (new Date(s.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const progress = s.total_topics > 0 ? Math.round((s.completed_topics / s.total_topics) * 100) : 0;
                return (
                  <Card key={s.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">{s.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {daysLeft}d left
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {s.completed_topics}/{s.total_topics} topics
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Subject Progress + Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Subject Progress</h2>
          {subjects.map((s) => {
            const progress = s.total_topics > 0 ? Math.round((s.completed_topics / s.total_topics) * 100) : 0;
            return (
              <Card key={s.id} className="p-4 space-y-2">
                <div className="flex justify-between">
                  <p className="font-medium text-sm">{s.name}</p>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </Card>
            );
          })}
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Weekly Study Activity</h2>
          <Card className="p-4">
            <WeeklyChart tasks={allTasks} />
          </Card>
        </div>
      </div>
    </div>
  );
}
