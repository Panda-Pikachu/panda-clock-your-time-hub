import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Plus, Minus, Bell, Edit2, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimerInstance {
  id: string;
  name: string;
  remainingTime: number;
  totalTime: number;
  isRunning: boolean;
  isComplete: boolean;
  hasNotified: boolean;
}

export const TimerWidget = () => {
  const [timers, setTimers] = useState<TimerInstance[]>([
    { id: '1', name: 'Timer 1', remainingTime: 300, totalTime: 300, isRunning: false, isComplete: false, hasNotified: false }
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [customTime, setCustomTime] = useState({ hours: '0', minutes: '5', seconds: '0' });
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const intervalsRef = useRef<Map<string, number>>(new Map());

  const presets = [
    { label: '30s', seconds: 30 },
    { label: '1m', seconds: 60 },
    { label: '5m', seconds: 300 },
    { label: '10m', seconds: 600 },
  ];

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          new Notification('Notifications Enabled!', {
            body: 'You will be notified when timers complete.',
            icon: '/favicon.ico',
          });
        }
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    }
  };

  // Timer tick logic
  useEffect(() => {
    timers.forEach(timer => {
      if (timer.isRunning && !intervalsRef.current.has(timer.id)) {
        const intervalId = window.setInterval(() => {
          setTimers(prev => prev.map(t => {
            if (t.id !== timer.id) return t;
            if (t.remainingTime <= 1) {
              clearInterval(intervalsRef.current.get(t.id));
              intervalsRef.current.delete(t.id);
              return { ...t, remainingTime: 0, isRunning: false, isComplete: true };
            }
            return { ...t, remainingTime: t.remainingTime - 1 };
          }));
        }, 1000);
        intervalsRef.current.set(timer.id, intervalId);
      } else if (!timer.isRunning && intervalsRef.current.has(timer.id)) {
        clearInterval(intervalsRef.current.get(timer.id));
        intervalsRef.current.delete(timer.id);
      }
    });

    return () => {
      intervalsRef.current.forEach(intervalId => clearInterval(intervalId));
    };
  }, [timers.map(t => `${t.id}-${t.isRunning}`).join(',')]);

  // Handle completion notifications
  useEffect(() => {
    timers.forEach(timer => {
      if (timer.isComplete && !timer.hasNotified) {
        // Browser notification
        if (notificationPermission === 'granted') {
          new Notification(`${timer.name} Complete!`, {
            body: 'Your timer has finished.',
            icon: '/favicon.ico',
            tag: `timer-${timer.id}`,
          });
        }

        // Speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(`${timer.name} completed`);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 1;
          window.speechSynthesis.speak(utterance);
        }

        setTimers(prev => prev.map(t => 
          t.id === timer.id ? { ...t, hasNotified: true } : t
        ));
      }
    });
  }, [timers, notificationPermission]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hrs.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  const startTimer = (id: string) => {
    setTimers(prev => prev.map(t => 
      t.id === id && t.remainingTime > 0 ? { ...t, isRunning: true, isComplete: false, hasNotified: false } : t
    ));
  };

  const pauseTimer = (id: string) => {
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, isRunning: false } : t
    ));
  };

  const resetTimer = (id: string) => {
    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id));
      intervalsRef.current.delete(id);
    }
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, remainingTime: t.totalTime, isRunning: false, isComplete: false, hasNotified: false } : t
    ));
  };

  const setTimerTime = (id: string, seconds: number) => {
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, remainingTime: seconds, totalTime: seconds, isRunning: false, isComplete: false, hasNotified: false } : t
    ));
  };

  const adjustTime = (id: string, delta: number) => {
    setTimers(prev => prev.map(t => {
      if (t.id !== id || t.isRunning) return t;
      const newTime = Math.max(0, t.totalTime + delta);
      return { ...t, remainingTime: newTime, totalTime: newTime };
    }));
  };

  const addTimer = () => {
    const newId = Date.now().toString();
    const totalSeconds = 
      parseInt(customTime.hours || '0') * 3600 + 
      parseInt(customTime.minutes || '0') * 60 + 
      parseInt(customTime.seconds || '0');
    
    const time = totalSeconds > 0 ? totalSeconds : 300;
    
    setTimers(prev => [...prev, {
      id: newId,
      name: `Timer ${prev.length + 1}`,
      remainingTime: time,
      totalTime: time,
      isRunning: false,
      isComplete: false,
      hasNotified: false,
    }]);
    setShowCustomInput(false);
    setCustomTime({ hours: '0', minutes: '5', seconds: '0' });
  };

  const removeTimer = (id: string) => {
    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id));
      intervalsRef.current.delete(id);
    }
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const startEditName = (id: string, currentName: string) => {
    setEditingId(id);
    setTempName(currentName);
  };

  const saveName = (id: string) => {
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, name: tempName || t.name } : t
    ));
    setEditingId(null);
  };

  const getProgress = (timer: TimerInstance) => {
    return timer.totalTime > 0 
      ? ((timer.totalTime - timer.remainingTime) / timer.totalTime) * 100 
      : 0;
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
          <h3 className="font-semibold text-foreground">Timers</h3>
        </div>
        
        <div className="flex items-center gap-1">
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
          {notificationPermission === 'granted' && (
            <span title="Notifications enabled">
              <Bell className="w-4 h-4 text-primary" />
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="max-h-80">
        <div className="space-y-4 pr-2">
          <AnimatePresence>
            {timers.map((timer) => {
              const formatted = formatTime(timer.remainingTime);
              return (
                <motion.div
                  key={timer.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                >
                  {/* Timer header */}
                  <div className="flex items-center justify-between mb-2">
                    {editingId === timer.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="h-6 w-24 text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && saveName(timer.id)}
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => saveName(timer.id)}>
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{timer.name}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => startEditName(timer.id, timer.name)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    
                    {timers.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeTimer(timer.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {/* Timer display */}
                  <div className="text-center mb-2">
                    <div className="flex items-center justify-center gap-1">
                      {!timer.isRunning && (
                        <div className="flex flex-col">
                          <Button variant="ghost" size="icon" onClick={() => adjustTime(timer.id, 60)} className="h-5 w-5">
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => adjustTime(timer.id, -60)} className="h-5 w-5">
                            <Minus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      
                      <motion.div
                        className="font-clock text-2xl font-bold text-foreground"
                        animate={timer.isComplete ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: timer.isComplete ? Infinity : 0, duration: 0.5 }}
                      >
                        {formatted.hours !== '00' && `${formatted.hours}:`}
                        {formatted.minutes}:{formatted.seconds}
                      </motion.div>

                      {!timer.isRunning && (
                        <div className="flex flex-col">
                          <Button variant="ghost" size="icon" onClick={() => adjustTime(timer.id, 10)} className="h-5 w-5" title="+10s">
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => adjustTime(timer.id, -10)} className="h-5 w-5" title="-10s">
                            <Minus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {!timer.isRunning && (
                      <div className="text-xs text-muted-foreground">Left: ±1min | Right: ±10sec</div>
                    )}

                    {/* Progress bar */}
                    <div className="h-1 bg-secondary rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        animate={{ width: `${getProgress(timer)}%` }}
                        transition={{ type: 'tween', ease: 'linear' }}
                      />
                    </div>
                  </div>

                  {/* Presets */}
                  {!timer.isRunning && (
                    <div className="flex gap-1 mb-2 justify-center flex-wrap">
                      {presets.map((preset) => (
                        <Button
                          key={preset.label}
                          variant="secondary"
                          size="sm"
                          onClick={() => setTimerTime(timer.id, preset.seconds)}
                          className="text-xs px-2 py-0.5 h-6"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex gap-1 justify-center">
                    <Button
                      variant={timer.isRunning ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => timer.isRunning ? pauseTimer(timer.id) : startTimer(timer.id)}
                      className="flex items-center gap-1 h-7 text-xs"
                    >
                      {timer.isRunning ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Start</>}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetTimer(timer.id)}
                      className="flex items-center gap-1 h-7 text-xs"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </Button>
                  </div>

                  {timer.isComplete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-center text-primary font-semibold text-sm">
                      🎉 Complete!
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Add new timer */}
      <div className="mt-4 pt-3 border-t border-border/30">
        {showCustomInput ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">H</span>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={customTime.hours}
                  onChange={(e) => setCustomTime(prev => ({ ...prev, hours: e.target.value }))}
                  className="h-8 w-14 text-center"
                />
              </div>
              <span className="text-xl font-bold mt-4">:</span>
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">M</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={customTime.minutes}
                  onChange={(e) => setCustomTime(prev => ({ ...prev, minutes: e.target.value }))}
                  className="h-8 w-14 text-center"
                />
              </div>
              <span className="text-xl font-bold mt-4">:</span>
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">S</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={customTime.seconds}
                  onChange={(e) => setCustomTime(prev => ({ ...prev, seconds: e.target.value }))}
                  className="h-8 w-14 text-center"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={addTimer} className="h-7">
                <Plus className="w-3 h-3 mr-1" /> Add Timer
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCustomInput(false)} className="h-7">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            className="w-full flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Timer
          </Button>
        )}
      </div>
    </motion.div>
  );
};
