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
  showDirectionToggle?: boolean;
  minMag?: number;
  maxMag?: number;
  stepMag?: number;
  isCompact?: boolean;
}

export const ForceControls: React.FC<ForceControlsProps> = ({
  forces,
  precision,
  onUpdateForce,
  showAngleSlider = true,
  showDirectionToggle = false,
  minMag = 0,
  maxMag = 100,
  stepMag = 0.5,
  isCompact = false,
}) => {
  return (
    <div className={isCompact ? "space-y-1.5" : "space-y-2.5"}>
      {forces.map((force) => (
        <div
          key={force.id}
          className={`${isCompact ? 'p-2 rounded-xl space-y-1' : 'p-2.5 rounded-xl space-y-2'} bg-slate-800/80 border border-slate-700/80 shadow-md relative overflow-hidden`}
        >
          {/* Accent Color Left Strip */}
          <div
            className="absolute top-0 left-0 bottom-0 w-1.5"
            style={{ backgroundColor: force.color }}
          />

          {/* Magnitude Control: Color Dot + Symbol + Lock + Slider + Numeric Display */}
          <div className="pl-1.5 flex items-center gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: force.color }}
              />
              <span className="text-slate-100 font-extrabold flex items-center gap-0.5 text-xs whitespace-nowrap">
                <ForceSymbol name={force.name} showArrow={false} /> =
              </span>
              {force.isLocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
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
              className="flex-1 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 my-auto"
            />

            <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
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
                className="w-16 px-1.5 py-0.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-right font-mono font-bold text-slate-100 focus:outline-none focus:border-blue-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                step={stepMag}
                min={minMag}
                max={maxMag}
              />
              <span className="font-semibold text-slate-400 text-xs">N</span>
            </div>
          </div>

          {/* Angle Slider + Numeric Input (if enabled) */}
          {showAngleSlider && (
            <div className="pl-1.5 flex items-center gap-2 pt-1 border-t border-slate-700/50">
              <label
                htmlFor={`angle-${force.id}`}
                className="text-slate-400 font-medium text-xs whitespace-nowrap shrink-0"
              >
                Góc α =
              </label>

              <input
                id={`angle-${force.id}`}
                type="range"
                disabled={force.isLocked}
                min={0}
                max={360}
                step={1}
                value={force.angleDeg}
                onChange={(e) => onUpdateForce(force.id, { angleDeg: parseFloat(e.target.value) })}
                className="flex-1 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 my-auto"
              />

              <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
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
                  className="w-16 px-1.5 py-0.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-right font-mono font-bold text-slate-100 focus:outline-none focus:border-blue-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={0}
                  max={360}
                />
                <span className="font-semibold text-slate-400 text-xs">°</span>
              </div>
            </div>
          )}

          {/* Direction Selector Buttons for Collinear Forces */}
          {showDirectionToggle && (
            <div className="pl-1.5 space-y-1 pt-1 border-t border-slate-700/50">
              <label className="text-slate-400 font-medium text-[10px] block">Chiều hướng lực:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={force.isLocked}
                  onClick={() => onUpdateForce(force.id, { angleDeg: 0 })}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 ${
                    Math.abs(force.angleDeg - 0) < 45 || Math.abs(force.angleDeg - 360) < 45
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>➔ Sang phải (+ Ox)</span>
                </button>

                <button
                  type="button"
                  disabled={force.isLocked}
                  onClick={() => onUpdateForce(force.id, { angleDeg: 180 })}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 ${
                    Math.abs(force.angleDeg - 180) < 45
                      ? 'bg-pink-600 border-pink-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>⬅ Sang trái (- Ox)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
