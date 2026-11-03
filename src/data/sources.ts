/**
 * Source (document type) registry. Adding a new type – e.g. "bdosszie" (B-dosszié, due by
 * 2027-02-25) – means extending SOURCE_TYPES and SOURCES, then adding a record template.
 */
export const SOURCE_TYPES = ['karton6', 'bnaplo', 'hadattar'] as const; // later: "bdosszie"

export type SourceType = (typeof SOURCE_TYPES)[number];

export interface SourceMeta {
  /** Short id prefix used in stable record ids. */
  idPrefix: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const SOURCES: Record<SourceType, SourceMeta> = {
  karton6: {
    idPrefix: 'k6',
    label: '6-os karton',
    shortLabel: '6-os karton',
    description: 'Az ügynökök személyazonosító adatai és főbb tevékenységeik.',
  },
  bnaplo: {
    idPrefix: 'bn',
    label: 'B-napló',
    shortLabel: 'B-napló',
    description: 'A beszervezési dossziék ügynökeinek nevei (nyilvántartási napló).',
  },
  hadattar: {
    idPrefix: 'ha',
    label: 'H-adattár',
    shortLabel: 'H-adattár',
    description: 'Hálózati személyek adatai és fedőnevei, az 1970-es évektől mágnesszalagon rögzítve.',
  },
};

export function isSourceType(value: unknown): value is SourceType {
  return typeof value === 'string' && (SOURCE_TYPES as readonly string[]).includes(value);
}
