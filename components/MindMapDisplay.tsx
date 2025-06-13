
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MindMapNodeData } from '../types';
import { D3_MARGIN, D3_NODE_RADIUS, D3_NODE_HORIZONTAL_SPACING, D3_NODE_VERTICAL_SPACING } from '../constants';

interface MindMapDisplayProps {
  data: MindMapNodeData;
  width?: number;
  height?: number;
}

export const MindMapDisplay: React.FC<MindMapDisplayProps> = ({ data, width = 800, height = 600 }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove(); // Clear previous rendering

    const effectiveWidth = width - D3_MARGIN.left - D3_MARGIN.right;
    const effectiveHeight = height - D3_MARGIN.top - D3_MARGIN.bottom;

    const root = d3.hierarchy(data);
    
    // Use d3.tree layout for a classic mind map structure
    // The layout size is [height, width] for horizontal tree
    const treeLayout = d3.tree<MindMapNodeData>().size([effectiveHeight, effectiveWidth]);
    treeLayout(root);

    const g = svgElement.append("g")
      .attr("transform", `translate(${D3_MARGIN.left},${D3_MARGIN.top})`);

    // Links
    g.selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal<d3.HierarchyLink<MindMapNodeData>, d3.HierarchyPointNode<MindMapNodeData>>()
        .x(d => d.y) // In horizontal tree, x is based on depth (mapped to y here)
        .y(d => d.x) // y is based on breadth (mapped to x here)
      );

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", d => `node${d.children ? " node--internal" : " node--leaf"}${d.depth === 0 ? " is-root" : (d.children ? " is-child" : " is-leaf")}`)
      .attr("transform", d => `translate(${d.y},${d.x})`); // Swap x and y for horizontal layout

    node.append("circle")
      .attr("r", D3_NODE_RADIUS);
      
    node.append("text")
      .attr("dy", ".31em")
      .attr("x", d => d.children ? - (D3_NODE_RADIUS + 5) : (D3_NODE_RADIUS + 5))
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .clone(true).lower() // For text background/stroke effect if needed
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .attr("stroke", "white"); // Match background or use a specific color for halo

    // Optional: Adjust node spacing based on depth or number of children
    // This requires a more complex layout or post-layout adjustments
    // For now, fixed spacing via treeLayout.nodeSize or .size is used.
    // If using nodeSize: treeLayout.nodeSize([D3_NODE_VERTICAL_SPACING, D3_NODE_HORIZONTAL_SPACING]);

  }, [data, width, height]);

  return (
    <div className="w-full overflow-auto bg-white rounded">
       <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};
