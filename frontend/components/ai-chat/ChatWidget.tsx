"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ImagePlus, Loader2, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { aiChatApi, type AiChatMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Routes where the bubble would get in the way (admin area, auth forms, full-screen tools). */
const HIDDEN_PREFIXES = ["/admin", "/login", "/register", "/forgot-password", "/dashboard/messages", "/dashboard/design"];

const SUGGESTIONS = [
  "Can you make a sliding window like this? (attach a photo)",
  "What door designs do you have?",
  "Rough price for a 6ft x 4ft sliding window?",
  "Do you repair old aluminium windows?",
];

const WELCOME: AiChatMessage = {
  role: "assistant",
  text: "Hi! I'm the AluMate Assistant. Ask me anything about AluMate or send me a photo of an Aluminium product and I'll tell you if we can make it, and show you similar designs from our catalogue.",
  designs: [],
};

const MAX_IMAGE_DIMENSION = 1280;
const TEASER_DISMISSED_KEY = "alumate_ai_teaser_dismissed";
const TEASER_DELAY_MS = 2500;

/** Downscale to a JPEG so uploads are fast and use less of the free AI quota. */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file; // e.g. HEIC the browser can't decode — let the server handle it
  }
}

/** Renders the assistant's plain-text reply: "-" bullets, **bold**, *italic*, line breaks. */
function FormattedText({ text }: { text: string }) {
  const renderInline = (line: string): ReactNode[] =>
    line.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((chunk, i) => {
      if (chunk.startsWith("**") && chunk.endsWith("**") && chunk.length > 4) {
        return (
          <strong key={i} className="font-semibold text-zinc-50">
            {chunk.slice(2, -2)}
          </strong>
        );
      }
      if (chunk.startsWith("*") && chunk.endsWith("*") && chunk.length > 2) {
        return (
          <em key={i} className="text-zinc-400">
            {chunk.slice(1, -1)}
          </em>
        );
      }
      return <span key={i}>{chunk}</span>;
    });

  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="ml-4 list-disc space-y-0.5">
        {bullets.map((b, i) => (
          <li key={i}>{renderInline(b)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flush();
    if (!line) return;
    if (/^([-*_])\1{2,}$/.test(line)) {
      blocks.push(<hr key={`hr-${blocks.length}`} className="border-zinc-800" />);
      return;
    }
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      blocks.push(
        <p key={`h-${blocks.length}`} className="font-semibold text-zinc-50">
          {renderInline(heading[1])}
        </p>,
      );
      return;
    }
    blocks.push(<p key={`p-${blocks.length}`}>{renderInline(line)}</p>);
  });
  flush();

  return <div className="space-y-2">{blocks}</div>;
}

export function ChatWidget() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<{ blob: Blob; preview: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTeaser, setShowTeaser] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const storageKey = `alumate_ai_chat_${user?.id ?? "guest"}`;

  // Show the "Ask me anything" teaser shortly after load, once per browser session.
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(TEASER_DISMISSED_KEY) === "1";
    } catch {}
    if (dismissed) return;
    const t = setTimeout(() => setShowTeaser(true), TEASER_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const dismissTeaser = () => {
    setShowTeaser(false);
    try {
      sessionStorage.setItem(TEASER_DISMISSED_KEY, "1");
    } catch {}
  };

  const toggleOpen = () => {
    setOpen((o) => !o);
    setEverOpened(true);
    dismissTeaser();
  };

  // Restore the previous conversation for this user (or guest) when the chat is first opened.
  useEffect(() => {
    if (!open) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(storageKey);
    } catch {
      /* storage unavailable */
    }
    if (!saved || saved === conversationId) return;

    setLoadingHistory(true);
    aiChatApi
      .getConversation(saved)
      .then((res) => {
        setConversationId(saved);
        setMessages(res.data?.messages ?? []);
      })
      .catch(() => {
        try {
          localStorage.removeItem(storageKey);
        } catch {}
        setConversationId(null);
        setMessages([]);
      })
      .finally(() => setLoadingHistory(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, storageKey]);

  // Switching account (login / logout) starts a fresh chat.
  useEffect(() => {
    setConversationId(null);
    setMessages([]);
  }, [user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  const attachFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    const blob = await compressImage(file);
    if (blob.size > 5 * 1024 * 1024) {
      setError("That image is too large (max 5 MB).");
      return;
    }
    setError(null);
    setImage({ blob, preview: URL.createObjectURL(blob) });
  }, []);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if ((!text && !image) || sending) return;

    const pending: AiChatMessage = { role: "user", text, imageUrl: image?.preview, designs: [] };
    setMessages((prev) => [...prev, pending]);
    setInput("");
    setError(null);
    setSending(true);
    const imageToSend = image;
    setImage(null);

    try {
      const res = await aiChatApi.send({
        message: text || undefined,
        conversationId: conversationId ?? undefined,
        image: imageToSend?.blob,
      });
      if (res.data) {
        setConversationId(res.data.conversationId);
        try {
          localStorage.setItem(storageKey, res.data.conversationId);
        } catch {}
        setMessages((prev) => [...prev, res.data!.reply]);
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m !== pending));
      setInput(text);
      if (imageToSend) setImage({ blob: imageToSend.blob, preview: URL.createObjectURL(imageToSend.blob) });
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const newChat = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setConversationId(null);
    setMessages([]);
    setError(null);
  };

  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p)) || user?.role === "admin") return null;

  const shown = messages.length ? messages : [WELCOME];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 bottom-24 top-20 z-60 flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50 sm:inset-x-auto sm:right-6 sm:top-auto sm:h-150 sm:max-h-[calc(100vh-8rem)] sm:w-100"
            role="dialog"
            aria-label="AluMate AI assistant"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-sky-500 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-100">AluMate Assistant</p>
                <p className="text-xs text-zinc-500">AI · answers may not be perfect</p>
              </div>
              <button
                onClick={newChat}
                className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                title="New chat"
                aria-label="Start a new chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {loadingHistory ? (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                shown.map((m, i) => (
                  <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                    {m.role === "assistant" && (
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-violet-300">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div className={cn("max-w-[82%] space-y-2", m.role === "user" && "items-end")}>
                      {m.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.imageUrl}
                          alt="Attached product photo"
                          className="ml-auto max-h-52 rounded-xl border border-zinc-800 object-cover"
                        />
                      )}
                      {m.text && (
                        <div
                          className={cn(
                            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                            m.role === "user"
                              ? "rounded-br-sm bg-linear-to-br from-violet-600 to-indigo-600 text-white"
                              : "rounded-bl-sm bg-zinc-900 text-zinc-200 ring-1 ring-zinc-800",
                          )}
                        >
                          {m.role === "assistant" ? <FormattedText text={m.text} /> : <p className="whitespace-pre-wrap">{m.text}</p>}
                        </div>
                      )}
                      {m.designs?.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {m.designs.map((d) => (
                            <Link
                              key={d.id}
                              href={isAuthenticated ? `/dashboard/catalogue/${d.id}` : "/login"}
                              className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-violet-500/60"
                            >
                              {d.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={d.imageUrl} alt={d.title} className="h-20 w-full object-cover" />
                              ) : (
                                <div className="h-20 w-full bg-zinc-800" />
                              )}
                              <div className="p-2">
                                <p className="truncate text-xs font-medium text-zinc-100 group-hover:text-violet-300">{d.title}</p>
                                <p className="text-[10px] uppercase tracking-wide text-zinc-500">{d.designCode}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {sending && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-violet-300">
                    <Bot className="h-4 w-4" />
                  </div>
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" />
                  </span>
                </div>
              )}

              {!messages.length && !loadingHistory && !sending && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => (s.includes("attach a photo") ? fileRef.current?.click() : send(s))}
                      className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-left text-xs text-zinc-300 hover:border-violet-500/60 hover:text-zinc-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-zinc-800 bg-zinc-900/60 p-3">
              {error && <p className="mb-2 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
              {image && (
                <div className="relative mb-2 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.preview} alt="Selected" className="h-16 w-16 rounded-lg border border-zinc-700 object-cover" />
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(image.preview);
                      setImage(null);
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-zinc-800 p-0.5 text-zinc-300 ring-1 ring-zinc-700 hover:text-white"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    attachFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={sending}
                  className="rounded-lg p-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
                  title="Attach a photo"
                  aria-label="Attach a photo"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  onPaste={(e) => {
                    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
                    if (file) {
                      e.preventDefault();
                      attachFile(file);
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder={image ? "Ask about this photo…" : "Ask about our products…"}
                  className="max-h-28 min-h-10.5 flex-1 resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                />
                <button
                  onClick={() => send()}
                  disabled={sending || (!input.trim() && !image)}
                  className="rounded-lg bg-linear-to-br from-violet-600 to-sky-500 p-2.5 text-white hover:opacity-90 disabled:opacity-40"
                  aria-label="Send message"
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Ask me anything" teaser */}
      <AnimatePresence>
        {showTeaser && !open && (
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed bottom-7 right-24 z-60 w-64 max-w-[calc(100vw-7rem)]"
          >
            <div className="relative rounded-2xl border border-zinc-700/60 bg-zinc-900/90 p-3.5 pr-8 shadow-xl shadow-black/40 backdrop-blur-md">
              <button
                onClick={toggleOpen}
                className="block text-left"
                aria-label="Open AI assistant"
              >
                <p className="text-sm font-semibold text-zinc-50">
                  Hi there 👋 Ask me anything!
                </p>
              </button>
              <button
                onClick={dismissTeaser}
                className="absolute right-2 top-2 rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {/* pointer towards the bubble */}
              <span className="absolute -right-1.5 bottom-5 h-3 w-3 rotate-45 border-r border-t border-zinc-700/60 bg-zinc-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble */}
      <div className="fixed bottom-6 right-6 z-60">
        {!everOpened && !open && (
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-violet-500/40 [animation-duration:2.5s]" />
        )}
        <motion.button
          onClick={toggleOpen}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-violet-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-violet-900/50 ring-1 ring-white/15 transition-shadow hover:shadow-violet-600/50"
          aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
              </motion.span>
            )}
          </AnimatePresence>
          {!open && (
            <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-400" title="Online" />
          )}
        </motion.button>
      </div>
    </>
  );
}
