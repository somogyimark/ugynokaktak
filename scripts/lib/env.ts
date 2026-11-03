import { loadEnv } from 'vite';

/** Data mode as Vite would see it (.env files + process env). Defaults to "mock". */
export function dataMode(): 'mock' | 'live' {
  const env = loadEnv(process.env.NODE_ENV === 'production' ? 'production' : 'development', process.cwd(), 'VITE_');
  return (process.env.VITE_DATA_MODE ?? env.VITE_DATA_MODE) === 'live' ? 'live' : 'mock';
}
