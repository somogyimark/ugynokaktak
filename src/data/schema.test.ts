import { describe, expect, it } from 'vitest';
import { AgentRecordSchema } from './schema';

const base = { id: 'k6-abc', source: 'karton6', name: 'Próbaházi Gábor', nameNormalized: 'probahazi gabor' };

describe('AgentRecordSchema', () => {
  it('accepts a minimal record', () => {
    expect(AgentRecordSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an inconsistent nameNormalized', () => {
    expect(AgentRecordSchema.safeParse({ ...base, nameNormalized: 'x' }).success).toBe(false);
  });

  it('rejects unknown keys (they belong in raw)', () => {
    expect(AgentRecordSchema.safeParse({ ...base, foo: 1 }).success).toBe(false);
    expect(AgentRecordSchema.safeParse({ ...base, raw: { foo: 1 } }).success).toBe(true);
  });

  it('rejects unknown source types and empty strings', () => {
    expect(AgentRecordSchema.safeParse({ ...base, source: 'bdosszie' }).success).toBe(false);
    expect(AgentRecordSchema.safeParse({ ...base, coverName: '' }).success).toBe(false);
  });

  it('only accepts http(s) official URLs', () => {
    expect(AgentRecordSchema.safeParse({ ...base, officialUrl: 'https://example.org/x' }).success).toBe(true);
    expect(AgentRecordSchema.safeParse({ ...base, officialUrl: 'javascript:alert(1)' }).success).toBe(false);
  });
});
