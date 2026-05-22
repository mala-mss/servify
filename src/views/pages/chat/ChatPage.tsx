import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Lock, User as UserIcon, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/controllers/context/AuthContext';
import { useTheme } from '@/controllers/context/ThemeContext';
import { getMessages, sendMessage, markAsRead, getConversations } from '@/controllers/api/chatApi';
import { getPublicKey, updatePublicKey } from '@/controllers/api/userPublicKeyApi';
import * as crypto from '@/controllers/utils/crypto';
import { userService } from '@/controllers/services/userService';

interface Message {
  id: string;
  sender_id: number;
  encrypted_content: string;
  iv: string;
  sent_at: string;
  is_read: boolean;
  decrypted_text?: string;
  decryption_error?: boolean;
}

const ChatPage: React.FC = () => {
  const { id: conversationId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { palette: p, mode } = useTheme();
  const navigate = useNavigate();

  const getRoleDisplay = (role: string) => {
    if (role === 'provider') return 'SERVICE PROVIDER';
    if (role === 'client') return 'CLIENT';
    if (role === 'admin') return 'ADMIN';
    return role?.toUpperCase() || 'USER';
  };
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null);
  const derivedKeyRef = useRef<CryptoKey | null>(null);
  const otherUserRef = useRef<any>(null);
  const [encryptionError, setEncryptionError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const initializing = useRef(false);

  useEffect(() => {
    if (user && conversationId && !initializing.current) {
      initChat();
    }
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      initializing.current = false;
    };
  }, [user, conversationId]);

  const initChat = async () => {
    if (initializing.current) return;
    initializing.current = true;
    setLoading(true);
    setEncryptionError(null);
    
    try {
      // 1. Get/Generate own keys
      let keyBundle = await crypto.getKeyPair(user!.id);
      let privateKey: CryptoKey;

      if (!keyBundle || !keyBundle.privateKey || !keyBundle.publicKeyBase64) {
        const keyPair = await crypto.generateKeyPair();
        privateKey = keyPair.privateKey;
        const pubKeyBase64 = await crypto.exportPublicKey(keyPair.publicKey);
        await crypto.saveKeyPair(user!.id, privateKey, pubKeyBase64);
        await updatePublicKey(pubKeyBase64);
      } else {
        privateKey = keyBundle.privateKey;
        try {
          const serverKeyData = await getPublicKey(user!.id);
          if (serverKeyData.public_key !== keyBundle.publicKeyBase64) {
            await updatePublicKey(keyBundle.publicKeyBase64);
          }
        } catch (err) {
          await updatePublicKey(keyBundle.publicKeyBase64);
        }
      }

      // 2. Fetch messages
      const data = await getMessages(conversationId!);

      // 3. Find other user and get their public key
      const convs = await getConversations();
      const currentConv = convs.find((c: any) => c.id.toString() === conversationId?.toString());

      let otherUserId: number | null = null;
      let otherUserFromConversation: any = null;

      if (currentConv) {
        // Correct logic to find the OTHER user regardless of current user's role
        const other = Number(currentConv.idu_cl) === Number(user?.id) 
          ? currentConv.provider.user 
          : currentConv.client.user;
        
        if (other) {
          otherUserFromConversation = other;
          otherUserId = other.id;
        }
      }

      if (!otherUserId) {
        const otherSenderId = data.messages.find(msg => msg.sender_id !== user?.id)?.sender_id || null;
        if (otherSenderId) {
          otherUserId = otherSenderId;
          try {
            const userResponse = await userService.getById(otherSenderId.toString());
            const userData = userResponse.user;
            const ou = {
              ...userData,
              role: getRoleDisplay(userData.role),
              fname: userData.fname || 'Unknown',
              lname: userData.lname || 'User'
            };
            setOtherUser(ou);
            otherUserRef.current = ou;
          } catch (err) {
            const ou = { id: otherUserId, role: 'USER', fname: 'Unknown', lname: 'User' };
            setOtherUser(ou);
            otherUserRef.current = ou;
          }
        }
      }

      if (otherUserFromConversation) {
        // If we got it from conversation, we might need to fetch full user to get role correctly if not included
        try {
          const userResponse = await userService.getById(otherUserFromConversation.id.toString());
          const userData = userResponse.user;
          const ou = {
            ...userData,
            role: getRoleDisplay(userData.role),
            fname: userData.fname || 'Unknown',
            lname: userData.lname || 'User'
          };
          setOtherUser(ou);
          otherUserRef.current = ou;
        } catch (err) {
          const ou = {
            ...otherUserFromConversation,
            role: user!.role === 'client' ? 'SERVICE PROVIDER' : 'CLIENT',
            fname: otherUserFromConversation.fname || 'Unknown',
            lname: otherUserFromConversation.lname || 'User'
          };
          setOtherUser(ou);
          otherUserRef.current = ou;
        }
      }

      if (otherUserId) {
        try {
          const keyData = await getPublicKey(otherUserId);
          const otherPubKey = await crypto.importPublicKey(keyData.public_key);
          const sharedKey = await crypto.deriveSharedSecret(privateKey, otherPubKey);
          setDerivedKey(sharedKey);
          derivedKeyRef.current = sharedKey;
          
          const decryptedMessages = await decryptBatch(data.messages, sharedKey);
          setMessages(decryptedMessages);
        } catch (err: any) {
          setEncryptionError('Waiting for other user to secure the chat...');
          setMessages(data.messages.map((m: any) => ({ ...m, decryption_error: true })));
        }
      }

      pollInterval.current = setInterval(fetchNewMessages, 3000);

    } catch (error) {
      console.error('Chat init error:', error);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const decryptBatch = async (msgs: Message[], key: CryptoKey) => {
    return await Promise.all(msgs.map(async (msg) => {
      try {
        const text = await crypto.decryptMessage(msg.encrypted_content, msg.iv, key);
        return { ...msg, decrypted_text: text };
      } catch (e) {
        return { ...msg, decryption_error: true };
      }
    }));
  };

  const fetchNewMessages = async () => {
    if (!conversationId) return;
    try {
      const data = await getMessages(conversationId, 1, 30);
      
      let newMsgs;
      const currentKey = derivedKeyRef.current;
      if (currentKey) {
        newMsgs = await decryptBatch(data.messages, currentKey);
      } else {
        newMsgs = data.messages.map((m: any) => ({ ...m, decryption_error: true }));
        await checkOtherUserKey();
      }
      
      setMessages(prev => {
        const hasChanges = newMsgs.length !== prev.length || 
                          newMsgs.some((msg, i) => prev[i] && (msg.id !== prev[i].id || msg.decrypted_text !== prev[i].decrypted_text || msg.decryption_error !== prev[i].decryption_error));
        
        if (hasChanges) {
          setTimeout(scrollToBottom, 100);
          return newMsgs;
        }
        return prev;
      });
    } catch (error) {
      console.error('Poll error:', error);
    }
  };

  const checkOtherUserKey = async () => {
    if (derivedKeyRef.current || !otherUserRef.current) return;
    try {
      const privateKey = await crypto.getPrivateKey(user!.id);
      if (!privateKey) return;

      const keyData = await getPublicKey(otherUserRef.current.id);
      const otherPubKey = await crypto.importPublicKey(keyData.public_key);
      const sharedKey = await crypto.deriveSharedSecret(privateKey, otherPubKey);
      setDerivedKey(sharedKey);
      derivedKeyRef.current = sharedKey;
      setEncryptionError(null);
      fetchNewMessages();
    } catch (e) {
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const currentKey = derivedKeyRef.current;
    if (!newMessage.trim() || !currentKey || sending) return;

    setSending(true);
    try {
      const { encrypted_content, iv } = await crypto.encryptMessage(newMessage, currentKey);
      await sendMessage(conversationId!, encrypted_content, iv);
      setNewMessage('');
      fetchNewMessages();
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: p.textMuted }}>
        <div className="animate-spin" style={{ width: 48, height: 48, border: `4px solid ${p.primary}20`, borderTopColor: p.primary, borderRadius: '50%' }} />
        <span>Securing your connection...</span>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', background: p.cardBg, borderRadius: '24px', overflow: 'hidden', border: `1px solid ${p.border}` }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: p.text, cursor: 'pointer' }}>
            <ChevronLeft size={24} />
          </button>
          <div 
            onClick={() => {
              if (otherUser?.id) {
                if (user?.role === 'client') {
                  navigate(`/client/provider/${otherUser.id}`);
                } else if (user?.role === 'provider') {
                  navigate(`/profile/client/${otherUser.id}`);
                } else if (user?.role === 'admin') {
                   // Admins can see both
                   if (otherUser.role === 'SERVICE PROVIDER') {
                     navigate(`/client/provider/${otherUser.id}`);
                   } else {
                     navigate(`/admin/users/${otherUser.id}`);
                   }
                }
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '14px', background: p.primary + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {otherUser?.profile_picture ? (
                <img src={otherUser.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserIcon size={24} color={p.primary} />
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: p.text }}>{otherUser?.fname} {otherUser?.lname}</div>
              <div style={{ fontSize: '12px', color: p.primary, fontWeight: 700, letterSpacing: '0.5px' }}>{otherUser?.role}</div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            if (otherUser?.id) {
              if (user?.role === 'client') {
                navigate(`/client/provider/${otherUser.id}`);
              } else if (user?.role === 'provider') {
                navigate(`/profile/client/${otherUser.id}`);
              } else if (user?.role === 'admin') {
                 if (otherUser.role === 'SERVICE PROVIDER') {
                   navigate(`/client/provider/${otherUser.id}`);
                 } else {
                   navigate(`/admin/users/${otherUser.id}`);
                 }
              }
            }
          }}
          style={{ 
            fontSize: '12px', 
            padding: '8px 16px',
            background: p.cardBg,
            border: `1px solid ${p.border}`,
            color: p.text,
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          View Profile
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ textAlign: 'center', margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: p.primary + '10', color: p.primary, padding: '6px 16px', borderRadius: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} />
            <span>
                {encryptionError || `Messages are end-to-end encrypted. Only you and ${otherUser?.fname} can read them.`}
            </span>
          </div>
        </div>

        {messages.map((msg) => {
          // Robust comparison: ensure both are treated as the same type (likely numbers)
          const isMe = Number(msg.sender_id) === Number(user?.id);
          return (
            <motion.div
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={msg.id}
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: isMe ? p.primary : p.border,
                  color: isMe ? '#fff' : p.text,
                  fontSize: '14px',
                  lineHeight: '1.5',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {msg.decryption_error ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontStyle: 'italic', opacity: 0.8 }}>
                    <Lock size={14} />
                    {derivedKey ? "Decryption failed" : "Encrypted message"}
                  </div>
                ) : (
                  msg.decrypted_text
                )}
              </div>
              <span style={{ fontSize: '10px', color: p.textMuted, marginTop: '4px' }}>
                {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isMe && (msg.is_read ? ' · Read' : ' · Sent')}
              </span>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSend}
        style={{ padding: '20px 24px', borderTop: `1px solid ${p.border}`, display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.01)' }}
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={derivedKey ? "Type a message..." : (encryptionError ? "Encryption pending..." : "Initializing...")}
          disabled={!derivedKey}
          style={{
            flex: 1,
            background: p.cardBg,
            border: `1px solid ${p.border}`,
            borderRadius: '14px',
            padding: '12px 20px',
            color: p.text,
            outline: 'none',
            fontSize: '14px',
            opacity: derivedKey ? 1 : 0.6
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || !derivedKey || sending}
          style={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            background: p.primary,
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            opacity: (newMessage.trim() && derivedKey && !sending) ? 1 : 0.5
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {sending ? <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
