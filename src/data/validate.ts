/** zod-based validation helpers for scripts and tests (not bundled into the client). */
import { AgentRecordSchema, type AgentRecord } from './schema';

export interface ValidationIssue {
  index: number;
  id?: string;
  messages: string[];
}

export interface ValidationResult {
  valid: AgentRecord[];
  issues: ValidationIssue[];
}

export function validateRecords(input: readonly unknown[]): ValidationResult {
  const valid: AgentRecord[] = [];
  const issues: ValidationIssue[] = [];
  input.forEach((item, index) => {
    const parsed = AgentRecordSchema.safeParse(item);
    if (parsed.success) valid.push(parsed.data);
    else {
      const id = typeof item === 'object' && item && 'id' in item ? String((item as { id: unknown }).id) : undefined;
      issues.push({
        index,
        id,
        messages: parsed.error.issues.map((i) => `${i.path.join('.') || '(rekord)'}: ${i.message}`),
      });
    }
  });
  return { valid, issues };
}
