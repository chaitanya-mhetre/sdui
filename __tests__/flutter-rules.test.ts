import { describe, it, expect } from 'vitest';
import { validateDrop } from '@/lib/flutterRules';
import type { LayoutNode, ComponentDefinition } from '@/types';

const TEXT: ComponentDefinition = {
  id: 'Text', name: 'Text', category: 'display', icon: 'Type', description: '',
  allowChildren: false, properties: [], defaultProps: {},
  children: { mode: 'none' },
};

const CONTAINER: ComponentDefinition = {
  id: 'Container', name: 'Container', category: 'layout', icon: 'Square', description: '',
  allowChildren: true, properties: [], defaultProps: {},
  children: { mode: 'single' },
};

const COLUMN: ComponentDefinition = {
  id: 'Column', name: 'Column', category: 'layout', icon: 'AlignCenterVertical', description: '',
  allowChildren: true, properties: [], defaultProps: {},
  children: { mode: 'multi' },
};

const SCAFFOLD: ComponentDefinition = {
  id: 'Scaffold', name: 'Scaffold', category: 'layout', icon: 'LayoutDashboard', description: '',
  allowChildren: true, properties: [], defaultProps: {},
  children: { mode: 'slots', slots: [{ name: 'body', mode: 'single', required: true }] },
};

const APPBAR_ACTIONS: ComponentDefinition = {
  id: 'AppBar', name: 'AppBar', category: 'layout', icon: '', description: '',
  allowChildren: true, properties: [], defaultProps: {},
  // Simplified: a hypothetical AppBar with only multi-actions, allowedTypes restricted.
  children: { mode: 'multi', allowedTypes: ['IconButton', 'Icon'] },
};

const ICON: ComponentDefinition = { ...TEXT, id: 'Icon', name: 'Icon' };
const BUTTON: ComponentDefinition = { ...TEXT, id: 'Button', name: 'Button' };

function makeNode(componentType: string, children: LayoutNode[] = []): LayoutNode {
  return { id: componentType.toLowerCase() + '-' + Math.random().toString(36).slice(2, 6), componentType, props: {}, children };
}

const getDef = (id: string): ComponentDefinition | null => {
  const map: Record<string, ComponentDefinition> = {
    Text: TEXT,
    Container: CONTAINER,
    Column: COLUMN,
    Scaffold: SCAFFOLD,
    AppBar: APPBAR_ACTIONS,
    Icon: ICON,
    Button: BUTTON,
  };
  return map[id] ?? null;
};

describe('validateDrop — arity', () => {
  it('rejects drop into a leaf (Text)', () => {
    const text = makeNode('Text');
    const root: LayoutNode = { id: 'root', componentType: 'Root', props: {}, children: [text] };
    const r = validateDrop(text.id, root, BUTTON, getDef, []);
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.title).toMatch(/leaf|doesn't accept/i);
  });

  it('rejects second drop into a single-child parent (Container)', () => {
    const existingChild = makeNode('Text');
    const container = makeNode('Container', [existingChild]);
    const root: LayoutNode = { id: 'root', componentType: 'Root', props: {}, children: [container] };
    const r = validateDrop(container.id, root, BUTTON, getDef, []);
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.title).toMatch(/already has a child/i);
  });

  it('accepts first drop into a single-child parent (Container)', () => {
    const container = makeNode('Container', []);
    const root: LayoutNode = { id: 'root', componentType: 'Root', props: {}, children: [container] };
    const r = validateDrop(container.id, root, BUTTON, getDef, []);
    expect(r.allowed).toBe(true);
  });

  it('accepts multiple drops into a multi-child parent (Column)', () => {
    const column = makeNode('Column', [makeNode('Text'), makeNode('Text')]);
    const root: LayoutNode = { id: 'root', componentType: 'Root', props: {}, children: [column] };
    const r = validateDrop(column.id, root, BUTTON, getDef, []);
    expect(r.allowed).toBe(true);
  });

  it('rejects drop of disallowed type when allowedTypes is set', () => {
    const appbar = makeNode('AppBar');
    const root: LayoutNode = { id: 'root', componentType: 'Root', props: {}, children: [appbar] };
    const r = validateDrop(appbar.id, root, BUTTON, getDef, []);
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.title).toMatch(/Can't put Button inside AppBar/i);
  });

  it('accepts drop of allowed type when allowedTypes is set', () => {
    const appbar = makeNode('AppBar');
    const root: LayoutNode = { id: 'root', componentType: 'Root', props: {}, children: [appbar] };
    const r = validateDrop(appbar.id, root, ICON, getDef, []);
    expect(r.allowed).toBe(true);
  });

  it('rejects freeform drop on a slots-mode parent (Scaffold)', () => {
    const scaffold = makeNode('Scaffold');
    const root: LayoutNode = { id: 'root', componentType: 'Root', props: {}, children: [scaffold] };
    const r = validateDrop(scaffold.id, root, BUTTON, getDef, []);
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.title).toMatch(/slots/i);
  });
});

describe('validateDrop — existing Scaffold rules still work', () => {
  it('still rejects Scaffold added inside another widget', () => {
    const column = makeNode('Column', []);
    const root: LayoutNode = { id: 'root', componentType: 'Root', props: {}, children: [column] };
    const r = validateDrop(column.id, root, SCAFFOLD, getDef, []);
    expect(r.allowed).toBe(false);
    // Either arity (Column is multi, no allowedTypes restriction → would pass arity)
    // OR the existing Scaffold-only-at-root rule should reject. Either is fine, as
    // long as it's rejected.
  });
});
