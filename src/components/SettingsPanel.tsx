import { StudySettings } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface SettingsPanelProps {
  settings: StudySettings;
  onUpdate: (settings: StudySettings) => void;
  onGeneratePlan: () => void;
  onReschedule: () => void;
  hasSubjects: boolean;
  hasTasks: boolean;
}

export default function SettingsPanel({
  settings,
  onUpdate,
  onGeneratePlan,
  onReschedule,
  hasSubjects,
  hasTasks,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <h2 className="text-lg font-semibold">Study Settings</h2>

      <Card className="p-6 space-y-4">
        <div>
          <Label>Hours Available Per Day</Label>
          <Input
            type="number"
            min={1}
            max={12}
            value={settings.hours_available_per_day}
            onChange={(e) =>
              onUpdate({ ...settings, hours_available_per_day: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label className="mb-3 block">Break Days</Label>
          <ToggleGroup 
            type="multiple" 
            value={(settings.custom_holidays || []).map(String)}
            onValueChange={(values) => {
              const newHolidays = values.map(Number);
              onUpdate({ ...settings, custom_holidays: newHolidays });
            }}
            className="justify-start gap-1 flex-wrap"
          >
            <ToggleGroupItem value="1" aria-label="Toggle Monday">M</ToggleGroupItem>
            <ToggleGroupItem value="2" aria-label="Toggle Tuesday">T</ToggleGroupItem>
            <ToggleGroupItem value="3" aria-label="Toggle Wednesday">W</ToggleGroupItem>
            <ToggleGroupItem value="4" aria-label="Toggle Thursday">T</ToggleGroupItem>
            <ToggleGroupItem value="5" aria-label="Toggle Friday">F</ToggleGroupItem>
            <ToggleGroupItem value="6" aria-label="Toggle Saturday">S</ToggleGroupItem>
            <ToggleGroupItem value="0" aria-label="Toggle Sunday">S</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={settings.start_date}
            onChange={(e) => onUpdate({ ...settings, start_date: e.target.value })}
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={onGeneratePlan} disabled={!hasSubjects} className="flex-1">
          Generate Study Plan
        </Button>
        <Button variant="outline" onClick={onReschedule} disabled={!hasTasks}>
          Reschedule Missed
        </Button>
      </div>
    </div>
  );
}
