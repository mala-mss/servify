import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from '@/controllers/services/userService';
import { adminService } from '@/controllers/services/adminService';
import type { Document } from '@/controllers/services/adminService';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  AlertTriangle,
  User as UserIcon,
  Users as UsersIcon,
  Briefcase,
  FileText,
  ExternalLink,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';

export default function UserDetail() {
  const { palette: p, mode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserDetail(id);
    }
  }, [id]);

  const fetchUserDetail = async (userId: string) => {
    setLoading(true);
    try {
      const resp = await userService.getById(userId);
      setUserData(resp.user);
      if (resp.user.role === 'provider') {
        fetchDocuments(parseInt(userId));
      }
    } catch (err) {
      console.error("Error fetching user detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (userId: number) => {
    setDocsLoading(true);
    try {
      const data = await adminService.getDocuments(0, userId);
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

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 32,
    marginBottom: 24
  };

  if (loading) return <div style={{ color: p.textMuted, textAlign: 'center', padding: 100 }}>Loading user details...</div>;
  if (!userData) return <div style={{ color: p.textMuted, textAlign: 'center', padding: 100 }}>User not found.</div>;

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer', marginBottom: 24, fontSize: 14 }}
      >
        <ArrowLeft size={16} />
        Back to Users
      </button>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* LEFT COLUMN: Profile Info & Documents */}
        <div style={{ flex: 1 }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${p.primary}15`, color: p.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 600 }}>
                {userData.profile_picture ? <img src={userData.profile_picture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : userData.fname[0]}
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: p.text, marginBottom: 4 }}>{userData.fname} {userData.lname}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: p.primary + '20', color: p.primary }}>
                    {userData.role?.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: userData.status === 'active' ? '#10b98120' : '#f43f5e20', color: userData.status === 'active' ? '#10b981' : '#f43f5e' }}>
                    {userData.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <InfoItem icon={<Mail size={18} />} label="Email Address" value={userData.email} p={p} />
              <InfoItem icon={<Phone size={18} />} label="Phone Number" value={userData.phone_number || "Not provided"} p={p} />
              <InfoItem icon={<MapPin size={18} />} label="Home Address" value={userData.address || "Not provided"} p={p} />
              <InfoItem icon={<Calendar size={18} />} label="Member Since" value={new Date(userData.created_at).toLocaleDateString()} p={p} />
            </div>
          </div>

          {/* VERIFICATION DOCUMENTS SECTION */}
          {userData.role === 'provider' && (
            <div style={cardStyle}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                 <h3 style={{ fontSize: 18, fontWeight: 600, color: p.text, display: 'flex', alignItems: 'center', gap: 10 }}>
                   <ShieldCheck size={20} color={p.primary} />
                   Verification Documents
                 </h3>
                 {docsLoading && <span style={{ fontSize: 12, color: p.textMuted }}>Updating...</span>}
               </div>

               {documents.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '40px', border: `1px dashed ${p.border}`, borderRadius: 12, color: p.textMuted }}>
                   No verification documents found for this provider.
                 </div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {documents.map(doc => (
                     <div key={doc.id_doc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${p.border}`, borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.primary, border: `1px solid ${p.border}` }}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: p.text }}>{doc.name}</div>
                            <div style={{ fontSize: 12, color: p.textMuted }}>{doc.type}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ 
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6,
                            background: doc.status === 'approved' ? '#10b98120' : doc.status === 'rejected' ? '#f43f5e20' : '#fb923c20',
                            color: doc.status === 'approved' ? '#10b981' : doc.status === 'rejected' ? '#f43f5e' : '#fb923c'
                          }}>
                            {doc.status}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <a href={doc.link} target="_blank" rel="noopener noreferrer" style={{ padding: 8, borderRadius: 8, background: 'transparent', color: p.textMuted, display: 'flex', alignItems: 'center' }} title="View Document">
                              <ExternalLink size={18} />
                            </a>
                            <button 
                              onClick={() => handleVerifyDocument(doc.id_doc, 'rejected')}
                              style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                            <button 
                              onClick={() => handleVerifyDocument(doc.id_doc, 'approved')}
                              style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}
                              title="Approve"
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
          )}

          {userData.role === 'client' && (
            <div style={cardStyle}>
               <h3 style={{ fontSize: 18, fontWeight: 600, color: p.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                 <UsersIcon size={20} />
                 Associated Records
               </h3>
               <p style={{ color: p.textMuted, fontSize: 14 }}>
                 Client specific data like dependants and authorized persons would be listed here in detail.
               </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Stats/Actions */}
        <div style={{ width: 320 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: p.text, marginBottom: 16 }}>Account Security</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: p.textMuted }}>Warnings</span>
                <span style={{ color: userData.nbr_warning > 0 ? '#f43f5e' : p.text, fontWeight: 600 }}>{userData.nbr_warning}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: p.textMuted }}>ID Verified</span>
                <span style={{ color: documents.every(d => d.status === 'approved') && documents.length > 0 ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                  {documents.every(d => d.status === 'approved') && documents.length > 0 ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button style={{ padding: '12px', borderRadius: 10, background: 'transparent', border: `1px solid ${p.border}`, color: p.text, fontWeight: 500, cursor: 'pointer' }}>
                Reset Password
              </button>
              <button style={{ padding: '12px', borderRadius: 10, background: '#f43f5e', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, value, p }: any) => (
  <div style={{ display: 'flex', gap: 12 }}>
    <div style={{ color: p.primary }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: p.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: p.text, fontWeight: 500 }}>{value}</div>
    </div>
  </div>
);
