import React, { useState, useEffect, useRef } from 'react';
import { 
  Conversation, 
  Message, 
  UserSettings, 
  ImageAttachment, 
  AnswerMode 
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RightInspector } from './components/RightInspector';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { PromptTemplatesModal } from './components/PromptTemplatesModal';
import { Bot, Sparkles, Plus, Code, Box, HelpCircle } from 'lucide-react';

const STORAGE_KEY_CONVERSATIONS = 'ai_hoi_dap_conversations_v1';
const STORAGE_KEY_SETTINGS = 'ai_hoi_dap_settings_v1';

const DEFAULT_SETTINGS: UserSettings = {
  level: 'beginner',
  mode: 'auto',
  enableSearch: false,
  selectedModel: 'gemini-3.6-flash',
};

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse conversations from localStorage', e);
    }
    return [];
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize active conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: 'Cuộc hội thoại mới',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        settings: settings,
      };
      setConversations([newConv]);
      setActiveId(newConv.id);
    } else if (!activeId) {
      setActiveId(conversations[0].id);
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations', e);
    }
  }, [conversations]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'Cuộc hội thoại mới',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      settings: settings,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const newConv: Conversation = {
          id: Date.now().toString(),
          title: 'Cuộc hội thoại mới',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
          settings: settings,
        };
        setActiveId(newConv.id);
        return [newConv];
      }
      if (activeId === id) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (text: string, images: ImageAttachment[] = []) => {
    if (!activeConversation) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      images: images,
      timestamp: Date.now(),
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      modeUsed: settings.mode,
    };

    const updatedMessages = [...activeConversation.messages, userMsg, assistantMsg];

    // Update conversation with user and streaming assistant message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
          : c
      )
    );

    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const historyToSend = [...activeConversation.messages, userMsg];

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyToSend,
          userSettings: settings,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let groundingSources: any[] = [];
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          const dataStr = trimmed.replace('data: ', '');
          if (dataStr === '[DONE]') break;

          try {
            const data = JSON.parse(dataStr);

            if (data.error) {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === activeConversation.id
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === assistantMsgId
                            ? {
                                ...m,
                                content: data.error,
                                isStreaming: false,
                                isError: true,
                              }
                            : m
                        ),
                      }
                    : c
                )
              );
              setIsLoading(false);
              return;
            }

            if (data.text) {
              accumulatedContent += data.text;
            }

            if (data.groundingChunks) {
              const newSources = data.groundingChunks
                .map((g: any) => g.web)
                .filter(Boolean);
              groundingSources = [...groundingSources, ...newSources];
            }

            // Real-time UI update chunk
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeConversation.id
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMsgId
                          ? {
                              ...m,
                              content: accumulatedContent,
                              groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
                              isStreaming: true,
                            }
                          : m
                      ),
                    }
                  : c
              )
            );
          } catch (err) {
            // ignore parse errors for partial chunks
          }
        }
      }

      // Mark streaming as completed
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                ),
              }
            : c
        )
      );

      // Auto title generation for new conversation on 1st prompt
      if (activeConversation.messages.length === 0) {
        try {
          const titleRes = await fetch('/api/chat/title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text }),
          });
          const titleData = await titleRes.json();
          if (titleData.title) {
            handleRenameConversation(activeConversation.id, titleData.title);
          }
        } catch (e) {
          // ignore title generation failure
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Streaming error:', err);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: err.message || 'Lỗi kết nối với hệ thống AI.',
                          isStreaming: false,
                          isError: true,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSelectPresetPrompt = (prompt: string, mode?: string) => {
    if (mode) {
      handleUpdateSettings({ mode: mode as AnswerMode });
    }
    handleSendMessage(prompt);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeId={activeConversation?.id || null}
        onSelectConversation={(id) => setActiveId(id)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onSelectPresetPrompt={handleSelectPresetPrompt}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#F8FAFC]">
        <Header
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          isSidebarOpen={isSidebarOpen}
          isInspectorOpen={isInspectorOpen}
          onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
        />

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            /* Empty State Landing Screen High Density Bright Theme */
            <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 mx-auto flex items-center justify-center text-blue-600 shadow-sm">
                <Bot className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono uppercase">
                  TRỢ LÝ AI HỎI &amp; ĐÁP HỆ THỐNG
                </h2>
                <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                  Tiếp nhận câu hỏi, phân tích ý định, hỗ trợ trao đổi liên tục và tự động chuyển đổi giữa chế độ <span className="font-semibold text-blue-700 font-mono">Product / Tech / QA</span>.
                </p>
              </div>

              {/* Starter Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-4">
                <button
                  onClick={() =>
                    handleSelectPresetPrompt(
                      'ESP32 đọc cảm biến DS18B20 dùng chân nào? Cho ví dụ code chi tiết.',
                      'technical'
                    )
                  }
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition shadow-xs group"
                >
                  <div className="flex items-center gap-2.5 font-bold text-xs text-slate-800 mb-1 group-hover:text-blue-700 font-mono uppercase">
                    <Code className="w-4 h-4 text-amber-600" />
                    <span>Lập trình Kỹ thuật &amp; Vi điều khiển</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Hỏi về ESP32, Arduino, cảm biến nhiệt độ, xử lý lỗi code và kiến trúc phần mềm.
                  </p>
                </button>

                <button
                  onClick={() =>
                    handleSelectPresetPrompt(
                      'Tôi muốn xây dựng một ứng dụng Web Quản lý Kho Hàng thực tế. Hãy lập kế hoạch và hướng dẫn theo quy trình 10 bước.',
                      'product'
                    )
                  }
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition shadow-xs group"
                >
                  <div className="flex items-center gap-2.5 font-bold text-xs text-slate-800 mb-1 group-hover:text-emerald-700 font-mono uppercase">
                    <Box className="w-4 h-4 text-emerald-600" />
                    <span>Xây dựng Sản phẩm (10 Bước)</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Chuyển sang chế độ AI Product Engineer: từ Ý tưởng, Kiến trúc đến Code &amp; Triển khai.
                  </p>
                </button>

                <button
                  onClick={() =>
                    handleSelectPresetPrompt(
                      'So sánh PostgreSQL và MongoDB theo bảng chi phí, ưu điểm, nhược điểm và đưa ra khuyến nghị.',
                      'qa'
                    )
                  }
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition shadow-xs group"
                >
                  <div className="flex items-center gap-2.5 font-bold text-xs text-slate-800 mb-1 group-hover:text-blue-700 font-mono uppercase">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>So sánh Giải pháp bằng Bảng</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Đánh giá trực quan theo bảng Markdown: chi phí, ưu/nhược điểm và khuyến nghị rõ ràng.
                  </p>
                </button>

                <button
                  onClick={() => setIsTemplatesOpen(true)}
                  className="p-4 rounded-xl border border-blue-200 bg-gradient-to-tr from-blue-50 to-indigo-50 hover:border-blue-400 hover:shadow-md transition shadow-xs group text-left"
                >
                  <div className="flex items-center gap-2.5 font-bold text-xs text-blue-700 mb-1 font-mono uppercase">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Thư viện Mẫu câu hỏi Chuẩn</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Khám phá thêm các mẫu câu hỏi sẵn sàng cho công việc và học tập.
                  </p>
                </button>
              </div>
            </div>
          ) : (
            /* Active Messages List */
            <div className="divide-y divide-slate-200/80 pb-6">
              {activeConversation.messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onRetry={() => {
                    const lastUserMsg = activeConversation.messages
                      .slice()
                      .reverse()
                      .find((m) => m.role === 'user');
                    if (lastUserMsg) {
                      handleSendMessage(lastUserMsg.content, lastUserMsg.images);
                    }
                  }}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopStreaming={handleStopStreaming}
        />
      </div>

      {/* Right Inspector Panel */}
      <RightInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        settings={settings}
        lastMessage={
          activeConversation && activeConversation.messages.length > 0
            ? activeConversation.messages[activeConversation.messages.length - 1]
            : undefined
        }
        totalMessages={activeConversation?.messages.length || 0}
      />

      {/* Prompt Templates Modal */}
      <PromptTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectPrompt={handleSelectPresetPrompt}
      />
    </div>
  );
}
