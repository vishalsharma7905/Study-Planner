import { useState } from 'react';
import { Subject, Difficulty } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, ListChecks } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SubjectManagerProps {
  subjects: Subject[];
  onAdd: (subject: Omit<Subject, 'id' | 'completed_topics'>) => void;
  onDelete: (id: string) => void;
  showAddDialog: boolean;
  onShowAddDialog: (v: boolean) => void;
}

const difficultyColors: Record<Difficulty, string> = {
  hard: 'bg-destructive/10 text-destructive',
  medium: 'bg-warning/10 text-warning',
  easy: 'bg-success/10 text-success',
};

export default function SubjectManager({ subjects, onAdd, onDelete, showAddDialog, onShowAddDialog }: SubjectManagerProps) {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [examDate, setExamDate] = useState('');
  const [totalTopics, setTotalTopics] = useState(10);
  const [topicTitlesText, setTopicTitlesText] = useState('');

  const handleTopicTitlesChange = (text: string) => {
    setTopicTitlesText(text);
    const titles = text.split('\n').filter(line => line.trim() !== '');
    if (titles.length > 0) {
      setTotalTopics(titles.length);
    }
  };

  const handleAdd = () => {
    if (!name || !examDate) return;
    const topic_titles = topicTitlesText.split('\n').filter(line => line.trim() !== '');
    const finalTotalTopics = topic_titles.length > 0 ? topic_titles.length : totalTopics;
    
    onAdd({ 
      name, 
      difficulty, 
      exam_date: examDate, 
      total_topics: finalTotalTopics,
      topic_titles: topic_titles.length > 0 ? topic_titles : undefined
    });
    
    setName('');
    setDifficulty('medium');
    setExamDate('');
    setTotalTopics(10);
    setTopicTitlesText('');
    onShowAddDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Subjects ({subjects.length})</h2>
        <Dialog open={showAddDialog} onOpenChange={onShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Exam Date</Label>
                  <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Total Topics</Label>
                  <Input 
                    type="number" 
                    value={totalTopics} 
                    onChange={(e) => setTotalTopics(Number(e.target.value))} 
                    min={1} 
                    disabled={topicTitlesText.split('\n').filter(line => line.trim() !== '').length > 0}
                  />
                  {topicTitlesText.split('\n').filter(line => line.trim() !== '').length > 0 && (
                    <p className="text-[10px] text-muted-foreground italic">Controlled by topic list</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                    Topic Names (Optional)
                  </Label>
                  <span className="text-[10px] text-muted-foreground">One topic per line</span>
                </div>
                <Textarea 
                  placeholder="Topic 1&#10;Topic 2&#10;Topic 3..." 
                  value={topicTitlesText} 
                  onChange={(e) => handleTopicTitlesChange(e.target.value)}
                  className="min-h-[120px] font-mono text-xs"
                />
              </div>

              <Button onClick={handleAdd} className="w-full mt-2">Create Study Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No subjects added yet. Click "Add Subject" to get started!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((s) => {
            const progress = s.total_topics > 0 ? Math.round((s.completed_topics / s.total_topics) * 100) : 0;
            const daysLeft = Math.ceil(
              (new Date(s.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            return (
              <Card key={s.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Exam: {new Date(s.exam_date).toLocaleDateString()} ({daysLeft}d left)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={difficultyColors[s.difficulty]}>{s.difficulty}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {s.completed_topics}/{s.total_topics} topics completed ({progress}%)
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
