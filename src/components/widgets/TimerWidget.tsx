import { motion } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Plus, Minus, Bell, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTimer } from '@/hooks/useTimer';
import { useState, useEffect, useRef } from 'react';

export const TimerWidget = () => {
  const timer = useTimer(300); // 5 minutes default
  const [timerName, setTimerName] = useState('Timer');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(timerName);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const hasNotified = useRef(false);

  const presets = [
    { label: '30s', seconds: 30 },
    { label: '1m', seconds: 60 },
    { label: '5m', seconds: 300 },
    { label: '10m', seconds: 600 },
    { label: '25m', seconds: 1500 },
  ];

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Handle timer completion
  useEffect(() => {
    if (timer.isComplete && !hasNotified.current) {
      hasNotified.current = true;
      
      // Browser notification
      if (notificationPermission === 'granted') {
        new Notification(`${timerName} Complete!`, {
          body: 'Your timer has finished.',
          icon: '/favicon.ico',
          tag: 'timer-complete',
        });
      }

      // Speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`${timerName} completed`);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
      }
    }
    
    if (!timer.isComplete) {
      hasNotified.current = false;
    }
  }, [timer.isComplete, timerName, notificationPermission]);

  const adjustTime = (delta: number) => {
    const newTime = Math.max(0, timer.totalTime + delta);
    timer.setTime(newTime);
  };

  const handleSaveName = () => {
    setTimerName(tempName || 'Timer');
    setIsEditingName(false);
  };

  const handleStartEdit = () => {
    setTempName(timerName);
    setIsEditingName(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="widget-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-7 w-28 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
              />
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSaveName}>
                <Check className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-foreground">{timerName}</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleStartEdit}>
                <Edit2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        
        {notificationPermission !== 'granted' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={requestNotificationPermission}
            className="h-8 w-8"
            title="Enable notifications"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Timer display */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2">
          {!timer.isRunning && (
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => adjustTime(60)}
                className="h-6 w-6"
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => adjustTime(-60)}
                className="h-6 w-6"
              >
                <Minus className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          <motion.div
            className="font-clock text-4xl font-bold text-foreground"
            animate={timer.isComplete ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: timer.isComplete ? Infinity : 0, duration: 0.5 }}
          >
            {timer.formatted.hours !== '00' && `${timer.formatted.hours}:`}
            {timer.formatted.minutes}:{timer.formatted.seconds}
          </motion.div>

          {!timer.isRunning && (
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => adjustTime(10)}
                className="h-6 w-6"
                title="+10 seconds"
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => adjustTime(-10)}
                className="h-6 w-6"
                title="-10 seconds"
              >
                <Minus className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground mt-1">
          {!timer.isRunning && <span>Left: ±1min | Right: ±10sec</span>}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-secondary rounded-full mt-3 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${timer.progress}%` }}
            transition={{ type: 'tween', ease: 'linear' }}
          />
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-1 mb-4 justify-center flex-wrap">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="secondary"
            size="sm"
            onClick={() => timer.setTime(preset.seconds)}
            className="text-xs px-2 py-1 h-7"
            disabled={timer.isRunning}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={timer.isRunning ? 'secondary' : 'default'}
          size="sm"
          onClick={timer.isRunning ? timer.pause : timer.start}
          className="flex items-center gap-1"
        >
          {timer.isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Start
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={timer.reset}
          className="flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      {timer.isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center text-primary font-semibold"
        >
          🎉 {timerName} Complete!
        </motion.div>
      )}
    </motion.div>
  );
};
