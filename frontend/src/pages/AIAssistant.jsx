import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2, User, Ship } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { API, getChatHistory } from "@/lib/api";
import { ASSISTANT } from "@/constants/testIds";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What's the import duty on turmeric into Australia?",
  "How do I calculate CIF value for a shipment?",
  "Best margin products to import from India right now?",
  "Explain GST on imported goods in Australia.",
];

function sessionId() {
  let s = localStorage.getItem("imex_session");
  if (!s) {
    s = crypto.randomUUID();
    localStorage.setItem("imex_session", s);
  }
  return s;
}

export default function AIAssistant() {
  const [session] = useState(sessionId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    getChatHistory(session).then((d) => setMessages(d.messages || [])).catch(() => {});
  }, [session]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch(`${API}/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session, message: msg }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.delta) {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = {
                role: "assistant",
                content: copy[copy.length - 1].content + payload.delta,
              };
              return copy;
            });
          } else if (payload.error) {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { role: "assistant", content: "⚠️ " + payload.error };
              return copy;
            });
          }
        }
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "⚠️ Connection error. Please try again." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div data-testid={ASSISTANT.page} className="space-y-7">
      <PageHeader
        eyebrow="Advisor"
        title="AI Trade Assistant"
        subtitle="Ask anything on customs, duties, HS codes, sourcing and margins — powered by Claude."
        icon={Sparkles}
      />

      <GlassCard lift={false} gold className="flex flex-col h-[62vh] min-h-[440px] overflow-hidden">
        <div ref={scrollRef} data-testid={ASSISTANT.messages} className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="h-full grid place-items-center text-center">
              <div>
                <span className="grid place-items-center h-16 w-16 rounded-3xl btn-gold mx-auto mb-5">
                  <Sparkles size={26} />
                </span>
                <h3 className="font-display text-2xl text-stone-100">How can I sharpen your trade?</h3>
                <p className="text-stone-400 text-sm mt-2 max-w-md mx-auto">
                  Try one of these to get started:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-6 max-w-xl mx-auto">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="btn-ghost-gold text-left text-sm px-4 py-3 rounded-xl leading-snug"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "")}
            >
              <span
                className={cn(
                  "grid place-items-center h-9 w-9 rounded-xl shrink-0",
                  m.role === "user" ? "glass text-stone-300" : "btn-gold"
                )}
              >
                {m.role === "user" ? <User size={16} /> : <Ship size={16} />}
              </span>
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-4 py-3 text-[0.92rem] leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "glass text-stone-100"
                    : "glass-gold text-stone-200"
                )}
              >
                {m.content || (streaming && i === messages.length - 1 ? (
                  <Loader2 size={15} className="animate-spin text-amber-300" />
                ) : "")}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <input
              data-testid={ASSISTANT.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about duties, sourcing, margins…"
              className="flex-1 glass rounded-full px-5 py-3.5 text-stone-100 text-[0.95rem] placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
            <button
              data-testid={ASSISTANT.send}
              onClick={() => send()}
              disabled={streaming || !input.trim()}
              className="btn-gold grid place-items-center h-12 w-12 rounded-full disabled:opacity-50"
            >
              {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
