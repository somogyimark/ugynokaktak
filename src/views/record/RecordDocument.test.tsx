import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { OPTIONAL_FIELDS, AgentRecordSchema, type AgentRecord, type OptionalField } from '../../data/schema';
import { SOURCE_TYPES } from '../../data/sources';
import { normalizeText } from '../../search/normalize';
import { formatDate } from '../../lib/format';
import { RecordDocument } from './RecordDocument';
import { PageMeta } from '../../components/PageMeta';

const FULL: Record<OptionalField, string> = {
  coverName: 'Fecske',
  birthDate: '1931-04-02',
  birthPlace: 'Szeged',
  motherName: 'Mintás Mária',
  recruitmentDate: '1962',
  recruitingUnit: 'BM III/III-4. osztály',
  category: 'informátor',
  activity: 'üzemi környezet ellenőrzése (fiktív)',
  registryNumber: 'H-01-000042',
  officialUrl: 'https://example.org/demo/1',
};

/** Fields every template shows (officialUrl is shown as a link in SourceInfo instead). */
const SHOWN = OPTIONAL_FIELDS.filter((f) => f !== 'officialUrl');
const RAW_VARIANTS: (Record<string, unknown> | undefined)[] = [undefined, {}, { sor: 7, lap: 2, szalag: 'SZALAG 03', blokk: 12, extra: { nested: [1, 2] } }, { sor: 'x', lap: -1 }];

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;

function makeRecord(source: AgentRecord['source'], mask: number, rawIndex: number): AgentRecord {
  const name = 'Próbaházi Gábor';
  const rec: AgentRecord = { id: `t-${source}-${mask}`, source, name, nameNormalized: normalizeText(name) };
  OPTIONAL_FIELDS.forEach((f, bit) => {
    if (mask & (1 << bit)) rec[f] = FULL[f];
  });
  const raw = RAW_VARIANTS[rawIndex % RAW_VARIANTS.length];
  if (raw) rec.raw = raw;
  return rec;
}

describe('record templates render every field combination', () => {
  for (const source of SOURCE_TYPES) {
    it(`${source}: all ${2 ** OPTIONAL_FIELDS.length} combinations, including empty`, () => {
      for (let mask = 0; mask < 2 ** OPTIONAL_FIELDS.length; mask++) {
        const record = makeRecord(source, mask, mask);
        expect(AgentRecordSchema.safeParse(record).success).toBe(true);
        const html = renderToStaticMarkup(<RecordDocument record={record} />);
        const ctx = `${source} mask=${mask}`;

        expect(html, ctx).toContain(escape(record.name));
        expect(html, ctx).toContain('data-testid="record-disclaimer"');
        expect(html, ctx).toContain('önmagában nem bizonyítja');

        const missing = SHOWN.filter((f) => record[f] === undefined);
        for (const f of SHOWN) {
          const v = record[f];
          if (v !== undefined) {
            const variants = [v, formatDate(v), v.toUpperCase()].map(escape);
            expect(variants.some((x) => html.includes(x)), `${ctx} shows ${f}`).toBe(true);
          }
        }
        // Missing fields are redacted (paper), or announced in the accessible list (terminal, which types lines in later).
        const redactions = count(html, 'data-redaction=""');
        const announced = count(html, 'adat nem áll rendelkezésre');
        if (source === 'hadattar') expect(announced, ctx).toBe(missing.length);
        else expect(redactions, ctx).toBe(missing.length);

        if (record.officialUrl) expect(html, ctx).toContain(`href="${record.officialUrl}"`);
        else expect(html, ctx).toContain('Nincs elérhető hivatkozás');
      }
    });
  }
});

describe('indexing rules', () => {
  it('PageMeta is noindex unless explicitly indexable', () => {
    expect(renderToStaticMarkup(<PageMeta title="x" />)).toContain('<meta name="robots" content="noindex, nofollow"/>');
    expect(renderToStaticMarkup(<PageMeta title="x" indexable />)).not.toContain('robots');
  });

  it('only the landing, statistics and methodology pages opt into indexing', () => {
    const view = (name: string) => readFileSync(join(import.meta.dirname, '..', `${name}.tsx`), 'utf8');
    for (const name of ['Record', 'Search', 'Styleguide', 'NotFound']) {
      expect(view(name)).toContain('<PageMeta');
      expect(view(name), name).not.toMatch(/indexable/);
    }
    for (const name of ['Home', 'Stats', 'Methodology']) expect(view(name), name).toMatch(/<PageMeta[^>]*indexable/);
  });
});
