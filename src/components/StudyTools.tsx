import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Timer as TimerIcon, StopCircle } from 'lucide-react';
import { toast } from 'sonner';

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setIsActive(false);
    setTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10">
      <div className="text-6xl font-mono font-bold tracking-tighter tabular-nums text-primary">
        {formatTime(time)}
      </div>
      <div className="flex gap-4">
        {!isActive ? (
          <Button size="lg" onClick={handleStart} className="rounded-full w-32 h-32 flex flex-col gap-2">
            <Play className="h-8 w-8" />
            <span>Start</span>
          </Button>
        ) : (
          <Button size="lg" onClick={handlePause} variant="outline" className="rounded-full w-32 h-32 flex flex-col gap-2">
            <Pause className="h-8 w-8" />
            <span>Pause</span>
          </Button>
        )}
        <Button size="lg" onClick={handleReset} variant="ghost" className="rounded-full w-32 h-32 flex flex-col gap-2">
          <RotateCcw className="h-8 w-8" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  );
};

const CountdownTimer = () => {
  const [inputMinutes, setInputMinutes] = useState('25');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success("Timer finished! Time for a break or a new task.", {
        duration: 5000,
      });
      // Play a subtle sound if possible or just notification
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleStart = () => {
    if (!isActive && timeLeft === initialTime) {
      const mins = parseInt(inputMinutes);
      if (isNaN(mins) || mins <= 0) {
        toast.error("Please enter a valid number of minutes.");
        return;
      }
      const totalSeconds = mins * 60;
      setTimeLeft(totalSeconds);
      setInitialTime(totalSeconds);
    }
    setIsActive(true);
  };

  const handlePause = () => setIsActive(false);
  
  const handleReset = () => {
    setIsActive(false);
    const mins = parseInt(inputMinutes) || 25;
    setTimeLeft(mins * 60);
    setInitialTime(mins * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10">
      {!isActive && timeLeft === initialTime ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              className="w-24 text-center text-2xl h-12 font-bold"
              min="1"
            />
            <span className="text-xl font-medium text-muted-foreground">minutes</span>
          </div>
          <p className="text-sm text-muted-foreground">Set your focus time</p>
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
             <svg className="w-64 h-64 transform -rotate-90">
                <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/20"
                />
                <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={754}
                    strokeDashoffset={754 - (754 * progress) / 100}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000 ease-linear"
                />
            </svg>
            <div className="absolute text-5xl font-mono font-bold tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
            </div>
        </div>
      )}

      <div className="flex gap-4">
        {!isActive ? (
          <Button size="lg" onClick={handleStart} className="rounded-full w-24 h-24 flex flex-col gap-1">
            <Play className="h-6 w-6" />
            <span className="text-xs">Start</span>
          </Button>
        ) : (
          <Button size="lg" onClick={handlePause} variant="outline" className="rounded-full w-24 h-24 flex flex-col gap-1">
            <Pause className="h-6 w-6" />
            <span className="text-xs">Pause</span>
          </Button>
        )}
        <Button size="lg" onClick={handleReset} variant="ghost" className="rounded-full w-24 h-24 flex flex-col gap-1">
          <RotateCcw className="h-6 w-6" />
          <span className="text-xs">Reset</span>
        </Button>
      </div>
    </div>
  );
};

export default function StudyTools() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Study Tools</h2>
        <p className="text-muted-foreground">Boost your productivity with our focus tools.</p>
      </div>

      <Card className="p-1">
        <Tabs defaultValue="stopwatch" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 p-1">
            <TabsTrigger value="stopwatch" className="text-base font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-md">
              <RotateCcw className="mr-2 h-4 w-4" />
              Stopwatch
            </TabsTrigger>
            <TabsTrigger value="timer" className="text-base font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-md">
              <TimerIcon className="mr-2 h-4 w-4" />
              Focus Timer
            </TabsTrigger>
          </TabsList>
          <TabsContent value="stopwatch" className="bg-card rounded-b-xl border-t-0 p-6 min-h-[400px] flex items-center justify-center">
            <Stopwatch />
          </TabsContent>
          <TabsContent value="timer" className="bg-card rounded-b-xl border-t-0 p-6 min-h-[400px] flex items-center justify-center">
            <CountdownTimer />
          </TabsContent>
        </Tabs>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <h3 className="font-semibold text-lg mb-2">Why use a timer?</h3>
            <p className="text-sm text-muted-foreground">
                Using techniques like Pomodoro (25 mins focus, 5 mins break) helps maintain high concentration levels and prevents burnout.
            </p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <h3 className="font-semibold text-lg mb-2">Track your speed</h3>
            <p className="text-sm text-muted-foreground">
                Use the stopwatch to see how long certain topics take. This helps in better time estimation for future study sessions.
            </p>
        </Card>
      </div>
    </div>
  );
}
