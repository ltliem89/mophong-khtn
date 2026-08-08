import React from 'react';
import { TeacherConfig } from '../types';
import { UserCheck, Lock, Unlock, Eye, Sparkles, Sliders } from 'lucide-react';

interface TeacherControlsProps {
  config: TeacherConfig;
  onUpdateConfig: (updates: Partial<TeacherConfig>) => void;
  onLoadPresetScenario: (scenarioId: string) => void;
}

export const TeacherControls: React.FC<TeacherControlsProps> = ({
  config,
  onUpdateConfig,
  onLoadPresetScenario,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-5 shadow-xl text-amber-100">
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-amber-200 text-base">
              BẢNG ĐIỀU KHIỂN DÀNH CHO GIÁO VIÊN
            </h3>
            <p className="text-xs text-amber-300/80">
              Công cụ trình chiếu, tạo tình huống thực tế và khóa thông số cho học sinh
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold font-mono">
          Mức độ: {config.difficulty}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Preset Scenarios */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
          <label className="font-bold text-amber-300 block flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Tình Huống Giảng Dạy Mẫu:
          </label>
          <select
            onChange={(e) => onLoadPresetScenario(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="preset1">1. Kéo xà sà bằng 2 dây cable (F1=12N, F2=16N, α=90°)</option>
            <option value="preset2">2. Treo biển quảng cáo cân bằng (3 lực triệt tiêu)</option>
            <option value="preset3">3. Phân tích trọng lực trên mặt phẳng nghiêng (P=20N, θ=30°)</option>
          </select>
        </div>

        {/* Difficulty Selector */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
          <label className="font-bold text-amber-300 block flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" /> Chọn Mức Đồ Khó:
          </label>
          <div className="flex gap-1.5">
            {(['CƠ BẢN', 'TRUNG BÌNH', 'NÂNG CAO'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onUpdateConfig({ difficulty: lvl })}
                className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                  config.difficulty === lvl
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Show/Hide Answers */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
          <label className="font-bold text-amber-300 block flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-amber-400" /> Trạng Thái Đáp Án:
          </label>
          <button
            onClick={() => onUpdateConfig({ showDirectAnswer: !config.showDirectAnswer })}
            className={`w-full py-2 rounded-lg font-bold text-xs transition border ${
              config.showDirectAnswer
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {config.showDirectAnswer ? '[ĐÃ HIỆN ĐÁP ÁN CHO TRÌNH CHIẾU]' : '[ĐÃ ẨN ĐÁP ÁN HỌC SINH]'}
          </button>
        </div>
      </div>
    </div>
  );
};
