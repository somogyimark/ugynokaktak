import type { AgentRecord, OptionalField } from '../../data/schema';

export const FIELD_LABELS: Record<OptionalField | 'name', string> = {
  name: 'Név',
  coverName: 'Fedőnév',
  birthDate: 'Születési idő',
  birthPlace: 'Születési hely',
  motherName: 'Anyja neve',
  recruitmentDate: 'Beszervezés ideje',
  recruitingUnit: 'Beszervező szerv',
  category: 'Kategória',
  activity: 'Főbb tevékenység',
  registryNumber: 'Nyilvántartási szám',
  officialUrl: 'Hivatalos rekord',
};

const DATE_FIELDS = new Set<OptionalField>(['birthDate', 'recruitmentDate']);

/** Display string for a field, or undefined when missing. Dates are formatted in Hungarian. */
export function fieldText(record: AgentRecord, field: OptionalField | 'name', format: (d: string) => string): string | undefined {
  const value = record[field];
  if (value === undefined) return undefined;
  return DATE_FIELDS.has(field as OptionalField) ? format(value) : value;
}

/** Ledger position from raw data when present ("lap"/"sor"), otherwise undefined. */
export function rawNumber(record: AgentRecord, key: string): number | undefined {
  const v = record.raw?.[key];
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export function rawText(record: AgentRecord, key: string): string | undefined {
  const v = record.raw?.[key];
  return typeof v === 'string' && v.trim() ? v : typeof v === 'number' ? String(v) : undefined;
}
