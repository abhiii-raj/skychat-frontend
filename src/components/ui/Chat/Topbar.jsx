import { Phone, Video, Info, Search, MoreHorizontal } from 'lucide-react';
import Avatar from '../Shared/Avatar';

const TopBar = ({ conversation, currentUser, showInfo, onToggleInfo, onStartVideoCall }) => {
  if (!conversation) return null;

  const peer = conversation.participants?.find((p) => {
    if (currentUser?._id && p._id) return p._id !== currentUser._id;
    if (currentUser?.username && p.username) return p.username !== currentUser.username;
    return p._id !== 'self';
  });
  const name = conversation.isGroup ? conversation.name : peer?.name || 'Unknown';
  const isOnline = !conversation.isGroup && peer?.isOnline;
  const memberCount = conversation.isGroup
    ? `${conversation.participants?.length || 0} members`
    : null;

  return (
    <div className="chat-topbar">
      <div className="chat-topbar-left">
        <Avatar
          name={name}
          src={peer?.avatarUrl}
          size="md"
          online={isOnline}
          group={conversation.isGroup}
        />
        <div>
          <div className="chat-peer-name">{name}</div>
          <div className={`chat-peer-status ${!isOnline && !conversation.isGroup ? 'offline' : ''}`}>
            {conversation.isGroup ? (
              <span style={{ color: 'var(--sky-text-3)' }}>{memberCount}</span>
            ) : (
              <>
                <span className="dot" />
                {isOnline ? 'Active now' : 'Offline'}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" title="Search messages">
          <Search size={15} />
        </button>
        <button className="icon-btn" title="Voice call">
          <Phone size={15} />
        </button>
        <button className="icon-btn" title="Video call" onClick={onStartVideoCall}>
          <Video size={15} />
        </button>
        <button
          className={`icon-btn ${showInfo ? 'active' : ''}`}
          title="Contact info"
          onClick={onToggleInfo}
        >
          <Info size={15} />
        </button>
        <button className="icon-btn" title="More options">
          <MoreHorizontal size={15} />
        </button>
      </div>
    </div>
  );
};

export default TopBar;