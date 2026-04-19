import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import TopBar from './Topbar';
import MessageList from './MessageList';
import InputBar from './InputBar';
import ContactInfoPanel from './ContactInfoPanel';
import VoiceCallPopup from './VoiceCallPopup';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';
import { MessageSquareDashed } from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [activeConversation, setActiveConversation] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [callUi, setCallUi] = useState({
    open: false,
    status: 'idle',
    direction: 'outgoing',
    callId: null,
    roomCode: null,
    conversation: null,
  });

  const handleSelectConv = (conv) => {
    setActiveConversation(conv);
    setShowInfo(false);
  };

  const handleMessageSent = (msg) => {
    setRefreshKey((v) => v + 1);
  };

  const sharedFiles = conversationMessages.filter((message) => message.type === 'file' && message.file);
  const sharedMedia = sharedFiles.filter((fileMessage) => {
    const mimeType = fileMessage.file?.mimeType || '';
    return mimeType.includes('image');
  }).map((fileMessage) => fileMessage.file);

  const handleStartVideoCall = () => {
    if (!activeConversation || !socket || !user?._id) return;
    const roomCode = activeConversation?._id || `${Date.now()}`;

    if (activeConversation.isGroup) {
      const memberIds = (activeConversation.participants || [])
        .map((p) => p._id)
        .filter((id) => id && id !== user._id);

      socket.emit('place_group_call', {
        fromUserId: user._id,
        callType: 'video',
        roomCode,
        conversationId: activeConversation._id,
        toUserIds: memberIds,
        fromUser: {
          _id: user._id,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl || '',
        },
      });
    }

    navigate(`/video/${roomCode}`);
  };

  const handleStartVoiceCall = () => {
    if (!activeConversation || !socket || !user?._id) return;

    const peer = activeConversation.participants?.find((p) => p._id !== user._id);
    const toUserId = peer?._id;
    if (!toUserId) return;

    const roomCode = activeConversation?._id || `dm-${toUserId}-${Date.now()}`;

    setCallUi({
      open: true,
      status: 'ringing',
      direction: 'outgoing',
      callId: null,
      roomCode,
      conversation: activeConversation,
    });

    socket.emit('place_call', {
      fromUserId: user._id,
      toUserId,
      callType: 'voice',
      roomCode,
      conversationId: activeConversation._id,
      fromUser: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl || '',
      },
    });
  };

  const handleOpenFullVoiceCall = () => {
    const roomCode = callUi.roomCode || activeConversation?._id || `${Date.now()}`;
    setCallUi((prev) => ({ ...prev, open: false }));
    navigate(`/video/${roomCode}?mode=voice`);
  };

  const handleAcceptIncomingCall = () => {
    if (!socket || !user?._id || !callUi.callId) return;
    socket.emit('accept_call', { callId: callUi.callId, userId: user._id });
  };

  const handleRejectIncomingCall = () => {
    if (socket && user?._id && callUi.callId) {
      socket.emit('reject_call', { callId: callUi.callId, userId: user._id });
    }
    setCallUi((prev) => ({ ...prev, open: false, status: 'ended' }));
  };

  const handleHangUpCall = () => {
    if (socket && user?._id && callUi.callId) {
      socket.emit('end_call', { callId: callUi.callId, userId: user._id });
    }
    setCallUi((prev) => ({ ...prev, open: false, status: 'ended' }));
  };

  useEffect(() => {
    if (!socket || !user?._id) return undefined;

    const findConversationForUser = (peerId, peerFallback) => {
      if (activeConversation?.participants?.some((p) => p._id === peerId)) {
        return activeConversation;
      }

      return {
        _id: `dm-${peerId}`,
        isGroup: false,
        participants: [
          {
            _id: user._id,
            name: user.name,
            username: user.username,
            avatarUrl: user.avatarUrl || '',
          },
          {
            _id: peerId,
            name: peerFallback?.name || 'Unknown',
            username: peerFallback?.username,
            avatarUrl: peerFallback?.avatarUrl || '',
          },
        ],
      };
    };

    const onCallRinging = ({ callId, roomCode, callType }) => {
      if (callType !== 'voice') return;
      setCallUi((prev) => ({ ...prev, open: true, status: 'ringing', callId, roomCode: roomCode || prev.roomCode }));
    };

    const onIncomingCall = ({ callId, roomCode, fromUser, fromUserId, callType }) => {
      if (callType === 'video') {
        const shouldJoin = window.confirm(`${fromUser?.name || 'Someone'} is inviting you to a video call. Join now?`);
        if (shouldJoin) {
          socket.emit('accept_call', { callId, userId: user._id });
          navigate(`/video/${roomCode}`);
        } else {
          socket.emit('reject_call', { callId, userId: user._id });
        }
        return;
      }

      if (callType !== 'voice') return;
      const incomingConversation = findConversationForUser(fromUserId, fromUser);
      setCallUi({
        open: true,
        status: 'incoming',
        direction: 'incoming',
        callId,
        roomCode,
        conversation: incomingConversation,
      });
    };

    const onCallAccepted = ({ callId, roomCode, callType }) => {
      if (callType !== 'voice') return;
      setCallUi((prev) => {
        if (prev.callId && prev.callId !== callId) return prev;
        return {
          ...prev,
          open: true,
          status: 'in-call',
          callId: callId || prev.callId,
          roomCode: roomCode || prev.roomCode,
        };
      });
    };

    const onCallRejected = ({ callId }) => {
      setCallUi((prev) => {
        if (prev.callId && prev.callId !== callId) return prev;
        return { ...prev, status: 'rejected' };
      });
    };

    const onCallEnded = ({ callId }) => {
      setCallUi((prev) => {
        if (prev.callId && prev.callId !== callId) return prev;
        return { ...prev, open: false, status: 'ended' };
      });
    };

    const onCallMissed = ({ callId }) => {
      setCallUi((prev) => {
        if (prev.callId && prev.callId !== callId) return prev;
        return { ...prev, status: 'missed' };
      });
    };

    const onCallUnavailable = ({ reason, callType }) => {
      if (callType !== 'voice') return;
      if (reason === 'busy' || reason === 'caller-busy') {
        setCallUi((prev) => ({ ...prev, status: 'busy' }));
        return;
      }
      setCallUi((prev) => ({ ...prev, status: 'unavailable' }));
    };

    socket.on('call_ringing', onCallRinging);
    socket.on('incoming_call', onIncomingCall);
    socket.on('call_accepted', onCallAccepted);
    socket.on('call_rejected', onCallRejected);
    socket.on('call_ended', onCallEnded);
    socket.on('call_missed', onCallMissed);
    socket.on('call_unavailable', onCallUnavailable);

    return () => {
      socket.off('call_ringing', onCallRinging);
      socket.off('incoming_call', onIncomingCall);
      socket.off('call_accepted', onCallAccepted);
      socket.off('call_rejected', onCallRejected);
      socket.off('call_ended', onCallEnded);
      socket.off('call_missed', onCallMissed);
      socket.off('call_unavailable', onCallUnavailable);
    };
  }, [socket, user, activeConversation, navigate]);

  const handleStartVideoMeeting = () => {
    const roomCode = `room-${Date.now()}`;
    navigate(`/video/${roomCode}`);
  };

  return (
    <div className="chat-shell">
      {/* Sidebar */}
      <Sidebar
        activeConvId={activeConversation?._id}
        onSelectConv={handleSelectConv}
        onNewChat={() => { /* open new chat modal */ }}
        onStartVideoMeeting={handleStartVideoMeeting}
      />

      {/* Main area */}
      <div className="chat-main">
        {activeConversation ? (
          <>
            <TopBar
              conversation={activeConversation}
              currentUser={user}
              showInfo={showInfo}
              onToggleInfo={() => setShowInfo((v) => !v)}
              onStartVideoCall={handleStartVideoCall}
              onStartVoiceCall={handleStartVoiceCall}
            />
            <MessageList
              conversation={activeConversation}
              refreshKey={refreshKey}
              onMessagesUpdate={setConversationMessages}
            />
            <InputBar
              conversation={activeConversation}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>

      {/* Info panel (togglable) */}
      {activeConversation && showInfo && (
        <ContactInfoPanel
          conversation={activeConversation}
          sharedFiles={sharedFiles.map((message) => message.file)}
          sharedMedia={sharedMedia}
          onStartVoiceCall={handleStartVoiceCall}
          onStartVideoCall={handleStartVideoCall}
        />
      )}

      <VoiceCallPopup
        open={callUi.open}
        conversation={callUi.conversation || activeConversation}
        currentUser={user}
        status={callUi.status}
        direction={callUi.direction}
        onClose={() => setCallUi((prev) => ({ ...prev, open: false }))}
        onAccept={handleAcceptIncomingCall}
        onReject={handleRejectIncomingCall}
        onHangUp={handleHangUpCall}
        onOpenFullCall={handleOpenFullVoiceCall}
      />
    </div>
  );
};

const WelcomeScreen = () => (
  <div className="chat-empty" style={{ flex: 1 }}>
    <div className="chat-empty-icon">
      <MessageSquareDashed size={30} color="var(--sky-text-3)" />
    </div>
    <div className="chat-empty-title">Your messages live here</div>
    <div className="chat-empty-sub">Select a conversation or start a new one</div>
  </div>
);

export default ChatPage;