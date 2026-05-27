import React, { useEffect, useState } from "react";
import { FileText, Upload, Trash2, CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";
import api from "../api/axiosConfig";
import "./HRDashboard.css";

// ── Simple inline toast (no external dep needed) ──────────────────────────
function Toast({ message, type }) {
  if (!message) return null;
  const bg = type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)";
  const color = type === "error" ? "#ef4444" : "#22c55e";
  return (
    <div style={{
      position:"fixed", top:20, right:20, zIndex:999,
      display:"flex", alignItems:"center", gap:10,
      padding:"12px 18px", borderRadius:12,
      background: bg, border:`1px solid ${color}`,
      color, fontWeight:600, fontSize:14,
      boxShadow:"0 8px 24px rgba(0,0,0,0.2)",
      animation:"fadeIn .2s ease",
    }}>
      {type === "error" ? <XCircle size={16}/> : <CheckCircle2 size={16}/>}
      {message}
    </div>
  );
}

export default function PageDocuments() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [toast, setToast]         = useState({ message:"", type:"success" });

  const API = "/api/documents";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message:"", type:"success" }), 3000);
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(API);
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleUpload = async () => {
    if (!file) { showToast("Please select a file", "error"); return; }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`${API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      fetchDocuments();
      showToast("File uploaded successfully");
    } catch (err) {
      console.error(err);
      showToast("Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleDocument = async (id) => {
    try {
      await api.put(`${API}/${id}/toggle`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      showToast("Toggle failed", "error");
    }
  };

  const deleteDocument = async (id, fileName) => {
    if (!window.confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    try {
      setDeleting(id);
      await api.delete(`${API}/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      showToast("Document deleted");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.response?.data || "Delete failed";
      showToast(typeof msg === "string" ? msg : "Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="hr-page">
      <Toast message={toast.message} type={toast.type}/>

      {/* Header */}
      <div className="hr-page-header-row">
        <h1 className="hr-page-heading">Documents</h1>
      </div>

      {/* Upload Panel */}
      <div className="hr-panel">
        <div className="hr-filter-row">
          <input type="file" onChange={(e) => setFile(e.target.files[0])}/>
          <button
            className="hr-primary-btn"
            onClick={handleUpload}
            disabled={loading}
            style={{ display:"flex", alignItems:"center", gap:8 }}
          >
            <Upload size={16}/>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="hr-panel">
        <div className="hr-panel-title">Uploaded Documents</div>
        <div className="hr-table-wrap">
          <table className="hr-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Document</th>
                <th>Type</th>
                <th>AI Access</th>
                <th>Uploaded</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="hr-empty-state">No documents uploaded</div>
                  </td>
                </tr>
              ) : documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.id}</td>
                  <td>
                    <div className="hr-table-emp">
                      <FileText size={18}/>
                      <div>{doc.fileName}</div>
                    </div>
                  </td>
                  <td>{doc.fileType}</td>
                  <td>
                    {doc.included
                      ? <span className="hr-badge b-green">Included</span>
                      : <span className="hr-badge b-red">Excluded</span>}
                  </td>
                  <td>
                    {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "-"}
                  </td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <button
                        className={doc.included ? "hr-reject-btn" : "hr-approve-btn"}
                        onClick={() => toggleDocument(doc.id)}
                      >
                        {doc.included ? "Exclude" : "Include"}
                      </button>
                      <button
                        onClick={() => deleteDocument(doc.id, doc.fileName)}
                        disabled={deleting === doc.id}
                        style={{
                          display:"flex", alignItems:"center", gap:5,
                          padding:"6px 12px", borderRadius:8, border:"none",
                          cursor: deleting === doc.id ? "not-allowed" : "pointer",
                          background:"rgba(239,68,68,0.12)",
                          color:"#ef4444",
                          fontWeight:600, fontSize:13,
                          opacity: deleting === doc.id ? 0.6 : 1,
                          transition:"all .15s",
                        }}
                      >
                        <Trash2 size={14}/>
                        {deleting === doc.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}