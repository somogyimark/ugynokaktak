/**
 * Zod-free constants of the data model, safe to import from client code
 * (importing values from schema.ts would pull zod into the bundle).
 */
import type { AgentRecord } from './schema';

/** Version of the on-disk data layout. */
export const SCHEMA_VERSION = 1;

/** Optional, displayable fields of a record, in display order. */
export const OPTIONAL_FIELDS = [
  'coverName',
  'birthDate',
  'birthPlace',
  'motherName',
  'recruitmentDate',
  'recruitingUnit',
  'category',
  'activity',
  'registryNumber',
  'officialUrl',
] as const satisfies readonly (keyof AgentRecord)[];

export type OptionalField = (typeof OPTIONAL_FIELDS)[number];
