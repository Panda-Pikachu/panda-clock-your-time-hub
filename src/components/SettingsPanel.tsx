import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, X, Monitor, Moon, Sun, 
  Clock, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClockStore, ClockMode } from '@/stores/clockStore';

const clockModes: { value: ClockMode; label: string; icon: string }[] = [
  { value: 'digital', label: 'Digital', icon: '🔢' },
  { value: 'analog', label: 'Analog', icon: '🕐' },
  { value: 'minimal', label: 'Minimal', icon: '✨' },
  { value: 'neon', label: 'Neon', icon: '💡' },
  { value: 'flip', label: 'Flip', icon: '📟' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔮' },
];

export const SettingsPanel = () => {
  const { settings, isSettingsOpen, toggleSettings, updateSettings } = useClockStore();

  const setTheme = (theme: 'light' | 'dark' | 'auto') => {
    updateSettings({ theme });
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  };

  return (
    <>
      {/* Settings trigger button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSettings}
        className="fixed top-4 right-8 z-50 glass-panel w-12 h-12 rounded-full hover:scale-110 transition-smooth"
      >
        <Settings className="w-5 h-5" />
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSettings}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 glass-panel z-50 border-l border-border"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🐼</span>
                  <h2 className="text-xl font-bold text-foreground">Settings</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleSettings}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-100px)]">
                <div className="space-y-6 pr-4">
                  {/* Clock Mode */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Clock Style
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {clockModes.map((mode) => (
                        <Button
                          key={mode.value}
                          variant={settings.mode === mode.value ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => updateSettings({ mode: mode.value })}
                          className="flex flex-col h-auto py-2 px-2"
                        >
                          <span className="text-lg">{mode.icon}</span>
                          <span className="text-xs mt-1">{mode.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Theme */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Sun className="w-4 h-4" /> Theme
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant={settings.theme === 'light' ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => setTheme('light')}
                        className="flex-1"
                      >
                        <Sun className="w-4 h-4 mr-1" /> Light
                      </Button>
                      <Button
                        variant={settings.theme === 'dark' ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => setTheme('dark')}
                        className="flex-1"
                      >
                        <Moon className="w-4 h-4 mr-1" /> Dark
                      </Button>
                      <Button
                        variant={settings.theme === 'auto' ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => setTheme('auto')}
                        className="flex-1"
                      >
                        <Monitor className="w-4 h-4 mr-1" /> Auto
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Time Format */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Time Format</h3>
                    <div className="flex gap-2">
                      <Button
                        variant={settings.timeFormat === '12h' ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => updateSettings({ timeFormat: '12h' })}
                        className="flex-1"
                      >
                        12 Hour
                      </Button>
                      <Button
                        variant={settings.timeFormat === '24h' ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => updateSettings({ timeFormat: '24h' })}
                        className="flex-1"
                      >
                        24 Hour
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Display Options */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Display Options
                    </h3>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showSeconds" className="text-sm">Show Seconds</Label>
                      <Switch
                        id="showSeconds"
                        checked={settings.showSeconds}
                        onCheckedChange={(checked) => updateSettings({ showSeconds: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="smoothSeconds" className="text-sm">Smooth Seconds</Label>
                      <Switch
                        id="smoothSeconds"
                        checked={settings.smoothSeconds}
                        onCheckedChange={(checked) => updateSettings({ smoothSeconds: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showDate" className="text-sm">Show Date</Label>
                      <Switch
                        id="showDate"
                        checked={settings.showDate}
                        onCheckedChange={(checked) => updateSettings({ showDate: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showWeekNumber" className="text-sm">Show Week Number</Label>
                      <Switch
                        id="showWeekNumber"
                        checked={settings.showWeekNumber}
                        onCheckedChange={(checked) => updateSettings({ showWeekNumber: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showParticles" className="text-sm">Animated Background</Label>
                      <Switch
                        id="showParticles"
                        checked={settings.showParticles}
                        onCheckedChange={(checked) => updateSettings({ showParticles: checked })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Widgets */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Widgets
                    </h3>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showWorldClock" className="text-sm">World Clock</Label>
                      <Switch
                        id="showWorldClock"
                        checked={settings.showWorldClock}
                        onCheckedChange={(checked) => updateSettings({ showWorldClock: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showTimer" className="text-sm">Timer</Label>
                      <Switch
                        id="showTimer"
                        checked={settings.showTimer}
                        onCheckedChange={(checked) => updateSettings({ showTimer: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showStopwatch" className="text-sm">Stopwatch</Label>
                      <Switch
                        id="showStopwatch"
                        checked={settings.showStopwatch}
                        onCheckedChange={(checked) => updateSettings({ showStopwatch: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showPomodoro" className="text-sm">Pomodoro</Label>
                      <Switch
                        id="showPomodoro"
                        checked={settings.showPomodoro}
                        onCheckedChange={(checked) => updateSettings({ showPomodoro: checked })}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
