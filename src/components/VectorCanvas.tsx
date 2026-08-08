import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ForceVector, DecimalPrecision } from '../types';
import { formatVal, cartesianToPolar, polarToCartesian, degToRad } from '../utils/physics';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Move, Crosshair } from 'lucide-react';

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
  isCompact?: boolean;
}

/**
 * Helper to render an SVG vector label without any background box.
 * Displays symbol (F1, F2, F) and magnitude/angle values in the same row
 * starting 1 space away from the vector tip, with a crisp dark text stroke/halo.
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
  precision: DecimalPrecision = 1,
  align: 'start' | 'center' | 'end' = 'start'
) => {
  let main = 'F';
  let sub = '';

  if (name.toLowerCase().startsWith('f')) {
    sub = name.substring(1);
  } else {
    main = name;
  }

  const valStr = showValues && magnitude !== undefined ? `[${formatVal(magnitude, precision)} N]` : '';
  const angleStr = showAngles && angleDeg !== undefined ? `(${Math.round(angleDeg)}°)` : '';
  const textBody = [valStr, angleStr].filter(Boolean).join(' ');

  // Estimate total text width
  const mainWidth = 11;
  const subWidth = sub ? sub.length * 6.5 : 0;
  const valWidth = textBody ? (textBody.length * 6.8 + 8) : 0;
  const totalWidth = mainWidth + subWidth + valWidth;

  let startX = 0;
  if (align === 'center') {
    startX = -totalWidth / 2;
  } else if (align === 'end') {
    startX = -totalWidth;
  } else {
    startX = 0; // 'start': starts 1 space away from arrow tip
  }

  return (
    <g
      key={`label-${name}-${Math.round(x)}-${Math.round(y)}`}
      transform={`translate(${x}, ${y})`}
      className="select-none pointer-events-none drop-shadow-md"
    >
      {/* 1. Dark halo outline behind entire single-row label */}
      <text
        x={startX}
        y={0}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        stroke="#020617"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
        dominantBaseline="middle"
        opacity="0.95"
      >
        <tspan fontWeight="900" fontSize="13.5">{main}</tspan>
        {sub && <tspan fontWeight="800" fontSize="10" dy="3">{sub}</tspan>}
        {textBody && (
          <tspan fontWeight="700" fontSize="11.5" dy={sub ? "-3" : "0"}>
            {` ${textBody}`}
          </tspan>
        )}
      </text>

      {/* 2. Overhead Vector Arrow line + tip directly above the letter 'F' */}
      <g transform={`translate(${startX + 1}, -12)`}>
        <line x1="0" y1="0" x2="8" y2="0" stroke="#020617" strokeWidth="3" strokeLinecap="round" />
        <path d="M 6 -2 L 9.5 0 L 6 2 Z" fill="#020617" stroke="#020617" strokeWidth="1" />
        <line x1="0" y1="0" x2="8" y2="0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 6 -2 L 9.5 0 L 6 2 Z" fill={color} />
      </g>

      {/* 3. Foreground crisp text */}
      <text
        x={startX}
        y={0}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        dominantBaseline="middle"
      >
        <tspan fill={color} fontWeight="900" fontSize="13.5">{main}</tspan>
        {sub && <tspan fill={color} fontWeight="800" fontSize="10" dy="3">{sub}</tspan>}
        {textBody && (
          <tspan fill="#f8fafc" fontWeight="700" fontSize="11.5" dy={sub ? "-3" : "0"}>
            {` ${textBody}`}
          </tspan>
        )}
      </text>
    </g>
  );
};

/**
 * Calculates smart label coordinates for a vector arrow to guarantee:
 * Label starts writing 1 space (~12-14px) away from the arrowhead tip,
 * with alignment adapted to the angle so characters never overlap vectors.
 */
const calculateSmartLabelPos = (
  tip: { x: number; y: number },
  angleDeg: number,
  index: number = 0,
  isResultant: boolean = false,
  allForces: ForceVector[] = []
) => {
  const rad = degToRad(angleDeg);
  const dx = Math.cos(rad);
  const dy = -Math.sin(rad); // SVG y is inverted
  const px = -dy; // Perpendicular unit vector (90 deg counter-clockwise)
  const py = dx;

  const normAngle = ((angleDeg % 360) + 360) % 360;

  // Adapt alignment so the label cell extends away from the arrowhead and vector line
  let align: 'start' | 'center' | 'end' = 'start';

  if (normAngle >= 70 && normAngle <= 110) {
    align = 'center'; // Vertical UP
  } else if (normAngle >= 250 && normAngle <= 290) {
    align = 'center'; // Vertical DOWN
  } else if (normAngle > 110 && normAngle < 250) {
    align = 'end'; // Pointing LEFT -> align 'end' so text extends leftward away from vector line
  } else {
    align = 'start'; // Pointing RIGHT -> align 'start' so text extends rightward away from vector line
  }

  // Radial offset places the label right next to the arrowhead (~2-4px)
  let radialOffset = isResultant ? 8 : 2;
  let perpOffset = 0;

  if (isResultant) {
    perpOffset = -18; // Position resultant vector label clear of component vectors
  } else if (allForces.length >= 2) {
    const isAbove = index % 2 === 0;
    perpOffset = isAbove ? -14 : 14;

    allForces.forEach((other, i) => {
      if (i !== index) {
        const diff = Math.abs(angleDeg - other.angleDeg);
        if (diff < 35 || Math.abs(diff - 360) < 35) {
          if (isAbove) {
            // F1: shift UP slightly more (-22px) and close to arrowhead tip (radialOffset = 2px)
            radialOffset = 2;
            perpOffset = -22;
          } else {
            // F2: shift DOWN slightly more (+22px) and close to arrowhead tip (radialOffset = 2px)
            radialOffset = 2;
            perpOffset = 22;
          }
        }
      }
    });
  }

  const lx = tip.x + dx * radialOffset + px * perpOffset;
  const ly = tip.y + dy * radialOffset + py * perpOffset;

  return { x: lx, y: ly, align };
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
  isCompact = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, height: 420 });

  // Zoom & Pan State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);

  const effectiveScaleFactor = scaleFactor * zoomLevel;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(3.0, +(prev + 0.1).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.5, +(prev - 0.1).toFixed(2)));
  const handleResetView = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Center O of the SVG canvas including Pan Offset
  const originX = canvasDimensions.width / 2 + objectOffset.x + panOffset.x;
  const originY = canvasDimensions.height / 2 - objectOffset.y + panOffset.y; // SVG y inverted

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

  // Handle SVG canvas background pointer down to start panning
  const handleBgPointerDown = (e: React.PointerEvent<SVGRectElement>) => {
    if (draggingId) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panOffset.x,
      startPanY: panOffset.y,
    };
  };

  // Convert SVG coordinate back to physical vector magnitude and angle or Pan canvas
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (draggingId && svgRef.current && onVectorChange) {
        const rect = svgRef.current.getBoundingClientRect();
        const pointerX = e.clientX - rect.left;
        const pointerY = e.clientY - rect.top;

        // Cartesian relative to Origin O (standard Math: +y up)
        const dx = pointerX - originX;
        const dy = -(pointerY - originY);

        let { magnitude, angleDeg } = cartesianToPolar(dx, dy);

        // Scale back to Newtons using effective scale factor
        let newMag = magnitude / effectiveScaleFactor;
        newMag = Math.max(0, Math.min(100, newMag)); // Cap at 100N
        angleDeg = Math.round(angleDeg);

        onVectorChange(draggingId, newMag, angleDeg);
      } else if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setPanOffset({
          x: panStartRef.current.startPanX + dx,
          y: panStartRef.current.startPanY + dy,
        });
      }
    },
    [draggingId, isPanning, originX, originY, effectiveScaleFactor, onVectorChange]
  );

  const handlePointerUp = useCallback(() => {
    setDraggingId(null);
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  useEffect(() => {
    if (draggingId || isPanning) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };
    }
  }, [draggingId, isPanning, handlePointerMove, handlePointerUp]);

  // Handle Mouse Wheel Zooming
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoomLevel((prev) => Math.min(3.5, Math.max(0.4, +(prev + delta).toFixed(2))));
  };

  // Compute tip position in SVG pixels for a vector (mag in N, angle in Deg)
  const getTipPos = (mag: number, angleDeg: number) => {
    const rad = degToRad(angleDeg);
    const pxLength = mag * effectiveScaleFactor;
    return {
      x: originX + pxLength * Math.cos(rad),
      y: originY - pxLength * Math.sin(rad),
    };
  };

  const containerHeightClass = isExpanded
    ? 'h-[550px] sm:h-[650px]'
    : isCompact
      ? 'h-[280px] sm:h-[330px]'
      : 'h-[380px] sm:h-[450px]';

  return (
    <div className={`relative w-full ${containerHeightClass} bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between transition-all duration-300`}>
      {/* Top Left Overlay Badge & Origin Info */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Gốc O ({Math.round(originX - canvasDimensions.width / 2)}, {Math.round(-(originY - canvasDimensions.height / 2))})</span>
        <span className="text-slate-600">|</span>
        <span className="text-blue-400">Tỉ lệ: 1 N = {effectiveScaleFactor.toFixed(1)} px</span>
        <span className="hidden lg:inline text-slate-500">| 🖱️ Cuộn/Kéo để Pan & Zoom</span>
      </div>

      {/* Top Right Zoom & Screen Presentation Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {/* Recenter button if canvas is panned or zoomed */}
        {(panOffset.x !== 0 || panOffset.y !== 0 || zoomLevel !== 1.0) && (
          <button
            type="button"
            onClick={handleResetView}
            title="Đặt lại góc nhìn & căn giữa gốc O"
            className="px-2.5 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white backdrop-blur-md rounded-xl border border-blue-500/50 shadow-md transition flex items-center gap-1.5 text-xs font-semibold animate-fadeIn"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Căn giữa O</span>
          </button>
        )}

        {/* Zoom Controls - Range Slider (50% - 300%) & Percentage Field */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-md text-xs">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Thu nhỏ (-10%)"
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Smooth Slider from 50% to 300% */}
          <input
            type="range"
            min="50"
            max="300"
            step="5"
            value={Math.round(zoomLevel * 100)}
            onChange={(e) => setZoomLevel(Number(e.target.value) / 100)}
            className="w-20 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            title="Kéo để phóng to / thu nhỏ (50% - 300%)"
          />

          <button
            type="button"
            onClick={handleZoomIn}
            title="Phóng to (+10%)"
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Real-time Percentage Field */}
          <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-lg px-1.5 py-0.5 focus-within:border-blue-500">
            <input
              type="number"
              min="50"
              max="300"
              step="1"
              value={Math.round(zoomLevel * 100)}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val) && val >= 10 && val <= 500) {
                  setZoomLevel(val / 100);
                }
              }}
              className="w-9 bg-transparent text-center font-mono font-bold text-xs text-blue-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              title="Nhập % tỉ lệ trực tiếp"
            />
            <span className="text-[11px] font-bold text-slate-400">%</span>
          </div>

          {(zoomLevel !== 1.0 || panOffset.x !== 0 || panOffset.y !== 0) && (
            <button
              type="button"
              onClick={handleResetView}
              title="Đặt lại mức zoom (100%)"
              className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition ml-0.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Expand / Maximize Toolbar for Large Screen Classroom Viewing */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Thu gọn màn hình" : "Mở rộng màn hình máy chiếu/TV"}
          className="p-2 bg-slate-900/90 backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 shadow-md transition flex items-center gap-1.5 text-xs font-semibold"
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Thu gọn</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Phóng to khung</span>
            </>
          )}
        </button>
      </div>

      <svg
        ref={svgRef}
        className={`w-full h-full select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'none' }}
        onWheel={handleWheel}
      >
        <defs>
          {/* Arrowhead Markers with unique IDs and standard orient="auto" */}
          {(() => {
            const markerMap = new Map<string, string>();
            // Standard defaults
            markerMap.set('fhl', '#10b981');
            markerMap.set('fx', '#06b6d4');
            markerMap.set('fy', '#f97316');
            markerMap.set('f1', '#3b82f6');
            markerMap.set('f2', '#ec4899');
            markerMap.set('f3', '#a855f7');
            markerMap.set('default', '#3b82f6');

            // Override / append with active vector definitions
            [
              ...forces,
              ...(resultantVector ? [{ id: 'fhl', color: '#10b981', ...resultantVector }] : []),
              ...(decomposedVectors ? [decomposedVectors.fx, decomposedVectors.fy] : []),
            ].filter(Boolean).forEach((vec, idx) => {
              const rawId = vec.id || vec.name || `vec-${idx}`;
              const markerId = String(rawId).toLowerCase();
              markerMap.set(markerId, vec.color || '#3b82f6');
            });

            return Array.from(markerMap.entries()).map(([markerId, color]) => (
              <marker
                key={`arrow-${markerId}`}
                id={`arrow-${markerId}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={color} />
              </marker>
            ));
          })()}
        </defs>

        {/* Interactive Background Rect for Canvas Panning */}
        <rect
          x="-2000"
          y="-2000"
          width="5000"
          height="5000"
          fill="transparent"
          onPointerDown={handleBgPointerDown}
        />

        {/* 1. Background Grid extended dynamically across full pan region */}
        {showGrid && (
          <g className="opacity-20 stroke-slate-700 pointer-events-none" strokeWidth="1">
            {Array.from({ length: Math.ceil(canvasDimensions.width / 30) + 60 }).map((_, i) => {
              const xPos = ((i - 30) * 30) + (originX % 30);
              return <line key={`v-${i}`} x1={xPos} y1="-1000" x2={xPos} y2="2000" />;
            })}
            {Array.from({ length: Math.ceil(canvasDimensions.height / 30) + 60 }).map((_, i) => {
              const yPos = ((i - 30) * 30) + (originY % 30);
              return <line key={`h-${i}`} x1="-1000" y1={yPos} x2="2000" y2={yPos} />;
            })}
          </g>
        )}

        {/* 2. Coordinate Axes Ox, Oy */}
        <g stroke="#475569" strokeWidth="1.5" opacity="0.6" className="pointer-events-none">
          {/* Ox Axis */}
          <line x1="-2000" y1={originY} x2="3000" y2={originY} strokeDasharray="4 4" />
          <text x={Math.min(canvasDimensions.width - 25, originX + 220)} y={originY - 8} fill="#94a3b8" fontSize="12" fontWeight="bold">
            +x
          </text>

          {/* Oy Axis */}
          <line x1={originX} y1="-2000" x2={originX} y2="3000" strokeDasharray="4 4" />
          <text x={originX + 8} y={Math.max(22, originY - 180)} fill="#94a3b8" fontSize="12" fontWeight="bold">
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

              let labelX = originX;
              let labelY = originY;
              let align: 'start' | 'center' | 'end' = 'start';

              if (isFx) {
                // Fx position: near the arrow tip, shifted slightly to the right
                const isRight = Math.cos(degToRad(vec.angleDeg)) >= 0;
                if (isRight) {
                  labelX = tip.x + 10;
                  labelY = tip.y + 16;
                  align = 'start';
                } else {
                  labelX = tip.x - 10;
                  labelY = tip.y + 16;
                  align = 'end';
                }
              } else {
                // Fy position: placed directly at the top of the orange arrowhead tip
                const isUp = Math.sin(degToRad(vec.angleDeg)) >= 0;
                labelX = tip.x;
                labelY = isUp ? tip.y - 16 : tip.y + 16;
                align = 'center';
              }

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
                    precision,
                    align
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

          // Calculate smart label coordinates clear of arrow line & head
          const smartPos = calculateSmartLabelPos(tip, force.angleDeg, index, false, forces);

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

              {/* Force Label & Magnitude Text */}
              {renderVectorLabelPill(
                smartPos.x,
                smartPos.y,
                force.name,
                force.magnitude,
                force.angleDeg,
                force.color,
                showValues,
                showAngles,
                precision,
                smartPos.align
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

            // Calculate smart label coordinates clear of arrow line & head
            const smartPos = calculateSmartLabelPos(tip, resultantVector.angleDeg, 0, true, forces);

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
                  smartPos.x,
                  smartPos.y,
                  resultantVector.name || 'Fhl',
                  resultantVector.magnitude,
                  resultantVector.angleDeg,
                  resultantVector.color || '#10b981',
                  showValues,
                  showAngles,
                  precision,
                  smartPos.align
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

          {/* Letter 'O' / Label for Origin O moved down clearly below the object */}
          <g transform="translate(0, 36)" className="select-none pointer-events-none">
            {/* Backdrop halo outline for 100% legibility */}
            <text
              x="0"
              y="0"
              fill="#020617"
              stroke="#020617"
              strokeWidth="4"
              strokeLinejoin="round"
              fontSize="12"
              fontWeight="900"
              textAnchor="middle"
            >
              Vật (O)
            </text>
            <text
              x="0"
              y="0"
              fill="#38bdf8"
              fontSize="12"
              fontWeight="900"
              textAnchor="middle"
            >
              Vật (O)
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
