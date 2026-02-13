export type NodeType = 'root' | 'section' | 'category' | 'bookmark' | 'tag';

export interface GraphNodeConfig {
  type: NodeType;
  labelField: string;
  color: string;
  size: number;
}

export const GRAPH_CONFIG: Record<NodeType, GraphNodeConfig> = {
  root: {
    type: 'root',
    labelField: 'name',
    color: '#ffffff',
    size: 24, // Increased from 20
  },
  section: {
    type: 'section',
    labelField: 'title',
    color: '#22d3ee', // Electric Cyan
    size: 14,
  },
  category: {
    type: 'category',
    labelField: 'name',
    color: '#818cf8', // indigo-400
    size: 10,
  },
  bookmark: {
    type: 'bookmark',
    labelField: 'title',
    color: '#ffffff',
    size: 6,
  },
  tag: {
    type: 'tag',
    labelField: 'name',
    color: '#34d399', // emerald-400
    size: 3,
  },
};
