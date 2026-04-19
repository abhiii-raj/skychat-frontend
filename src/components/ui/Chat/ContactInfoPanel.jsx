import { Phone, Video, FileText, Image } from 'lucide-react';
import Avatar from '../Shared/Avatar';
import { useAuth } from '../../../contexts/AuthContext';

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const getFileClass = (mime = '') => {
  if (mime.includes('pdf'))   return 'pdf';
  if (mime.includes('word'))  return 'doc';
  if (mime.includes('zip'))   return 'zip';
  if (mime.includes('image')) return 'image';
  return 'other';
};

const ContactInfoPanel = ({
  conversation,
  sharedFiles = [],
  sharedMedia = [],
  onStartVoiceCall,
  onStartVideoCall,
}) => {
  const { user } = useAuth();

  if (!conversation) return null;

  const peer = conversation.participants?.find((p) => p._id !== user?._id);
  const name = conversation.isGroup ? conversation.name : peer?.name || 'Unknown';
  const email = conversation.isGroup ? null : peer?.email;
  const bio = conversation.isGroup ? '' : peer?.bio || '';
  const avatarSrc = conversation.isGroup ? null : peer?.avatarUrl || '';
  const memberCount = conversation.participants?.length || 0;

  return (
    <aside className="chat-info-panel">
      {/* Profile header */}
      <div className="info-header">
        <Avatar
          name={name}
          src={avatarSrc}
          size="lg"
          online={!conversation.isGroup && peer?.isOnline}
          group={conversation.isGroup}
        />
        <div className="info-name">{name}</div>
        {!conversation.isGroup && bio && <div className="info-bio">{bio}</div>}
        {email && <div className="info-email">{email}</div>}
        {conversation.isGroup && (
          <div className="info-email">{memberCount} members</div>
        )}

        <div className="info-actions">
          <button className="icon-btn" title="Voice call" onClick={onStartVoiceCall}>
            <Phone size={15} />
          </button>
          <button className="icon-btn" title="Video call" onClick={onStartVideoCall}>
            <Video size={15} />
          </button>
        </div>
      </div>

      {/* Group members */}
      {conversation.isGroup && (
        <>
          <p className="info-section-label">Members</p>
          <div style={{ padding: '0 8px 8px' }}>
            {conversation.participants?.map((p) => (
              <div
                key={p._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: 'var(--sky-radius-sm)',
                }}
              >
                <Avatar name={p.name} size="sm" online={p.isOnline} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--sky-text-1)' }}>
                    {p.name}
                    {p._id === user?._id && (
                      <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--sky-text-3)' }}>you</span>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: p.isOnline ? 'var(--sky-green)' : 'var(--sky-text-3)' }}>
                    {p.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Shared media */}
      {sharedMedia.length > 0 && (
        <>
          <p className="info-section-label">Shared media</p>
          <div className="media-grid">
            {sharedMedia.slice(0, 9).map((m, i) => (
              <div
                key={i}
                className="media-thumb"
                style={m.url ? { backgroundImage: `url(${m.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {!m.url && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Image size={14} color="var(--sky-text-3)" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Shared files */}
      {sharedFiles.length > 0 && (
        <>
          <p className="info-section-label">Shared files</p>
          {sharedFiles.slice(0, 5).map((f, i) => {
            const cls = getFileClass(f.mimeType);
            return (
              <a
                key={i}
                href={f.url}
                download={f.name}
                target="_blank"
                rel="noreferrer"
                className="shared-file-row"
                style={{ textDecoration: 'none' }}
              >
                <div className={`file-icon-box ${cls}`}>
                  <FileText size={15} />
                </div>
                <div className="file-details">
                  <div className="file-details-name">{f.name}</div>
                  <div className="file-details-size">{formatFileSize(f.size)}</div>
                </div>
              </a>
            );
          })}
        </>
      )}

      {/* Empty shared state */}
      {sharedFiles.length === 0 && sharedMedia.length === 0 && (
        <div style={{
          padding: '24px 20px',
          textAlign: 'center',
          color: 'var(--sky-text-3)',
          fontSize: '12px',
        }}>
          No shared files or media yet.
        </div>
      )}
    </aside>
  );
};

export default ContactInfoPanel;