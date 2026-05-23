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

describe('validateSduiJson — child arity', () => {
  it('rejects a leaf widget with children (text with children[])', () => {
    const json = { type: 'text', data: 'hi', children: [{ type: 'icon' }] };
    const r = validateSduiJson(json);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toMatch(/leaf/i);
  });

  it('rejects a single-child widget with multiple children', () => {
    const json = { type: 'container', children: [{ type: 'text' }, { type: 'text' }] };
    const r = validateSduiJson(json);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toMatch(/single-child/i);
  });

  it('accepts a single-child widget with one child', () => {
    const json = { type: 'container', children: [{ type: 'text', data: 'ok' }] };
    const r = validateSduiJson(json);
    expect(r.valid).toBe(true);
  });

  it('accepts a multi-child widget with many children', () => {
    const json = { type: 'column', children: [{ type: 'text' }, { type: 'text' }, { type: 'text' }] };
    const r = validateSduiJson(json);
    expect(r.valid).toBe(true);
  });

  it('rejects mixing child and children on single-child widgets', () => {
    const json = { type: 'container', child: { type: 'text' }, children: [{ type: 'text' }] };
    const r = validateSduiJson(json);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toMatch(/both 'child' and 'children'/i);
  });

  it('walks into slot fields (scaffold body)', () => {
    const json = {
      type: 'scaffold',
      body: { type: 'text', children: [{ type: 'icon' }] }, // leaf-with-children deep inside
    };
    const r = validateSduiJson(json);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toMatch(/leaf/i);
  });

  it('unknown types default to permissive (multi)', () => {
    const json = { type: 'someUnknownThing', children: [{ type: 'text' }, { type: 'text' }] };
    const r = validateSduiJson(json);
    expect(r.valid).toBe(true);
  });

  it('accepts the layoutKind=embed + container root combo with arity', () => {
    const json = { type: 'container', child: { type: 'text', data: 'hi' } };
    const r = validateSduiJson(json, { layoutKind: 'embed' });
    expect(r.valid).toBe(true);
  });
});
