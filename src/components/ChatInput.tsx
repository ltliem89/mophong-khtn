import React, { useState, useRef, useEffect } from 'react';
import { ImageAttachment } from '../types';
import { 
  Send, 
  Paperclip, 
  X, 
  Square, 
  Sparkles, 
  Image as ImageIcon,
  Cpu,
  Box,
  Code,
  HelpCircle
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, images: ImageAttachment[]) => void;
  isLoading: boolean;
  onStopStreaming: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStopStreaming,
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const parts = result.split(',');
          const mimeType = file.type;
          const base64Data = parts[1];

          setAttachments((prev) => [
            ...prev,
            {
              mimeType,
              data: base64Data,
              url: result,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const quickChips = [
    { label: 'ESP32 đọc cảm biến', text: 'ESP32 đọc cảm biến DS18B20 dùng chân nào? Cho ví dụ code chi tiết.' },
    { label: 'Xây dựng App Quản lý Kho', text: 'Tôi muốn xây dựng sản phẩm Web Quản Lý Kho Hàng hoàn chỉnh.' },
    { label: 'So sánh Database', text: 'So sánh PostgreSQL và MongoDB theo bảng chi phí, ưu nhược điểm.' },
    { label: 'Tìm lỗi Code React', text: 'Sửa lỗi re-render vô hạn trong React useEffect kèm ví dụ code.' },
  ];

  return (
    <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-3 pb-4 px-3 sm:px-6 shadow-xs">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Quick Chip Starters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            GỢI Ý Ý ĐỊNH:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(chip.text);
                textareaRef.current?.focus();
              }}
              className="px-2.5 py-1 text-xs font-mono rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 shrink-0 transition"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group rounded overflow-hidden border border-slate-200 w-14 h-14 bg-white shadow-xs">
                <img src={att.url} alt="upload" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveAttachment(idx)}
                  className="absolute top-1 right-1 p-0.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-full transition"
                  title="Xóa hình ảnh"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area Input Console Bar */}
        <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-300 focus-within:border-blue-600 focus-within:bg-white rounded-xl p-2 shadow-xs transition-all">
          {/* File Upload Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Attach Image Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 rounded-md transition"
            title="Đính kèm hình ảnh (Sơ đồ mạch, lỗi code, tài liệu, giao diện...)"
            id="upload-image-btn"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi tiếp theo của bạn ở đây... (Giữ ngữ cảnh hội thoại liên tục)"
            rows={1}
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none resize-none min-h-[24px] max-h-[160px] py-1.5 px-1 custom-scrollbar"
            id="chat-textarea"
          />

          {/* Send / Stop Action Button */}
          {isLoading ? (
            <button
              onClick={onStopStreaming}
              className="h-10 w-10 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition active:scale-95"
              title="Dừng sinh câu trả lời"
              id="stop-btn"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() && attachments.length === 0}
              className={`h-10 w-10 rounded-lg flex items-center justify-center transition active:scale-95 ${
                input.trim() || attachments.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="Gửi câu hỏi"
              id="send-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-center text-[10px] font-mono text-slate-400">
          AI Product Engineer • Phân tích Hệ thống &amp; Tự động duy trì trạng thái phần cứng/phần mềm.
        </div>
      </div>
    </div>
  );
};
