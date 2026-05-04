import React, { useState } from "react";
import { aiAPI } from "./api";
import "./AI.css";

export default function AIPage() {
  const [tab, setTab] = useState("chat");

  const [question, setQuestion] = useState("");
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [history, setHistory] = useState("");

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ FILE UPLOAD
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8080/api/ai/upload", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      setResume(text); // auto-fill

    } catch {
      alert("❌ File upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CHAT
  const handleAsk = async () => {
    if (!question.trim()) {
      setResponse("⚠️ Please enter a question");
      return;
    }

    try {
      setLoading(true);
      const res = await aiAPI.ask(question);
      setResponse(res.data);
    } catch {
      setResponse("❌ Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  // ✅ RESUME
  const handleResume = async () => {
    if (!resume.trim() || !job.trim()) {
      setResponse("⚠️ Resume and Job Description are required");
      return;
    }

    try {
      setLoading(true);
      const res = await aiAPI.resume(resume, job);
      setResponse(res.data);
    } catch {
      setResponse("❌ Resume screening failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ PERFORMANCE
  const handlePerformance = async () => {
    if (!history.trim()) {
      setResponse("⚠️ Please enter performance history");
      return;
    }

    try {
      setLoading(true);
      const res = await aiAPI.performance(history);
      setResponse(res.data);
    } catch {
      setResponse("❌ Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-container">
      <h2>🤖 AI HR Assistant</h2>

      {/* ✅ TABS */}
      <div className="ai-tabs">
        <button
          className={tab === "chat" ? "active" : ""}
          onClick={() => setTab("chat")}
        >
          Chat
        </button>

        <button
          className={tab === "resume" ? "active" : ""}
          onClick={() => setTab("resume")}
        >
          Resume Screening
        </button>

        <button
          className={tab === "performance" ? "active" : ""}
          onClick={() => setTab("performance")}
        >
          Performance
        </button>
      </div>

      {/* ✅ CHAT */}
      {tab === "chat" && (
        <>
          <textarea
            placeholder="Ask HR question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button className="ai-btn" onClick={handleAsk}>
            {loading ? "Thinking..." : "Ask"}
          </button>
        </>
      )}

      {/* ✅ RESUME (UPLOAD + TEXT) */}
      {tab === "resume" && (
        <>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
          />

          <textarea
            placeholder="Resume text will appear here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />

          <textarea
            placeholder="Paste Job Description..."
            value={job}
            onChange={(e) => setJob(e.target.value)}
          />

          <button className="ai-btn" onClick={handleResume}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </>
      )}

      {/* ✅ PERFORMANCE */}
      {tab === "performance" && (
        <>
          <textarea
            placeholder="Enter performance history..."
            value={history}
            onChange={(e) => setHistory(e.target.value)}
          />

          <button className="ai-btn" onClick={handlePerformance}>
            {loading ? "Generating..." : "Generate Summary"}
          </button>
        </>
      )}

      {/* ✅ RESPONSE */}
      <div className="ai-response">
        {response || "No response yet..."}
      </div>
    </div>
  );
}