
export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

export interface MindMapNodeData extends MindMapNode {
  id: string;
  children?: MindMapNodeData[];
  // D3 properties. These are added by d3.hierarchy and layout
  x?: number;
  y?: number;
  depth?: number;
  height?: number;
  parent?: MindMapNodeData | null; 
  data?: MindMapNode; // Original data node
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  // Other types of chunks can be defined here if needed
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other grounding metadata fields can be added here
}

export interface Candidate {
  groundingMetadata?: GroundingMetadata;
  // Other candidate fields
}
