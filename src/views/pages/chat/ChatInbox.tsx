import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Lock, Search, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getConversations } from '@/controllers/api/chatApi';
import { useAuth } from '@/controllers/context/AuthContext';
import { useTheme } from '@/controllers/context/ThemeContext';

interface Conversation {
  id: string;
  idu_cl: number;
  idu_sp: number;
  last_message_at: string;
  client?: { user: { id: number; fname: string; lname: string; profile_picture: string } };
  provider?: { user: { id: number; fname: string; lname: string; profile_picture: string } };
}

const ChatInbox: React.FC = () => {
  const { user } = useAuth();
  const { palette: p } = useTheme();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conv: Conversation) => {
    if (user?.role === 'client') {
      return {
        ...conv.provider?.user,
        role: 'SERVICE PROVIDER',
        color: '#2FB0BC'
      };
    } else {
      return {
        ...conv.client?.user,
        role: 'CLIENT',
        color: '#7C3AED'
      };
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherUser(conv);
    const fullName = `${other.fname} ${other.lname}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: p.text, fontFamily: "'Instrument Serif', serif" }}>Messages</h1>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: p.textMuted }} size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            style={{
              background: p.cardBg,
              border: `1px solid ${p.border}`,
              borderRadius: '12px',
              padding: '10px 16px 10px 40px',
              color: p.text,
              fontSize: '14px',
              outline: 'none',
              width: '260px'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} style={{ height: '80px', background: p.cardBg, borderRadius: '20px', animate: 'pulse' }} />
          ))
        ) : filteredConversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: p.textMuted }}>
            <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>No conversations found.</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const other = getOtherUser(conv);
            return (
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                style={{
                  background: p.cardBg,
                  border: `1px solid ${p.border}`,
                  borderRadius: '20px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: 56, height: 56, borderRadius: '16px', overflow: 'hidden', background: other.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {other.profile_picture ? (
                    <img src={other.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserIcon color={other.color} size={24} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '18px', color: p.text }}>{other.fname} {other.lname}</span>
                    <span style={{ fontSize: '12px', color: p.textMuted }}>{new Date(conv.last_message_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: other.color, fontWeight: 800, letterSpacing: '0.5px', background: other.color + '15', padding: '2px 8px', borderRadius: '6px' }}>
                      {other.role}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: p.textMuted, fontSize: '13px' }}>
                      <Lock size={12} />
                      <span style={{ fontStyle: 'italic' }}>End-to-end encrypted</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatInbox;
