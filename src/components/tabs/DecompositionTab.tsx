import React, { useState } from 'react';
import { ForceVector, DecimalPrecision, DataRecord } from '../../types';
import { formatVal, degToRad } from '../../utils/physics';
import { VectorCanvas } from '../VectorCanvas';
import { ForceControls } from '../ForceControls';
import { ForceSymbol } from '../ForceSymbol';
import { Eye, EyeOff, PlusCircle, Split, HelpCircle } from 'lucide-react';

interface DecompositionTabProps {
  precision: DecimalPrecision;
  scaleFactor: number;
  onRecordData: (record: Omit<DataRecord, 'id' | 'timestamp'>) => void;
}

export const DecompositionTab: React.FC<DecompositionTabProps> = ({
  precision,
  scaleFactor,
  onRecordData,
}) => {
  const [fMag, setFMag] = useState(10);
  const [thetaDeg, setThetaDeg] = useState(35);
  const [showComponents, setShowComponents] = useState(true);

  // Main Force F
  const mainForce: ForceVector = {
    id: 'f',
    name: 'F',
    magnitude: fMag,
    angleDeg: thetaDeg,
    color: '#3b82f6', // Blue
  };

  // Calculate Decomposed Components Fx and Fy
  const rad = degToRad(thetaDeg);
  const fxMag = Math.abs(fMag * Math.cos(rad));
  const fyMag = Math.abs(fMag * Math.sin(rad));

  const fxAngle = Math.cos(rad) >= 0 ? 0 : 180;
  const fyAngle = Math.sin(rad) >= 0 ? 90 : 270;

  const fxVector: ForceVector = {
    id: 'fx',
    name: 'Fx',
    magnitude: fxMag,
    angleDeg: fxAngle,
    color: '#06b6d4', // Cyan
  };

  const fyVector: ForceVector = {
    id: 'fy',
    name: 'Fy',
    magnitude: fyMag,
    angleDeg: fyAngle,
    color: '#f97316', // Orange
  };

  const handleRecord = () => {
    onRecordData({
      round: 0,
      tabName: 'Phân tích lực',
      f1: fMag,
      f2: fxMag, // Fx
      angle: thetaDeg,
      fResult: fyMag, // Fy
      fResultAngle: 0,
      notes: `Phân tích F=${fMag}N thành Fx=${formatVal(fxMag, precision)}N và Fy=${formatVal(fyMag, precision)}N`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Canvas & Component Toggles */}
      <div className="lg:col-span-7 space-y-4">
        <VectorCanvas
          forces={[mainForce]}
          decomposedVectors={showComponents ? { fx: fxVector, fy: fyVector } : null}
          showParallelogram={false}
          showGrid={true}
          showValues={true}
          showAngles={true}
          scaleFactor={scaleFactor}
          precision={precision}
          onVectorChange={(_, newMag, newAngleDeg) => {
            setFMag(newMag);
            setThetaDeg(newAngleDeg);
          }}
        />

        {/* Toggle Show/Hide Components */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Split className="w-4 h-4 text-cyan-400" /> Trạng thái phân tích lực:
          </span>

          <button
            onClick={() => setShowComponents(!showComponents)}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
              showComponents
                ? 'bg-cyan-600 text-white border border-cyan-500'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {showComponents ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{showComponents ? '[ẨN THÀNH PHẦN]' : '[HIỆN THÀNH PHẦN]'}</span>
          </button>
        </div>

        {/* Component Values Dashboard */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 shadow-md">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-[11px] text-blue-400 font-medium flex items-center gap-1">Lực gốc <ForceSymbol name="F" /></span>
            <span className="text-lg font-mono font-bold text-blue-300">
              {formatVal(fMag, precision)} N
            </span>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <span className="text-[11px] text-purple-400 font-medium block">Góc θ (với Ox)</span>
            <span className="text-lg font-mono font-bold text-purple-300">
              {thetaDeg}°
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">Thành phần <ForceSymbol name="Fx" /> (Ox)</span>
            <span className="text-lg font-mono font-bold text-cyan-300">
              {formatVal(fxMag, precision)} N
            </span>
          </div>

          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <span className="text-[11px] text-orange-400 font-medium flex items-center gap-1">Thành phần <ForceSymbol name="Fy" /> (Oy)</span>
            <span className="text-lg font-mono font-bold text-orange-300">
              {formatVal(fyMag, precision)} N
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Force Controls & Trigonometry Formulas */}
      <div className="lg:col-span-5 space-y-6">
        <ForceControls
          forces={[mainForce]}
          precision={precision}
          showAngleSlider={true}
          onUpdateForce={(_, updates) => {
            if (updates.magnitude !== undefined) setFMag(updates.magnitude);
            if (updates.angleDeg !== undefined) setThetaDeg(updates.angleDeg);
          }}
        />

        {/* Record Data Button */}
        <button
          onClick={handleRecord}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ghi vào Bảng Số Liệu Thực Hành</span>
        </button>

        {/* Formula Box */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
          <h4 className="font-bold text-cyan-400 text-xs">
            📐 CÔNG THỨC PHÂN TÍCH LỰC VUÔNG GÓC:
          </h4>
          <div className="space-y-1.5 font-mono text-slate-200">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-cyan-400 font-bold">Fx = F · cos(θ)</span>
              <span>{formatVal(fMag, precision)} × cos({thetaDeg}°) = {formatVal(fxMag, precision)} N</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-orange-400 font-bold">Fy = F · sin(θ)</span>
              <span>{formatVal(fMag, precision)} × sin({thetaDeg}°) = {formatVal(fyMag, precision)} N</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            💡 Kiểm tra lại: F² = Fx² + Fy² = ({formatVal(fxMag, precision)})² + ({formatVal(fyMag, precision)})² = {(fxMag*fxMag + fyMag*fyMag).toFixed(1)} ≈ {(fMag*fMag).toFixed(1)}.
          </p>
        </div>
      </div>
    </div>
  );
};
