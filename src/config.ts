/** Runtime configuration, resolved at build time from Vite env variables. */

export type DataMode = 'mock' | 'live';

/** Defaults to "mock": the demo watermark must never disappear by accident. */
export const DATA_MODE: DataMode = import.meta.env.VITE_DATA_MODE === 'live' ? 'live' : 'mock';

/** Address for correction / removal requests. Placeholder until a real, monitored one is configured. */
export const CONTACT_EMAIL: string = import.meta.env.VITE_CONTACT_EMAIL || 'helyesbites@example.org';

/** Name of the official source shown on every record. Finalised during M6. */
export const OFFICIAL_SOURCE_NAME =
  DATA_MODE === 'mock' ? 'fiktív tesztadat (nem valós forrás)' : 'nyitottaktak.hu – hivatalos nyilvántartás';

export const OFFICIAL_SOURCE_URL = DATA_MODE === 'mock' ? undefined : 'https://nyitottaktak.hu/';
