/**
 * Normalised data model (SPEC §5) as zod schemas + TypeScript types.
 * zod is only used at import/validation time (scripts, tests); the client imports types only.
 */
import { z } from 'zod';
import { normalizeText } from '../search/normalize';
import { SOURCE_TYPES } from './sources';

export { SOURCE_TYPES, type SourceType } from './sources';

import { SCHEMA_VERSION } from './model';

export { SCHEMA_VERSION, OPTIONAL_FIELDS, type OptionalField } from './model';

const optionalText = z.string().trim().min(1).optional();

export const SourceTypeSchema = z.enum(SOURCE_TYPES);

export const AgentRecordSchema = z
  .object({
    /** Stable, deterministic identifier. */
    id: z.string().regex(/^[a-z0-9]+-[a-z0-9-]+$/, 'id: csak kisbetű, szám és kötőjel'),
    source: SourceTypeSchema,
    /** As written in the source. */
    name: z.string().trim().min(1),
    /** Without diacritics, lowercase – for search. Must equal normalizeText(name). */
    nameNormalized: z.string().min(1),
    coverName: optionalText,
    /** Whatever precision is known (year or full date). */
    birthDate: optionalText,
    birthPlace: optionalText,
    motherName: optionalText,
    recruitmentDate: optionalText,
    recruitingUnit: optionalText,
    category: optionalText,
    activity: optionalText,
    registryNumber: optionalText,
    officialUrl: z.url({ protocol: /^https?$/ }).optional(),
    /** Original source fields, so nothing is lost. */
    raw: z.record(z.string(), z.unknown()).optional(),
  })
  // Unknown keys are errors rather than silently dropped: extra source fields belong in `raw`.
  .strict()
  .superRefine((rec, ctx) => {
    if (rec.nameNormalized !== normalizeText(rec.name)) {
      ctx.addIssue({ code: 'custom', path: ['nameNormalized'], message: 'nameNormalized ≠ normalizeText(name)' });
    }
  });

export type AgentRecord = z.infer<typeof AgentRecordSchema>;


/**
 * Compact search-catalog row, stored as a tuple to keep the search payload small:
 * [id, source, name, coverName, birthYear, birthPlace, county, recruitmentYear, registryNumber]
 */
export const CatalogRowSchema = z.tuple([
  z.string(),
  SourceTypeSchema,
  z.string(),
  z.string().nullable(),
  z.number().int().nullable(),
  z.string().nullable(),
  z.string().nullable(),
  z.number().int().nullable(),
  z.string().nullable(),
]);

export type CatalogRow = z.infer<typeof CatalogRowSchema>;

export const ManifestSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  mode: z.enum(['mock', 'live']),
  generatedAt: z.string(),
  /** Human-readable description of where the data came from. */
  sourceDescription: z.string(),
  totalRecords: z.number().int().nonnegative(),
  counts: z.record(SourceTypeSchema, z.number().int().nonnegative()),
  /** Records are split into `records-XXX.json` buckets by hash(id) % bucketCount. */
  bucketCount: z.number().int().positive(),
  /** Search catalog is split into `catalog-XXX.json` chunks. */
  catalogChunks: z.number().int().positive(),
});

export type Manifest = z.infer<typeof ManifestSchema>;

const YearCount = z.record(z.string(), z.number().int().nonnegative());

export const StatsSchema = z.object({
  generatedAt: z.string(),
  totalRecords: z.number().int().nonnegative(),
  counts: z.record(SourceTypeSchema, z.number().int().nonnegative()),
  /** Recruitments per year, per source type. */
  recruitmentsByYear: z.record(SourceTypeSchema, YearCount),
  /** Birth decade ("1920") → count. */
  birthDecades: YearCount,
  /** County code → count (only where the birthplace could be resolved). */
  byCounty: z.record(z.string(), z.number().int().nonnegative()),
  /** Records whose birthplace could not be mapped to a county. */
  unknownCounty: z.number().int().nonnegative(),
  /** Field completeness: source → field → number of records that have it. */
  fieldCoverage: z.record(SourceTypeSchema, z.record(z.string(), z.number().int().nonnegative())),
  /** Names that appear in more than one source type (not proof of identity!). */
  crossSourceNames: z.number().int().nonnegative(),
});

export type Stats = z.infer<typeof StatsSchema>;
