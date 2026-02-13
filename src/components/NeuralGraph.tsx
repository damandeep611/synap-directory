"use client";

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { GraphData, GraphNode, GraphLink } from '@/actions/graph';
import { forceX, forceY, forceCollide } from 'd3-force';
import { ForceGraphMethods } from 'react-force-graph-2d';

// Extended types for the force simulation
interface ForceGraphNode extends GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  index?: number;
}

interface ForceGraphLink extends Omit<GraphLink, 'source' | 'target'> {
  source: ForceGraphNode | string;
  target: ForceGraphNode | string;
  index?: number;
}

// Helper to check if source/target are objects (post-init)
const isNodeObject = (node: string | ForceGraphNode): node is ForceGraphNode => {
  return typeof node !== 'string';
};

// Dynamic import to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

interface NeuralGraphProps {
  data: GraphData;
}

const NeuralGraph: React.FC<NeuralGraphProps> = ({ data }) => {
  const router = useRouter();
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial simulation tuning
  useEffect(() => {
    if (graphRef.current) {
      const fg = graphRef.current;
      // 1. Reduce repulsion for a denser cluster
      fg.d3Force('charge')?.strength(-80);
      
      // 2. Shorten link distances significantly
      const linkForce: any = fg.d3Force('link');
      if (linkForce) {
        linkForce.distance((link: ForceGraphLink) => {
          const source = link.source as ForceGraphNode;
          if (source.type === 'root') return 80; 
          if (source.type === 'section') return 50; 
          return 20; 
        }).iterations(2);
      }

      // 3. Add Centering force to pull everything into a "Brain" shape
      fg.d3Force('center', null); // Remove default center
      fg.d3Force('x', forceX(0).strength(0.1));
      fg.d3Force('y', forceY(0).strength(0.1));
      
      // 4. Add Collision to prevent overlap in the dense cluster
      fg.d3Force('collide', forceCollide((node: any) => (node as ForceGraphNode).size * 1.8)); 
    }
  }, [data]);

  const handleClick = (node: object) => {
    const gNode = node as ForceGraphNode;
    if (!gNode.isClickable) return;

    if (gNode.slug) {
      router.push(gNode.slug);
    } else if (gNode.url) {
      window.open(gNode.url, '_blank', 'noopener,noreferrer');
    }
  };

  const paintNode = (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as ForceGraphNode;
    const { x, y, color, label, size, type } = n;
    if (x === undefined || y === undefined || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const isHovered = hoverNode === n.id;
    
    // 1. UNIQUE ROOT "BRAIN CORE" DESIGN
    if (type === 'root') {
        // Outer pulsing field
        const pulse = (Math.sin(Date.now() / 1000) * 0.2) + 1;
        const rootGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 5 * pulse);
        rootGlow.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        rootGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        rootGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = rootGlow;
        ctx.beginPath();
        ctx.arc(x, y, size * 5 * pulse, 0, 2 * Math.PI);
        ctx.fill();

        // Concentric brain rings
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(x, y, (size + (i * 6)) / globalScale, 0, 2 * Math.PI);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = (2 - (i * 0.5)) / globalScale;
            ctx.globalAlpha = 0.1 * (4 - i);
            ctx.setLineDash([10, 5]);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    // 1b. Standard Multi-layered Glow (for others)
    if (type !== 'root') {
        const glowSize = size * 3.5;
        if (Number.isFinite(glowSize) && glowSize > 0) {
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
            gradient.addColorStop(0, `${color}${isHovered ? '44' : '22'}`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, glowSize, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // 2. Decorative Hub Rings (Only for categories now)
    if (type === 'category') {
        ctx.beginPath();
        ctx.arc(x, y, size + 4 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.globalAlpha = isHovered ? 0.9 : 0.3;
        ctx.stroke();
    }

    // 3. Core Node with Inner Detail
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    
    // Root is dark, Sections are vibrant colors
    ctx.fillStyle = (isHovered && type !== 'root') ? '#ffffff' : color;
    ctx.globalAlpha = 1;
    ctx.fill();

    // Define Root node with a subtle border
    if (type === 'root') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
    }
    
    // Subtle inner depth for Root and Section
    if ((type === 'root' || type === 'section') && size > 8) {
        ctx.beginPath();
        ctx.arc(x, y, size * 0.8, 0, 2 * Math.PI);
        ctx.fillStyle = type === 'root' ? '#ffffff' : '#000000';
        ctx.globalAlpha = 0.05; 
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // 4. Enhanced Typography
    const shouldShowLabel = globalScale > 0.6 || type === 'root' || type === 'section' || isHovered;
    if (shouldShowLabel) {
      // Adjusted font sizes for larger nodes
      const baseFontSize = type === 'root' ? 22 : (type === 'section' ? 12 : 7.6); 
      const fontSize = baseFontSize / globalScale; 
      
      ctx.font = `${type === 'root' || type === 'section' ? '900' : '500'} ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (type === 'root' || type === 'section') {
          // Label INSIDE the node
          ctx.fillStyle = '#ffffff'; // All labels inside nodes are now white
          ctx.shadowBlur = 0;
          
          // Use full label name (removed truncation)
          ctx.fillText(label, x, y);
      } else {
          // Label BELOW the node for others
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 6 / globalScale;
          ctx.fillStyle = isHovered ? '#ffffff' : '#ffffff';
          
          const labelYOffset = size + fontSize + (6 / globalScale);
          ctx.fillText(label, x, y + labelYOffset);
      }
      
      ctx.shadowBlur = 0;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-black/20 overflow-hidden relative">
      <div className="absolute top-6 left-8 z-10 pointer-events-none space-y-1">
        <h3 className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-bold">Neural Codex</h3>
        <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-white/20 text-[8px] uppercase tracking-widest font-medium">System Core Active</p>
        </div>
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        nodeCanvasObject={paintNode}
        nodeLabel={(node: object) => {
            const n = node as ForceGraphNode;
            return n.isClickable ? `Click to explore ${n.label}` : n.label;
        }}
        onNodeClick={handleClick}
        onNodeHover={(node) => setHoverNode(node ? (node as ForceGraphNode).id : null)}
        
        // Link styling for that organic look
        linkColor={(link: object) => (link as ForceGraphLink).color || 'rgba(255, 255, 255, 0.15)'}
        linkCurvature={0.25}
        linkWidth={(link: object) => {
            const l = link as ForceGraphLink;
            if (isNodeObject(l.source) && l.source.type === 'root') return 2.5;
            return 1.2;
        }}
        
        // Particle effects
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={(link: object) => (link as ForceGraphLink).color || 'rgba(255, 255, 255, 0.4)'}
        
        d3VelocityDecay={0.4}
      />
    </div>
  );
};

export default NeuralGraph;
