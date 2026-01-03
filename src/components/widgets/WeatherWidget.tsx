import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, ThermometerSun, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  description: string;
}

interface CityWeather {
  name: string;
  lat: number;
  lon: number;
  weather: WeatherData | null;
  loading: boolean;
}

interface WeatherAlert {
  type: 'heat' | 'rain' | 'wind' | 'humidity';
  message: string;
  severity: 'warning' | 'danger';
}

// All Tamil Nadu district headquarters and major cities with coordinates
const TN_CITIES = [
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
  { name: 'Madurai', lat: 9.9252, lon: 78.1198 },
  { name: 'Tiruchirappalli', lat: 10.7905, lon: 78.7047 },
  { name: 'Salem', lat: 11.6643, lon: 78.1460 },
  { name: 'Tirunelveli', lat: 8.7139, lon: 77.7567 },
  { name: 'Erode', lat: 11.3410, lon: 77.7172 },
  { name: 'Vellore', lat: 12.9165, lon: 79.1325 },
  { name: 'Thoothukudi', lat: 8.7642, lon: 78.1348 },
  { name: 'Dindigul', lat: 10.3624, lon: 77.9695 },
  { name: 'Thanjavur', lat: 10.7870, lon: 79.1378 },
  { name: 'Tiruppur', lat: 11.1085, lon: 77.3411 },
  { name: 'Nagercoil', lat: 8.1833, lon: 77.4119 },
  { name: 'Kanchipuram', lat: 12.8342, lon: 79.7036 },
  { name: 'Karur', lat: 10.9601, lon: 78.0766 },
  { name: 'Hosur', lat: 12.7409, lon: 77.8253 },
  { name: 'Cuddalore', lat: 11.7480, lon: 79.7714 },
  { name: 'Kumbakonam', lat: 10.9617, lon: 79.3881 },
  { name: 'Rajapalayam', lat: 9.4525, lon: 77.5536 },
  { name: 'Pudukkottai', lat: 10.3833, lon: 78.8001 },
  { name: 'Sivakasi', lat: 9.4533, lon: 77.7994 },
  { name: 'Nagapattinam', lat: 10.7672, lon: 79.8449 },
  { name: 'Virudhunagar', lat: 9.5680, lon: 77.9624 },
  { name: 'Pollachi', lat: 10.6609, lon: 77.0087 },
  { name: 'Krishnagiri', lat: 12.5266, lon: 78.2141 },
  { name: 'Ooty', lat: 11.4102, lon: 76.6950 },
  { name: 'Kodaikanal', lat: 10.2381, lon: 77.4892 },
  { name: 'Ariyalur', lat: 11.1400, lon: 79.0800 },
  { name: 'Dharmapuri', lat: 12.1211, lon: 78.1582 },
  { name: 'Kallakurichi', lat: 11.7400, lon: 78.9600 },
  { name: 'Mayiladuthurai', lat: 11.1000, lon: 79.6500 },
  { name: 'Namakkal', lat: 11.2189, lon: 78.1674 },
  { name: 'Perambalur', lat: 11.2320, lon: 78.8800 },
  { name: 'Ramanathapuram', lat: 9.3639, lon: 78.8395 },
  { name: 'Ranipet', lat: 12.9320, lon: 79.3330 },
  { name: 'Sivaganga', lat: 9.8433, lon: 78.4809 },
  { name: 'Tenkasi', lat: 8.9604, lon: 77.3152 },
  { name: 'Theni', lat: 10.0104, lon: 77.4768 },
  { name: 'Thiruvannamalai', lat: 12.2253, lon: 79.0747 },
  { name: 'Thiruvarur', lat: 10.7725, lon: 79.6370 },
  { name: 'Tiruvallur', lat: 13.1231, lon: 79.9120 },
  { name: 'Villupuram', lat: 11.9401, lon: 79.4861 },
  { name: 'Chengalpattu', lat: 12.6819, lon: 79.9888 },
  { name: 'Tirupattur', lat: 12.4955, lon: 78.5730 },
  { name: 'Kanyakumari', lat: 8.0883, lon: 77.5385 },
];

const getWeatherIcon = (code: number, size: string = "w-10 h-10") => {
  if (code === 0) return <Sun className={`${size} text-yellow-500`} />;
  if (code <= 3) return <Cloud className={`${size} text-muted-foreground`} />;
  if (code <= 67) return <CloudRain className={`${size} text-blue-400`} />;
  if (code <= 77) return <Snowflake className={`${size} text-blue-200`} />;
  return <CloudRain className={`${size} text-blue-500`} />;
};

const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
};

const generateAlerts = (weather: WeatherData): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];
  
  if (weather.temperature >= 40) {
    alerts.push({ type: 'heat', message: 'Extreme heat warning! Stay indoors and hydrate.', severity: 'danger' });
  } else if (weather.temperature >= 35) {
    alerts.push({ type: 'heat', message: 'Heat advisory: High temperature expected.', severity: 'warning' });
  }
  
  if (weather.weatherCode >= 61 && weather.weatherCode <= 67) {
    alerts.push({ type: 'rain', message: 'Rain expected. Carry an umbrella.', severity: 'warning' });
  } else if (weather.weatherCode >= 80) {
    alerts.push({ type: 'rain', message: 'Heavy rain/thunderstorm warning!', severity: 'danger' });
  }
  
  if (weather.windSpeed >= 50) {
    alerts.push({ type: 'wind', message: 'Strong wind warning! Avoid outdoor activities.', severity: 'danger' });
  } else if (weather.windSpeed >= 30) {
    alerts.push({ type: 'wind', message: 'Windy conditions expected.', severity: 'warning' });
  }
  
  if (weather.humidity >= 90) {
    alerts.push({ type: 'humidity', message: 'Very high humidity. May feel uncomfortable.', severity: 'warning' });
  }
  
  return alerts;
};

export const WeatherWidget = () => {
  const [currentLocation, setCurrentLocation] = useState<string>('Loading...');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [cityWeathers, setCityWeathers] = useState<CityWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  const fetchWeatherForCity = async (lat: number, lon: number): Promise<WeatherData | null> => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await response.json();
      
      return {
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        feelsLike: Math.round(data.current.apparent_temperature),
        description: getWeatherDescription(data.current.weather_code),
      };
    } catch {
      return null;
    }
  };

  const fetchAllCityWeathers = async () => {
    const weatherPromises = TN_CITIES.map(async (city) => {
      const weather = await fetchWeatherForCity(city.lat, city.lon);
      return { ...city, weather, loading: false };
    });
    
    const results = await Promise.all(weatherPromises);
    setCityWeathers(results);
  };

  const getLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const geoResponse = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const geoData = await geoResponse.json();
            setCurrentLocation(geoData.city || geoData.locality || 'Your Location');
          } catch {
            setCurrentLocation('Your Location');
          }
          
          const weather = await fetchWeatherForCity(latitude, longitude);
          if (weather) {
            setCurrentWeather(weather);
            setAlerts(generateAlerts(weather));
          }
          setLoading(false);
        },
        async () => {
          // Default to Chennai if location denied
          setCurrentLocation('Chennai');
          const weather = await fetchWeatherForCity(13.0827, 80.2707);
          if (weather) {
            setCurrentWeather(weather);
            setAlerts(generateAlerts(weather));
          }
          setLoading(false);
        }
      );
    } else {
      setCurrentLocation('Chennai');
      const weather = await fetchWeatherForCity(13.0827, 80.2707);
      if (weather) {
        setCurrentWeather(weather);
        setAlerts(generateAlerts(weather));
      }
      setLoading(false);
    }
  };

  const refreshAll = () => {
    setLoading(true);
    getLocation();
    fetchAllCityWeathers();
  };

  useEffect(() => {
    getLocation();
    fetchAllCityWeathers();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="widget-card flex items-center justify-center min-h-[200px] col-span-1 md:col-span-2"
      >
        <div className="animate-pulse text-muted-foreground">Loading weather...</div>
      </motion.div>
    );
  }

  if (error || !currentWeather) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="widget-card col-span-1 md:col-span-2"
      >
        <div className="text-center py-4">
          <p className="text-muted-foreground mb-2">{error || 'Unable to load weather'}</p>
          <Button variant="secondary" size="sm" onClick={refreshAll}>
            Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="widget-card col-span-1 md:col-span-2"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">{currentLocation}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={refreshAll} className="w-8 h-8">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-secondary/30">
        <div className="flex items-center gap-4">
          {getWeatherIcon(currentWeather.weatherCode)}
          <div>
            <p className="text-3xl font-bold text-foreground">{currentWeather.temperature}°C</p>
            <p className="text-sm text-muted-foreground">{currentWeather.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1 text-right">
          <div className="flex items-center gap-1 justify-end">
            <ThermometerSun className="w-3 h-3 text-orange-400" />
            <span className="text-xs text-muted-foreground">Feels {currentWeather.feelsLike}°C</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-muted-foreground">{currentWeather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Wind className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{currentWeather.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                alert.severity === 'danger' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{alert.message}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tamil Nadu Cities Weather */}
      <div className="border-t border-border/50 pt-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Tamil Nadu Cities</h4>
        <ScrollArea className="h-[180px]">
          <div className="grid grid-cols-2 gap-2 pr-2">
            {cityWeathers.map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/20"
              >
                <div className="flex items-center gap-2">
                  {city.weather && getWeatherIcon(city.weather.weatherCode, "w-5 h-5")}
                  <span className="text-sm text-foreground">{city.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {city.weather ? `${city.weather.temperature}°C` : '--'}
                </span>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
};