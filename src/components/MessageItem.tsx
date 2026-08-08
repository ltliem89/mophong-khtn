import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Globe, 
  ExternalLink, 
  Box, 
  Code2, 
  HelpCircle, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  onRetry?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-4 px-3 sm:px-6 transition-colors bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0 flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-xs">
              ME
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-md shadow-blue-500/20">
              AI
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0">
          {isUser ? (
            /* User Message layout */
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-tighter font-mono">
                Người dùng
              </div>
              <div className="text-base sm:text-lg leading-snug text-slate-900 font-sans font-medium">
                {message.content}
              </div>

              {/* User Image Attachments */}
              {message.images && message.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {message.images.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 max-w-xs shadow-xs">
                      <img
                        src={img.url || `data:${img.mimeType};base64,${img.data}`}
                        alt="User Upload"
                        className="max-h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* AI Response: Structured Bright Card */
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3">
              {/* Card Header & Controls */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter font-mono">
                    Trả lời từ AI Engineer
                  </span>
                  {message.modeUsed && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {message.modeUsed === 'product' && 'SẢN PHẨM'}
                      {message.modeUsed === 'technical' && 'KỸ THUẬT'}
                      {message.modeUsed === 'qa' && 'HỎI & ĐÁP'}
                      {message.modeUsed === 'auto' && 'PHÂN TÍCH Ý ĐỊNH'}
                    </span>
                  )}
                </div>

                {message.content && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 transition"
                    title="Sao chép câu trả lời"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Streaming Indicator */}
              {message.isStreaming && !message.content && (
                <div className="flex items-center gap-2 py-3 text-blue-600 text-xs font-mono italic">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                  </div>
                  <span>Hệ thống đang truy xuất dữ liệu &amp; phân tích ý định...</span>
                </div>
              )}

              {/* Error Message Display */}
              {message.isError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-bold">LỖI XỬ LÝ HỆ THỐNG</p>
                    <p className="text-red-700 mt-0.5">{message.content}</p>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="mt-2 text-xs font-bold text-red-700 underline hover:no-underline"
                      >
                        Thử lại ngay
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Markdown Content */}
              {message.content && !message.isError && (
                <div className="prose max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed overflow-x-auto font-sans">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');

                        if (!inline) {
                          return <CodeBlock language={match ? match[1] : ''} code={codeString} />;
                        }

                        return (
                          <code
                            className="bg-slate-100 border border-slate-200 text-blue-700 px-1.5 py-0.5 rounded font-mono text-xs"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      table({ children }: any) {
                        return (
                          <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            <table className="w-full text-xs text-left">
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ children }: any) {
                        return <thead className="bg-slate-100 text-slate-800 font-mono font-bold uppercase">{children}</thead>;
                      },
                      tbody({ children }: any) {
                        return <tbody className="divide-y divide-slate-200 text-slate-700">{children}</tbody>;
                      },
                      th({ children }: any) {
                        return <th className="p-2.5 border-b border-slate-200">{children}</th>;
                      },
                      td({ children }: any) {
                        return <td className="p-2.5">{children}</td>;
                      },
                      ul({ children }: any) {
                        return <ul className="list-disc pl-5 my-2 space-y-1 text-slate-700">{children}</ul>;
                      },
                      ol({ children }: any) {
                        return <ol className="list-decimal pl-5 my-2 space-y-1 text-slate-700">{children}</ol>;
                      },
                      h1({ children }: any) {
                        return <h1 className="text-base font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-200 font-mono">{children}</h1>;
                      },
                      h2({ children }: any) {
                        return <h2 className="text-sm font-bold text-blue-700 mt-3 mb-1.5 font-mono">{children}</h2>;
                      },
                      h3({ children }: any) {
                        return <h3 className="text-xs font-bold text-slate-800 mt-2 mb-1 font-mono uppercase">{children}</h3>;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Grounding Citations */}
              {message.groundingSources && message.groundingSources.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-500 uppercase">
                    <Globe className="w-3.5 h-3.5 text-sky-600" />
                    <span>Nguồn dữ liệu web thực tế:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {message.groundingSources.map((source, idx) => {
                      if (!source.uri) return null;
                      return (
                        <a
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded bg-sky-50 text-sky-700 border border-sky-200 hover:border-sky-400 transition"
                        >
                          <span className="truncate max-w-[200px]">{source.title || source.uri}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Code block subcomponent with syntax copy button
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-[10px] text-blue-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Đã sao chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="font-sans">Sao chép code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
        <pre>{code}</pre>
      </div>
    </div>
  );
};
