"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { GraphData, GraphNode } from '@/actions/graph';
import { forceX, forceY, forceCollide } from 'd3-force';

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
      fg.d3Force('charge').strength(-80);
      
      // 2. Shorten link distances significantly
      fg.d3Force('link').distance((link: any) => {
        if (link.source.type === 'root') return 50;
        if (link.source.type === 'section') return 30;
        return 15;
      }).iterations(2);

      // 3. Add Centering force to pull everything into a "Brain" shape
      fg.d3Force('center', null); // Remove default center
      fg.d3Force('x', forceX(0).strength(0.1));
      fg.d3Force('y', forceY(0).strength(0.1));
      
      // 4. Add Collision to prevent overlap in the dense cluster
      fg.d3Force('collide', forceCollide((node: any) => node.size * 1.5));
    }
  }, [data]);

  const handleClick = (node: any) => {
    const gNode = node as GraphNode;
    if (!gNode.isClickable) return;

    if (gNode.slug) {
      router.push(gNode.slug);
    } else if (gNode.url) {
      window.open(gNode.url, '_blank', 'noopener,noreferrer');
    }
  };

  const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x, y, color, label, size, type, isClickable } = node;
    if (x === undefined || y === undefined || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const isHovered = hoverNode === node.id;
    
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

    // 2. Decorative Hub Rings
    if (type === 'section' || type === 'category') {
        ctx.beginPath();
        ctx.arc(x, y, size + 4 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.globalAlpha = isHovered ? 0.9 : (type === 'section' ? 0.6 : 0.3);
        if (type === 'section') ctx.setLineDash([4, 2]);
        ctx.stroke();
        ctx.setLineDash([]); 
    }

    // 3. Core Node with Inner Detail
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = isHovered || type === 'root' ? '#ffffff' : color;
    ctx.globalAlpha = 1;
    ctx.fill();
    
    if (size > 8) {
        ctx.beginPath();
        ctx.arc(x, y, size * (type === 'root' ? 0.6 : 0.4), 0, 2 * Math.PI);
        ctx.fillStyle = type === 'root' ? '#000000' : '#000000';
        ctx.globalAlpha = 0.2;
        ctx.fill();
    }

    // 4. Enhanced Typography
    const shouldShowLabel = globalScale > 0.6 || type === 'root' || type === 'section' || isHovered;
    if (shouldShowLabel) {
      // Root font is 2x bigger than others
      const baseFontSize = type === 'root' ? 18 : 7.6; // Root: ~+35%, Others: -20%
      const fontSize = baseFontSize / globalScale; 
      
      ctx.font = `${type === 'root' || type === 'section' ? '900' : '500'} ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Intense shadow/glow for root for "more white" look
      ctx.shadowColor = type === 'root' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = (type === 'root' ? 15 : 6) / globalScale;
      
      ctx.fillStyle = isHovered || type === 'root' ? '#ffffff' : (type === 'section' ? color : '#ffffff');
      
      const labelYOffset = type === 'root' ? 0 : size + fontSize + (6 / globalScale);
      
      // Root label in center of node, others below
      ctx.fillText(label, x, y + labelYOffset);
      
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
        nodeLabel={(node: any) => node.isClickable ? `Click to explore ${node.label}` : node.label}
        onNodeClick={handleClick}
        onNodeHover={(node) => setHoverNode(node ? (node as any).id : null)}
        
        // Link styling for that organic look
        linkColor={(link: any) => link.color || 'rgba(255, 255, 255, 0.15)'}
        linkCurvature={0.25}
        linkWidth={(link: any) => (link.source.type === 'root' ? 2.5 : 1.2)}
        
        // Particle effects
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={(link: any) => {
            // Root-originating links get vibrant emerald particles
            if (link.source.id === 'root' || link.source === 'root') return '#10b981';
            return link.color || 'rgba(255, 255, 255, 0.4)';
        }}
        
        d3VelocityDecay={0.4}
      />
    </div>
  );
};

export default NeuralGraph;
