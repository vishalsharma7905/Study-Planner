import { useState } from 'react';
import { Subject, StudyTask } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tasks: StudyTask[];
  subjects: Subject[];
  onCompleteTask: (id: string) => void;
}

function toDateStr(d: Date) {
  return d.toLocaleDateString('en-CA');
}

function getSubjectName(subjects: Subject[], id: string) {
  return subjects.find((s) => s.id === id)?.name || 'Unknown';
}

export default function CalendarView({ tasks, subjects, onCompleteTask }: CalendarViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const todayStr = toDateStr(today);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {months[startOfWeek.getMonth()]} {startOfWeek.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, i) => {
          const dateStr = toDateStr(day);
          const dayTasks = tasks.filter((t) => t.scheduled_date === dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div key={i} className="space-y-2">
              <div
                className={`text-center py-2 rounded-lg text-sm font-medium ${
                  isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                <div>{dayNames[i]}</div>
                <div className="text-lg font-bold">{day.getDate()}</div>
              </div>
              <div className="space-y-1.5 min-h-[100px]">
                {dayTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`p-2 text-xs space-y-1 cursor-pointer transition-all hover:shadow-md ${
                      task.completed ? 'opacity-50' : ''
                    }`}
                    onClick={() => onCompleteTask(task.id)}
                  >
                    <div className="flex items-center gap-1.5">
                      <Checkbox checked={task.completed} className="h-3 w-3" />
                      <span className={`font-medium truncate ${task.completed ? 'line-through' : ''}`}>
                        {getSubjectName(subjects, task.subject_id)}
                      </span>
                    </div>
                    <p className="text-muted-foreground">Topic {task.topic_number}</p>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
