import React from 'react';
import { ForceVector, DecimalPrecision } from '../types';
import { formatVal } from '../utils/physics';
import { ForceSymbol } from './ForceSymbol';
import { Lock } from 'lucide-react';

interface ForceControlsProps {
  forces: ForceVector[];
  precision: DecimalPrecision;
  onUpdateForce: (id: string, updates: Partial<ForceVector>) => void;
  showAngleSlider?: boolean;
  minMag?: number;
  maxMag?: number;
  stepMag?: number;
}

export const ForceControls: React.FC<ForceControlsProps> = ({
  forces,
  precision,
  onUpdateForce,
  showAngleSlider = true,
  minMag = 0,
  maxMag = 50,
  stepMag = 0.5,
}) => {
  return (
    <div className="space-y-4">
      {forces.map((force) => (
        <div
          key={force.id}
          className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 shadow-md relative overflow-hidden"
        >
          {/* Accent Color Left Strip */}
          <div
            className="absolute top-0 left-0 bottom-0 w-1.5"
            style={{ backgroundColor: force.color }}
          />

          {/* Header Row */}
          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: force.color }}
              />
              <span className="font-extrabold text-white text-sm flex items-center gap-1">
                Lực <ForceSymbol name={force.name} />
              </span>
            </div>

            <div className="flex items-center gap-2">
              {force.isLocked && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3" /> Đã khoá
                </span>
              )}
            </div>
          </div>

          {/* Magnitude Slider + Numeric Input */}
          <div className="pl-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <label htmlFor={`mag-${force.id}`} className="text-slate-400 font-medium flex items-center gap-1">
                Độ lớn (<ForceSymbol name={force.name} showArrow={false} />):
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  disabled={force.isLocked}
                  value={formatVal(force.magnitude, precision)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      onUpdateForce(force.id, { magnitude: Math.max(minMag, Math.min(maxMag, val)) });
                    }
                  }}
                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono font-bold text-slate-100 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  step={stepMag}
                  min={minMag}
                  max={maxMag}
                />
                <span className="font-semibold text-slate-400 text-xs">N</span>
              </div>
            </div>

            <input
              id={`mag-${force.id}`}
              type="range"
              disabled={force.isLocked}
              min={minMag}
              max={maxMag}
              step={stepMag}
              value={force.magnitude}
              onChange={(e) => onUpdateForce(force.id, { magnitude: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Angle Slider + Numeric Input (if enabled) */}
          {showAngleSlider && (
            <div className="pl-2 space-y-1.5 pt-1 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <label htmlFor={`angle-${force.id}`} className="text-slate-400 font-medium">Góc hướng (α):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    disabled={force.isLocked}
                    value={Math.round(force.angleDeg)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        onUpdateForce(force.id, { angleDeg: ((val % 360) + 360) % 360 });
                      }
                    }}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono font-bold text-slate-100 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    min={0}
                    max={360}
                  />
                  <span className="font-semibold text-slate-400 text-xs">°</span>
                </div>
              </div>

              <input
                id={`angle-${force.id}`}
                type="range"
                disabled={force.isLocked}
                min={0}
                max={360}
                step={1}
                value={force.angleDeg}
                onChange={(e) => onUpdateForce(force.id, { angleDeg: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
