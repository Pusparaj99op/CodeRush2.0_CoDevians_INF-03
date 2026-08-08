"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How does Veldar handle payments?",
  "What blockchains do you support?",
  "Explain the x402 protocol",
  "How do I get started?",
];

function BotIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <rect x="3" y="7" width="18" height="13" rx="3" stroke={color} strokeWidth="1.7" />
      {/* Antenna */}
      <line x1="12" y1="7" x2="12" y2="3" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="2.5" r="1.2" fill={color} />
      {/* Eyes */}
      <circle cx="8.5" cy="13" r="1.5" fill={color} />
      <circle cx="15.5" cy="13" r="1.5" fill={color} />
      {/* Mouth */}
      <path
        d="M9 16.5 Q12 18.5 15 16.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm **Veldar AI**\n\nI can help you understand how Veldar automates your B2B payments across borders. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setErrorDetail("");

    const callAPI = async () => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      return res;
    };

    try {
      let res = await callAPI();

      // Auto-retry once on rate limit (503) after a short pause
      if (res.status === 503) {
        setMessages([...newMessages, {
          role: "assistant",
          content: "⏳ High demand — retrying in 5 seconds…",
        }]);
        await new Promise((r) => setTimeout(r, 5000));
        // Remove the temporary message
        setMessages(newMessages);
        res = await callAPI();
      }

      const data = await res.json();

      if (data.text) {
        setMessages([...newMessages, { role: "assistant", content: data.text }]);
      } else {
        const detail = data.details ? data.details.join("\n") : data.error;
        setErrorDetail(detail || "Unknown error");
        const userMsg =
          res.status === 503
            ? "I'm getting a lot of requests right now — please wait a moment and try again! 🙏"
            : "Sorry, I couldn't connect right now. Please try again in a moment.";
        setMessages([...newMessages, { role: "assistant", content: userMsg }]);
      }
    } catch (err) {
      setErrorDetail(String(err));
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Network error — please check your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const renderText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      const isBullet = /^[-•*]\s/.test(line);
      return (
        <span
          key={i}
          className={isBullet ? "relative block pl-3 before:content-['•'] before:absolute before:left-0" : "block"}
          dangerouslySetInnerHTML={{ __html: boldLine }}
        />
      );
    });
  };

  return (
    <>
      {/* ── Keyframe animations ───────────────────────────────────── */}
      <style>{`
        @keyframes veldar-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes veldar-ping {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes veldar-ping-delay {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes veldar-icon-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(255,82,40,0.7)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 12px rgba(255,82,40,1)); }
        }
      `}</style>
      {/* ── Floating Chat Button ──────────────────────────────────── */}
      <div
        className="fixed bottom-6 right-6 z-[9999]"
        style={{
          animation: open ? "none" : "veldar-float 3s ease-in-out infinite",
        }}
      >
        {/* Pulse rings — only when closed */}
        {!open && (
          <>
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(255,82,40,0.25)",
                animation: "veldar-ping 2s ease-out infinite",
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(255,82,40,0.15)",
                animation: "veldar-ping-delay 2s ease-out infinite 0.6s",
              }}
            />
          </>
        )}

        <button
          id="veldar-chat-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open Veldar AI chat"
          className="relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300"
          style={{
            background: "rgba(10, 9, 8, 0.95)",
            border: "1.5px solid rgba(255, 82, 40, 0.65)",
            boxShadow: open
              ? "0 0 0 4px rgba(255,82,40,0.18), 0 8px 32px rgba(255,82,40,0.4)"
              : "0 0 0 2px rgba(255,82,40,0.12), 0 4px 24px rgba(255,82,40,0.35)",
            backdropFilter: "blur(16px)",
          }}
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,82,40,0.9)">
              <path d="M18 6L6 18M6 6l12 12" stroke="rgba(255,82,40,0.9)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          ) : (
            <span
              style={{
                animation: "veldar-icon-pulse 2.5s ease-in-out infinite",
                display: "flex",
              }}
            >
              <BotIcon size={24} color="#ff5228" />
            </span>
          )}
        </button>
      </div>

      {/* ── Chat Panel ───────────────────────────────────────────── */}
      <div
        className="fixed bottom-24 right-6 z-[9998] flex flex-col overflow-hidden transition-all duration-500"
        style={{
          width: "min(420px, calc(100vw - 3rem))",
          height: open ? "560px" : "0px",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          borderRadius: "1.25rem",
          border: open ? "1.5px solid rgba(255, 82, 40, 0.28)" : "none",
          background: "rgba(10, 9, 8, 0.97)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,82,40,0.07)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 shrink-0"
          style={{
            borderBottom: "1px solid rgba(255,82,40,0.14)",
            background: "linear-gradient(90deg, rgba(255,82,40,0.07) 0%, transparent 100%)",
          }}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
            style={{
              background: "rgba(255,82,40,0.12)",
              border: "1px solid rgba(255,82,40,0.4)",
              boxShadow: "0 0 14px rgba(255,82,40,0.22)",
            }}
          >
            <BotIcon size={18} color="#ff5228" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#f5f3f0] leading-tight">Veldar AI</p>
            <p className="text-[11px] text-[#8a8581]">Powered by Gemini · Always on</p>
          </div>
          <span
            className="ml-auto flex items-center gap-1.5 text-[11px] font-medium"
            style={{ color: "#34d399" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "#34d399" }}
            />
            Online
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "none" }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <span
                  className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(255,82,40,0.1)",
                    border: "1px solid rgba(255,82,40,0.3)",
                  }}
                >
                  <BotIcon size={13} color="#ff5228" />
                </span>
              )}
              <div
                className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={
                  m.role === "user"
                    ? {
                        background: "rgba(255,82,40,0.16)",
                        border: "1px solid rgba(255,82,40,0.28)",
                        color: "#f5f3f0",
                        borderBottomRightRadius: "6px",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        color: "#c9c5bf",
                        borderBottomLeftRadius: "6px",
                      }
                }
              >
                {renderText(m.content)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(255,82,40,0.1)", border: "1px solid rgba(255,82,40,0.3)" }}
              >
                <BotIcon size={13} color="#ff5228" />
              </span>
              <div
                className="rounded-2xl px-4 py-3 flex gap-1.5 items-center"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderBottomLeftRadius: "6px",
                }}
              >
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 rounded-full animate-bounce"
                    style={{ background: "#ff5228", animationDelay: `${d * 0.15}s`, opacity: 0.7 }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick suggestions */}
          {messages.length === 1 && !loading && (
            <div className="pt-1 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-[rgba(255,82,40,0.18)]"
                  style={{
                    background: "rgba(255,82,40,0.08)",
                    border: "1px solid rgba(255,82,40,0.24)",
                    color: "#ff5228",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Debug error (dev only) */}
          {errorDetail && process.env.NODE_ENV === "development" && (
            <details className="text-[10px] text-red-400 break-all">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="whitespace-pre-wrap mt-1">{errorDetail}</pre>
            </details>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="px-4 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,82,40,0.18)",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Veldar AI anything…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm text-[#f5f3f0] placeholder-[#8a8581] outline-none leading-relaxed py-0.5"
              style={{ maxHeight: "96px", overflowY: "auto" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200"
              style={{
                background: input.trim() && !loading ? "rgba(255,82,40,0.9)" : "rgba(255,255,255,0.06)",
                color: input.trim() && !loading ? "#fff" : "#555",
                cursor: input.trim() && !loading ? "pointer" : "default",
              }}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-[#6b6660]">
            Veldar AI · Gemini-powered
          </p>
        </div>
      </div>
    </>
  );
}
