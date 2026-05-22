import React, { useState, useEffect } from "react";
import { useTheme } from "@/controllers/context/ThemeContext";
import { FileText, ExternalLink, Plus, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { providerService } from "@/controllers/services/providerService";
import type { Document } from "@/controllers/services/providerService";

export default function MyDocuments() {
  const { palette: p, mode } = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: "", type: "Identity", link: "" });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await providerService.getDocuments();
      setDocuments(data.documents);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await providerService.uploadDocument(newDoc);
      setShowUploadModal(false);
      setNewDoc({ name: "", type: "Identity", link: "" });
      fetchDocuments();
      alert("Document uploaded successfully and is pending verification.");
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    const colors = {
      approved: { text: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <CheckCircle2 size={12} /> },
      rejected: { text: "#f43f5e", bg: "rgba(244,63,94,0.1)", icon: <AlertCircle size={12} /> },
      pending: { text: "#fb923c", bg: "rgba(251,146,60,0.1)", icon: <Clock size={12} /> }
    };
    const config = colors[s as keyof typeof colors] || colors.pending;

    return (
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
        color: config.text,
        background: config.bg,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        textTransform: "capitalize"
      }}>
        {config.icon}
        {status}
      </span>
    );
  };

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
    animation: "fadeUp .4s ease both",
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: p.text, fontWeight: 400, marginBottom: 8 }}>Verification Documents</h1>
          <p style={{ color: p.textMuted, fontSize: 14 }}>Manage your identity and professional verification documents.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          style={{
            background: p.primary,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Plus size={18} />
          Upload New Document
        </button>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: p.textMuted }}>Loading documents...</div>
        ) : documents.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: p.textMuted }}>No documents found. Please upload verification documents.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: `1px solid ${p.border}` }}>
                <th style={{ padding: "0 12px 16px", fontSize: 11, color: p.textMuted, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>Document</th>
                <th style={{ padding: "0 12px 16px", fontSize: 11, color: p.textMuted, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>Type</th>
                <th style={{ padding: "0 12px 16px", fontSize: 11, color: p.textMuted, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "0 12px 16px", fontSize: 11, color: p.textMuted, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id_doc} style={{ borderBottom: `1px solid ${p.border}` }}>
                  <td style={{ padding: "20px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${p.primary}10`, color: p.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={18} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: p.text }}>{doc.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: "20px 12px", fontSize: 13, color: p.textMuted }}>{doc.type}</td>
                  <td style={{ padding: "20px 12px" }}>
                    {statusBadge(doc.status)}
                    {doc.status === 'rejected' && doc.rejection_reason && (
                      <div style={{ fontSize: 11, color: "#f43f5e", marginTop: 4, maxWidth: 200 }}>
                        Reason: {doc.rejection_reason}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "20px 12px", textAlign: "right" }}>
                    <a 
                      href={doc.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        background: "none",
                        border: "none",
                        color: p.textMuted,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        textDecoration: "none"
                      }}
                    >
                      <ExternalLink size={14} />
                      View File
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: p.cardBg, width: "100%", maxWidth: 450, borderRadius: 20, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: p.text, marginBottom: 8 }}>Upload Document</h2>
            <p style={{ color: p.textMuted, fontSize: 14, marginBottom: 24 }}>Select a document type and provide the file.</p>
            
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: p.textMuted, marginBottom: 8, textTransform: "uppercase" }}>Document Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Criminal Record Clearance"
                  value={newDoc.name}
                  onChange={e => setNewDoc({...newDoc, name: e.target.value})}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${p.border}`, color: p.text, outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: p.textMuted, marginBottom: 8, textTransform: "uppercase" }}>Type</label>
                <select 
                  value={newDoc.type}
                  onChange={e => setNewDoc({...newDoc, type: e.target.value})}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: mode === 'dark' ? p.cardBg : '#fff', border: `1px solid ${p.border}`, color: p.text, outline: "none" }}
                >
                  <option value="Identity">Identity</option>
                  <option value="Qualification">Qualification</option>
                  <option value="Safety">Safety</option>
                  <option value="Address">Address</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: p.textMuted, marginBottom: 8, textTransform: "uppercase" }}>File Link / Placeholder</label>
                <input 
                  type="text"
                  placeholder="https://..."
                  value={newDoc.link}
                  onChange={e => setNewDoc({...newDoc, link: e.target.value})}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${p.border}`, color: p.text, outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: "transparent", border: `1px solid ${p.border}`, color: p.text, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUploading}
                  style={{ flex: 2, padding: 12, borderRadius: 10, background: p.primary, border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: isUploading ? 0.7 : 1 }}
                >
                  {isUploading ? "Uploading..." : "Submit for Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}













