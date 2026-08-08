import React, { useState } from 'react';
import { DecimalPrecision } from '../types';
import { 
  Atom, 
  HelpCircle, 
  RotateCcw, 
  Layers, 
  Settings2,
  X,
  BookOpen,
  CheckCircle2,
  Target,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface HeaderProps {
  precision: DecimalPrecision;
  setPrecision: (p: DecimalPrecision) => void;
  scaleFactor: number; // Pixels per Newton
  setScaleFactor: (scale: number) => void;
  onResetAll: () => void;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  precision,
  setPrecision,
  scaleFactor,
  setScaleFactor,
  onResetAll,
  isCompact,
  setIsCompact,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-lg">
      <div className={`max-w-7xl mx-auto px-4 ${isCompact ? 'py-2' : 'py-3'} flex flex-wrap items-center justify-between gap-3 transition-all`}>
        {/* Title & Badge */}
        <div className="flex items-center gap-2.5">
          <div className={`${isCompact ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 transition-all`}>
            <Atom className={`${isCompact ? 'w-4 h-4' : 'w-6 h-6'} animate-spin-slow`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-extrabold text-white tracking-tight ${isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
                BÀI 13 – TỔNG HỢP & PHÂN TÍCH LỰC
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                Vật Lí 10 • KNTT
              </span>
            </div>
            {!isCompact && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Phòng thí nghiệm ảo Vật lý tương tác</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400 font-medium">Cân bằng & Phân tích lực</span>
              </p>
            )}
          </div>
        </div>

        {/* Global Controls & Mode Switchers */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Compressed View Toggle */}
          <button
            onClick={() => setIsCompact(!isCompact)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold transition ${
              isCompact
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20'
                : 'bg-slate-800/90 text-slate-300 border-slate-700/80 hover:bg-slate-700/80 hover:text-white'
            }`}
            title={isCompact ? 'Chuyển sang Chế độ hiển thị đầy đủ' : 'Chuyển sang Chế độ hiển thị thu gọn (Tối ưu màn hình)'}
          >
            {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span>{isCompact ? 'Chế độ Thu gọn' : 'Thu gọn'}</span>
          </button>

          {/* Decimal Precision Control */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700/80 text-slate-300">
            <span className="text-slate-400 text-[11px]">Làm tròn:</span>
            {([0, 1, 2, 3] as DecimalPrecision[]).map((p) => (
              <button
                key={p}
                onClick={() => setPrecision(p)}
                className={`w-5 h-5 rounded font-mono text-[11px] font-bold transition ${
                  precision === p
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                .{p}
              </button>
            ))}
          </div>

          {/* Scale Control */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700/80 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400">Tỉ lệ:</span>
            <span className="font-mono text-[11px] font-bold text-cyan-300">
              1cm={(20 / scaleFactor).toFixed(1)}N
            </span>
            <div className="flex gap-0.5 ml-1">
              <button
                onClick={() => setScaleFactor(Math.max(4, scaleFactor - 2))}
                className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold"
                title="Thu nhỏ vector"
              >
                -
              </button>
              <button
                onClick={() => setScaleFactor(Math.min(25, scaleFactor + 2))}
                className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold"
                title="Phóng to vector"
              >
                +
              </button>
            </div>
          </div>

          {/* Reset All Button */}
          <button
            onClick={onResetAll}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl transition"
            title="Đặt lại toàn bộ thí nghiệm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-5 text-slate-200 relative shadow-2xl">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-blue-600/20 rounded-xl text-blue-400 border border-blue-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Hướng Dẫn BÀI 13 – VẬT LÍ 10</h3>
                <p className="text-xs text-slate-400">Tổng hợp và phân tích lực. Cân bằng lực</p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
                <h4 className="font-bold text-blue-400 flex items-center gap-1.5 text-sm">
                  <Target className="w-4 h-4" /> 1. Kéo thả Vector trực tiếp
                </h4>
                <p>
                  Bạn có thể dùng chuột hoặc cảm ứng chạm trực tiếp vào **mũi tên vector** trên bảng mô phỏng để thay đổi độ lớn và góc quay theo thời gian thực!
                </p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> 2. Ba chế độ thí nghiệm chính (Khớp SGK Bài 13)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>Hai lực cùng phương:</strong> Quan sát tổng hợp khi cùng chiều (F<sub>hl</sub> = F₁ + F₂) và ngược chiều (F<sub>hl</sub> = |F₁ - F₂|) - Hình 13.2 SGK.</li>
                  <li><strong>Quy tắc hình bình hành:</strong> Tổng hợp 2 lực đồng quy góc α, dựng đường chéo hình bình hành F<sub>hl</sub> - Hình 13.3 SGK.</li>
                  <li><strong>Phân tích lực:</strong> Phân tích lực F thành 2 thành phần vuông góc F<sub>x</sub>, F<sub>y</sub> trên hai trục Ox, Oy - Hình 13.8 & 13.9 SGK.</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
                <h4 className="font-bold text-purple-400 flex items-center gap-1.5 text-sm">
                  <Settings2 className="w-4 h-4" /> 3. Tùy chỉnh hiển thị & Thu gọn
                </h4>
                <p>
                  Sử dụng nút **Thu gọn** trên thanh công cụ để tối ưu không gian làm việc trên màn hình nhỏ. Bạn cũng có thể điều chỉnh độ chính xác làm tròn số và tỉ lệ xích ngay phía trên.
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowHelp(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition"
              >
                Đã hiểu, Bắt đầu thí nghiệm!
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
