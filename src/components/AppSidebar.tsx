import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Settings,
  Flame,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type View = 'dashboard' | 'calendar' | 'subjects' | 'settings';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  streak: number;
  onCreateClick: () => void;
}

const navItems: { view: View; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'calendar', label: 'Calendar', icon: CalendarDays },
  { view: 'subjects', label: 'Subjects', icon: BookOpen },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar({ currentView, onViewChange, streak, onCreateClick }: SidebarProps) {
  return (
    <aside className="flex flex-col w-64 min-h-screen bg-card border-r border-border p-6">
      <div className="mb-10 flex items-center gap-2">
        <BookOpen className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Exam Study Planner</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              currentView === view
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-2 px-4 py-3 bg-accent rounded-lg">
          <Flame className="h-5 w-5 text-warning" />
          <span className="text-sm font-semibold">{streak} day streak</span>
        </div>
        <Button onClick={onCreateClick} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>
    </aside>
  );
}
