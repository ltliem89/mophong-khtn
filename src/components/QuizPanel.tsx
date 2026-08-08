import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, RefreshCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: '1. Hai lực cùng phương, cùng chiều có độ lớn F1 = 6 N và F2 = 8 N. Hợp lực của chúng có độ lớn bằng bao nhiêu?',
    options: ['A. 2 N', 'B. 10 N', 'C. 14 N', 'D. 48 N'],
    correctIdx: 2,
    explanation: 'Khi 2 lực cùng phương cùng chiều (α = 0°), hợp lực có độ lớn Fhl = F1 + F2 = 6 + 8 = 14 N.',
  },
  {
    id: 'q2',
    question: '2. Hai lực cùng phương, ngược chiều có độ lớn F1 = 12 N và F2 = 5 N. Hợp lực có độ lớn và chiều như thế nào?',
    options: [
      'A. Fhl = 17 N, cùng chiều F1',
      'B. Fhl = 7 N, cùng chiều F1',
      'C. Fhl = 7 N, cùng chiều F2',
      'D. Fhl = 60 N, ngược chiều F1',
    ],
    correctIdx: 1,
    explanation: 'Khi 2 lực ngược chiều (α = 180°), độ lớn Fhl = |F1 - F2| = |12 - 5| = 7 N và hợp lực luôn cùng chiều với lực có độ lớn lớn hơn (F1).',
  },
  {
    id: 'q3',
    question: '3. Hai lực đồng quy F1 = 6 N và F2 = 8 N vuông góc với nhau (α = 90°). Độ lớn hợp lực Fhl bằng bao nhiêu?',
    options: ['A. 14 N', 'B. 2 N', 'C. 10 N', 'D. 48 N'],
    correctIdx: 2,
    explanation: 'Khi 2 lực vuông góc (α = 90°), Fhl = √(F1² + F2²) = √(6² + 8²) = √100 = 10 N theo định lý Pytago.',
  },
  {
    id: 'q4',
    question: '4. Điều kiện cân bằng của một chất điểm chịu tác dụng của nhiều lực là gì?',
    options: [
      'A. Hợp lực tác dụng lên vật phải bằng 0 (Fhl = 0)',
      'B. Các lực phải cùng độ lớn',
      'C. Các lực phải song song với nhau',
      'D. Vật phải hoàn toàn không chuyển động',
    ],
    correctIdx: 0,
    explanation: 'Theo Định luật I Newton và điều kiện cân bằng lực: Tổng hợp lực tác dụng lên chất điểm phải bằng 0 (ΣF = 0). Khi đó vật đứng yên hoặc chuyển động thẳng đều.',
  },
  {
    id: 'q5',
    question: '5. Độ lớn hợp lực Fhl của hai lực F1 và F2 luôn thỏa mãn bất đẳng thức nào?',
    options: [
      'A. Fhl = F1 + F2',
      'B. |F1 - F2| ≤ Fhl ≤ F1 + F2',
      'C. Fhl ≥ F1 + F2',
      'D. Fhl = |F1 - F2|',
    ],
    correctIdx: 1,
    explanation: 'Hợp lực đạt cực đại khi α = 0° (Fhl = F1 + F2) và cực tiểu khi α = 180° (Fhl = |F1 - F2|). Do đó |F1 - F2| ≤ Fhl ≤ F1 + F2.',
  },
  {
    id: 'q6',
    question: '6. Một lực F = 10 N hợp với trục Ox góc 60°. Thành phần lực Fx trên trục Ox có giá trị là:',
    options: ['A. 5 N', 'B. 8.66 N', 'C. 10 N', 'D. 0 N'],
    correctIdx: 0,
    explanation: 'Thành phần Fx = F · cos(θ) = 10 · cos(60°) = 10 · 0.5 = 5 N.',
  },
  {
    id: 'q7',
    question: '7. Hai lực F1 = F2 = 10 N hợp với nhau góc α = 120°. Độ lớn hợp lực Fhl là:',
    options: ['A. 20 N', 'B. 10 N', 'C. 0 N', 'D. 14.1 N'],
    correctIdx: 1,
    explanation: 'Khi F1 = F2 và α = 120°, tam giác lực là tam giác đều nên độ lớn hợp lực Fhl = F1 = F2 = 10 N.',
  },
  {
    id: 'q8',
    question: '8. Quy tắc tổng hợp hai lực đồng quy là quy tắc nào?',
    options: [
      'A. Quy tắc tam giác vuông',
      'B. Quy tắc hình bình hành',
      'C. Quy tắc hình chữ nhật',
      'D. Quy tắc đòn đẩy',
    ],
    correctIdx: 1,
    explanation: 'Muốn tổng hợp hai lực đồng quy tác dụng lên cùng một vật, ta dùng Quy tắc hình bình hành: hai lực thành phần là hai cạnh, đường chéo xuất phát từ gốc chung là vector hợp lực.',
  },
];

export const QuizPanel: React.FC = () => {
  const [answers, setAnswers] = useState<{ [qId: string]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (qId: string, optIdx: number) => {
    setAnswers({ ...answers, [qId]: optIdx });
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIdx) score += 1;
    });
    return score;
  };

  const score = calculateScore();

  const handleResetQuiz = () => {
    setAnswers({});
    setShowResults(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              NGÂN HÀNG CÂU HỎI CỦNG CỐ BÀI 13
            </h3>
            <p className="text-xs text-slate-400">
              Trắc nghiệm kiểm tra kiến thức tổng hợp, phân tích lực & cân bằng lực
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showResults && (
            <span className="px-3 py-1.5 rounded-xl bg-blue-950 border border-blue-800 text-blue-300 text-xs font-mono font-bold">
              Điểm số: {score}/{QUIZ_QUESTIONS.length} ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
            </span>
          )}

          <button
            onClick={handleResetQuiz}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm lại</span>
          </button>
        </div>
      </div>

      {/* Question Cards */}
      <div className="space-y-6">
        {QUIZ_QUESTIONS.map((q) => {
          const selected = answers[q.id];
          const isAnswered = selected !== undefined;
          const isCorrect = selected === q.correctIdx;

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition space-y-3 ${
                isAnswered
                  ? isCorrect
                    ? 'bg-slate-800/80 border-emerald-500/50'
                    : 'bg-slate-800/80 border-rose-500/50'
                  : 'bg-slate-800/50 border-slate-700/80'
              }`}
            >
              <h4 className="font-bold text-slate-100 text-xs sm:text-sm leading-relaxed">
                {q.question}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isOptSelected = selected === optIdx;
                  const isOptCorrect = optIdx === q.correctIdx;

                  let btnStyle = 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-700/80';
                  if (isAnswered) {
                    if (isOptCorrect) {
                      btnStyle = 'bg-emerald-950/80 text-emerald-200 border-emerald-500 font-bold';
                    } else if (isOptSelected) {
                      btnStyle = 'bg-rose-950/80 text-rose-200 border-rose-500 font-bold';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isOptCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {isAnswered && isOptSelected && !isOptCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Physics Explanation */}
              {isAnswered && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300 mt-2">
                  <div className="font-bold text-blue-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Giải thích Vật lí:
                  </div>
                  <p className="text-[11px] leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
