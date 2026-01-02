"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant for AJ247 Studios. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndpoint = process.env.NEXT_PUBLIC_CHAT_ENDPOINT || "https://aj247studios.com/api/chat";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const GUEST_LIMIT = 3;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) =>
      setSession(sess)
    );
    return () => listener?.subscription.unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Check guest limit before sending
    if (!session && guestCount >= GUEST_LIMIT) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "You've reached the guest message limit. Please log in to continue chatting.",
        },
      ]);
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Increment guest count if not logged in
    if (!session) {
      setGuestCount((prev) => prev + 1);
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      
      // Add Authorization header if user is logged in
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.promptLogin) {
          // Backend says login required
          throw new Error(errorData.error || "Please log in to continue");
        }
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Prefer our API's reply shape, then fall back to raw OpenAI shape
      const assistantContent =
        data.reply ||
        data.choices?.[0]?.message?.content ||
        data.message ||
        "I apologize, but I couldn't generate a response.";
      
      const assistantMessage: Message = {
        role: "assistant",
        content: assistantContent,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm your AI assistant for AJ247 Studios. How can I help you today?",
      },
    ]);
  };

  const handleAuth = async (type: "signInWithPassword" | "signUp") => {
    setLoading(true);
    const { error } = await supabase.auth[type]({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setGuestCount(0);
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm your AI assistant for AJ247 Studios. How can I help you today?",
      },
    ]);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 z-50"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div 
          className={`fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col z-50 transition-all duration-300 ${
            isFullscreen 
              ? 'inset-0 rounded-none' 
              : 'bottom-0 left-0 right-0 sm:bottom-20 sm:right-6 sm:left-auto sm:w-96 rounded-t-2xl sm:rounded-2xl'
          }`}
          style={!isFullscreen ? { height: 'calc(100vh - 4rem)', maxHeight: '600px' } : {}}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 rounded-t-2xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white text-sm sm:text-base truncate">AI Assistant</h3>
                  <p className="text-xs text-blue-100 truncate">
                    {session ? `Welcome, ${session.user?.email}` : `Guest (${guestCount}/${GUEST_LIMIT} messages)`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {session && (
                  <button
                    onClick={handleLogout}
                    className="text-white hover:bg-white/20 px-2 sm:px-3 py-1 rounded-lg transition-colors text-xs"
                    title="Logout"
                  >
                    Logout
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  title="Close chat"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hidden sm:block text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  )}
                </button>
                <button
                  onClick={clearChat}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
                style={{ animation: 'fadeIn 0.3s ease-in' }}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm"
                  } shadow-sm break-words`}
                >
                  <div className="text-xs sm:text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-3 prose-p:last:mb-0 prose-ul:my-3 prose-ul:last:mb-0 prose-ol:my-3 prose-ol:last:mb-0 prose-li:m-0 prose-li:my-1 prose-hr:my-4 prose-hr:border-gray-300 dark:prose-hr:border-gray-600 prose-code:bg-gray-200 dark:prose-code:bg-gray-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:p-3 prose-pre:rounded prose-pre:text-xs prose-pre:overflow-x-auto prose-pre:my-3 prose-blockquote:border-l-4 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:my-3 prose-a:text-blue-500 dark:prose-a:text-blue-400 prose-a:underline prose-strong:font-bold prose-em:italic prose-h1:mb-3 prose-h1:mt-4 prose-h2:mb-3 prose-h2:mt-4 prose-h3:mb-2 prose-h3:mt-3">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        h1: ({node, ...props}: any) => <h1 className="text-base font-bold mb-2" {...props} />,
                        h2: ({node, ...props}: any) => <h2 className="text-sm font-bold mb-2" {...props} />,
                        h3: ({node, ...props}: any) => <h3 className="text-xs font-bold mb-1" {...props} />,
                        ul: ({node, ...props}: any) => <ul className="list-disc list-inside" {...props} />,
                        ol: ({node, ...props}: any) => <ol className="list-decimal list-inside" {...props} />,
                        code: ({node, inline, className, children, ...props}: any) => {
                          if (inline) {
                            return <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs" {...props}>{children}</code>;
                          }
                          return <code className="block bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded text-xs overflow-x-auto" {...props}>{children}</code>;
                        },
                        pre: ({node, children, ...props}: any) => <pre className="bg-gray-900 dark:bg-gray-950 p-3 rounded text-xs overflow-x-auto mb-2" {...props}>{children}</pre>,
                        blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-3 italic my-2" {...props} />,
                        a: ({node, href, ...props}: any) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 underline" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start" style={{ animation: 'fadeIn 0.3s ease-in' }}>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" style={{ animation: 'bounce 1s infinite' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full" style={{ animation: 'bounce 1s infinite 0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full" style={{ animation: 'bounce 1s infinite 0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-2xl">
            {!session && guestCount >= GUEST_LIMIT ? (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400">
                  You've reached the guest limit. Log in to continue chatting!
                </p>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAuth("signInWithPassword")}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleAuth("signUp")}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-shadow"
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg flex items-center justify-center text-xs sm:text-sm font-medium"
                    title="Send message"
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Powered by OpenAI GPT-4o-mini
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
