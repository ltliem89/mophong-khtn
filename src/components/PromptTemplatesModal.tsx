import React from 'react';
import { 
  X, 
  Sparkles, 
  Box, 
  Code, 
  HelpCircle, 
  Image as ImageIcon, 
  Cpu, 
  CheckCircle2,
  Table
} from 'lucide-react';
import { AnswerMode } from '../types';

interface PromptTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string, mode?: AnswerMode) => void;
}

export const PromptTemplatesModal: React.FC<PromptTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  if (!isOpen) return null;

  const templates = [
    {
      category: '🛠️ Trợ lý Xây dựng Sản phẩm (10 Bước)',
      mode: 'product' as AnswerMode,
      icon: Box,
      items: [
        {
          title: 'Tạo Hệ thống Web Quản lý Kho',
          prompt: 'Tôi muốn xây dựng một hệ thống Web Quản lý Kho Hàng thực tế. Hãy lập kế hoạch và hướng dẫn theo đúng quy trình 10 bước: Ý tưởng → Phân tích yêu cầu → Kiến trúc → Chức năng → Giao diện → Backend → Database → AI/API → Kiểm thử → Triển khai.',
        },
        {
          title: 'Tạo Ứng dụng Quản lý Tài chính',
          prompt: 'Hãy thiết kế ứng dụng Quản lý Tài chính Cá nhân đa nền tảng với phân tích kiến trúc, lựa chọn công nghệ, cấu trúc thư mục và đoạn mã nguồn khởi tạo.',
        },
      ],
    },
    {
      category: '🔌 Vi điều khiển & Phần cứng IoT',
      mode: 'technical' as AnswerMode,
      icon: Cpu,
      items: [
        {
          title: 'ESP32 đọc Cảm biến Nhiệt độ DS18B20',
          prompt: 'ESP32 đọc cảm biến nhiệt độ DS18B20 dùng chân nào? Viết code mẫu Arduino C++ chi tiết có kiểm tra lỗi sơ đồ đấu nối.',
        },
        {
          title: 'Gửi dữ liệu Cảm biến lên Server qua HTTP API',
          prompt: 'Hướng dẫn ESP32 đọc dữ liệu cảm biến DHT22 và gửi dữ liệu dạng JSON qua HTTP POST API về Server Express Node.js.',
        },
      ],
    },
    {
      category: '📊 So sánh Công nghệ & Bảng Đánh giá',
      mode: 'qa' as AnswerMode,
      icon: Table,
      items: [
        {
          title: 'So sánh PostgreSQL vs MongoDB',
          prompt: 'Hãy so sánh chi tiết giữa PostgreSQL và MongoDB bằng bảng Markdown dựa trên các tiêu chí: Chi phí, Ưu điểm, Nhược điểm, Trường hợp sử dụng phù hợp và đưa ra Khuyến nghị rõ ràng.',
        },
        {
          title: 'So sánh React vs Vue.js',
          prompt: 'So sánh React và Vue.js cho dự án Web của doanh nghiệp nhỏ. Đưa ra bảng so sánh và lời khuyên phù hợp.',
        },
      ],
    },
    {
      category: '💻 Tìm Lỗi Code & Phân tích Kỹ thuật',
      mode: 'technical' as AnswerMode,
      icon: Code,
      items: [
        {
          title: 'Sửa lỗi Re-render vô hạn trong React',
          prompt: 'Phân tích nguyên nhân gây ra lỗi Vòng lặp Re-render vô hạn trong React useEffect, cách khắc phục kèm ví dụ code so sánh Trước vs Sau.',
        },
        {
          title: 'Tối ưu hoá Query SQL & Indexing',
          prompt: 'Cách phân tích và tối ưu hóa câu lệnh SQL Query bị chậm khi cơ sở dữ liệu có trên 1 triệu dòng.',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold font-mono text-slate-900 text-sm uppercase tracking-tight">
                THƯ VIỆN MẪU CÂU HỎI CHUẨN (INTENT TEMPLATES)
              </h2>
              <p className="text-xs text-slate-500">
                Chọn mẫu câu hỏi chuẩn tối ưu quy trình phân tích của AI Engineer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded border border-slate-200 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar font-mono">
          {templates.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Icon className="w-4 h-4 text-blue-600" />
                  <span>{cat.category}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cat.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => {
                        onSelectPrompt(item.prompt, cat.mode);
                        onClose();
                      }}
                      className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 transition group"
                    >
                      <div className="font-bold text-xs text-slate-800 group-hover:text-blue-700 mb-1 flex items-center justify-between">
                        <span>{item.title}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans line-clamp-2 leading-relaxed">
                        {item.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
