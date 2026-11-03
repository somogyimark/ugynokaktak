import type { AgentRecord } from '../data/schema';
import type { SourceType } from '../data/sources';

/** Normalised fields an adapter can fill from a source column. */
export type MappableField =
  | 'name'
  | 'coverName'
  | 'birthDate'
  | 'birthPlace'
  | 'motherName'
  | 'recruitmentDate'
  | 'recruitingUnit'
  | 'category'
  | 'activity'
  | 'registryNumber'
  | 'officialUrl';

/**
 * Describes how one source file maps onto the normalised model. Written by hand once the
 * real format is known (M6). Column names are matched case- and accent-insensitively.
 */
export interface FieldMapping {
  source: SourceType;
  /** Normalised field → source column name (or candidates, first non-empty wins). */
  fields: Partial<Record<MappableField, string | readonly string[]>>;
  /** Columns whose values identify a row; used for the stable id. Defaults to registryNumber + name + birthDate. */
  idFields?: readonly string[];
  /** Builds the official URL when the source has an id but no link, e.g. "https://…/rekord/{Azonosító}". */
  officialUrlTemplate?: string;
}

/** A candidate record, not yet validated. */
export type CandidateRecord = Partial<AgentRecord> & { raw: Record<string, unknown> };

export interface AdapterResult {
  records: CandidateRecord[];
  /** Row-level problems found while parsing (validation happens later). */
  warnings: string[];
}

export interface SourceAdapter {
  id: string;
  description: string;
  canHandle(fileName: string): boolean;
  parse(content: string, mapping: FieldMapping): AdapterResult;
}
