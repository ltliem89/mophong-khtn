import React, { useState } from 'react';
import { Challenge, SimulationTab } from '../types';
import { Award, CheckCircle2, Trophy, ArrowRight, Zap, Target } from 'lucide-react';

interface ChallengePanelProps {
  onSelectChallengeTab: (tab: SimulationTab) => void;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'THỬ THÁCH 1: Tìm Hợp Lực Hình Bình Hành',
    level: 'CƠ BẢN',
    description: 'Cho F1 = 8 N, F2 = 6 N và góc α = 60°. Hãy tìm độ lớn hợp lực Fhl.',
    tab: 'concurrent',
    targetType: 'Fhl_magnitude',
    targetValue: 12.17, // sqrt(64 + 36 + 2*8*6*0.5) = sqrt(148) = 12.165 N
    tolerance: 0.1,
    initialConfig: { f1: 8, f2: 6, angle: 60 },
  },
  {
    id: 'c2',
    title: 'THỬ THÁCH 2: Hợp Lực Cùng Phương Ngược Chiều',
    level: 'TRUNG BÌNH',
    description: 'Cho F1 = 15 N (0°), F2 = 9 N (180°). Hãy xác định độ lớn hợp lực Fhl.',
    tab: 'collinear',
    targetType: 'Fhl_magnitude',
    targetValue: 6.0,
    tolerance: 0.1,
    initialConfig: { f1: 15, f2: 9 },
  },
  {
    id: 'c3',
    title: 'THỬ THÁCH 3: Hợp Lực Bằng 10 N',
    level: 'TRUNG BÌNH',
    description: 'Tự chọn F1, F2 và góc α sao cho hợp lực Fhl đúng bằng 10.0 N.',
    tab: 'concurrent',
    targetType: 'Fhl_magnitude',
    targetValue: 10.0,
    tolerance: 0.1,
    initialConfig: { f1: 6, f2: 8, angle: 90 },
  },
  {
    id: 'c4',
    title: 'THỬ THÁCH 4: Phân Tích Lực Thành Thành Phần Fx, Fy',
    level: 'NÂNG CAO',
    description: 'Cho F = 20 N ở góc θ = 30°. Hãy xác định giá trị của thành phần vuông góc Fx.',
    tab: 'decomposition',
    targetType: 'decomposition_fx',
    targetValue: 17.32, // 20 * cos(30°) = 17.32 N
    tolerance: 0.1,
    initialConfig: { f1: 20, f2: 0, angle: 30 },
  },
];

export const ChallengePanel: React.FC<ChallengePanelProps> = ({
  onSelectChallengeTab,
}) => {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  const handleCheckAnswer = (c: Challenge) => {
    const val = parseFloat(answerInput);
    if (isNaN(val)) return;

    if (c.targetValue !== undefined) {
      const diff = Math.abs(val - c.targetValue);
      if (diff <= c.tolerance) {
        setFeedback({
          isCorrect: true,
          msg: `🎉 CHÍNH XÁC! Kết quả tính toán của bạn rất chuẩn xác (Đáp án: ~${c.targetValue} N).`,
        });
        if (!completedIds.includes(c.id)) {
          setCompletedIds([...completedIds, c.id]);
        }
      } else {
        setFeedback({
          isCorrect: false,
          msg: `❌ CHƯA CHÍNH XÁC! Kết quả của bạn: ${val} N. (Gợi ý: Kiểm tra lại công thức hoặc mở tab mô phỏng tương tác).`,
        });
      }
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              CHẾ ĐỘ THỬ THÁCH VẬT LÍ (CHALLENGES)
            </h3>
            <p className="text-xs text-slate-400">
              Thử tài giải bài tập tương tác, kiểm tra kết quả tự động với hệ thống
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-mono font-bold">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Đã hoàn thành: {completedIds.length}/{CHALLENGES.length}</span>
        </div>
      </div>

      {/* Challenge List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHALLENGES.map((c) => {
          const isDone = completedIds.includes(c.id);
          const isSelected = activeChallenge?.id === c.id;

          return (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border transition space-y-3 relative ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-500/50'
                  : isSelected
                  ? 'bg-slate-800 border-purple-500 shadow-lg'
                  : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                    c.level === 'CƠ BẢN'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : c.level === 'TRUNG BÌNH'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {c.level}
                </span>

                {isDone && (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Hoàn thành
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">{c.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{c.description}</p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActiveChallenge(c);
                    setFeedback(null);
                    setAnswerInput('');
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Đang làm' : 'Làm thử thách'}</span>
                </button>

                <button
                  onClick={() => onSelectChallengeTab(c.tab)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1"
                >
                  <span>Mở mô phỏng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Challenge Answer Box */}
      {activeChallenge && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/60 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-purple-300 text-sm flex items-center gap-2">
              <Target className="w-4 h-4" /> Đang giải: {activeChallenge.title}
            </h4>
            <span className="text-xs text-slate-400">Nhập đáp án số liệu để kiểm tra</span>
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="number"
              placeholder="Nhập giá trị cần tìm (N)..."
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              step="0.01"
            />
            <button
              onClick={() => handleCheckAnswer(activeChallenge)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
            >
              [KIỂM TRA]
            </button>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${
                feedback.isCorrect
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
              }`}
            >
              {feedback.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
