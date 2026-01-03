import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, X, Search, Sun, Moon } from 'lucide-react';
import { useClockStore, WorldClockCity } from '@/stores/clockStore';
import { getTimeInTimezone, formatTime } from '@/hooks/useTime';
import { useTime } from '@/hooks/useTime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AVAILABLE_CITIES: Omit<WorldClockCity, 'id'>[] = [
  { name: 'New York', timezone: 'America/New_York' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles' },
  { name: 'Chicago', timezone: 'America/Chicago' },
  { name: 'Toronto', timezone: 'America/Toronto' },
  { name: 'London', timezone: 'Europe/London' },
  { name: 'Paris', timezone: 'Europe/Paris' },
  { name: 'Berlin', timezone: 'Europe/Berlin' },
  { name: 'Amsterdam', timezone: 'Europe/Amsterdam' },
  { name: 'Moscow', timezone: 'Europe/Moscow' },
  { name: 'Dubai', timezone: 'Asia/Dubai' },
  { name: 'Mumbai', timezone: 'Asia/Kolkata' },
  { name: 'Singapore', timezone: 'Asia/Singapore' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo' },
  { name: 'Seoul', timezone: 'Asia/Seoul' },
  { name: 'Sydney', timezone: 'Australia/Sydney' },
  { name: 'Auckland', timezone: 'Pacific/Auckland' },
  { name: 'São Paulo', timezone: 'America/Sao_Paulo' },
];

const getDayNightIcon = (hour: number) => {
  return hour >= 6 && hour < 18 ? (
    <Sun className="w-3 h-3 text-yellow-500" />
  ) : (
    <Moon className="w-3 h-3 text-blue-400" />
  );
};

const getTimeDifference = (timezone: string): string => {
  const now = new Date();
  const localOffset = now.getTimezoneOffset();
  const cityTime = getTimeInTimezone(timezone);
  const cityOffset = -cityTime.getTimezoneOffset();
  const diffMinutes = cityOffset - (-localOffset);
  const diffHours = diffMinutes / 60;
  
  if (diffHours === 0) return 'Same time';
  const sign = diffHours > 0 ? '+' : '';
  return `${sign}${diffHours}h`;
};

export const WorldClockWidget = () => {
  const { settings, addWorldClock, removeWorldClock } = useClockStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  useTime(false); // Just to trigger re-renders

  const filteredCities = AVAILABLE_CITIES.filter(
    city =>
      !settings.worldClocks.some(wc => wc.timezone === city.timezone) &&
      city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCity = (city: Omit<WorldClockCity, 'id'>) => {
    addWorldClock({
      ...city,
      id: Date.now().toString(),
    });
    setSearchQuery('');
    setIsAdding(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="widget-card col-span-1 md:col-span-2"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">World Clock</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAdding(!isAdding)}
          className="w-8 h-8"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredCities.slice(0, 5).map((city) => (
                <Button
                  key={city.timezone}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddCity(city)}
                  className="w-full justify-start text-sm"
                >
                  {city.name}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {settings.worldClocks.map((city, index) => {
          const cityTime = getTimeInTimezone(city.timezone);
          const { time: displayTime, period } = formatTime(
            cityTime.getHours(),
            cityTime.getMinutes(),
            cityTime.getSeconds(),
            settings.timeFormat,
            false
          );

          return (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 group"
            >
              <div className="flex items-center gap-2">
                {getDayNightIcon(cityTime.getHours())}
                <div>
                  <p className="font-medium text-foreground text-sm">{city.label || city.name}</p>
                  <p className="text-xs text-muted-foreground">{getTimeDifference(city.timezone)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-clock text-lg font-semibold text-foreground">
                    {displayTime}
                  </p>
                  {period && (
                    <p className="text-xs text-muted-foreground">{period}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWorldClock(city.id)}
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
