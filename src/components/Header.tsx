import React from 'react';
import { UserSettings, UserLevel, AnswerMode } from '../types';
import { 
  Bot, 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  PanelLeft, 
  Plus, 
  GraduationCap, 
  Code2, 
  Box, 
  HelpCircle,
  Cpu,
  Activity
} from 'lucide-react';

interface HeaderProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenTemplates: () => void;
  isSidebarOpen: boolean;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onNewChat,
  onToggleSidebar,
  onOpenTemplates,
  isSidebarOpen,
  isInspectorOpen,
  onToggleInspector,
}) => {
  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-3 sm:px-6 shrink-0 z-30 transition-colors shadow-xs">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Mở/Đóng Danh sách Hội thoại"
          id="sidebar-toggle-btn"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Brand Logo & Bright Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-white italic text-xs shrink-0 shadow-sm shadow-blue-500/20">
            A
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 uppercase font-mono truncate">
              AI PRODUCT ENGINEER <span className="text-blue-600 opacity-90 hidden md:inline">/ PHÂN TÍCH HỆ THỐNG</span>
            </span>
            <span className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SẴN SÀNG</span>
            </span>
          </div>
        </div>
      </div>

      {/* Center/Right Bright Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Level Switcher */}
        <div className="relative group">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 transition"
            title="Đổi trình độ người dùng"
            id="level-switcher-btn"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline text-slate-500">Trình độ:</span>
            <span className="font-bold text-indigo-600">
              {settings.level === 'beginner' ? 'NGƯỜI MỚI' : 'CHUYÊN GIA'}
            </span>
          </button>
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 hidden group-hover:block z-50">
            <button
              onClick={() => onUpdateSettings({ level: 'beginner' })}
              className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center justify-between ${
                settings.level === 'beginner'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🌱 NGƯỜI MỚI BẮT ĐẦU</span>
              {settings.level === 'beginner' && '✓'}
            </button>
            <button
              onClick={() => onUpdateSettings({ level: 'expert' })}
              className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center justify-between ${
                settings.level === 'expert'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>⚡ CHUYÊN GIA KỸ THUẬT</span>
              {settings.level === 'expert' && '✓'}
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="relative group">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 transition"
            title="Chế độ câu trả lời"
            id="mode-switcher-btn"
          >
            {settings.mode === 'product' && <Box className="w-3.5 h-3.5 text-emerald-600" />}
            {settings.mode === 'technical' && <Code2 className="w-3.5 h-3.5 text-amber-600" />}
            {settings.mode === 'qa' && <HelpCircle className="w-3.5 h-3.5 text-blue-600" />}
            {settings.mode === 'auto' && <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
            
            <span className="hidden lg:inline text-slate-500">Chế độ:</span>
            <span className="font-bold">
              {settings.mode === 'auto' && 'TỰ ĐỘNG'}
              {settings.mode === 'qa' && 'HỎI & ĐÁP'}
              {settings.mode === 'product' && 'SẢN PHẨM'}
              {settings.mode === 'technical' && 'KỸ THUẬT'}
            </span>
          </button>

          <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 hidden group-hover:block z-50">
            <button
              onClick={() => onUpdateSettings({ mode: 'auto' })}
              className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 ${
                settings.mode === 'auto'
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tự động nhận diện</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ mode: 'qa' })}
              className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 ${
                settings.mode === 'qa'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hỏi &amp; Đáp ngắn gọn</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ mode: 'product' })}
              className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 ${
                settings.mode === 'product'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Tạo Sản phẩm (10 bước)</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ mode: 'technical' })}
              className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 ${
                settings.mode === 'technical'
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Kỹ thuật &amp; Code</span>
            </button>
          </div>
        </div>

        {/* Search Grounding Toggle */}
        <button
          onClick={() => onUpdateSettings({ enableSearch: !settings.enableSearch })}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-mono rounded border transition ${
            settings.enableSearch
              ? 'bg-sky-50 border-sky-300 text-sky-700 font-semibold'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title="Bật/Tắt tìm kiếm Google thực tế"
          id="google-search-toggle"
        >
          <Search className={`w-3.5 h-3.5 ${settings.enableSearch ? 'text-sky-600 animate-pulse' : ''}`} />
          <span className="hidden sm:inline">Tra cứu Web</span>
        </button>

        {/* Model Switcher */}
        <button
          onClick={() =>
            onUpdateSettings({
              selectedModel:
                settings.selectedModel === 'gemini-3.6-flash'
                  ? 'gemini-3.1-pro-preview'
                  : 'gemini-3.6-flash',
            })
          }
          className="hidden xl:flex items-center gap-1.5 px-2 py-1 text-xs font-mono rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
          title="Chuyển mô hình Gemini"
          id="model-toggle-btn"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-600" />
          <span>{settings.selectedModel === 'gemini-3.1-pro-preview' ? 'Pro 3.1' : 'Flash 3.6'}</span>
        </button>

        {/* Prompt Templates Preset Button */}
        <button
          onClick={onOpenTemplates}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded transition"
          title="Thư viện Mẫu câu hỏi chuẩn"
          id="templates-btn"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Right Inspector Toggle */}
        <button
          onClick={onToggleInspector}
          className={`p-1.5 rounded border transition ${
            isInspectorOpen
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title="Bật/Tắt Panel Phân tích Ý định"
          id="inspector-toggle-btn"
        >
          <Activity className="w-4 h-4" />
        </button>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all active:scale-95"
          id="new-chat-btn"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">MỚI</span>
        </button>
      </div>
    </header>
  );
};

