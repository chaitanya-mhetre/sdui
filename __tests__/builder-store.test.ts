import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from '@/store/builderStore';
import type { LayoutNode } from '@/types';

function makeNode(componentType: string, id: string, children: LayoutNode[] = [], props: Record<string, unknown> = {}): LayoutNode {
  return { id, componentType, props, children };
}

function setRoot(tree: LayoutNode) {
  useBuilderStore.setState({
    rootNode: tree,
    selection: { selectedNodeId: null, selectedNodes: [], hoveredNodeId: null } as any,
    clipboardNode: null,
  });
}

describe('builderStore — moveNode', () => {
  it('moves a node between siblings (within same parent)', () => {
    const a = makeNode('Text', 'a');
    const b = makeNode('Text', 'b');
    const c = makeNode('Text', 'c');
    const col = makeNode('Column', 'col', [a, b, c]);
    setRoot(makeNode('Root', 'root', [col]));
    useBuilderStore.getState().moveNode('a', 'col', 2);
    const cols = useBuilderStore.getState().rootNode!.children[0];
    expect(cols.children.map((n) => n.id)).toEqual(['b', 'a', 'c']);
  });

  it('reparents to a different parent', () => {
    const a = makeNode('Text', 'a');
    const col1 = makeNode('Column', 'col1', [a]);
    const col2 = makeNode('Column', 'col2', []);
    setRoot(makeNode('Root', 'root', [col1, col2]));
    useBuilderStore.getState().moveNode('a', 'col2');
    const root = useBuilderStore.getState().rootNode!;
    expect(root.children[0].children).toHaveLength(0);
    expect(root.children[1].children.map((n) => n.id)).toEqual(['a']);
  });

  it('no-op when nodeId === newParentId', () => {
    const a = makeNode('Text', 'a');
    setRoot(makeNode('Root', 'root', [a]));
    useBuilderStore.getState().moveNode('a', 'a');
    expect(useBuilderStore.getState().rootNode!.children).toHaveLength(1);
  });
});

describe('builderStore — duplicateNode', () => {
  it('duplicates a node with a fresh id, inserted as next sibling', () => {
    const a = makeNode('Text', 'a', [], { data: 'hello' });
    const col = makeNode('Column', 'col', [a]);
    setRoot(makeNode('Root', 'root', [col]));
    useBuilderStore.getState().duplicateNode('a');
    const colNow = useBuilderStore.getState().rootNode!.children[0];
    expect(colNow.children).toHaveLength(2);
    expect(colNow.children[0].id).toBe('a');
    expect(colNow.children[1].id).not.toBe('a');
    expect(colNow.children[1].props.data).toBe('hello');
  });

  it('deep-clones children with fresh ids', () => {
    const inner = makeNode('Text', 'inner');
    const a = makeNode('Container', 'a', [inner]);
    const col = makeNode('Column', 'col', [a]);
    setRoot(makeNode('Root', 'root', [col]));
    useBuilderStore.getState().duplicateNode('a');
    const colNow = useBuilderStore.getState().rootNode!.children[0];
    expect(colNow.children[1].children[0].id).not.toBe('inner');
  });
});

describe('builderStore — copy/paste/cut', () => {
  it('copyNode populates clipboardNode (deep clone)', () => {
    const a = makeNode('Text', 'a', [], { data: 'x' });
    setRoot(makeNode('Root', 'root', [a]));
    useBuilderStore.getState().copyNode('a');
    expect(useBuilderStore.getState().clipboardNode).toBeTruthy();
    expect(useBuilderStore.getState().clipboardNode!.id).not.toBe('a');
    expect(useBuilderStore.getState().clipboardNode!.props.data).toBe('x');
  });

  it('pasteNode inserts clipboard as child of parentId', () => {
    const a = makeNode('Text', 'a');
    const col = makeNode('Column', 'col', []);
    setRoot(makeNode('Root', 'root', [col]));
    useBuilderStore.setState({ clipboardNode: a, selection: { selectedNodeId: 'col', selectedNodes: ['col'], hoveredNodeId: null } as any });
    useBuilderStore.getState().pasteNode('col');
    expect(useBuilderStore.getState().rootNode!.children[0].children).toHaveLength(1);
  });

  it('cutNode copies then deletes', () => {
    const a = makeNode('Text', 'a');
    const col = makeNode('Column', 'col', [a]);
    setRoot(makeNode('Root', 'root', [col]));
    useBuilderStore.getState().cutNode('a');
    expect(useBuilderStore.getState().clipboardNode).toBeTruthy();
    expect(useBuilderStore.getState().rootNode!.children[0].children).toHaveLength(0);
  });
});

describe('builderStore — setNodeHidden', () => {
  it('sets __hidden flag on node.props', () => {
    const a = makeNode('Text', 'a');
    setRoot(makeNode('Root', 'root', [a]));
    useBuilderStore.getState().setNodeHidden('a', true);
    expect(useBuilderStore.getState().rootNode!.children[0].props.__hidden).toBe(true);
    useBuilderStore.getState().setNodeHidden('a', false);
    expect(useBuilderStore.getState().rootNode!.children[0].props.__hidden).toBe(false);
  });
});
