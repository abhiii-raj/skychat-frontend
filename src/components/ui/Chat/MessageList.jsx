import { useEffect, useRef, useState, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import Avatar from '../Shared/Avatar';
import { messagesAPI } from '../../../services/api';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';

const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
};

const formatDateLabel = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
};

const MessageList = ({ conversation, refreshKey = 0, searchTerm = '', onMessagesUpdate }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [typing, setTyping]       = useState(null); // { name }
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);

  const bottomRef = useRef(null);
  const listRef   = useRef(null);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (pg = 1) => {
    if (!conversation) return;
    if (conversation.isGroup) {
      setMessages([]);
      setHasMore(false);
      onMessagesUpdate?.([]);
      return;
    }
    setLoading(true);
    try {
      const peerId = conversation.isGroup
        ? conversation._id
        : conversation.participants?.find((p) => {
          if (user?._id && p._id) return p._id !== user._id;
          if (user?.username && p.username) return p.username !== user.username;
          return p._id !== 'self';
        })?._id;

      const { data } = await messagesAPI.getConversation(peerId, pg);
      if (pg === 1) {
        const nextMessages = data.messages || data;
        setMessages(nextMessages);
        setHasMore(nextMessages.length === 30);
        onMessagesUpdate?.(nextMessages);
      } else {
        const nextMessages = data.messages || data;
        setMessages((prev) => {
          const combined = [...nextMessages, ...prev];
          onMessagesUpdate?.(combined);
          return combined;
        });
        setHasMore(nextMessages.length === 30);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [conversation, user, onMessagesUpdate]);

  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    onMessagesUpdate?.([]);
    fetchMessages(1);
  }, [conversation?._id, fetchMessages, refreshKey, onMessagesUpdate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket events
  useEffect(() => {
    if (!socket || !conversation) return;

    const onMessage = (msg) => {
      if (msg.conversationId === conversation._id) {
        setMessages((prev) => [...prev, msg]);
        setTyping(null);
      }
    };

    const onTyping = ({ conversationId, senderName }) => {
      if (conversationId === conversation._id && senderName !== user?.name) {
        setTyping({ name: senderName });
      }
    };

    const onStopTyping = ({ conversationId }) => {
      if (conversationId === conversation._id) setTyping(null);
    };

    socket.on('receive_message', onMessage);
    socket.on('typing', onTyping);
    socket.on('stop_typing', onStopTyping);

    return () => {
      socket.off('receive_message', onMessage);
      socket.off('typing', onTyping);
      socket.off('stop_typing', onStopTyping);
    };
  }, [socket, conversation, user]);

  // Infinite scroll (scroll to top → load more)
  const onScroll = () => {
    if (listRef.current?.scrollTop === 0 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredMessages = normalizedSearch
    ? messages.filter((msg) => {
      const text = (msg.content || '').toLowerCase();
      const fileName = (msg.file?.name || '').toLowerCase();
      return text.includes(normalizedSearch) || fileName.includes(normalizedSearch);
    })
    : messages;

  if (!conversation) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-icon">
          <MessageSquare size={28} color="var(--sky-text-3)" />
        </div>
        <div className="chat-empty-title">No conversation selected</div>
        <div className="chat-empty-sub">Pick someone from the sidebar to start chatting</div>
      </div>
    );
  }

  return (
    <div
      className="messages-area"
      ref={listRef}
      onScroll={onScroll}
    >
      {loading && page === 1 && <SkeletonMessages />}

      {!loading && filteredMessages.length === 0 && normalizedSearch && (
        <div className="chat-empty" style={{ minHeight: 180 }}>
          <div className="chat-empty-title">No messages found</div>
          <div className="chat-empty-sub">Try a different keyword in this conversation</div>
        </div>
      )}

      {filteredMessages.map((msg, idx) => {
        const prev = filteredMessages[idx - 1];
        const showDateDivider = !prev || !isSameDay(prev.createdAt, msg.createdAt);
        const isSent = msg.sender?._id === user?._id || msg.senderId === user?._id;

        // Show avatar only for first message in a group from same sender
        const nextMsg = filteredMessages[idx + 1];
        const showAvatar = !isSent && (
          !nextMsg || nextMsg.sender?._id !== msg.sender?._id
        );

        const senderName = msg.sender?.name || '';

        return (
          <div key={msg._id || idx}>
            {showDateDivider && (
              <div className="date-divider">
                <div className="date-divider-line" />
                <span className="date-divider-text">{formatDateLabel(msg.createdAt)}</span>
                <div className="date-divider-line" />
              </div>
            )}
            <MessageBubble
              message={msg}
              isSent={isSent}
              showAvatar={showAvatar}
              senderName={senderName}
            />
          </div>
        );
      })}

      {/* Typing indicator */}
      {typing && (
        <div className="typing-indicator">
          <Avatar name={typing.name} size="sm" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--sky-text-3)', marginBottom: '4px' }}>
              {typing.name} is typing…
            </div>
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

const SkeletonMessages = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {[80, 55, 140, 90, 65].map((w, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end',
          gap: '10px',
          alignItems: 'flex-end',
        }}
      >
        {i % 2 === 0 && (
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
        )}
        <div className="skeleton" style={{ height: 38, width: `${w}%`, maxWidth: 260, borderRadius: 14 }} />
      </div>
    ))}
  </div>
);

export default MessageList;