import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const ChatInboxDropdown: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const { user } = useAuth();
  const { palette: p } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
    }
  }, [isOpen, user]);

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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: p.textMuted,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 600,
          position: 'relative'
        }}
      >
        <MessageSquare size={20} />
        <span>Messages</span>
        {/* Placeholder for unread count if needed */}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 20px)',
                right: 0,
                width: 320,
                background: p.cardBg,
                border: `1px solid ${p.border}`,
                borderRadius: '24px',
                padding: '12px 0',
                boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(40px)',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '12px 20px', borderBottom: `1px solid ${p.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: p.text }}>Conversations</span>
              </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: p.textMuted }}>Loading...</div>
                ) : conversations.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: p.textMuted }}>No conversations</div>
                ) : (
                  conversations.map((conv) => {
                    const other = getOtherUser(conv);
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/chat/${conv.id}`);
                        }}
                        style={{
                          padding: '12px 20px',
                          borderBottom: `1px solid ${p.border}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: '12px', overflow: 'hidden', background: other.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {other.profile_picture ? (
                            <img src={other.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ color: other.color, fontWeight: 700 }}>{other.fname?.[0]}</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: p.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {other.fname} {other.lname}
                            </span>
                            <span style={{ fontSize: 10, color: p.textMuted }}>{formatTime(conv.last_message_at)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <span style={{ fontSize: 10, color: other.color, fontWeight: 700, letterSpacing: '0.5px' }}>{other.role}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: p.textMuted, fontSize: 11 }}>
                            <Lock size={10} />
                            <span style={{ fontStyle: 'italic' }}>Encrypted message</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInboxDropdown;
