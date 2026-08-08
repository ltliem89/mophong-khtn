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
  isCompact?: boolean;
}

export const DecompositionTab: React.FC<DecompositionTabProps> = ({
  precision,
  scaleFactor,
  onRecordData,
  isCompact = false,
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
    <div className={`grid grid-cols-1 lg:grid-cols-12 ${isCompact ? 'gap-3' : 'gap-6'}`}>
      {/* Left Column: Canvas & Component Toggles */}
      <div className={`lg:col-span-7 ${isCompact ? 'space-y-2.5' : 'space-y-4'}`}>
        {/* Toggle Show/Hide Components */}
        <div className={`${isCompact ? 'p-2 text-xs' : 'p-3 text-xs'} rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between`}>
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Split className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-cyan-400`} /> Trạng thái phân tích lực:
          </span>

          <button
            onClick={() => setShowComponents(!showComponents)}
            className={`${isCompact ? 'px-3 py-1 text-[11px]' : 'px-4 py-2 text-xs'} rounded-xl font-bold flex items-center gap-1.5 transition ${
              showComponents
                ? 'bg-cyan-600 text-white border border-cyan-500'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {showComponents ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showComponents ? '[ẨN THÀNH PHẦN]' : '[HIỆN THÀNH PHẦN]'}</span>
          </button>
        </div>

        <VectorCanvas
          forces={[mainForce]}
          decomposedVectors={showComponents ? { fx: fxVector, fy: fyVector } : null}
          showParallelogram={false}
          showGrid={true}
          showValues={true}
          showAngles={true}
          scaleFactor={scaleFactor}
          precision={precision}
          isCompact={isCompact}
          onVectorChange={(_, newMag, newAngleDeg) => {
            setFMag(newMag);
            setThetaDeg(newAngleDeg);
          }}
        />


      </div>

      {/* Right Column: Force Controls & Trigonometry Formulas */}
      <div className={`lg:col-span-5 ${isCompact ? 'space-y-3' : 'space-y-6'}`}>
        <ForceControls
          forces={[mainForce]}
          precision={precision}
          showAngleSlider={true}
          isCompact={isCompact}
          onUpdateForce={(_, updates) => {
            if (updates.magnitude !== undefined) setFMag(updates.magnitude);
            if (updates.angleDeg !== undefined) setThetaDeg(updates.angleDeg);
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

        {/* Formula Box */}
        <div className={`${isCompact ? 'p-2.5 space-y-1 text-[11px]' : 'p-4 space-y-2 text-xs'} rounded-2xl bg-slate-900 border border-slate-800 text-slate-300`}>
          <h4 className="font-bold text-cyan-400 text-xs">
            📐 CÔNG THỨC PHÂN TÍCH LỰC VUÔNG GÓC:
          </h4>
          <div className="space-y-1 font-mono text-slate-200">
            <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between text-[11px]">
              <span className="text-cyan-400 font-bold">Fx = F · cos(θ)</span>
              <span>{formatVal(fMag, precision)} × cos({thetaDeg}°) = {formatVal(fxMag, precision)} N</span>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between text-[11px]">
              <span className="text-orange-400 font-bold">Fy = F · sin(θ)</span>
              <span>{formatVal(fMag, precision)} × sin({thetaDeg}°) = {formatVal(fyMag, precision)} N</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
