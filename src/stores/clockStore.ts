import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ClockMode = 'digital' | 'analog' | 'minimal' | 'neon' | 'flip' | 'hybrid';
export type TimeFormat = '12h' | '24h';

export interface WorldClockCity {
  id: string;
  name: string;
  timezone: string;
  label?: string;
}

export interface ClockSettings {
  // Display
  mode: ClockMode;
  timeFormat: TimeFormat;
  showSeconds: boolean;
  smoothSeconds: boolean;
  showDate: boolean;
  showWeekNumber: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  showParticles: boolean;
  
  // World Clock
  worldClocks: WorldClockCity[];
  
  // Widgets
  showWorldClock: boolean;
  showTimer: boolean;
  showStopwatch: boolean;
  showPomodoro: boolean;
}

interface ClockStore {
  settings: ClockSettings;
  isSettingsOpen: boolean;
  isFullscreen: boolean;
  
  // Actions
  updateSettings: (updates: Partial<ClockSettings>) => void;
  toggleSettings: () => void;
  setFullscreen: (value: boolean) => void;
  addWorldClock: (city: WorldClockCity) => void;
  removeWorldClock: (id: string) => void;
  resetSettings: () => void;
}

const defaultSettings: ClockSettings = {
  mode: 'digital',
  timeFormat: '12h',
  showSeconds: true,
  smoothSeconds: true,
  showDate: true,
  showWeekNumber: false,
  theme: 'dark',
  accentColor: 'green',
  showParticles: true,
  worldClocks: [
    { id: '1', name: 'New York', timezone: 'America/New_York' },
    { id: '2', name: 'London', timezone: 'Europe/London' },
    { id: '3', name: 'Tokyo', timezone: 'Asia/Tokyo' },
    { id: '4', name: 'Sydney', timezone: 'Australia/Sydney' },
  ],
  showWorldClock: true,
  showTimer: true,
  showStopwatch: true,
  showPomodoro: true,
};

export const useClockStore = create<ClockStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      isSettingsOpen: false,
      isFullscreen: false,
      
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      
      toggleSettings: () =>
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      
      setFullscreen: (value) => set({ isFullscreen: value }),
      
      addWorldClock: (city) =>
        set((state) => ({
          settings: {
            ...state.settings,
            worldClocks: [...state.settings.worldClocks, city],
          },
        })),
      
      removeWorldClock: (id) =>
        set((state) => ({
          settings: {
            ...state.settings,
            worldClocks: state.settings.worldClocks.filter((c) => c.id !== id),
          },
        })),
      
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'panda-clock-settings',
    }
  )
);
