import React, { useState } from 'react';
import { Compass, CheckCircle2, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { formatVal } from '../utils/physics';

export const ExplorationPanel: React.FC = () => {
  const [activeTaskId, setActiveTaskId] = useState<'task1' | 'task2'>('task1');

  // Task 1 predictions & inputs
  const [predAlpha0, setPredAlpha0] = useState('');
  const [predAlpha90, setPredAlpha90] = useState('');
  const [predAlpha180, setPredAlpha180] = useState('');
  const [hasTested1, setHasTested1] = useState(false);

  // Task 2 predictions & inputs
  const [predEquilAngle, setPredEquilAngle] = useState('');
  const [hasTested2, setHasTested2] = useState(false);

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-white text-base">
            THÍ NGHIỆM KHÁM PHÁ VẬT LÍ (DỰ ĐOÁN & THỰC HÀNH)
          </h3>
          <p className="text-xs text-slate-400">
            Dự đoán kết quả trước khi chạy mô phỏng, so sánh và tự rút ra quy luật vật lí
          </p>
        </div>
      </div>

      {/* Task Selector Tabs */}
      <div className="flex gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTaskId('task1')}
          className={`px-4 py-2.5 rounded-xl border transition ${
            activeTaskId === 'task1'
              ? 'bg-amber-600 border-amber-500 text-white shadow-md'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          THÍ NGHIỆM 1: Khảo sát Hợp lực theo Góc α
        </button>

        <button
          onClick={() => setActiveTaskId('task2')}
          className={`px-4 py-2.5 rounded-xl border transition ${
            activeTaskId === 'task2'
              ? 'bg-amber-600 border-amber-500 text-white shadow-md'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          THÍ NGHIỆM 2: Cân bằng lực với F1 = F2 = 10 N
        </button>
      </div>

      {/* TASK 1 CONTENT */}
      {activeTaskId === 'task1' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Đề bài Thí nghiệm 1:
            </h4>
            <p>
              Giữ nguyên hai lực <strong className="text-blue-400">F1 = 10 N</strong> và{' '}
              <strong className="text-pink-400">F2 = 10 N</strong>. Hãy dự đoán độ lớn hợp lực Fhl khi thay đổi góc α từ 0° đến 180°.
            </p>
          </div>

          {/* Step 1: Student Prediction Inputs */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-blue-400 uppercase tracking-wider">
              1. Em Dự Đoán Hợp Lực Fhl:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-slate-400 font-medium block">Khi α = 0° (Cùng chiều):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Dự đoán N..."
                    value={predAlpha0}
                    onChange={(e) => setPredAlpha0(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-slate-400 font-bold">N</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-slate-400 font-medium block">Khi α = 90° (Vuông góc):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Dự đoán N..."
                    value={predAlpha90}
                    onChange={(e) => setPredAlpha90(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-slate-400 font-bold">N</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-slate-400 font-medium block">Khi α = 180° (Ngược chiều):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Dự đoán N..."
                    value={predAlpha180}
                    onChange={(e) => setPredAlpha180(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-slate-400 font-bold">N</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setHasTested1(true)}
              disabled={!predAlpha0 || !predAlpha90 || !predAlpha180}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>[XÁC NHẬN DỰ ĐOÁN & CHẠY THÍ NGHIỆM KHÁM PHÁ]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Step 2: Compare & Conclusions */}
          {hasTested1 && (
            <div className="p-4 bg-slate-800/90 rounded-2xl border border-emerald-500/50 space-y-3 text-xs">
              <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 2. Kết Quả Thí Nghiệm Thực Tế & So Sánh:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">α = 0° (Max):</span>
                  <div className="text-slate-200 mt-1">Dự đoán: {predAlpha0} N</div>
                  <div className="text-emerald-400 font-bold">Thực tế: 20.0 N</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">α = 90°:</span>
                  <div className="text-slate-200 mt-1">Dự đoán: {predAlpha90} N</div>
                  <div className="text-emerald-400 font-bold">Thực tế: 14.1 N (10√2)</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">α = 180° (Min):</span>
                  <div className="text-slate-200 mt-1">Dự đoán: {predAlpha180} N</div>
                  <div className="text-emerald-400 font-bold">Thực tế: 0.0 N</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                <strong className="text-amber-400">📝 Rút ra kết luận:</strong>
                <p>
                  1. Khi góc α tăng từ 0° đến 180°, độ lớn hợp lực Fhl <strong>giảm dần</strong> từ giá trị cực đại (F1 + F2) xuống giá trị cực tiểu (|F1 - F2|).
                  <br />
                  2. Độ lớn hợp lực luôn thỏa mãn bất đẳng thức: <strong>|F1 - F2| ≤ Fhl ≤ F1 + F2</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TASK 2 CONTENT */}
      {activeTaskId === 'task2' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Đề bài Thí nghiệm 2:
            </h4>
            <p>
              Cho hai lực <strong className="text-blue-400">F1 = 10 N</strong> và{' '}
              <strong className="text-pink-400">F2 = 10 N</strong> tác dụng vào một vật. Bắt buộc góc α giữa 2 lực bằng bao nhiêu để hợp lực có độ lớn đúng bằng <strong>10 N</strong>?
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-blue-400 uppercase tracking-wider">
              1. Em Dự Đoán Góc α:
            </h4>

            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="number"
                placeholder="Nhập dự đoán góc α (°)..."
                value={predEquilAngle}
                onChange={(e) => setPredEquilAngle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
              <span className="text-slate-400 font-bold">độ (°)</span>
            </div>

            <button
              onClick={() => setHasTested2(true)}
              disabled={!predEquilAngle}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>[XÁC NHẬN DỰ ĐOÁN & KIỂM TRA]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {hasTested2 && (
            <div className="p-4 bg-slate-800/90 rounded-2xl border border-emerald-500/50 space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Kết Quả Lý Thuyết & Thực Nghiệm:
              </h4>

              <p>
                - Dự đoán của em: <strong>{predEquilAngle}°</strong>
                <br />- Đáp án chính xác: <strong>α = 120°</strong>
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-amber-400">📐 Giải thích Toán - Vật Lí:</strong>
                <p className="font-mono text-emerald-300 text-[11px]">
                  Fhl² = F1² + F2² + 2·F1·F2·cos(120°) = 100 + 100 + 2·10·10·(-0.5) = 100 ➔ Fhl = 10 N.
                </p>
                <p className="pt-1 text-[11px] text-slate-400">
                  💡 Khi hai lực thành phần bằng nhau (F1 = F2) và hợp với nhau góc 120°, tam giác lực trở thành tam giác đều, do đó độ lớn hợp lực đúng bằng độ lớn mỗi lực thành phần!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
