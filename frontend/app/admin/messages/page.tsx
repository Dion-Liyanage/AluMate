
"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Clock, Loader2, Search, MessageSquare, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Conversation {
  _id: string;
  lastMessage: string;
  timestamp: string;
  isRead: boolean;
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export default function AdminChatPage() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Setup Socket Connection
  useEffect(() => {
    if (!user?.id) return;

    const newSocket = io(SOCKET_URL, {
      query: { userId: user.id },
    });

    newSocket.on("receive_message", (message) => {
      // If the message is from the user we are currently talking to
      if (message.senderId === selectedUserId) {
        setMessages((prev) => [...prev, message]);
      }
      // Refresh the conversation list to update the last message
      fetchConversations();
    });

    newSocket.on("message_sent", (message) => {
      if (message.receiverId === selectedUserId) {
        setMessages((prev) => [...prev, message]);
      }
      fetchConversations();
    });

    newSocket.on("conversation_history", (history) => {
      setMessages(history);
      setIsLoadingChat(false);
    });

    setSocket(newSocket);
    fetchConversations();

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, selectedUserId]);

  // 2. Fetch Inbox / Conversation List
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("alumate_token");
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  // 3. Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectUser = (otherUserId: string) => {
    setSelectedUserId(otherUserId);
    setIsLoadingChat(true);
    socket?.emit("join_conversation", { otherUserId });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedUserId) return;

    socket.emit("send_message", {
      receiverId: selectedUserId,
      content: newMessage,
    });
    setNewMessage("");
  };

  const selectedUser = conversations.find(c => c._id === selectedUserId)?.user;

  return (
    <DashboardLayout title="Admin Chat Center">
      <div className="max-w-6xl mx-auto h-[calc(100vh-160px)] flex gap-6">
        
        {/* LEFT: Conversation List */}
        <Card className="w-80 bg-zinc-900/50 border-zinc-800 flex flex-col backdrop-blur-xl">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-semibold text-zinc-200 mb-3">Messages</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search customers..." 
                className="pl-9 bg-zinc-950 border-zinc-800 text-xs h-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoadingList ? (
              <div className="p-10 flex flex-col items-center gap-2 opacity-50">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Loading inbox...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-10 text-center text-zinc-500 text-xs">
                No active conversations yet.
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectUser(conv._id)}
                  className={`w-full p-4 flex gap-3 items-center border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/30 text-left ${
                    selectedUserId === conv._id ? "bg-zinc-800/60" : ""
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-medium text-sm text-zinc-200 truncate">
                        {conv.user.firstName} {conv.user.lastName}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(conv.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate">{conv.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* RIGHT: Chat Window */}
        <Card className="flex-1 bg-zinc-900/50 border-zinc-800 flex flex-col overflow-hidden backdrop-blur-xl">
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-200">
                    {selectedUser?.firstName} {selectedUser?.lastName}
                  </h3>
                  <span className="text-xs text-zinc-500">Customer</span>
                </div>
              </div>

              {/* Messages */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {isLoadingChat ? (
                  <div className="h-full flex items-center justify-center opacity-50">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={msg._id || idx}
                      className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                          msg.senderId === user?.id
                            ? "bg-zinc-100 text-zinc-950 rounded-tr-none"
                            : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 opacity-50 ${
                          msg.senderId === user?.id ? "text-right" : "text-left"
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-200 h-11"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="bg-zinc-100 text-zinc-950 hover:bg-white h-11 px-6">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
              <div className="h-20 w-20 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-zinc-300 font-medium">Select a conversation</p>
                <p className="text-sm opacity-50">Choose a customer from the left to start chatting.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
