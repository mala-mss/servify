import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Calendar, MessageSquare, ChevronLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '@/controllers/api/axiosInstance';
import { useTheme } from '@/controllers/context/ThemeContext';
import { startConversation } from '@/controllers/api/chatApi';

interface ClientProfileData {
  id: number;
  fname: string;
  lname: string;
  profile_picture: string;
  email: string;
  phone_number: string;
  address: string;
  created_at: string;
  dependants: any[];
  authorizedPersons: any[];
  hasActiveBooking: boolean;
}

const ClientProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { palette: p, mode } = useTheme();
  const [client, setClient] = useState<ClientProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientProfile();
  }, [id]);

  const fetchClientProfile = async () => {
    try {
      const res = await axiosInstance.get(`/users/clients/${id}`);
      if (res.data.success) {
        setClient(res.data.client);
      }
    } catch (error) {
      console.error('Failed to fetch client profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const conversation = await startConversation(Number(id));
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  if (loading) return <div style={{ color: p.text, textAlign: 'center', padding: '100px' }}>Loading client profile...</div>;
  if (!client) return <div style={{ color: p.text, textAlign: 'center', padding: '100px' }}>Client not found.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: p.primary, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        <ChevronLeft size={20} />
        Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: '32px', background: p.primary + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {client.profile_picture ? (
                <img src={client.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={48} color={p.primary} />
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: p.text, marginBottom: '4px' }}>{client.fname} {client.lname}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: p.textMuted, fontSize: '14px' }}>
                <Calendar size={16} />
                <span>Member since {new Date(client.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Contact Info (Only if active booking) */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: p.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Contact Information
              {!client.hasActiveBooking && <ShieldCheck size={18} color={p.textMuted} title="Locked until booking is active" />}
            </h2>
            {client.hasActiveBooking ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '20px', borderRadius: '20px', background: p.cardBg, border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone size={20} color={p.primary} />
                  <div>
                    <div style={{ fontSize: '12px', color: p.textMuted }}>Phone Number</div>
                    <div style={{ fontWeight: 600, color: p.text }}>{client.phone_number}</div>
                  </div>
                </div>
                <div style={{ padding: '20px', borderRadius: '20px', background: p.cardBg, border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={20} color={p.primary} />
                  <div>
                    <div style={{ fontSize: '12px', color: p.textMuted }}>Address</div>
                    <div style={{ fontWeight: 600, color: p.text }}>{client.address}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px', borderRadius: '24px', background: p.cardBg, border: `1px dashed ${p.border}`, textAlign: 'center', color: p.textMuted }}>
                <p style={{ fontSize: '14px' }}>Contact information is hidden. You will see it once a booking is confirmed with this client.</p>
              </div>
            )}
          </section>

          {/* Dependants */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: p.text, marginBottom: '20px' }}>Dependants</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {client.dependants?.map((dep, idx) => (
                <div key={idx} style={{ padding: '16px 24px', borderRadius: '16px', background: p.cardBg, border: `1px solid ${p.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: p.text }}>{dep.name}</div>
                    <div style={{ fontSize: '12px', color: p.textMuted }}>{dep.relationship} · {new Date().getFullYear() - new Date(dep.date_of_birth).getFullYear()} years old</div>
                  </div>
                </div>
              ))}
              {(!client.dependants || client.dependants.length === 0) && <p style={{ color: p.textMuted, fontSize: '14px' }}>No dependants listed.</p>}
            </div>
          </section>

          {/* Authorized Persons */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: p.text, marginBottom: '20px' }}>Authorized Persons</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {client.authorizedPersons?.map((ap, idx) => (
                <div key={idx} style={{ padding: '16px 24px', borderRadius: '16px', background: p.cardBg, border: `1px solid ${p.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: p.text }}>{ap.name}</div>
                    <div style={{ fontSize: '12px', color: p.textMuted }}>Authorized to pick up/assist</div>
                  </div>
                  {client.hasActiveBooking && <div style={{ fontWeight: 600, color: p.primary, fontSize: '14px' }}>{ap.phone_number}</div>}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div>
          <div style={{ position: 'sticky', top: '100px', padding: '32px', borderRadius: '28px', background: p.cardBg, border: `1px solid ${p.border}`, boxShadow: mode === 'dark' ? '0 20px 50px rgba(0,0,0,0.4)' : '0 20px 50px rgba(0,0,0,0.05)' }}>
            <button 
              onClick={handleStartChat}
              style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: p.primary, color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <MessageSquare size={20} />
              Start Chat
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: p.textMuted, marginTop: '16px' }}>
              Messages are end-to-end encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
