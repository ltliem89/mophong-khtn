import React, { useState } from 'react';
import { ForceVector, DecimalPrecision, DataRecord } from '../../types';
import { calculateNetForce } from '../../utils/physics';
import { VectorCanvas } from '../VectorCanvas';
import { ForceControls } from '../ForceControls';
import { PlusCircle, HelpCircle } from 'lucide-react';

interface CollinearTabProps {
  precision: DecimalPrecision;
  scaleFactor: number;
  onRecordData: (record: Omit<DataRecord, 'id' | 'timestamp'>) => void;
  isCompact?: boolean;
}

export const CollinearTab: React.FC<CollinearTabProps> = ({
  precision,
  scaleFactor,
  onRecordData,
  isCompact = false,
}) => {
  const [f1Mag, setF1Mag] = useState(5);
  const [f1Angle, setF1Angle] = useState(0); // 0 (right +Ox) or 180 (left -Ox)

  const [f2Mag, setF2Mag] = useState(3);
  const [f2Angle, setF2Angle] = useState(0); // 0 (right +Ox) or 180 (left -Ox)

  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

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
  const isSameDirection = Math.abs(f1Angle - f2Angle) < 45 || Math.abs(Math.abs(f1Angle - f2Angle) - 360) < 45;

  const handleRecord = () => {
    onRecordData({
      round: 0, // Assigned by handler
      tabName: 'Hai lực cùng phương',
      f1: f1Mag,
      f2: f2Mag,
      angle: isSameDirection ? 0 : 180,
      fResult: netResult.netMagnitude,
      fResultAngle: netResult.netAngleDeg,
      notes: isSameDirection ? 'Cùng chiều' : 'Ngược chiều',
    });
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 ${isCompact ? 'gap-3' : 'gap-6'}`}>
      {/* Left Column: Interactive Simulation Canvas */}
      <div className="lg:col-span-7">
        <VectorCanvas
          forces={forces}
          resultantVector={{
            magnitude: netResult.netMagnitude,
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
          isCompact={isCompact}
          onVectorChange={(id, newMag, angleDeg) => {
            const dirAngle = (angleDeg !== undefined && angleDeg > 90 && angleDeg < 270) ? 180 : 0;
            if (id === 'f1') {
              setF1Mag(newMag);
              setF1Angle(dirAngle);
            }
            if (id === 'f2') {
              setF2Mag(newMag);
              setF2Angle(dirAngle);
            }
          }}
        />
      </div>

      {/* Right Column: Controls & Exploration Questions */}
      <div className={`lg:col-span-5 ${isCompact ? 'space-y-3' : 'space-y-6'}`}>
        {/* Force Sliders & Direction Toggles */}
        <ForceControls
          forces={forces}
          precision={precision}
          showAngleSlider={false}
          showDirectionToggle={true}
          isCompact={isCompact}
          onUpdateForce={(id, updates) => {
            if (id === 'f1') {
              if (updates.magnitude !== undefined) setF1Mag(updates.magnitude);
              if (updates.angleDeg !== undefined) setF1Angle(updates.angleDeg);
            }
            if (id === 'f2') {
              if (updates.magnitude !== undefined) setF2Mag(updates.magnitude);
              if (updates.angleDeg !== undefined) setF2Angle(updates.angleDeg);
            }
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

        {/* Exploration Discovery Questions */}
        <div className={`${isCompact ? 'p-2.5 space-y-2 text-[11px]' : 'p-4 space-y-3 text-xs'} rounded-2xl bg-slate-900 border border-slate-800`}>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>CÂU HỎI KHÁM PHÁ</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => setSelectedQuestion(selectedQuestion === 1 ? null : 1)}
              className="w-full p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition space-y-1 block"
            >
              <span className="font-semibold text-slate-200 block">
                ❓ 1. Khác biệt giữa hai lực cùng chiều và ngược chiều là gì?
              </span>
              {selectedQuestion === 1 && (
                <p className="text-slate-400 text-[10px] pt-1 border-t border-slate-700/50 leading-relaxed">
                  💡 <strong>Trả lời:</strong> Nếu 2 lực cùng chiều (0° hoặc 180°), hợp lực có độ lớn bằng tổng hai lực (Fhl = F1 + F2). Nếu ngược chiều, hợp lực bằng hiệu hai lực (Fhl = |F1 - F2|) và hướng theo lực có độ lớn lớn hơn.
                </p>
              )}
            </button>

            <button
              onClick={() => setSelectedQuestion(selectedQuestion === 2 ? null : 2)}
              className="w-full p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition space-y-1 block"
            >
              <span className="font-semibold text-slate-200 block">
                ❓ 2. Điều gì xảy ra khi F1 = F2 và ngược chiều?
              </span>
              {selectedQuestion === 2 && (
                <p className="text-slate-400 text-[10px] pt-1 border-t border-slate-700/50 leading-relaxed">
                  💡 <strong>Trả lời:</strong> Hai lực cùng độ lớn nhưng ngược chiều sẽ <strong>triệt tiêu hoàn toàn</strong> nhau (F<sub>hl</sub> = 0 N). Vật cân bằng, đứng yên hoặc chuyển động thẳng đều.
                </p>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
