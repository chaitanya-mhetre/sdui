import { describe, it, expect } from 'vitest';
import { validateSduiJson } from '@/lib/sdui/validation';

describe('validateSduiJson — layoutKind', () => {
  it('accepts scaffold root when layoutKind is "full"', () => {
    const json = { type: 'scaffold', body: { type: 'container' } };
    const r = validateSduiJson(json, { layoutKind: 'full' });
    expect(r.valid).toBe(true);
  });

  it('rejects scaffold root when layoutKind is "embed"', () => {
    const json = { type: 'scaffold', body: { type: 'container' } };
    const r = validateSduiJson(json, { layoutKind: 'embed' });
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toMatch(/scaffold.*embed/i);
  });

  it('accepts container root when layoutKind is "embed"', () => {
    const json = { type: 'container', child: { type: 'text', data: 'hi' } };
    const r = validateSduiJson(json, { layoutKind: 'embed' });
    expect(r.valid).toBe(true);
  });

  it('rejects appBar / drawer / floatingActionButton as embed root', () => {
    for (const root of ['appBar', 'drawer', 'floatingActionButton']) {
      const r = validateSduiJson({ type: root }, { layoutKind: 'embed' });
      expect(r.valid).toBe(false);
    }
  });
});

describe('validateSduiJson — {{...}} syntax', () => {
  it('accepts balanced {{var}} expressions', () => {
    const json = { type: 'text', data: 'Hello {{user.name}}!' };
    const r = validateSduiJson(json);
    expect(r.valid).toBe(true);
  });

  it('rejects unbalanced braces', () => {
    const json = { type: 'text', data: 'Hello {{user.name}' };
    const r = validateSduiJson(json);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toMatch(/unbalanced/i);
  });

  it('does not validate referenced keys exist (runtime only)', () => {
    const json = { type: 'text', data: '{{whatever.nonexistent}}' };
    const r = validateSduiJson(json);
    expect(r.valid).toBe(true);
  });
});
