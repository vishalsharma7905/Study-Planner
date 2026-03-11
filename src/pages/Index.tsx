import { useState } from 'react';
import AppSidebar from '@/components/AppSidebar';
import Dashboard from '@/components/Dashboard';
import CalendarView from '@/components/CalendarView';
import SubjectManager from '@/components/SubjectManager';
import SettingsPanel from '@/components/SettingsPanel';
import { useStudyPlanner } from '@/hooks/useStudyPlanner';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';

type View = 'dashboard' | 'calendar' | 'subjects' | 'settings';

const Index = () => {
  const [view, setView] = useState<View>('dashboard');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const planner = useStudyPlanner();

  const handleCreateClick = () => {
    setView('subjects');
    setShowAddDialog(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        currentView={view}
        onViewChange={setView}
        streak={planner.streak.current_streak}
        onCreateClick={handleCreateClick}
      />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-10" />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              S
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          {view === 'dashboard' && (
            <Dashboard
              subjects={planner.subjects}
              todayTasks={planner.todayTasks}
              allTasks={planner.tasks}
              streak={planner.streak}
              totalCompleted={planner.totalCompleted}
              totalTasks={planner.totalTasks}
              onCompleteTask={planner.completeTask}
            />
          )}
          {view === 'calendar' && (
            <CalendarView
              tasks={planner.tasks}
              subjects={planner.subjects}
              onCompleteTask={planner.completeTask}
            />
          )}
          {view === 'subjects' && (
            <SubjectManager
              subjects={planner.subjects}
              onAdd={planner.addSubject}
              onDelete={planner.deleteSubject}
              showAddDialog={showAddDialog}
              onShowAddDialog={setShowAddDialog}
            />
          )}
          {view === 'settings' && (
            <SettingsPanel
              settings={planner.settings}
              onUpdate={planner.updateSettings}
              onGeneratePlan={planner.generatePlan}
              onReschedule={planner.doReschedule}
              hasSubjects={planner.subjects.length > 0}
              hasTasks={planner.tasks.length > 0}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
