
"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Check, Loader2, MessageSquare } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/lib/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

interface SupportAgent {
  id: string;
  firstName: string;
  lastName: string;
}

interface ChatMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function UserChatPage() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [supportAgent, setSupportAgent] = useState<SupportAgent | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;

    let isActive = true;

    const loadSupportAgent = async () => {
      try {
        const response = await apiClient.get<SupportAgent>("/messages/support-agent");
        if (isActive) {
          setSupportAgent(response.data);
        }
      } catch {
        if (isActive) {
          setSupportError("Support chat is unavailable right now.");
          setIsLoading(false);
        }
      }
    };

    loadSupportAgent();

    return () => {
      isActive = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !supportAgent) return;

    const newSocket = io(SOCKET_URL, {
      query: { userId: user.id },
      transports: ["websocket", "polling"], // Force try websocket first
    });

    newSocket.on("connect", () => {
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    newSocket.on("receive_message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("message_sent", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [supportAgent, user?.id]);

  useEffect(() => {
    if (!supportAgent) return;

    let isActive = true;
    setIsLoading(true);

    const loadHistory = async () => {
      try {
        const response = await apiClient.get<ChatMessage[]>(
          `/messages/history/${supportAgent.id}`
        );
        if (isActive) {
          setMessages(response.data);
        }
      } catch {
        if (isActive) {
          setSupportError("Unable to load your conversation.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isActive = false;
    };
  }, [supportAgent]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !supportAgent) return;

    socket.emit("send_message", {
      receiverId: supportAgent.id,
      content: newMessage,
    });
    setNewMessage("");
  };

  return (
    <DashboardLayout title="Support Chat">
      <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col">
        <Card className="flex-1 bg-zinc-900/50 border-zinc-800 flex flex-col overflow-hidden backdrop-blur-xl">
          {/* Chat Header */}
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <User className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">
                  {supportAgent ? `${supportAgent.firstName} ${supportAgent.lastName}` : "AluMate Support"}
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-zinc-500">Always Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(circle_at_center,rgba(39,39,42,0.1)_0,transparent_100%)]"
          >
            {supportError ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3 text-center">
                <MessageSquare className="h-8 w-8" />
                <p>{supportError}</p>
              </div>
            ) : isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Loading your conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4 opacity-50">
                <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm">Start a conversation with our support team!</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={msg._id || idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.senderId === user?.id
                        ? "bg-zinc-100 text-zinc-950 rounded-tr-none shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
                        : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <div className={`text-[10px] mt-1 opacity-50 flex items-center gap-1 ${
                      msg.senderId === user?.id ? "justify-end text-zinc-900" : "justify-start text-zinc-400"
                    }`}>
                      {msg.senderId === user?.id && (
                        <Check className="h-3 w-3" aria-label="Sent" />
                      )}
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700"
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || !socket || !supportAgent}
                className="bg-zinc-100 text-zinc-950 hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
