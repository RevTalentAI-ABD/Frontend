import React, {
  useState,
  useEffect,
  useRef
} from "react";

import {
  Bot,
  Maximize2,
  Minimize2,
  X,
  Square,
  SendHorizontal,
  AlertCircle
} from "lucide-react";
import "./FloatingAI.css";

export default function FloatingAI() {

  const [open, setOpen]             = useState(false);
  const [message, setMessage]       = useState("");
  const [chat, setChat]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [isFullPage, setIsFullPage] = useState(false);

  const chatEndRef = useRef(null);
  const abortRef   = useRef(null);

  // Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // Stop Generating
  const stopGenerating = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  // Send Message
  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const currentQuestion = message;
    setMessage("");
    setChat(prev => [...prev, { type: "user", text: currentQuestion }]);

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      // Backend returns single JSON (stream: false)
      const data = await response.json();

      const aiText =
        data.response ||
        data.message ||
        data.answer ||
        "No response from AI.";

      setChat(prev => [...prev, { type: "ai", text: aiText }]);

    } catch (err) {
      if (err.name === "AbortError") return; // user pressed Stop — silent
      console.error(err);
      setChat(prev => [
        ...prev,
        { type: "ai", text: "AI server not available. Make sure Ollama is running." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        className="hr-ai-float-btn"
        onClick={() => setOpen(o => !o)}
      >
        <Bot size={24} />
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div className={`hr-ai-chat-window${isFullPage ? " hr-ai-fullpage" : ""}`}>

          {/* HEADER */}
          <div className="hr-ai-header">
            <div>HR AI Assistant</div>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>

              {/* Expand / Collapse */}
              <button
                className="hr-ai-icon-btn"
                onClick={() => setIsFullPage(f => !f)}
                title={
                  isFullPage
                    ? "Exit full page"
                    : "Expand to full page"
                }
              >

                {
                  isFullPage
                    ? <Minimize2 size={16} />
                    : <Maximize2 size={16} />
                }

              </button>

              {/* Close */}
              <button
                className="hr-ai-icon-btn"
                onClick={() => {
                  stopGenerating();
                  setOpen(false);
                  setIsFullPage(false);
                }}
              >
              <X size={16} />
              </button>

            </div>
          </div>

          {/* BODY */}
          <div className="hr-ai-body">

            {chat.length === 0 && !loading && (
              <div
                className="hr-empty-state"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "center"
                }}
              >

                <AlertCircle size={18} />

                Ask anything from uploaded HR documents.

              </div>
            )}

            {chat.map((msg, index) => (
              <div
                key={index}
                className={msg.type === "user" ? "hr-ai-user-wrap" : "hr-ai-bot-wrap"}
              >
                <div className={msg.type === "user" ? "hr-ai-user-msg" : "hr-ai-bot-msg"}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing dots while waiting */}
            {loading && (
              <div className="hr-ai-bot-wrap">
                <div className="hr-ai-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          {/* FOOTER */}
          <div className="hr-ai-footer">
            <input
              type="text"
              placeholder="Ask AI..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
              disabled={loading}
            />

            {loading ? (
              <button className="hr-ai-stop-btn" onClick={stopGenerating}>
                <>
                  <Square size={14} />

                  <span style={{ marginLeft: 6 }}>
                    Stop
                  </span>
                </>
              </button>
            ) : (
              <button
                onClick={sendMessage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >

                <SendHorizontal size={15} />

                Send

              </button>
            )}
          </div>

        </div>
      )}
    </>
  );
}
