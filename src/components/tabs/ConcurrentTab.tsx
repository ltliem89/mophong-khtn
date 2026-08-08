import React, { useState } from 'react';
import { ForceVector, DecimalPrecision, DataRecord } from '../../types';
import { formatVal, calculateParallelogramResultant } from '../../utils/physics';
import { VectorCanvas } from '../VectorCanvas';
import { ForceControls } from '../ForceControls';
import { ForceSymbol } from '../ForceSymbol';
import { 
  Eye, 
  PlusCircle, 
  LineChart, 
  Compass
} from 'lucide-react';

interface ConcurrentTabProps {
  precision: DecimalPrecision;
  scaleFactor: number;
  onRecordData: (record: Omit<DataRecord, 'id' | 'timestamp'>) => void;
  isCompact?: boolean;
}

export const ConcurrentTab: React.FC<ConcurrentTabProps> = ({
  precision,
  scaleFactor,
  onRecordData,
  isCompact = false,
}) => {
  const [f1Mag, setF1Mag] = useState(6);
  const [f2Mag, setF2Mag] = useState(8);
  const [alphaDeg, setAlphaDeg] = useState(60); // Angle between F1 and F2

  // Display Toggles
  const [showParallelogram, setShowParallelogram] = useState(true);
  const [showResultant, setShowResultant] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showGraph, setShowGraph] = useState(false);

  // We place F1 along angle 0° for clean visual presentation, F2 at alphaDeg
  const f1Angle = 0;
  const f2Angle = alphaDeg;

  const forces: ForceVector[] = [
    {
      id: 'f1',
      name: 'F1',
      magnitude: f1Mag,
      angleDeg: f1Angle,
      color: '#3b82f6', // Blue
    },
    {
      id: 'f2',
      name: 'F2',
      magnitude: f2Mag,
      angleDeg: f2Angle,
      color: '#ec4899', // Pink
    },
  ];

  // Calculate Resultant via Parallelogram Formula
  const { magnitude: fResultMag, angleRelF1Deg } = calculateParallelogramResultant(f1Mag, f2Mag, alphaDeg);

  const handleRecord = () => {
    onRecordData({
      round: 0,
      tabName: 'Quy tắc hình bình hành',
      f1: f1Mag,
      f2: f2Mag,
      angle: alphaDeg,
      fResult: fResultMag,
      fResultAngle: angleRelF1Deg,
      notes: `Góc α = ${alphaDeg}°`,
    });
  };

  // Generate 19 graph data points for alpha from 0° to 180° in steps of 10°
  const graphData = Array.from({ length: 19 }, (_, i) => {
    const a = i * 10;
    const res = calculateParallelogramResultant(f1Mag, f2Mag, a);
    return { alpha: a, fResult: res.magnitude };
  });

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 ${isCompact ? 'gap-3' : 'gap-6'}`}>
      {/* Left Column: Canvas & Graph Tool */}
      <div className={`lg:col-span-7 ${isCompact ? 'space-y-2.5' : 'space-y-4'}`}>
        {/* Visibility Toggles Toolbar */}
        <div className={`${isCompact ? 'p-2' : 'p-3.5'} rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs`}>
          <span className="font-bold text-slate-400 flex items-center gap-1">
            <Eye className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-blue-400`} /> Tùy chọn hiển thị:
          </span>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <label className={`flex items-center gap-1 cursor-pointer bg-slate-800/80 ${isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5'} rounded-xl border border-slate-700/80 hover:text-white transition`}>
              <input
                type="checkbox"
                checked={showParallelogram}
                onChange={(e) => setShowParallelogram(e.target.checked)}
                className="accent-blue-500 rounded w-3 h-3"
              />
              <span>Hình bình hành</span>
            </label>

            <label className={`flex items-center gap-1 cursor-pointer bg-slate-800/80 ${isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5'} rounded-xl border border-slate-700/80 hover:text-white transition`}>
              <input
                type="checkbox"
                checked={showResultant}
                onChange={(e) => setShowResultant(e.target.checked)}
                className="accent-emerald-500 rounded w-3 h-3"
              />
              <span>Vector Hợp lực</span>
            </label>

            <label className={`flex items-center gap-1 cursor-pointer bg-slate-800/80 ${isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5'} rounded-xl border border-slate-700/80 hover:text-white transition`}>
              <input
                type="checkbox"
                checked={showValues}
                onChange={(e) => setShowValues(e.target.checked)}
                className="accent-cyan-500 rounded w-3 h-3"
              />
              <span>Giá trị N</span>
            </label>

            <label className={`flex items-center gap-1 cursor-pointer bg-slate-800/80 ${isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5'} rounded-xl border border-slate-700/80 hover:text-white transition`}>
              <input
                type="checkbox"
                checked={showAngles}
                onChange={(e) => setShowAngles(e.target.checked)}
                className="accent-pink-500 rounded w-3 h-3"
              />
              <span>Góc α</span>
            </label>

            <button
              onClick={() => setShowGraph(!showGraph)}
              className={`${isCompact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} rounded-xl border font-semibold flex items-center gap-1 transition ${
                showGraph
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Đồ thị Fhl(α)</span>
            </button>
          </div>
        </div>

        <VectorCanvas
          forces={forces}
          resultantVector={{
            magnitude: fResultMag,
            angleDeg: angleRelF1Deg,
            name: 'Fhl',
            color: '#10b981',
          }}
          showParallelogram={showParallelogram}
          showResultant={showResultant}
          showValues={showValues}
          showAngles={showAngles}
          showGrid={showGrid}
          scaleFactor={scaleFactor}
          precision={precision}
          isCompact={isCompact}
          onVectorChange={(id, newMag, newAngleDeg) => {
            if (id === 'f1') setF1Mag(newMag);
            if (id === 'f2') {
              setF2Mag(newMag);
              setAlphaDeg(Math.min(180, Math.max(0, newAngleDeg)));
            }
          }}
        />



        {/* Optional Interactive Graph Overlay */}
        {showGraph && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-400">
              <span className="flex items-center gap-1.5">
                <LineChart className="w-4 h-4" /> Đồ thị Phụ Thuộc Hợp Lực <ForceSymbol name="Fhl" /> Theo Góc α (0° → 180°)
              </span>
              <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                α = {alphaDeg}° ➔ <ForceSymbol name="Fhl" showArrow={false} /> = {formatVal(fResultMag, precision)} N
              </span>
            </div>

            {/* SVG Graph Plot */}
            <div className="w-full h-44 bg-slate-950 rounded-xl p-3 border border-slate-800 relative">
              <svg className="w-full h-full overflow-visible">
                {/* Axes */}
                <line x1="30" y1="130" x2="100%" y2="130" stroke="#475569" strokeWidth="1" />
                <line x1="30" y1="10" x2="30" y2="130" stroke="#475569" strokeWidth="1" />

                {/* Plot Curve */}
                {(() => {
                  const maxF = f1Mag + f2Mag || 1;
                  const points = graphData.map((d) => {
                    const x = 30 + (d.alpha / 180) * 85; // % or pixel calc
                    const y = 130 - (d.fResult / maxF) * 110;
                    return `${x}% ${y}`;
                  }).join(', ');

                  // Current point position
                  const curX = 30 + (alphaDeg / 180) * 85;
                  const curY = 130 - (fResultMag / maxF) * 110;

                  return (
                    <>
                      <polyline
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2.5"
                        points={points}
                      />
                      {/* Active point indicator */}
                      <circle
                        cx={`${curX}%`}
                        cy={curY}
                        r="6"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    </>
                  );
                })()}
              </svg>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono px-6">
                <span>0° (Max)</span>
                <span>90°</span>
                <span>180° (Min)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Controls & Formula Explanation */}
      <div className={`lg:col-span-5 ${isCompact ? 'space-y-3' : 'space-y-6'}`}>
        {/* Angle Alpha Slider Card */}
        <div className={`${isCompact ? 'p-2.5 space-y-2' : 'p-4 space-y-3'} rounded-2xl bg-slate-900 border border-slate-800`}>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-purple-400" /> Góc giữa hai lực (α):
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={alphaDeg}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) setAlphaDeg(Math.min(180, Math.max(0, val)));
                }}
                className="w-20 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded-lg text-right font-mono font-bold text-purple-300 text-xs focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={0}
                max={180}
              />
              <span className="font-semibold text-slate-400 text-xs">°</span>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={180}
            step={1}
            value={alphaDeg}
            onChange={(e) => setAlphaDeg(parseInt(e.target.value))}
            className={`w-full ${isCompact ? 'h-1.5' : 'h-2'} bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500`}
          />

          {/* Quick preset angle buttons */}
          <div className="grid grid-cols-5 gap-1 pt-0.5">
            {[0, 45, 60, 90, 180].map((a) => (
              <button
                key={a}
                onClick={() => setAlphaDeg(a)}
                className={`py-0.5 rounded-lg text-[10px] font-mono font-semibold transition ${
                  alphaDeg === a
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {a}°
              </button>
            ))}
          </div>
        </div>

        {/* Force F1 & F2 Controls */}
        <ForceControls
          forces={forces}
          precision={precision}
          showAngleSlider={false}
          isCompact={isCompact}
          onUpdateForce={(id, updates) => {
            if (id === 'f1' && updates.magnitude !== undefined) setF1Mag(updates.magnitude);
            if (id === 'f2' && updates.magnitude !== undefined) setF2Mag(updates.magnitude);
          }}
        />

        {/* Record Data Button */}
        <button
          onClick={handleRecord}
          className={`w-full ${isCompact ? 'py-2 text-[11px]' : 'py-3 text-xs'} bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ghi vào Bảng Số Liệu Thực Hành</span>
        </button>

        {/* Parallelogram Formula Box */}
        <div className={`${isCompact ? 'p-2.5 space-y-1 text-[11px]' : 'p-4 space-y-2 text-xs'} rounded-2xl bg-slate-900 border border-slate-800 text-slate-300`}>
          <h4 className="font-bold text-emerald-400 text-xs">
            📐 ĐỊNH LÝ HÀM SỐ COS TRONG TỔNG HỢP LỰC:
          </h4>
          <p className="font-mono text-emerald-300 bg-slate-950 p-2 rounded-xl border border-slate-800 text-center text-xs font-semibold">
            F<sub>hl</sub> = √(F₁² + F₂² + 2·F₁·F₂·cos α)
          </p>
        </div>
      </div>
    </div>
  );
};
