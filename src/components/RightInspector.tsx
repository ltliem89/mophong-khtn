import React from 'react';
import { UserSettings, Message } from '../types';
import { 
  Activity, 
  CheckCircle2, 
  Globe, 
  Sliders, 
  Cpu, 
  Layers, 
  Zap, 
  Clock, 
  BookOpen, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface RightInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  lastMessage?: Message;
  totalMessages: number;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  isOpen,
  onClose,
  settings,
  lastMessage,
  totalMessages,
}) => {
  if (!isOpen) return null;

  // Derive active intent metrics based on message or settings
  const modeLabel = 
    settings.mode === 'product' ? 'TẠO SẢN PHẨM' :
    settings.mode === 'technical' ? 'KỸ THUẬT & CODE' :
    settings.mode === 'qa' ? 'HỎI & ĐÁP' : 'TỰ ĐỘNG PHÂN TÍCH';

  const modeBadgeColor = 
    settings.mode === 'product' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
    settings.mode === 'technical' ? 'bg-amber-50 text-amber-700 border-amber-300' :
    settings.mode === 'qa' ? 'bg-blue-50 text-blue-700 border-blue-300' :
    'bg-purple-50 text-purple-700 border-purple-300';

  const levelLabel = settings.level === 'beginner' ? 'NGƯỜI MỚI' : 'CHUYÊN GIA';

  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 text-slate-800 text-xs h-full overflow-y-auto custom-scrollbar shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono font-bold text-[11px] tracking-wider text-slate-700 uppercase">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Phân tích ý định (Intent)</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-900 text-xs px-1.5 py-0.5 rounded border border-slate-200 bg-white"
          title="Đóng Inspector"
        >
          ✕
        </button>
      </div>

      {/* Intent Metrics Panel */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-[11px]">Loại câu hỏi:</span>
          <span className={`px-2 py-0.5 rounded border font-mono font-bold text-[10px] ${modeBadgeColor}`}>
            {modeLabel}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-[11px]">Trình độ User:</span>
          <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[10px] font-mono font-bold">
            {levelLabel}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-[11px]">Độ tin cậy xử lý:</span>
          <span className="text-emerald-600 font-mono font-bold">98.5%</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-[11px]">Mô hình AI:</span>
          <span className="text-purple-700 font-mono font-bold text-[10px]">
            {settings.selectedModel === 'gemini-3.1-pro-preview' ? 'Pro 3.1' : 'Flash 3.6'}
          </span>
        </div>
      </div>

      {/* Processing Pipeline Steps */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Quy trình xử lý (Steps)</span>
        </div>

        <div className="space-y-3.5 relative pl-2 pt-1">
          {/* Vertical step line */}
          <div className="absolute left-[13px] top-3 bottom-3 w-[1px] bg-slate-200"></div>

          {/* Step 1 */}
          <div className="relative flex gap-3 items-start">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100 z-10 shrink-0 mt-0.5"></div>
            <div>
              <div className="font-bold text-slate-900 text-[11px]">1. Nhận diện Yêu cầu</div>
              <div className="text-slate-500 text-[10px]">Phân tích Intent &amp; Ngữ cảnh câu hỏi</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex gap-3 items-start">
            <div className={`w-3.5 h-3.5 rounded-full z-10 shrink-0 mt-0.5 ${lastMessage ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-200'}`}></div>
            <div>
              <div className="font-bold text-slate-900 text-[11px]">2. Truy xuất &amp; Cấu trúc</div>
              <div className="text-slate-500 text-[10px]">Lập bảng, phân tích lỗi, code block</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex gap-3 items-start">
            <div className={`w-3.5 h-3.5 rounded-full z-10 shrink-0 mt-0.5 ${settings.enableSearch ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-slate-200'}`}></div>
            <div>
              <div className="font-bold text-slate-900 text-[11px]">3. Tra cứu Web Thực tế</div>
              <div className="text-slate-500 text-[10px]">
                {settings.enableSearch ? 'Đã bật Google Search Grounding' : 'Chưa bật Grounding'}
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative flex gap-3 items-start">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-300 z-10 shrink-0 mt-0.5"></div>
            <div>
              <div className="font-bold text-slate-800 text-[11px]">4. AI Product Engineer</div>
              <div className="text-slate-500 text-[10px]">Duy trì ngữ cảnh &amp; Hỏi tiếp theo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grounding & References Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono flex items-center gap-1">
            <Globe className="w-3 h-3 text-sky-600" />
            Nguồn tham khảo
          </span>
          <span className="text-[10px] text-emerald-600 font-mono font-semibold">Live Sync</span>
        </div>

        {lastMessage?.groundingSources && lastMessage.groundingSources.length > 0 ? (
          <div className="space-y-1">
            {lastMessage.groundingSources.map((src, i) => (
              <a
                key={i}
                href={src.uri}
                target="_blank"
                rel="noreferrer"
                className="block text-[10px] text-sky-600 hover:underline truncate font-medium"
              >
                • {src.title || src.uri}
              </a>
            ))}
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 font-mono leading-relaxed space-y-0.5">
            <div>• Google Search Engine API</div>
            <div>• Technical &amp; System Architecture</div>
            <div>• ESP32 / Web / Database Docs</div>
          </div>
        )}
      </div>
    </aside>
  );
};
