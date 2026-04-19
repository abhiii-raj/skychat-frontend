import { useState, useEffect, useCallback } from 'react';
import { Edit, LogOut, Search, Hash, Video, Camera, Save, X } from 'lucide-react';
import Avatar from '../Shared/Avatar';
import { useAuth } from '../../../contexts/AuthContext';
import { usersAPI } from '../../../services/api';
import { useSocket } from '../../../contexts/SocketContext';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Sidebar = ({ activeConvId, onSelectConv, onNewChat, onStartVideoMeeting }) => {
  const { user, logout, updateProfile } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await usersAPI.getAll();
      const currentUser = {
        _id: user?._id || 'self',
        name: user?.name || 'You',
        username: user?.username,
      };

      const contacts = (Array.isArray(data) ? data : []).map((peer) => ({
        _id: `dm-${peer._id}`,
        isGroup: false,
        participants: [currentUser, peer],
        unreadCount: 0,
        lastMessage: null,
      }));

      setConversations(contacts);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Real-time: bump conversation to top on new message
  useEffect(() => {
    if (!socket) return;
    const handler = ({ conversationId, message }) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === conversationId);
        if (idx === -1) return prev;
        const updated = { ...prev[idx], lastMessage: message };
        return [updated, ...prev.filter((c) => c._id !== conversationId)];
      });
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket]);

  const findPeer = (conv) => {
    const meId = user?._id;
    const meUsername = user?.username;
    return conv.participants?.find((p) => {
      if (meId && p._id) return p._id !== meId;
      if (meUsername && p.username) return p.username !== meUsername;
      return p._id !== 'self';
    }) || {};
  };

  const filtered = conversations.filter((c) => {
    const name = c.isGroup
      ? c.name
      : findPeer(c).name || '';
    return name.toLowerCase().includes(query.toLowerCase());
  });

  const dms     = filtered.filter((c) => !c.isGroup);
  const groups  = filtered.filter((c) => c.isGroup);

  const getPeer = (conv) => findPeer(conv);

  const openProfileEditor = () => {
    setProfileError('');
    setProfileForm({ name: user?.name || '', bio: user?.bio || '' });
    setAvatarFile(null);
    setAvatarPreview(user?.avatarUrl || '');
    setShowProfileEditor(true);
  };

  const closeProfileEditor = () => {
    setShowProfileEditor(false);
    setProfileError('');
    setAvatarFile(null);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    event.target.value = '';
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setProfileError('');
      await updateProfile({
        name: profileForm.name,
        bio: profileForm.bio,
        avatarFile,
      });
      closeProfileEditor();
    } catch (error) {
      setProfileError(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C8 3 5 6 5 10c0 3 1.5 5.5 4 7l1 4h4l1-4c2.5-1.5 4-4 4-7 0-4-3-7-7-7z" fill="white" opacity="0.95" />
            </svg>
          </div>
          <span className="sidebar-logo-text">SkyChat</span>
        </div>

        <div className="sidebar-search">
          <Search size={13} color="var(--sky-text-3)" />
          <input
            placeholder="Search conversations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          className="sidebar-video-btn"
          type="button"
          onClick={onStartVideoMeeting}
          title="Start video meeting"
        >
          <Video size={14} />
          Start video meeting
        </button>
      </div>

      {/* Conversation list */}
      <div className="sidebar-list">
        {loading ? (
          <SkeletonList />
        ) : (
          <>
            {/* DMs */}
            {dms.length > 0 && (
              <>
                <p className="sidebar-section-label">Direct Messages</p>
                {dms.map((conv) => {
                  const peer = getPeer(conv);
                  return (
                    <ConvItem
                      key={conv._id}
                      name={peer.name || 'Unknown'}
                      src={peer.avatarUrl}
                      preview={conv.lastMessage?.content || 'No messages yet'}
                      time={formatTime(conv.lastMessage?.createdAt)}
                      unread={conv.unreadCount || 0}
                      online={peer.isOnline}
                      active={activeConvId === conv._id}
                      onClick={() => onSelectConv(conv)}
                      group={false}
                    />
                  );
                })}
              </>
            )}

            {/* Groups */}
            {groups.length > 0 && (
              <>
                <p className="sidebar-section-label" style={{ marginTop: '8px' }}>Groups</p>
                {groups.map((conv) => (
                  <ConvItem
                    key={conv._id}
                    name={conv.name}
                    preview={conv.lastMessage?.content || 'No messages yet'}
                    time={formatTime(conv.lastMessage?.createdAt)}
                    unread={conv.unreadCount || 0}
                    active={activeConvId === conv._id}
                    onClick={() => onSelectConv(conv)}
                    group
                  />
                ))}
              </>
            )}

            {filtered.length === 0 && !loading && (
              <div style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--sky-text-3)',
                fontSize: '13px'
              }}>
                {query ? 'No results found.' : 'No conversations yet.'}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <Avatar name={user?.name || ''} src={user?.avatarUrl} size="sm" online />
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-name">{user?.name || 'You'}</div>
          <div className="sidebar-footer-status">{user?.bio || 'Online'}</div>
        </div>
        <button
          className="sidebar-icon-btn"
          onClick={openProfileEditor}
          title="Edit profile"
        >
          <Edit size={14} />
        </button>
        <button
          className="sidebar-icon-btn"
          onClick={logout}
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>

      {showProfileEditor && (
        <div className="profile-modal-backdrop" onClick={closeProfileEditor}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3>Edit profile</h3>
              <button type="button" className="sidebar-icon-btn" onClick={closeProfileEditor}>
                <X size={14} />
              </button>
            </div>

            <div className="profile-avatar-wrap">
              <Avatar name={profileForm.name || user?.name || ''} src={avatarPreview || user?.avatarUrl} size="lg" />
              <label className="profile-avatar-upload" htmlFor="profile-avatar-input">
                <Camera size={12} />
                Change
              </label>
              <input
                id="profile-avatar-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>

            <div className="sky-field" style={{ marginBottom: 12 }}>
              <label className="sky-label" htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                className="sky-input"
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                maxLength={40}
              />
            </div>

            <div className="sky-field" style={{ marginBottom: 8 }}>
              <label className="sky-label" htmlFor="profile-bio">Bio</label>
              <textarea
                id="profile-bio"
                className="sky-input profile-bio-input"
                value={profileForm.bio}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                maxLength={160}
              />
            </div>

            {profileError && <div className="sky-alert sky-alert-error">{profileError}</div>}

            <button
              type="button"
              className="sky-btn sky-btn-primary"
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              <Save size={14} />
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

/* ── Sub-components ──────────────────────────────────────────────────────── */

const ConvItem = ({ name, src, preview, time, unread, online, active, onClick, group }) => (
  <div
    className={`contact-item ${active ? 'active' : ''}`}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    {group ? (
      <div className="sky-avatar sky-avatar-purple sky-avatar-group">
        <Hash size={14} />
      </div>
    ) : (
      <Avatar name={name} src={src} size="md" online={online} />
    )}

    <div className="contact-body">
      <div className="contact-name">{name}</div>
      <div className="contact-preview">{preview}</div>
    </div>

    <div className="contact-meta">
      <span className="contact-time">{time}</span>
      {unread > 0 && (
        <span className="unread-badge">{unread > 99 ? '99+' : unread}</span>
      )}
    </div>
  </div>
);

const SkeletonList = () => (
  <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px' }}>
        <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 10, width: '80%' }} />
        </div>
      </div>
    ))}
  </div>
);

export default Sidebar;