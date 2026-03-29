import { useState, useEffect, useRef } from "react";
import { Send, FileText, LockKeyhole, Menu } from "lucide-react";
import useApiCall from "../hooks/useApiCall";
import { searchAPI } from "../utility/ApiService";
import { toast } from "react-toastify";

type ChatPanelProps = {
  hasReadyFiles: boolean;
  onMenuClick: () => void;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: { id: number; name: string }[];
};

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when text completely changes
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const isWordBoundary =
        text[currentIndex] === " " || text[currentIndex] === "\n";
      // Render multiple characters if normal, break on word boundaries for typing effect
      const charsToType = isWordBoundary ? 1 : 1;

      const timeout = setTimeout(() => {
        setDisplayedText(
          (prev) => prev + text.slice(currentIndex, currentIndex + charsToType),
        );
        setCurrentIndex((prev) => prev + charsToType);
      }, 10); // typing speed

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {displayedText || "\u00A0"}
    </span>
  );
}

export default function ChatPanel({
  hasReadyFiles,
  onMenuClick,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { fetchData: sendQuery, loading } = useApiCall(searchAPI);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !hasReadyFiles || loading) return;

    const userMessage: Message = { role: "user", content: query.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");

    // extract history for payload
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    const { data, error } = await sendQuery({
      query: userMessage.content,
      history,
    });

    if (error) {
      toast.error(error);
      setMessages((prev) => [
        ...prev.slice(-10),
        {
          role: "assistant",
          content:
            "Sorry, I ran into an issue finding the answer. Please try again.",
        },
      ]);
    } else if (data) {
      const responseData = data as any;
      setMessages((prev) => [
        ...prev.slice(-10),
        {
          role: "assistant",
          content: responseData.message as string,
          sources: responseData.sources as any[],
        },
      ]);
    }
  };

  if (!hasReadyFiles) {
    return (
      <div className="w-full md:w-2/3 h-full bg-slate-50 flex flex-col items-center justify-center p-8 text-center text-slate-400 relative">
        <button
          onClick={onMenuClick}
          className="absolute top-5 left-5 p-2 bg-white rounded-xl shadow-sm border border-slate-200 md:hidden text-slate-600 focus:outline-none hover:bg-slate-50 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="w-20 h-20 rounded-full bg-slate-200 border-4 border-slate-100 flex items-center justify-center mb-6 shadow-inner">
          <LockKeyhole className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-600 tracking-tight">
          Chat Locked
        </h3>
        <p className="mt-3 max-w-sm text-slate-500 font-medium">
          Upload a report and wait for it to be ready to start asking questions.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-2/3 h-full bg-slate-50 flex flex-col relative">
      <div className="px-4 sm:px-8 py-5 border-b border-slate-200 bg-white shadow-sm z-10 flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 md:hidden text-slate-600 focus:outline-none shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Ask My Doc
          </h2>
          <p className="text-sm text-slate-500 font-medium hidden sm:block">
            Ask questions about your uploaded reports
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 flex flex-col">
        {messages.length === 0 ? (
          <div className="h-full flex-1 flex items-center justify-center text-slate-400 font-medium">
            How can I help you understand your reports today?
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex max-w-[85%] ${msg.role === "user" ? "self-end" : "self-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 shrink-0 flex items-center justify-center mr-3 mt-1 shadow-sm border border-blue-200">
                  <span className="text-blue-600 font-bold text-xs">AI</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div
                  className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                  }`}
                >
                  {msg.role === "assistant" && index === messages.length - 1 ? (
                    <TypewriterText text={msg.content} />
                  ) : (
                    <span className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </span>
                  )}
                </div>

                {/* Source badges */}
                {msg.role === "assistant" &&
                  msg.sources &&
                  msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.sources.map((src) => (
                        <div
                          key={src.id}
                          className="flex items-center bg-slate-200/50 border border-slate-200 text-slate-500 text-[11px] font-medium px-2 py-1 rounded-full"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          <span className="truncate max-w-[150px]">
                            {src.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 shrink-0 flex items-center justify-center mr-3 mt-1 shadow-sm border border-blue-200">
              <span className="text-blue-600 font-bold text-xs">AI</span>
            </div>
            <div className="p-4 rounded-2xl flex items-center bg-white border border-slate-200 rounded-bl-none shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 sm:p-6 bg-white border-t border-slate-200 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <form
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto flex items-center"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="E.g., What does my blood test say about cholesterol?"
            className="w-full bg-slate-100 border-none rounded-full pl-6 pr-14 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full transition-transform active:scale-95 shadow-md shadow-blue-500/20 disabled:shadow-none"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
