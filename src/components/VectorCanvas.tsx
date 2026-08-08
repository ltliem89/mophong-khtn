import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ForceVector, DecimalPrecision } from '../types';
import { formatVal, cartesianToPolar, polarToCartesian, degToRad } from '../utils/physics';
import { Maximize2, RefreshCcw } from 'lucide-react';

interface VectorCanvasProps {
  forces: ForceVector[];
  resultantVector?: { magnitude: number; angleDeg: number; name?: string; color?: string } | null;
  decomposedVectors?: { fx: ForceVector; fy: ForceVector } | null;
  showParallelogram?: boolean;
  showResultant?: boolean;
  showValues?: boolean;
  showAngles?: boolean;
  showGrid?: boolean;
  scaleFactor: number; // Pixels per Newton
  precision: DecimalPrecision;
  onVectorChange?: (id: string, newMag: number, newAngleDeg: number) => void;
  // Motion animation parameters
  objectOffset?: { x: number; y: number };
  isMoving?: boolean;
}

/**
 * Helper to render an SVG vector label inside a dark backdrop pill.
 * Renders standard Physics vector notation: Vector Arrow overhead on F, and small subscript.
 */
const renderVectorLabelPill = (
  x: number,
  y: number,
  name: string,
  magnitude?: number,
  angleDeg?: number,
  color: string = '#3b82f6',
  showValues: boolean = true,
  showAngles: boolean = false,
  precision: DecimalPrecision = 1
) => {
  let main = 'F';
  let sub = '';

  if (name.toLowerCase().startsWith('f')) {
    sub = name.substring(1);
  } else {
    main = name;
  }

  const valStr = showValues && magnitude !== undefined ? ` = ${formatVal(magnitude, precision)} N` : '';
  const angleStr = showAngles && angleDeg !== undefined ? ` (${Math.round(angleDeg)}°)` : '';
  const textBody = `${valStr}${angleStr}`;

  // Approximate pill dimensions
  const mainWidth = 10;
  const subWidth = sub.length * 7;
  const textBodyWidth = textBody.length * 6.8;
  const totalWidth = Math.max(52, mainWidth + subWidth + textBodyWidth + 18);
  const pillHeight = 25;

  return (
    <g key={`label-${name}-${x}-${y}`} transform={`translate(${x}, ${y})`} className="select-none pointer-events-none drop-shadow-md">
      {/* Semi-transparent dark backdrop pill so vector lines never cut through text */}
      <rect
        x={-totalWidth / 2}
        y={-pillHeight / 2}
        width={totalWidth}
        height={pillHeight}
        rx="7"
        fill="#020617"
        fillOpacity="0.92"
        stroke={color}
        strokeWidth="1.2"
      />

      {/* Group centered inside pill */}
      <g transform={`translate(${-totalWidth / 2 + 8}, 4)`}>
        {/* Overhead Vector Arrow line + tip above F */}
        <line x1="0" y1="-10" x2="8" y2="-10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
        <path d="M 6 -12 L 9.5 -10 L 6 -8 Z" fill={color} />

        {/* Text */}
        <text fontFamily="sans-serif">
          {/* Main Letter 'F' */}
          <tspan fill={color} fontWeight="900" fontSize="12">{main}</tspan>

          {/* Subscript number/letter e.g. 1, 2, hl, x, y */}
          {sub && (
            <tspan fill={color} fontWeight="800" fontSize="9" dy="2.5">{sub}</tspan>
          )}

          {/* Magnitude & Angle */}
          {textBody && (
            <tspan fill="#f8fafc" fontWeight="700" fontSize="11" dy={sub ? "-2.5" : "0"}>
              {textBody}
            </tspan>
          )}
        </text>
      </g>
    </g>
  );
};

export const VectorCanvas: React.FC<VectorCanvasProps> = ({
  forces,
  resultantVector,
  decomposedVectors,
  showParallelogram = true,
  showResultant = true,
  showValues = true,
  showAngles = true,
  showGrid = true,
  scaleFactor,
  precision,
  onVectorChange,
  objectOffset = { x: 0, y: 0 },
  isMoving = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, height: 420 });

  // Center O of the SVG canvas
  const originX = canvasDimensions.width / 2 + objectOffset.x;
  const originY = canvasDimensions.height / 2 - objectOffset.y; // SVG y inverted

  // Handle ResizeObserver for responsive SVG canvas
  useEffect(() => {
    if (!svgRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasDimensions({ width, height });
        }
      }
    });
    observer.observe(svgRef.current.parentElement || svgRef.current);
    return () => observer.disconnect();
  }, []);

  // Convert SVG coordinate back to physical vector magnitude and angle
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingId || !svgRef.current || !onVectorChange) return;

      const rect = svgRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      // Cartesian relative to Origin O (standard Math: +y up)
      const dx = pointerX - originX;
      const dy = -(pointerY - originY);

      let { magnitude, angleDeg } = cartesianToPolar(dx, dy);

      // Scale back to Newtons
      let newMag = magnitude / scaleFactor;
      newMag = Math.max(0, Math.min(50, newMag)); // Cap at 50N
      angleDeg = Math.round(angleDeg);

      onVectorChange(draggingId, newMag, angleDeg);
    },
    [draggingId, originX, originY, scaleFactor, onVectorChange]
  );

  const handlePointerUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };
    }
  }, [draggingId, handlePointerMove, handlePointerUp]);

  // Compute tip position in SVG pixels for a vector (mag in N, angle in Deg)
  const getTipPos = (mag: number, angleDeg: number) => {
    const rad = degToRad(angleDeg);
    const pxLength = mag * scaleFactor;
    return {
      x: originX + pxLength * Math.cos(rad),
      y: originY - pxLength * Math.sin(rad),
    };
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[450px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between">
      {/* Top Overlay Badge & Quick Settings */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Tọa độ gốc O (0,0)</span>
        <span className="text-slate-600">|</span>
        <span className="text-blue-400">Tỉ lệ: 1 N = {scaleFactor.toFixed(1)} px</span>
      </div>

      <div className="absolute top-3 right-3 z-10 text-[11px] text-slate-300 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-sm flex items-center gap-1.5 font-medium">
        <span>💡 Rê chuột vào đầu mũi tên để hiện nút kéo</span>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair select-none"
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Arrowhead Markers */}
          {[
            ...forces,
            ...(resultantVector ? [{ id: 'fhl', color: '#10b981', ...resultantVector }] : []),
            ...(decomposedVectors ? [decomposedVectors.fx, decomposedVectors.fy] : []),
          ].filter(Boolean).map((vec, idx) => {
            const rawId = vec.id || vec.name || `vec-${idx}`;
            const markerId = String(rawId).toLowerCase();
            return (
              <marker
                key={`${markerId}-${idx}`}
                id={`arrow-${markerId}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill={vec.color || '#3b82f6'} />
              </marker>
            );
          })}
          {/* Standard Fallbacks */}
          {['fhl', 'f', 'f1', 'f2', 'f3', 'fx', 'fy', 'default'].map((mId) => (
            <marker
              key={`fallback-${mId}`}
              id={`arrow-${mId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 1 L 10 5 L 0 9 z"
                fill={
                  mId === 'fhl' ? '#10b981' :
                  mId === 'fx' ? '#06b6d4' :
                  mId === 'fy' ? '#f97316' :
                  mId === 'f1' ? '#3b82f6' :
                  mId === 'f2' ? '#ec4899' : '#3b82f6'
                }
              />
            </marker>
          ))}
        </defs>

        {/* 1. Background Grid */}
        {showGrid && (
          <g className="opacity-20 stroke-slate-700" strokeWidth="1">
            {/* Grid Lines every 30px */}
            {Array.from({ length: Math.ceil(canvasDimensions.width / 30) }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 30} y1="0" x2={i * 30} y2={canvasDimensions.height} />
            ))}
            {Array.from({ length: Math.ceil(canvasDimensions.height / 30) }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 30} x2={canvasDimensions.width} y2={i * 30} />
            ))}
          </g>
        )}

        {/* 2. Coordinate Axes Ox, Oy */}
        <g stroke="#475569" strokeWidth="1.5" opacity="0.6">
          {/* Ox Axis */}
          <line x1="10" y1={originY} x2={canvasDimensions.width - 10} y2={originY} strokeDasharray="4 4" />
          <text x={canvasDimensions.width - 25} y={originY - 8} fill="#94a3b8" fontSize="12" fontWeight="bold">
            +x
          </text>

          {/* Oy Axis */}
          <line x1={originX} y1="10" x2={originX} y2={canvasDimensions.height - 10} strokeDasharray="4 4" />
          <text x={originX + 8} y="22" fill="#94a3b8" fontSize="12" fontWeight="bold">
            +y
          </text>
        </g>

        {/* 3. Parallelogram Construction Lines for Tab 2 */}
        {showParallelogram && forces.length >= 2 && resultantVector && (
          (() => {
            const tip1 = getTipPos(forces[0].magnitude, forces[0].angleDeg);
            const tip2 = getTipPos(forces[1].magnitude, forces[1].angleDeg);
            const tipRes = getTipPos(resultantVector.magnitude, resultantVector.angleDeg);

            return (
              <g stroke="#10b981" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6">
                <line x1={tip1.x} y1={tip1.y} x2={tipRes.x} y2={tipRes.y} />
                <line x1={tip2.x} y1={tip2.y} x2={tipRes.x} y2={tipRes.y} />
              </g>
            );
          })()
        )}

        {/* 4. Decomposition Projection Lines for Tab 4 */}
        {decomposedVectors && (
          (() => {
            const fxTip = getTipPos(decomposedVectors.fx.magnitude, decomposedVectors.fx.angleDeg);
            const fyTip = getTipPos(decomposedVectors.fy.magnitude, decomposedVectors.fy.angleDeg);
            const mainTip = getTipPos(forces[0]?.magnitude || 0, forces[0]?.angleDeg || 0);

            return (
              <g stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5">
                {/* Line from Main Tip to Fx Tip */}
                <line x1={mainTip.x} y1={mainTip.y} x2={fxTip.x} y2={fxTip.y} />
                {/* Line from Main Tip to Fy Tip */}
                <line x1={mainTip.x} y1={mainTip.y} x2={fyTip.x} y2={fyTip.y} />
              </g>
            );
          })()
        )}

        {/* 5. Render Decomposed Component Vectors (Fx, Fy) */}
        {decomposedVectors && (
          <>
            {[decomposedVectors.fx, decomposedVectors.fy].map((vec) => {
              const tip = getTipPos(vec.magnitude, vec.angleDeg);
              const markerId = (vec.id || vec.name || 'default').toLowerCase();
              const isFx = vec.id === 'fx' || vec.name === 'Fx';

              // Position labels to avoid overlapping coordinate axes
              const labelX = isFx
                ? originX + (tip.x - originX) / 2
                : originX - 48;
              const labelY = isFx
                ? originY + 28
                : originY + (tip.y - originY) / 2;

              return (
                <g key={vec.id}>
                  <line
                    x1={originX}
                    y1={originY}
                    x2={tip.x}
                    y2={tip.y}
                    stroke={vec.color}
                    strokeWidth="3"
                    markerEnd={`url(#arrow-${markerId})`}
                  />
                  {showValues && renderVectorLabelPill(
                    labelX,
                    labelY,
                    vec.name,
                    vec.magnitude,
                    vec.angleDeg,
                    vec.color,
                    showValues,
                    false,
                    precision
                  )}
                </g>
              );
            })}
          </>
        )}

        {/* 6. Render Input Forces */}
        {forces.map((force, index) => {
          const tip = getTipPos(force.magnitude, force.angleDeg);
          const markerId = (force.id || force.name || 'default').toLowerCase();
          const rad = degToRad(force.angleDeg);

          // Arc for Angle display
          const arcRadius = 35;
          const arcX = originX + arcRadius * Math.cos(rad);
          const arcY = originY - arcRadius * Math.sin(rad);

          const isInteractive = !force.isLocked && Boolean(onVectorChange);
          const isHovered = hoveredId === force.id;
          const isDragging = draggingId === force.id;
          const showHandle = isInteractive && (isHovered || isDragging);

          const handlePointerDown = (e: React.PointerEvent) => {
            if (!isInteractive) return;
            e.stopPropagation();
            e.preventDefault();
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
            setDraggingId(force.id);
            setHoveredId(force.id);
          };

          // Smart label offsets to prevent force vector lines or other labels from overlapping text
          let labelX = tip.x + Math.cos(rad) * 22;
          let labelY = tip.y - Math.sin(rad) * 22;

          // Check collinear / horizontal alignment
          const isHorizontal = force.angleDeg === 0 || force.angleDeg === 180;
          if (isHorizontal) {
            if (force.id === 'f1' || index === 0) {
              labelY = tip.y - 24; // Above vector line
            } else {
              labelY = tip.y + 26; // Below vector line
            }
          } else if (forces.length >= 2) {
            // Small angles between forces (< 35 deg)
            const otherForce = forces.find(f => f.id !== force.id);
            if (otherForce && Math.abs(force.angleDeg - otherForce.angleDeg) < 35) {
              if (force.angleDeg <= otherForce.angleDeg) {
                labelY = tip.y + 24;
              } else {
                labelY = tip.y - 24;
              }
            }
          }

          return (
            <g
              key={force.id}
              className="group"
              onPointerEnter={() => {
                if (isInteractive) setHoveredId(force.id);
              }}
              onPointerLeave={() => {
                if (isInteractive && draggingId !== force.id) setHoveredId(null);
              }}
            >
              {/* Invisible wide stroke for easy vector line hover & drag */}
              {isInteractive && (
                <line
                  x1={originX}
                  y1={originY}
                  x2={tip.x}
                  y2={tip.y}
                  stroke="transparent"
                  strokeWidth="24"
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={handlePointerDown}
                />
              )}

              {/* Force Vector Line */}
              <line
                x1={originX}
                y1={originY}
                x2={tip.x}
                y2={tip.y}
                stroke={force.color}
                strokeWidth="3.5"
                markerEnd={`url(#arrow-${markerId})`}
                className="pointer-events-none transition-all duration-75"
              />

              {/* Angle Arc */}
              {showAngles && force.magnitude > 0.5 && (
                <path
                  d={`M ${originX + 25} ${originY} A 25 25 0 ${force.angleDeg > 180 ? 1 : 0} 0 ${arcX} ${arcY}`}
                  fill="none"
                  stroke={force.color}
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  opacity="0.8"
                  className="pointer-events-none"
                />
              )}

              {/* Force Label & Magnitude Text Pill */}
              {renderVectorLabelPill(
                labelX,
                labelY,
                force.name,
                force.magnitude,
                force.angleDeg,
                force.color,
                showValues,
                showAngles,
                precision
              )}

              {/* Interactive Arrowhead Hit Area */}
              {isInteractive && (
                <circle
                  cx={tip.x}
                  cy={tip.y}
                  r="22"
                  fill="transparent"
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={handlePointerDown}
                />
              )}

              {/* Drag Handle Dot at Arrowhead - ONLY visible on hover or dragging */}
              {showHandle && (
                <g className="pointer-events-none">
                  <circle
                    cx={tip.x}
                    cy={tip.y}
                    r="15"
                    fill={force.color}
                    fillOpacity="0.25"
                    stroke={force.color}
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                  <circle
                    cx={tip.x}
                    cy={tip.y}
                    r="8.5"
                    fill={force.color}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="drop-shadow-lg"
                  />
                  <circle
                    cx={tip.x}
                    cy={tip.y}
                    r="3"
                    fill="#ffffff"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* 7. Render Resultant Force Vector (Fhl) */}
        {showResultant && resultantVector && resultantVector.magnitude > 0.05 && (
          (() => {
            const tip = getTipPos(resultantVector.magnitude, resultantVector.angleDeg);
            const rad = degToRad(resultantVector.angleDeg);
            const isCollinear = resultantVector.angleDeg === 0 || resultantVector.angleDeg === 180;

            // Offset label for resultant force to prevent overlapping F1 or F2
            let labelX = tip.x + Math.cos(rad) * 24;
            let labelY = tip.y - Math.sin(rad) * 24;

            if (isCollinear) {
              labelY = tip.y - 52; // Higher above vector line than F1
            } else {
              // Check proximity to input force tips
              const closeForce = forces.find(f => {
                const fTip = getTipPos(f.magnitude, f.angleDeg);
                return Math.hypot(fTip.x - tip.x, fTip.y - tip.y) < 50;
              });
              if (closeForce) {
                labelY -= 28;
              }
            }

            return (
              <g key="fhl-vector">
                <line
                  x1={originX}
                  y1={originY}
                  x2={tip.x}
                  y2={tip.y}
                  stroke={resultantVector.color || '#10b981'}
                  strokeWidth="4.5"
                  markerEnd="url(#arrow-fhl)"
                />
                {renderVectorLabelPill(
                  labelX,
                  labelY,
                  resultantVector.name || 'Fhl',
                  resultantVector.magnitude,
                  resultantVector.angleDeg,
                  resultantVector.color || '#10b981',
                  showValues,
                  showAngles,
                  precision
                )}
              </g>
            );
          })()
        )}

        {/* 8. Central Object at Origin O */}
        <g transform={`translate(${originX}, ${originY})`}>
          {/* Physics Box/Sphere */}
          <rect
            x="-18"
            y="-18"
            width="36"
            height="36"
            rx="8"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="2.5"
            className={`shadow-lg transition-transform ${isMoving ? 'scale-110 border-blue-400' : ''}`}
          />
          <circle cx="0" cy="0" r="4" fill="#38bdf8" />
          <text x="0" y="28" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">
            Vật (O)
          </text>
        </g>
      </svg>
    </div>
  );
};
