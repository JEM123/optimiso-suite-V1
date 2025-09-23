import type { Entite, Poste } from '../types';
import type { Node, Edge } from 'reactflow';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 80;

interface TreeNode {
    id: string;
    item: Entite | Poste;
    children: TreeNode[];
    width: number;
    x: number;
    y: number;
}

export const buildOrganigrammeLayout = (entites: Entite[], postes: Poste[]): { nodes: Node[], edges: Edge[] } => {
    if (entites.length === 0) return { nodes: [], edges: [] };

    const allItems: (Entite | Poste)[] = [...entites, ...postes];
    const itemMap = new Map(allItems.map(item => [item.id, item]));
    const childrenMap = new Map<string, string[]>();

    allItems.forEach(item => {
        let parentId: string | undefined;
        if ('type' in item) { // is Entite
            parentId = item.parentId;
        } else { // is Poste
            parentId = item.posteParentId || item.entiteId;
        }
        if (parentId && itemMap.has(parentId)) {
            if (!childrenMap.has(parentId)) {
                childrenMap.set(parentId, []);
            }
            childrenMap.get(parentId)!.push(item.id);
        }
    });

    const roots = allItems.filter(item => {
        let parentId: string | undefined;
        if ('type' in item) { parentId = item.parentId; } 
        else { parentId = item.posteParentId || item.entiteId; }
        return !parentId || !itemMap.has(parentId);
    });

    const buildTree = (itemId: string): TreeNode => {
        const item = itemMap.get(itemId)!;
        const children = (childrenMap.get(itemId) || []).map(childId => buildTree(childId));
        return { id: itemId, item, children, width: 0, x: 0, y: 0 };
    };
    
    const forest = roots.map(root => buildTree(root.id));

    const calculateWidths = (node: TreeNode): void => {
        if (node.children.length === 0) {
            node.width = NODE_WIDTH;
            return;
        }
        node.children.forEach(calculateWidths);
        const childrenWidth = node.children.reduce((acc, child) => acc + child.width, 0) + (node.children.length - 1) * HORIZONTAL_SPACING;
        node.width = Math.max(NODE_WIDTH, childrenWidth);
    };
    forest.forEach(calculateWidths);
    
    const assignPositions = (node: TreeNode, level: number, parentX: number) => {
        node.y = level * (NODE_HEIGHT + VERTICAL_SPACING);
        
        const childrenWidth = node.children.reduce((acc, child) => acc + child.width, 0) + (node.children.length - 1) * HORIZONTAL_SPACING;
        let currentX = parentX - childrenWidth / 2;

        node.children.forEach(child => {
            const childX = currentX + child.width / 2;
            assignPositions(child, level + 1, childX);
            currentX += child.width + HORIZONTAL_SPACING;
        });
        
        node.x = parentX;
    };
    
    let forestWidth = forest.reduce((acc, tree) => acc + tree.width, 0) + (forest.length - 1) * HORIZONTAL_SPACING * 2;
    let currentX = -forestWidth / 2;

    forest.forEach(tree => {
        const treeX = currentX + tree.width / 2;
        assignPositions(tree, 0, treeX);
        currentX += tree.width + HORIZONTAL_SPACING * 2;
    });

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const flattenTree = (node: TreeNode) => {
        nodes.push({
            id: node.id,
            type: 'default',
            data: { label: ('nom' in node.item) ? node.item.nom : node.item.intitule },
            position: { x: node.x, y: node.y },
        });
        node.children.forEach(child => {
            edges.push({
                id: `e-${node.id}-${child.id}`,
                source: node.id,
                target: child.id,
                type: 'smoothstep',
            });
            flattenTree(child);
        });
    };
    forest.forEach(flattenTree);

    return { nodes, edges };
};
