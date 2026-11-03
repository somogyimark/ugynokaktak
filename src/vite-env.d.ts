/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "mock" shows the demo watermark; "live" is only allowed after M6 approval. */
  readonly VITE_DATA_MODE?: 'mock' | 'live';
  /** Contact address for correction / removal requests (placeholder until set). */
  readonly VITE_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
