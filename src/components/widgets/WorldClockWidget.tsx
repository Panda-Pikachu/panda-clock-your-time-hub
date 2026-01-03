import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, X, Search, Sun, Moon } from 'lucide-react';
import { useClockStore, WorldClockCity } from '@/stores/clockStore';
import { getTimeInTimezone, formatTime } from '@/hooks/useTime';
import { useTime } from '@/hooks/useTime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// All Tamil Nadu cities and towns
const AVAILABLE_CITIES: Omit<WorldClockCity, 'id'>[] = [
  { name: 'Chennai', timezone: 'Asia/Kolkata' },
  { name: 'Coimbatore', timezone: 'Asia/Kolkata' },
  { name: 'Madurai', timezone: 'Asia/Kolkata' },
  { name: 'Tiruchirappalli', timezone: 'Asia/Kolkata' },
  { name: 'Salem', timezone: 'Asia/Kolkata' },
  { name: 'Tirunelveli', timezone: 'Asia/Kolkata' },
  { name: 'Erode', timezone: 'Asia/Kolkata' },
  { name: 'Vellore', timezone: 'Asia/Kolkata' },
  { name: 'Thoothukudi', timezone: 'Asia/Kolkata' },
  { name: 'Dindigul', timezone: 'Asia/Kolkata' },
  { name: 'Thanjavur', timezone: 'Asia/Kolkata' },
  { name: 'Tiruppur', timezone: 'Asia/Kolkata' },
  { name: 'Nagercoil', timezone: 'Asia/Kolkata' },
  { name: 'Kanchipuram', timezone: 'Asia/Kolkata' },
  { name: 'Karur', timezone: 'Asia/Kolkata' },
  { name: 'Hosur', timezone: 'Asia/Kolkata' },
  { name: 'Cuddalore', timezone: 'Asia/Kolkata' },
  { name: 'Kumbakonam', timezone: 'Asia/Kolkata' },
  { name: 'Rajapalayam', timezone: 'Asia/Kolkata' },
  { name: 'Pudukkottai', timezone: 'Asia/Kolkata' },
  { name: 'Sivakasi', timezone: 'Asia/Kolkata' },
  { name: 'Nagapattinam', timezone: 'Asia/Kolkata' },
  { name: 'Virudhunagar', timezone: 'Asia/Kolkata' },
  { name: 'Pollachi', timezone: 'Asia/Kolkata' },
  { name: 'Ambur', timezone: 'Asia/Kolkata' },
  { name: 'Neyveli', timezone: 'Asia/Kolkata' },
  { name: 'Krishnagiri', timezone: 'Asia/Kolkata' },
  { name: 'Ooty', timezone: 'Asia/Kolkata' },
  { name: 'Kodaikanal', timezone: 'Asia/Kolkata' },
  { name: 'Ariyalur', timezone: 'Asia/Kolkata' },
  { name: 'Dharmapuri', timezone: 'Asia/Kolkata' },
  { name: 'Kallakurichi', timezone: 'Asia/Kolkata' },
  { name: 'Mayiladuthurai', timezone: 'Asia/Kolkata' },
  { name: 'Namakkal', timezone: 'Asia/Kolkata' },
  { name: 'Perambalur', timezone: 'Asia/Kolkata' },
  { name: 'Ramanathapuram', timezone: 'Asia/Kolkata' },
  { name: 'Ranipet', timezone: 'Asia/Kolkata' },
  { name: 'Sivaganga', timezone: 'Asia/Kolkata' },
  { name: 'Tenkasi', timezone: 'Asia/Kolkata' },
  { name: 'Theni', timezone: 'Asia/Kolkata' },
  { name: 'Thiruvannamalai', timezone: 'Asia/Kolkata' },
  { name: 'Thiruvarur', timezone: 'Asia/Kolkata' },
  { name: 'Tiruvallur', timezone: 'Asia/Kolkata' },
  { name: 'Villupuram', timezone: 'Asia/Kolkata' },
  { name: 'Chengalpattu', timezone: 'Asia/Kolkata' },
  { name: 'Tirupattur', timezone: 'Asia/Kolkata' },
  { name: 'Kanyakumari', timezone: 'Asia/Kolkata' },
  { name: 'Mahabalipuram', timezone: 'Asia/Kolkata' },
  { name: 'Rameswaram', timezone: 'Asia/Kolkata' },
  { name: 'Velankanni', timezone: 'Asia/Kolkata' },
  { name: 'Yelagiri', timezone: 'Asia/Kolkata' },
  { name: 'Yercaud', timezone: 'Asia/Kolkata' },
  { name: 'Coonoor', timezone: 'Asia/Kolkata' },
  { name: 'Mettupalayam', timezone: 'Asia/Kolkata' },
  { name: 'Arakkonam', timezone: 'Asia/Kolkata' },
  { name: 'Vaniyambadi', timezone: 'Asia/Kolkata' },
  { name: 'Gudiyatham', timezone: 'Asia/Kolkata' },
  { name: 'Tindivanam', timezone: 'Asia/Kolkata' },
  { name: 'Paramakudi', timezone: 'Asia/Kolkata' },
  { name: 'Srivilliputhur', timezone: 'Asia/Kolkata' },
  { name: 'Sankarankovil', timezone: 'Asia/Kolkata' },
  { name: 'Palani', timezone: 'Asia/Kolkata' },
  { name: 'Attur', timezone: 'Asia/Kolkata' },
  { name: 'Gobichettipalayam', timezone: 'Asia/Kolkata' },
  { name: 'Avinashi', timezone: 'Asia/Kolkata' },
  { name: 'Udumalaipettai', timezone: 'Asia/Kolkata' },
  { name: 'Valparai', timezone: 'Asia/Kolkata' },
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
