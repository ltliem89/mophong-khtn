import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { formatVal } from '../utils/physics';

interface MotionControlsProps {
  netMagnitude: number;
  netAngleDeg: number;
  onOffsetChange: (offset: { x: number; y: number }) => void;
  onMovingStateChange: (isMoving: boolean) => void;
}

export const MotionControls: React.FC<MotionControlsProps> = ({
  netMagnitude,
  netAngleDeg,
  onOffsetChange,
  onMovingStateChange,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<0.25 | 0.5 | 1 | 2>(1);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [mass, setMass] = useState(1); // default 1 kg

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Position offset (in canvas pixels)
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Acceleration a = F / m
  const accel = netMagnitude / mass;
  // Velocity v = a * t
  const velocity = accel * elapsedTime;
  // Displacement d = 0.5 * a * t^2
  const displacement = 0.5 * accel * elapsedTime * elapsedTime;

  const animate = (time: number) => {
    if (lastTimeRef.current !== null) {
      const dt = ((time - lastTimeRef.current) / 1000) * speedMultiplier;
      setElapsedTime((prev) => {
        const newTime = prev + dt;

        // Calculate offset displacement in pixels (scale 1m = 10px for visual movement)
        const rad = (netAngleDeg * Math.PI) / 180;
        const dPx = 0.5 * accel * newTime * newTime * 10;

        const newX = dPx * Math.cos(rad);
        const newY = dPx * Math.sin(rad);

        // Cap animation distance so object stays inside canvas boundary
        if (Math.hypot(newX, newY) > 180) {
          setIsRunning(false);
          onMovingStateChange(false);
          return prev;
        }

        onOffsetChange({ x: newX, y: newY });
        setPos({ x: newX, y: newY });
        return newTime;
      });
    }
    lastTimeRef.current = time;
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isRunning) {
      onMovingStateChange(true);
      requestRef.current = requestAnimationFrame(animate);
    } else {
      onMovingStateChange(false);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, speedMultiplier, netMagnitude, netAngleDeg, mass]);

  const handleReset = () => {
    setIsRunning(false);
    onMovingStateChange(false);
    setElapsedTime(0);
    setPos({ x: 0, y: 0 });
    onOffsetChange({ x: 0, y: 0 });
    lastTimeRef.current = null;
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-emerald-400" /> Mô Phỏng Chuyển Động Vật Thể
        </span>

        {/* Speed multiplier selection */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-[11px] font-mono">
          {([0.25, 0.5, 1, 2] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeedMultiplier(s)}
              className={`px-2 py-0.5 rounded-lg transition font-bold ${
                speedMultiplier === s
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
          <span className="text-slate-400 text-[10px] block">Khối lượng m:</span>
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type="number"
              value={mass}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(e) => setMass(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-12 bg-slate-900 border border-slate-700 rounded px-1 text-right font-mono font-bold text-emerald-300 text-xs"
            />
            <span className="text-slate-400 text-[11px]">kg</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
          <span className="text-slate-400 text-[10px] block">Gia tốc a = F/m:</span>
          <span className="font-mono font-bold text-emerald-400 text-xs mt-1 block">
            {accel.toFixed(2)} m/s²
          </span>
        </div>

        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
          <span className="text-slate-400 text-[10px] block">Vận tốc v = a·t:</span>
          <span className="font-mono font-bold text-cyan-400 text-xs mt-1 block">
            {velocity.toFixed(2)} m/s
          </span>
        </div>

        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
          <span className="text-slate-400 text-[10px] block">Thời gian t:</span>
          <span className="font-mono font-bold text-purple-400 text-xs mt-1 block">
            {elapsedTime.toFixed(2)} s
          </span>
        </div>
      </div>

      {/* Animation Action Controls */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={netMagnitude <= 0.01}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> <span>TẠM DỪNG</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> <span>CHẠY MÔ PHỎNG CHUYỂN ĐỘNG</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-4 h-4" /> <span>ĐẶT LẠI VỊ TRÍ</span>
        </button>
      </div>
    </div>
  );
};
