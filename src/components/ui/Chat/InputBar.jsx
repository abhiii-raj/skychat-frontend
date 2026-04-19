import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { messagesAPI } from '../../../services/api';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';

const TYPING_DEBOUNCE_MS = 1500;
const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🔥', '🎉', '😎', '🤔', '👏', '❤️', '😢'];

const InputBar = ({ conversation, onMessageSent }) => {
  const { user }   = useAuth();
  const { socket } = useSocket();

  const [text, setText]           = useState('');
  const [sending, setSending]     = useState(false);
  const [filePreview, setFile]    = useState(null); // { name, size, file }
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef               = useRef(null);
  const fileInputRef              = useRef(null);
  const emojiPickerRef            = useRef(null);
  const typingTimerRef            = useRef(null);
  const isTypingRef               = useRef(false);

  // Auto-resize textarea
  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  };

  useEffect(() => { autoResize(); }, [text]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!emojiPickerRef.current?.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', onClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [showEmojiPicker]);

  // Emit typing events
  const emitTyping = useCallback(() => {
    if (!socket || !conversation) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', {
        conversationId: conversation._id,
        senderName: user?.name,
      });
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stop_typing', { conversationId: conversation._id });
    }, TYPING_DEBOUNCE_MS);
  }, [socket, conversation, user]);

  const stopTyping = useCallback(() => {
    clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket?.emit('stop_typing', { conversationId: conversation?._id });
    }
  }, [socket, conversation]);

  const handleChange = (e) => {
    setText(e.target.value);
    emitTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile({ name: f.name, size: f.size, file: f });
    e.target.value = '';
  };

  const removeFile = () => setFile(null);

  const insertEmoji = (emoji) => {
    setText((prev) => `${prev}${emoji}`);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleSend = async () => {
    if ((!text.trim() && !filePreview) || sending || !conversation) return;

    setSending(true);
    stopTyping();

    try {
      const peerId = conversation.isGroup
        ? null
        : conversation.participants?.find((p) => {
          if (user?._id && p._id) return p._id !== user._id;
          if (user?.username && p.username) return p.username !== user.username;
          return p._id !== 'self';
        })?._id;

      const payload = {
        recipientId: peerId,
        content: text.trim(),
      };

      const formData = new FormData();
      formData.append('recipientId', payload.recipientId);
      formData.append('content', payload.content);
      if (filePreview?.file) {
        formData.append('file', filePreview.file);
      }

      const { data } = await messagesAPI.send(formData);

      // Emit via socket for instant delivery
      socket?.emit('send_message', data);

      onMessageSent?.(data);
      setText('');
      setFile(null);
      setShowEmojiPicker(false);
      textareaRef.current?.focus();
    } catch {
      // handle error (could show toast)
    } finally {
      setSending(false);
    }
  };

  const canSend = (text.trim() || filePreview) && !sending;

  return (
    <div className="input-bar">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* File preview chip */}
        {filePreview && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 12px',
            background: 'var(--sky-surface-2)',
            border: '1px solid var(--sky-border)',
            borderRadius: 'var(--sky-radius-sm)',
            fontSize: '12px',
          }}>
            <Paperclip size={13} color="var(--sky-blue)" />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--sky-text-1)' }}>
              {filePreview.name}
            </span>
            <button
              onClick={removeFile}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sky-text-3)', display: 'flex' }}
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="input-wrap" ref={emojiPickerRef}>
          {/* Attach */}
          <button
            className="input-action"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            type="button"
          >
            <Paperclip size={17} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Text area */}
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />

          {/* Emoji placeholder */}
          <button
            className="input-action"
            title="Emoji"
            type="button"
            onClick={() => setShowEmojiPicker((v) => !v)}
          >
            <Smile size={17} />
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="emoji-btn"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Send */}
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={!canSend}
        title="Send message"
        type="button"
      >
        <Send size={17} />
      </button>
    </div>
  );
};

export default InputBar;