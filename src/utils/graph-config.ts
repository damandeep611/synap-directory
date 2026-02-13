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
    color: '#0a0a0a', // Deep Black for contrast with white text
    size: 40, 
  },
  section: {
    type: 'section',
    labelField: 'title',
    color: '#22d3ee', // Electric Cyan
    size: 28, // Increased from 20
  },
  category: {
    type: 'category',
    labelField: 'name',
    color: '#818cf8', // indigo-400
    size: 12, // Increased from 10
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
    color: '#ffffff', // Neutral White for contrast
    size: 3,
  },
};
