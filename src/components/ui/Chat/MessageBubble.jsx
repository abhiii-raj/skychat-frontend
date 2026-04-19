import { Check, CheckCheck, FileText, Download } from 'lucide-react';
import Avatar from '../Shared/Avatar';

const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileClass = (mime = '') => {
  if (mime.includes('pdf'))   return 'pdf';
  if (mime.includes('word') || mime.includes('document')) return 'doc';
  if (mime.includes('zip') || mime.includes('rar'))       return 'zip';
  if (mime.includes('image')) return 'image';
  return 'other';
};

/* Read receipt icon */
const ReadIcon = ({ status, sent }) => {
  if (!sent) return null;
  return (
    <span className={`msg-tick ${status === 'read' ? 'read' : ''}`}>
      {status === 'sent' ? (
        <Check size={12} />
      ) : (
        <CheckCheck size={12} />
      )}
    </span>
  );
};

const MessageBubble = ({ message, isSent, showAvatar, senderName }) => {
  const { content, type, file, quotedMessage, status, createdAt } = message;

  return (
    <div className={`msg-row ${isSent ? 'sent' : ''}`}>
      {/* Avatar column (only for received messages) */}
      <div className="msg-avatar-col">
        {!isSent && showAvatar && (
          <Avatar name={senderName || ''} size="sm" />
        )}
      </div>

      <div className="msg-content-col">
        {/* Sender label for groups */}
        {!isSent && showAvatar && senderName && (
          <div className="msg-sender-name">{senderName}</div>
        )}

        {/* Bubble */}
        {type === 'file' ? (
          <FileBubble file={file} isSent={isSent} />
        ) : (
          <div className={`msg-bubble ${isSent ? 'sent' : 'recv'}`}>
            {/* Quoted reply */}
            {quotedMessage && (
              <div className="msg-quote">
                <div className="msg-quote-author">
                  {quotedMessage.senderName || 'Unknown'}
                </div>
                <div>{quotedMessage.content}</div>
              </div>
            )}
            {content}
          </div>
        )}

        {/* Meta: time + read receipt */}
        <div className="msg-meta" style={{ justifyContent: isSent ? 'flex-end' : 'flex-start' }}>
          <span className="msg-time">{formatTime(createdAt)}</span>
          <ReadIcon status={status} sent={isSent} />
        </div>
      </div>
    </div>
  );
};

const FileBubble = ({ file, isSent }) => {
  const cls = getFileClass(file?.mimeType);
  return (
    <div className="msg-file">
      <div className={`file-icon-box ${cls}`}>
        <FileText size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="msg-file-name">{file?.name || 'Attachment'}</div>
        <div className="msg-file-size">{formatFileSize(file?.size)}</div>
      </div>
      <a
        href={file?.url}
        download={file?.name}
        target="_blank"
        rel="noreferrer"
        style={{ color: isSent ? 'rgba(255,255,255,0.7)' : 'var(--sky-text-3)', display: 'flex' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Download size={15} />
      </a>
    </div>
  );
};

export default MessageBubble;