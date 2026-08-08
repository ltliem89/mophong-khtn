import React, { useState } from 'react';
import { ForceVector, DecimalPrecision, DataRecord } from '../../types';
import { formatVal, calculateNetForce } from '../../utils/physics';
import { VectorCanvas } from '../VectorCanvas';
import { ForceControls } from '../ForceControls';
import { ForceSymbol } from '../ForceSymbol';
import { ArrowRight, ArrowLeftRight, PlusCircle, HelpCircle } from 'lucide-react';

interface CollinearTabProps {
  precision: DecimalPrecision;
  scaleFactor: number;
  onRecordData: (record: Omit<DataRecord, 'id' | 'timestamp'>) => void;
}

export const CollinearTab: React.FC<CollinearTabProps> = ({
  precision,
  scaleFactor,
  onRecordData,
}) => {
  const [f1Mag, setF1Mag] = useState(5);
  const [f2Mag, setF2Mag] = useState(3);
  const [directionMode, setDirectionMode] = useState<'same' | 'opposite'>('same');
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  // Derive vectors
  const f1Angle = 0; // Always rightwards
  const f2Angle = directionMode === 'same' ? 0 : 180; // Rightwards or Leftwards

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

  const netResult = calculateNetForce(forces);

  // Resultant force details
  const fResultMag = directionMode === 'same' ? f1Mag + f2Mag : Math.abs(f1Mag - f2Mag);
  let resultDirectionText = 'Triệt tiêu = 0 N';
  if (fResultMag > 0.001) {
    if (directionMode === 'same' || f1Mag >= f2Mag) {
      resultDirectionText = 'Cùng chiều với F1 (Sang phải ➔)';
    } else {
      resultDirectionText = 'Cùng chiều với F2 (Sang trái ⬅)';
    }
  }

  const handleRecord = () => {
    onRecordData({
      round: 0, // Assigned by handler
      tabName: 'Hai lực cùng phương',
      f1: f1Mag,
      f2: f2Mag,
      angle: directionMode === 'same' ? 0 : 180,
      fResult: fResultMag,
      fResultAngle: netResult.netAngleDeg,
      notes: directionMode === 'same' ? 'Cùng chiều' : 'Ngược chiều',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Interactive Simulation Canvas */}
      <div className="lg:col-span-7 space-y-4">
        <VectorCanvas
          forces={forces}
          resultantVector={{
            magnitude: fResultMag,
            angleDeg: netResult.netAngleDeg,
            name: 'Fhl',
            color: '#10b981',
          }}
          showParallelogram={false}
          showGrid={true}
          showValues={true}
          showAngles={false}
          scaleFactor={scaleFactor}
          precision={precision}
          onVectorChange={(id, newMag) => {
            if (id === 'f1') setF1Mag(newMag);
            if (id === 'f2') setF2Mag(newMag);
          }}
        />

        {/* Real-time Results Dashboard */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-md">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-[11px] text-blue-400 font-medium flex items-center gap-1">Lực <ForceSymbol name="F1" /></span>
            <span className="text-lg font-mono font-bold text-blue-300">
              {formatVal(f1Mag, precision)} N
            </span>
          </div>

          <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <span className="text-[11px] text-pink-400 font-medium flex items-center gap-1">Lực <ForceSymbol name="F2" /></span>
            <span className="text-lg font-mono font-bold text-pink-300">
              {formatVal(f2Mag, precision)} N
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">Hợp lực <ForceSymbol name="Fhl" /></span>
            <span className="text-lg font-mono font-bold text-emerald-300">
              {formatVal(fResultMag, precision)} N
            </span>
          </div>

          <div className="sm:col-span-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Chiều hợp lực:</span>
            <span className="font-bold text-slate-200 flex items-center gap-1">{resultDirectionText}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Controls & Exploration Questions */}
      <div className="lg:col-span-5 space-y-6">
        {/* Direction Switcher Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Chiều tác dụng giữa hai lực
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDirectionMode('same')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-bold ${
                directionMode === 'same'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowRight className="w-5 h-5" />
              <span>[→ Cùng chiều]</span>
              <span className="text-[10px] opacity-80 flex items-center gap-0.5">
                <ForceSymbol name="Fhl" showArrow={false} /> = <ForceSymbol name="F1" showArrow={false} /> + <ForceSymbol name="F2" showArrow={false} />
              </span>
            </button>

            <button
              onClick={() => setDirectionMode('opposite')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-bold ${
                directionMode === 'opposite'
                  ? 'bg-pink-600 border-pink-500 text-white shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-5 h-5" />
              <span>[← Ngược chiều]</span>
              <span className="text-[10px] opacity-80 flex items-center gap-0.5">
                <ForceSymbol name="Fhl" showArrow={false} /> = |<ForceSymbol name="F1" showArrow={false} /> - <ForceSymbol name="F2" showArrow={false} />|
              </span>
            </button>
          </div>
        </div>

        {/* Force Sliders */}
        <ForceControls
          forces={forces}
          precision={precision}
          showAngleSlider={false}
          onUpdateForce={(id, updates) => {
            if (id === 'f1' && updates.magnitude !== undefined) setF1Mag(updates.magnitude);
            if (id === 'f2' && updates.magnitude !== undefined) setF2Mag(updates.magnitude);
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

        {/* Exploration Discovery Questions */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <HelpCircle className="w-4 h-4" />
            <span>CÂU HỎI KHÁM PHÁ</span>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => setSelectedQuestion(selectedQuestion === 1 ? null : 1)}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition space-y-1 block"
            >
              <span className="font-semibold text-slate-200 block">
                ❓ 1. Điều gì xảy ra với hợp lực khi tăng F1?
              </span>
              {selectedQuestion === 1 && (
                <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-700/50 leading-relaxed">
                  💡 <strong>Trả lời:</strong> Nếu 2 lực cùng chiều, tăng F1 làm Fhl tăng (Fhl = F1 + F2). Nếu ngược chiều, khi F1 lớn hơn F2 thì Fhl tăng; còn khi F1 nhỏ hơn F2, tăng F1 làm Fhl giảm cho tới khi F1 = F2 (Fhl = 0).
                </p>
              )}
            </button>

            <button
              onClick={() => setSelectedQuestion(selectedQuestion === 2 ? null : 2)}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition space-y-1 block"
            >
              <span className="font-semibold text-slate-200 block">
                ❓ 2. Điều gì xảy ra khi F1 = F2 và ngược chiều?
              </span>
              {selectedQuestion === 2 && (
                <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-700/50 leading-relaxed">
                  💡 <strong>Trả lời:</strong> Hai lực cùng độ lớn, cùng phương nhưng ngược chiều sẽ <strong>triệt tiêu hoàn toàn</strong> nhau (F<sub>hl</sub> = |F₁ - F₂| = 0 N). Vật đứng yên hoặc giữ nguyên trạng thái chuyển động thẳng đều.
                </p>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
