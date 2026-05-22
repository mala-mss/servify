import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { 
  UserPlus, 
  Check, 
  X, 
  Mail, 
  Briefcase, 
  Clock,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react';
import { adminService } from '@/controllers/services/adminService';
import type { InscriptionRequest, Document } from '@/controllers/services/adminService';

const Approvals = () => {
  const { palette: p, mode } = useTheme();
  const [requests, setRequests] = useState<InscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Document verification state
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await adminService.getApprovals();
      setRequests(data.requests);
    } catch (err) {
      console.error("Error fetching approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (id: number, userId?: number) => {
    setDocsLoading(true);
    setSelectedRequestId(id);
    try {
      const data = await adminService.getDocuments(id, userId);
      setDocuments(data.documents);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleVerifyDocument = async (docId: number, status: 'approved' | 'rejected') => {
    let reason = "";
    if (status === 'rejected') {
      reason = window.prompt("Reason for rejection:") || "";
      if (!reason) return;
    }
    try {
      await adminService.verifyDocument(docId, status, reason);
      setDocuments(docs => docs.map(d => d.id_doc === docId ? { ...d, status, rejection_reason: reason } : d));
    } catch (err) {
      console.error(`Error ${status} document:`, err);
      alert(`Failed to ${status} document.`);
    }
  };

  const handleAction = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await adminService.handleApproval(id, status);
      setRequests(requests.filter(r => r.id_r !== id));
      setSelectedRequestId(null);
      setDocuments([]);
      alert(`Provider registration ${status}.`);
    } catch (err: any) {
      console.error(`Error ${status} request:`, err);
      alert(err.response?.data?.message || `Failed to ${status} request.`);
    }
  };

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
  };

  const selectedRequest = requests.find(r => 
    (r.id_r === selectedRequestId && (r.id_r !== 0 || (documents.length > 0 && r.id_user === documents[0]?.id_user)))
  );

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          Registration Requests
        </h1>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          Review documents and approve new service provider accounts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedRequestId !== null ? '350px 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Requests List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: p.textMuted }}>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, border: `2px dashed ${p.border}`, borderRadius: 16 }}>
              <div style={{ color: p.textMuted, marginBottom: 12 }}>
                <UserPlus size={40} style={{ opacity: 0.3 }} />
              </div>
              <div style={{ color: p.text, fontWeight: 500 }}>No pending requests</div>
            </div>
          ) : requests.map((req) => (
            <div 
              key={req.id_r === 0 ? `user-${req.id_user}` : `req-${req.id_r}`} 
              style={{ 
                ...cardStyle, 
                cursor: 'pointer',
                borderColor: (selectedRequestId === req.id_r && (req.id_r !== 0 || (documents.length > 0 && documents[0]?.id_user === req.id_user))) ? p.primary : p.border,
                boxShadow: (selectedRequestId === req.id_r && (req.id_r !== 0 || (documents.length > 0 && documents[0]?.id_user === req.id_user))) ? `0 0 0 1px ${p.primary}` : 'none'
              }}
              onClick={() => fetchDocuments(req.id_r, req.id_user)}
            >
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.primary}15`, color: p.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 }}>
                  {req.fname[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: p.text, marginBottom: 2 }}>{req.fname} {req.lname}</h3>
                    {req.type === 'doc_update' && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: `${p.primary}20`, color: p.primary, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Update</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: p.textMuted }}>{req.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: p.textMuted }}>
                <span>{req.years_of_exp > 0 ? `${req.years_of_exp}y Exp` : 'New Provider'}</span>
                <span>•</span>
                <span>{new Date(req.submitted_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Request Details & Documents */}
        {selectedRequestId !== null && (
          <div style={{ ...cardStyle, animation: "fadeIn .3s ease" }}>
            {selectedRequest ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 600, color: p.text, marginBottom: 4 }}>
                      {selectedRequest.fname} {selectedRequest.lname}
                    </h2>
                    <p style={{ color: p.textMuted, fontSize: 14 }}>
                      {selectedRequest.type === 'doc_update' ? 'Additional Documents for Verification' : 'Provider Registration Documents'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {selectedRequest.type === 'registration' && (
                      <>
                        <button 
                          onClick={() => handleAction(selectedRequestId, 'rejected')}
                          style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 8, color: '#f43f5e', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Reject Registration
                        </button>
                        <button 
                          onClick={() => handleAction(selectedRequestId, 'approved')}
                          style={{ padding: '8px 24px', background: p.primary, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Final Approve
                        </button>
                      </>
                    )}
                    {selectedRequest.type === 'doc_update' && (
                      <button 
                        onClick={() => {
                          setSelectedRequestId(null);
                          setDocuments([]);
                          fetchRequests();
                        }}
                        style={{ padding: '8px 24px', background: p.primary, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Mark as Handled
                      </button>
                    )}
                  </div>
                </div>

                {selectedRequest.type === 'registration' && (
                  <div style={{ marginBottom: 32 }}>
                    <h4 style={{ fontSize: 12, color: p.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Bio & Info</h4>
                    <p style={{ fontSize: 14, color: p.text, lineHeight: 1.6, background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', padding: 16, borderRadius: 12 }}>
                      {selectedRequest.bio || "No bio provided."}
                    </p>
                  </div>
                )}

                <div>
                  <h4 style={{ fontSize: 12, color: p.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Documents ({documents.length})</h4>
                  {docsLoading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: p.textMuted }}>Loading documents...</div>
                  ) : documents.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: p.textMuted, border: `1px dashed ${p.border}`, borderRadius: 12 }}>No documents found.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {documents.map(doc => (
                        <div key={doc.id_doc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${p.border}`, borderRadius: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.primary }}>
                              <FileText size={20} />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: p.text }}>{doc.name}</div>
                              <div style={{ fontSize: 12, color: p.textMuted }}>{doc.type}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {doc.status !== 'pending' && (
                              <div style={{ 
                                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6,
                                background: doc.status === 'approved' ? '#10b98120' : '#f43f5e20',
                                color: doc.status === 'approved' ? '#10b981' : '#f43f5e'
                              }}>
                                {doc.status}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 8 }}>
                              <a href={doc.link} target="_blank" rel="noopener noreferrer" style={{ padding: 8, borderRadius: 8, background: 'transparent', color: p.textMuted, display: 'flex', alignItems: 'center' }}>
                                <ExternalLink size={18} />
                              </a>
                              <button 
                                title="Reject Document"
                                onClick={() => handleVerifyDocument(doc.id_doc, 'rejected')}
                                style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                              >
                                <X size={18} />
                              </button>
                              <button 
                                title="Approve Document"
                                onClick={() => handleVerifyDocument(doc.id_doc, 'approved')}
                                style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}
                              >
                                <Check size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: p.textMuted }}>Select a request to view details</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
