/**
 * Import configuration: which file in /raw maps to which source type, and how.
 * PLACEHOLDER – the real column names are unknown until the live format is examined (M6).
 * Do not fill this in from guesses; inspect the actual files first.
 */
import type { FieldMapping } from '../src/adapters/types';

export interface ImportFile {
  /** File name inside /raw. */
  file: string;
  mapping: FieldMapping;
}

export const IMPORT_FILES: ImportFile[] = [
  // Example (fictional column names):
  // {
  //   file: 'karton6.csv',
  //   mapping: {
  //     source: 'karton6',
  //     fields: { name: 'Név', coverName: 'Fedőnév', birthDate: ['Születési dátum', 'Szül. év'], registryNumber: 'Nyilvántartási szám' },
  //     officialUrlTemplate: 'https://example.org/rekord/{Azonosító}',
  //   },
  // },
];

/** Human-readable source description written into the manifest. */
export const SOURCE_DESCRIPTION = 'nyitottaktak.hu (pontosítandó az M6 során)';
