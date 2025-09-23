
import type { Entite, Poste, Personne } from '../types';
import type { Node, Edge } from 'reactflow';
import { hierarchy, tree } from 'd3-hierarchy';

const NODE_WIDTH = 224; // w-56
const NODE_HEIGHT = 120;
const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 80;

interface HierarchyDataItem {
    id: string;
    item: Entite | Poste;
    children?: HierarchyDataItem[];
}

const getEntitePeopleCount = (
    entiteId: string,
    entites: Entite[],
    postes: Poste[],
    entiteChildrenMap: Map<string, string[]>
): number => {
    let count = postes.filter(p => p.entiteId === entiteId)
                      .reduce((sum, p) => sum + p.occupantsIds.length, 0);

    const childrenIds = entiteChildrenMap.get(entiteId) || [];
    for (const childId of childrenIds) {
        count += getEntitePeopleCount(childId, entites, postes, entiteChildrenMap);
    }
    return count;
};

export const buildOrganigrammeLayout = (
    entites: Entite[],
    postes: Poste[],
    personnes: Personne[],
    layoutDirection: 'TB' | 'LR' = 'TB',
    collapsedNodes: Set<string>,
    onToggleNode: (nodeId: string) => void
): { nodes: Node[], edges: Edge[] } => {
    if (entites.length === 0) return { nodes: [], edges: [] };

    const allItems: (Entite | Poste)[] = [...entites, ...postes];
    const itemMap = new Map(allItems.map(item => [item.id, item]));
    const childrenMap = new Map<string, string[]>();

    allItems.forEach(item => {
        const parentId = 'type' in item ? item.parentId : (item.posteParentId || item.entiteId);
        if (parentId && itemMap.has(parentId)) {
            if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
            childrenMap.get(parentId)!.push(item.id);
        }
    });

    const buildHierarchy = (itemId: string): HierarchyDataItem | null => {
        const item = itemMap.get(itemId);
        if (!item) return null;

        const dataItem: HierarchyDataItem = { id: itemId, item };
        
        if (!collapsedNodes.has(itemId)) {
            const childrenIds = childrenMap.get(itemId) || [];
            if (childrenIds.length > 0) {
                dataItem.children = childrenIds.map(buildHierarchy).filter((c): c is HierarchyDataItem => c !== null);
            }
        }
        return dataItem;
    };
    
    const roots = allItems.filter(item => {
        const parentId = 'type' in item ? item.parentId : (item.posteParentId || item.entiteId);
        return !parentId || !itemMap.has(parentId);
    });

    const virtualRoot: HierarchyDataItem = {
        id: '___virtual_root___',
        item: { id: '___virtual_root___', nom: 'Root' } as any,
        children: roots.map(root => buildHierarchy(root.id)).filter((c): c is HierarchyDataItem => c !== null),
    };

    const d3Hierarchy = hierarchy(virtualRoot);
    const treeLayout = tree<HierarchyDataItem>();

    if (layoutDirection === 'TB') {
        treeLayout.nodeSize([NODE_WIDTH + HORIZONTAL_SPACING, NODE_HEIGHT + VERTICAL_SPACING]);
    } else {
        treeLayout.nodeSize([NODE_HEIGHT + VERTICAL_SPACING, NODE_WIDTH + HORIZONTAL_SPACING]);
    }
    
    const layout = treeLayout(d3Hierarchy);
    const descendants = layout.descendants();

    const entiteChildrenMap = new Map<string, string[]>();
    entites.forEach(e => {
        if (e.parentId) {
            if (!entiteChildrenMap.has(e.parentId)) entiteChildrenMap.set(e.parentId, []);
            entiteChildrenMap.get(e.parentId)!.push(e.id);
        }
    });

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    descendants.forEach(d3Node => {
        if (d3Node.data.id === '___virtual_root___') return;

        const item = d3Node.data.item;
        const isEntite = 'type' in item;
        const hasChildren = (childrenMap.get(item.id) || []).length > 0;
        
        const peopleCount = isEntite
            ? getEntitePeopleCount(item.id, entites, postes, entiteChildrenMap)
            : (item as Poste).occupantsIds.length;
        
        const occupants = isEntite ? [] : personnes.filter(p => (item as Poste).occupantsIds.includes(p.id));
        const responsable = isEntite ? personnes.find(p => p.id === (item as Entite).responsableId) : undefined;
        
        nodes.push({
            id: item.id,
            type: isEntite ? 'entite' : 'poste',
            data: { 
                item: item,
                peopleCount: peopleCount,
                occupants: occupants,
                responsable: responsable,
                isCollapsed: collapsedNodes.has(item.id),
                onToggleCollapse: onToggleNode,
                hasChildren: hasChildren,
            },
            position: layoutDirection === 'TB' ? { x: d3Node.x, y: d3Node.y } : { x: d3Node.y, y: d3Node.x },
        });

        if (d3Node.parent && d3Node.parent.data.id !== '___virtual_root___') {
            edges.push({
                id: `e-${d3Node.parent.data.id}-${d3Node.data.id}`,
                source: d3Node.parent.data.id,
                target: d3Node.data.id,
                type: 'smoothstep',
            });
        }
    });

    return { nodes, edges };
};
