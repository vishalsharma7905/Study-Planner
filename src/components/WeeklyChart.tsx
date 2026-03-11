import { StudyTask } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  tasks: StudyTask[];
}

export default function WeeklyChart({ tasks }: Props) {
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get last 7 days
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('en-CA');
    const completed = tasks.filter((t) => t.scheduled_date === dateStr && t.completed).length;
    const total = tasks.filter((t) => t.scheduled_date === dateStr).length;
    return {
      day: dayNames[d.getDay()],
      completed,
      total,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar dataKey="completed" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} name="Completed" />
        <Bar dataKey="total" fill="hsl(262, 40%, 90%)" radius={[4, 4, 0, 0]} name="Total" />
      </BarChart>
    </ResponsiveContainer>
  );
}
