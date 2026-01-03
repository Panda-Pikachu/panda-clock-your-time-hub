import { motion } from 'framer-motion';
import { Maximize, Minimize, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClockStore } from '@/stores/clockStore';

export const Header = () => {
  const { isFullscreen, setFullscreen, toggleSettings } = useClockStore();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-30 p-4"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-3xl">🐼</span>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Panda Clock</h1>
            <p className="text-xs text-muted-foreground">Your Modern Time Hub</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSettings}
            className="glass-panel w-10 h-10 rounded-full"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="glass-panel w-10 h-10 rounded-full"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
};
