import React, { useState } from 'react';
import { Conversation } from '../types';
import { 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  X, 
  Download, 
  Sparkles, 
  Cpu, 
  Code, 
  Box, 
  ChevronRight,
  HelpCircle,
  Terminal,
  FileText
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onSelectPresetPrompt: (prompt: string, mode?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onSelectPresetPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStartRename = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleExportChat = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    const markdown = `# ${c.title}\n\n` + c.messages.map((m) => `### ${m.role === 'user' ? 'Người dùng' : 'AI Assistant'}\n${m.content}\n\n`).join('---\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${c.title.replace(/[^a-zA-Z0-9-À-ỹ]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presetPrompts = [
    {
      title: 'ESP32 & Cảm biến DS18B20',
      prompt: 'ESP32 đọc cảm biến DS18B20 dùng chân nào? Viết code mẫu chi tiết.',
      mode: 'technical',
      icon: Cpu,
    },
    {
      title: 'Tạo sản phẩm Web Quản lý',
      prompt: 'Tôi muốn tạo một sản phẩm Web quản lý kho hàng. Hãy phân tích và xây dựng từng bước.',
      mode: 'product',
      icon: Box,
    },
    {
      title: 'So sánh Database',
      prompt: 'So sánh PostgreSQL và MongoDB theo bảng chi phí, ưu điểm, nhược điểm và khuyến nghị.',
      mode: 'qa',
      icon: HelpCircle,
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        onClick={onClose}
      />

      <aside className="fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200 shadow-lg transition-all duration-300 shrink-0">
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            <span>Lịch sử hội thoại</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 lg:hidden transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono font-bold text-xs transition shadow-sm shadow-blue-600/20 active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tạo dự án mới...</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hội thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-6 px-3 text-slate-400 text-xs font-mono">
              {searchTerm ? 'Không có kết quả.' : 'Chưa có hội thoại nào.'}
            </div>
          ) : (
            filtered.map((c) => {
              const isActive = c.id === activeId;
              const isEditing = editingId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectConversation(c.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative p-2.5 rounded-lg text-xs cursor-pointer transition-colors border ${
                    isActive
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium'
                      : 'border-transparent hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {isActive && (
                    <div className="text-blue-600 font-mono font-bold text-[10px] mb-0.5 tracking-wider">
                      ĐANG CHỌN
                    </div>
                  )}

                  <div className="flex items-center gap-2 min-w-0 pr-12">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    
                    {isEditing ? (
                      <form onSubmit={(e) => handleSaveRename(c.id, e)} className="flex-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={(e) => handleSaveRename(c.id, e)}
                          autoFocus
                          className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-900 focus:outline-none font-mono"
                        />
                      </form>
                    ) : (
                      <span className="truncate">{c.title || 'Cuộc hội thoại'}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="absolute right-1.5 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded border border-slate-200 shadow-xs">
                      <button
                        onClick={(e) => handleStartRename(c, e)}
                        className="p-1 text-slate-500 hover:text-blue-600"
                        title="Đổi tên"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleExportChat(c, e)}
                        className="p-1 text-slate-500 hover:text-emerald-600"
                        title="Tải về File Markdown"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(c.id);
                        }}
                        className="p-1 text-slate-500 hover:text-red-600"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50 space-y-1">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
            Mẫu câu hỏi nhanh
          </div>
          {presetPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  onSelectPresetPrompt(item.prompt, item.mode);
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full text-left p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 hover:text-blue-600 transition flex items-center gap-2"
              >
                <Icon className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Context Notes Box */}
        <div className="m-2.5 p-3 bg-slate-100/80 rounded-lg border border-slate-200 text-[11px] leading-relaxed text-slate-600 font-mono">
          <strong className="text-slate-800 block mb-0.5">Ghi chú ngữ cảnh:</strong>
          Hệ thống đang tự động giữ trạng thái hội thoại liên tục để trả lời câu tiếp theo.
        </div>
      </aside>
    </>
  );
};

