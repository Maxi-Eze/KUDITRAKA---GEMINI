'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  pinX: number;
  pinY: number;
  vx: number;
  vy: number;
  pinned: boolean;
  phase: number;
}

interface Segment {
  a: number;
  b: number;
  broken: boolean;
  regrowAt: number;
  opacity: number;
}

interface WebCluster {
  particles: Particle[];
  segments: Segment[];
}

function makeParticle(x: number, y: number, pinned: boolean): Particle {
  return {
    x,
    y,
    pinX: x,
    pinY: y,
    vx: 0,
    vy: 0,
    pinned,
    phase: Math.random() * Math.PI * 2,
  };
}

function createWeb(cx: number, cy: number, radius: number, spokes: number): WebCluster {
  const particles: Particle[] = [];
  const segments: Segment[] = [];

  const hub = makeParticle(cx, cy, true);
  particles.push(hub);

  const rimIndices: number[] = [];
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2 - Math.PI / 4;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    particles.push(makeParticle(px, py, false));
    rimIndices.push(particles.length - 1);
    segments.push({ a: 0, b: particles.length - 1, broken: false, regrowAt: 0, opacity: 1 });
  }

  for (let i = 0; i < spokes; i++) {
    const a = rimIndices[i];
    const b = rimIndices[(i + 1) % spokes];
    segments.push({ a, b, broken: false, regrowAt: 0, opacity: 1 });
  }

  const innerIndices: number[] = [];
  const innerRadius = radius * 0.5;
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2 - Math.PI / 4 + Math.PI / spokes;
    const px = cx + Math.cos(angle) * innerRadius;
    const py = cy + Math.sin(angle) * innerRadius;
    particles.push(makeParticle(px, py, false));
    innerIndices.push(particles.length - 1);
    if (i > 0) {
      segments.push({
        a: innerIndices[i - 1],
        b: innerIndices[i],
        broken: false,
        regrowAt: 0,
        opacity: 1,
      });
    }
  }
  segments.push({
    a: innerIndices[innerIndices.length - 1],
    b: innerIndices[0],
    broken: false,
    regrowAt: 0,
    opacity: 1,
  });

  const midIndices: number[] = [];
  const midRadius = radius * 0.75;
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2 - Math.PI / 4 + Math.PI / (spokes * 2);
    const px = cx + Math.cos(angle) * midRadius;
    const py = cy + Math.sin(angle) * midRadius;
    particles.push(makeParticle(px, py, false));
    midIndices.push(particles.length - 1);
    if (i > 0) {
      segments.push({
        a: midIndices[i - 1],
        b: midIndices[i],
        broken: false,
        regrowAt: 0,
        opacity: 1,
      });
    }
  }
  segments.push({
    a: midIndices[midIndices.length - 1],
    b: midIndices[0],
    broken: false,
    regrowAt: 0,
    opacity: 1,
  });

  for (let i = 0; i < spokes; i++) {
    segments.push({
      a: midIndices[i],
      b: rimIndices[i],
      broken: false,
      regrowAt: 0,
      opacity: 1,
    });
    segments.push({
      a: innerIndices[i],
      b: midIndices[i],
      broken: false,
      regrowAt: 0,
      opacity: 1,
    });
  }

  return { particles, segments };
}

const LINE_OPACITY = 0.42;
const LINE_WIDTH = 0.85;
const CUT_RADIUS = 18;
const REGROW_MS = 4000;

export function CobwebCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

    if (prefersReducedMotion || coarsePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    let time = 0;
    let animationId: number | null = null;
    let clusters: WebCluster[] = [];

    function buildClusters() {
      const base = Math.min(width, height);
      clusters = [
        createWeb(width * 0.12, height * 0.12, base * 0.22, 8),
        createWeb(width * 0.88, height * 0.1, base * 0.18, 7),
        createWeb(width * 0.1, height * 0.88, base * 0.2, 7),
        createWeb(width * 0.9, height * 0.9, base * 0.16, 6),
      ];
    }

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas!.width = width;
      canvas!.height = height;
      buildClusters();
    }

    function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len2 = dx * dx + dy * dy;
      if (len2 === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * dx + (py - y1) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }

    function cutSegments() {
      const now = performance.now();

      clusters.forEach((cluster) => {
        cluster.segments.forEach((seg) => {
          if (seg.broken) {
            if (now >= seg.regrowAt) {
              seg.broken = false;
              seg.opacity = 0;
            }
            return;
          }

          const a = cluster.particles[seg.a];
          const b = cluster.particles[seg.b];
          const dist = distToSegment(mouseX, mouseY, a.x, a.y, b.x, b.y);

          if (dist < CUT_RADIUS) {
            seg.broken = true;
            seg.regrowAt = now + REGROW_MS;
            seg.opacity = 1;

            if (!cluster.particles[seg.a].pinned) {
              cluster.particles[seg.a].vx += (Math.random() - 0.5) * 2;
              cluster.particles[seg.a].vy += 1.5;
            }
            if (!cluster.particles[seg.b].pinned) {
              cluster.particles[seg.b].vx += (Math.random() - 0.5) * 2;
              cluster.particles[seg.b].vy += 1.5;
            }
          }
        });
      });
    }

    function updateParticles(cluster: WebCluster) {
      const t = time * 0.001;

      cluster.particles.forEach((p) => {
        if (p.pinned) {
          p.x = p.pinX + Math.sin(t * 0.7 + p.phase) * 3;
          p.y = p.pinY + Math.cos(t * 0.5 + p.phase) * 3;
          return;
        }

        const spring = 0.04;
        const damp = 0.92;
        const driftX = Math.sin(t * 0.6 + p.phase) * 2;
        const driftY = Math.cos(t * 0.4 + p.phase) * 2;

        p.vx += (p.pinX + driftX - p.x) * spring;
        p.vy += (p.pinY + driftY - p.y) * spring;
        p.vy += 0.08;
        p.vx *= damp;
        p.vy *= damp;
        p.x += p.vx;
        p.y += p.vy;
      });

      const now = performance.now();
      cluster.segments.forEach((seg) => {
        if (seg.broken && now < seg.regrowAt) {
          seg.opacity = Math.max(0, seg.opacity - 0.015);
        } else if (!seg.broken && seg.opacity < 1) {
          seg.opacity = Math.min(1, seg.opacity + 0.03);
        }
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      clusters.forEach((cluster) => {
        updateParticles(cluster);

        cluster.segments.forEach((seg) => {
          if (seg.broken && seg.opacity <= 0) return;

          const a = cluster.particles[seg.a];
          const b = cluster.particles[seg.b];
          const alpha = LINE_OPACITY * seg.opacity;

          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.strokeStyle = `rgba(178, 246, 0, ${alpha})`;
          ctx!.lineWidth = LINE_WIDTH;
          ctx!.stroke();
        });
      });
    }

    function loop(now: number) {
      time = now;
      cutSegments();
      draw();
      animationId = requestAnimationFrame(loop);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouseX = -1000;
      mouseY = -1000;
    }

    resize();
    animationId = requestAnimationFrame(loop);

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (animationId !== null) cancelAnimationFrame(animationId);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
