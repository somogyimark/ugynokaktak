import { csvAdapter } from './csv';
import { jsonAdapter } from './json';
import type { SourceAdapter } from './types';

/** Registered adapters. Add html.ts / pdf.ts here when the live format requires it (M6). */
export const ADAPTERS: readonly SourceAdapter[] = [csvAdapter, jsonAdapter];

export function adapterFor(fileName: string): SourceAdapter | undefined {
  return ADAPTERS.find((a) => a.canHandle(fileName));
}

export type { SourceAdapter, FieldMapping, AdapterResult, CandidateRecord, MappableField } from './types';
