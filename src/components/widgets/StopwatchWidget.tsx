import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, RotateCcw, Flag, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect, useRef } from 'react';

interface StopwatchInstance {
  id: string;
  name: string;
  time: number; // milliseconds
  isRunning: boolean;
  laps: number[];
}

export const StopwatchWidget = () => {
  const [stopwatches, setStopwatches] = useState<StopwatchInstance[]>([
    { id: '1', name: 'Stopwatch 1', time: 0, isRunning: false, laps: [] }
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const intervalsRef = useRef<Map<string, number>>(new Map());
  const startTimesRef = useRef<Map<string, number>>(new Map());
  const accumulatedRef = useRef<Map<string, number>>(new Map());

  // Stopwatch tick logic
  useEffect(() => {
    stopwatches.forEach(sw => {
      if (sw.isRunning && !intervalsRef.current.has(sw.id)) {
        startTimesRef.current.set(sw.id, Date.now());
        accumulatedRef.current.set(sw.id, sw.time);
        
        const intervalId = window.setInterval(() => {
          setStopwatches(prev => prev.map(s => {
            if (s.id !== sw.id || !s.isRunning) return s;
            const startTime = startTimesRef.current.get(s.id) || Date.now();
            const accumulated = accumulatedRef.current.get(s.id) || 0;
            return { ...s, time: accumulated + (Date.now() - startTime) };
          }));
        }, 10);
        intervalsRef.current.set(sw.id, intervalId);
      } else if (!sw.isRunning && intervalsRef.current.has(sw.id)) {
        clearInterval(intervalsRef.current.get(sw.id));
        intervalsRef.current.delete(sw.id);
        accumulatedRef.current.set(sw.id, sw.time);
      }
    });

    return () => {
      intervalsRef.current.forEach(intervalId => clearInterval(intervalId));
    };
  }, [stopwatches.map(s => `${s.id}-${s.isRunning}`).join(',')]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      centiseconds: centiseconds.toString().padStart(2, '0'),
    };
  };

  const formatLap = (ms: number, index: number, laps: number[]) => {
    const prevMs = index > 0 ? laps[index - 1] : 0;
    const lapMs = ms - prevMs;
    const lapSeconds = Math.floor(lapMs / 1000);
    const minutes = Math.floor(lapSeconds / 60);
    const seconds = lapSeconds % 60;
    const centiseconds = Math.floor((lapMs % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const startStopwatch = (id: string) => {
    setStopwatches(prev => prev.map(s => 
      s.id === id ? { ...s, isRunning: true } : s
    ));
  };

  const pauseStopwatch = (id: string) => {
    setStopwatches(prev => prev.map(s => 
      s.id === id ? { ...s, isRunning: false } : s
    ));
  };

  const resetStopwatch = (id: string) => {
    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id));
      intervalsRef.current.delete(id);
    }
    accumulatedRef.current.set(id, 0);
    setStopwatches(prev => prev.map(s => 
      s.id === id ? { ...s, time: 0, isRunning: false, laps: [] } : s
    ));
  };

  const lapStopwatch = (id: string) => {
    setStopwatches(prev => prev.map(s => 
      s.id === id && s.isRunning ? { ...s, laps: [...s.laps, s.time] } : s
    ));
  };

  const addStopwatch = () => {
    const newId = Date.now().toString();
    setStopwatches(prev => [...prev, {
      id: newId,
      name: `Stopwatch ${prev.length + 1}`,
      time: 0,
      isRunning: false,
      laps: [],
    }]);
  };

  const removeStopwatch = (id: string) => {
    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id));
      intervalsRef.current.delete(id);
    }
    setStopwatches(prev => prev.filter(s => s.id !== id));
  };

  const startEditName = (id: string, currentName: string) => {
    setEditingId(id);
    setTempName(currentName);
  };

  const saveName = (id: string) => {
    setStopwatches(prev => prev.map(s => 
      s.id === id ? { ...s, name: tempName || s.name } : s
    ));
    setEditingId(null);
  };

  const exportLaps = (sw: StopwatchInstance) => {
    if (sw.laps.length === 0) return;
    
    const csvContent = [
      'Lap,Lap Time,Total Time',
      ...sw.laps.map((lapTime, index) => {
        const lapDuration = formatLap(lapTime, index, sw.laps);
        const totalFormatted = formatTime(lapTime);
        return `${index + 1},${lapDuration},${totalFormatted.minutes}:${totalFormatted.seconds}.${totalFormatted.centiseconds}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sw.name.replace(/\s+/g, '_')}_laps.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="widget-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Stopwatches</h3>
      </div>

      <ScrollArea className="max-h-80">
        <div className="space-y-4 pr-2">
          <AnimatePresence>
            {stopwatches.map((sw) => {
              const formatted = formatTime(sw.time);
              return (
                <motion.div
                  key={sw.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    {editingId === sw.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="h-6 w-28 text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && saveName(sw.id)}
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => saveName(sw.id)}>
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{sw.name}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => startEditName(sw.id, sw.name)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    
                    {stopwatches.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeStopwatch(sw.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {/* Display */}
                  <div className="text-center mb-3">
                    <motion.div
                      className="font-clock text-3xl font-bold text-foreground"
                      animate={sw.isRunning ? { opacity: [1, 0.9, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      {formatted.minutes}:{formatted.seconds}
                      <span className="text-xl text-muted-foreground">.{formatted.centiseconds}</span>
                    </motion.div>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-1 justify-center mb-2">
                    <Button
                      variant={sw.isRunning ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => sw.isRunning ? pauseStopwatch(sw.id) : startStopwatch(sw.id)}
                      className="flex items-center gap-1 h-7 text-xs"
                    >
                      {sw.isRunning ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Start</>}
                    </Button>
                    
                    {sw.isRunning && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => lapStopwatch(sw.id)}
                        className="flex items-center gap-1 h-7 text-xs"
                      >
                        <Flag className="w-3 h-3" /> Lap
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetStopwatch(sw.id)}
                      className="flex items-center gap-1 h-7 text-xs"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </Button>
                  </div>

                  {/* Laps */}
                  {sw.laps.length > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Laps ({sw.laps.length})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportLaps(sw)}
                          className="h-5 text-xs px-2"
                        >
                          Export
                        </Button>
                      </div>
                      <ScrollArea className="h-20">
                        <div className="space-y-1">
                          {sw.laps.map((lapTime, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex justify-between text-xs py-0.5 border-b border-border/20 last:border-0"
                            >
                              <span className="text-muted-foreground">Lap {index + 1}</span>
                              <span className="font-clock text-foreground">
                                {formatLap(lapTime, index, sw.laps)}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Add new stopwatch */}
      <div className="mt-4 pt-3 border-t border-border/30">
        <Button
          variant="outline"
          size="sm"
          onClick={addStopwatch}
          className="w-full flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Stopwatch
        </Button>
      </div>
    </motion.div>
  );
};
