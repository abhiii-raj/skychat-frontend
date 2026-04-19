import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import TopBar from './Topbar';
import MessageList from './MessageList';
import InputBar from './InputBar';
import ContactInfoPanel from './ContactInfoPanel';
import { useAuth } from '../../../contexts/AuthContext';
import { MessageSquareDashed } from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeConversation, setActiveConversation] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [conversationMessages, setConversationMessages] = useState([]);

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
    if (!activeConversation) return;
    const roomCode = activeConversation?._id || `${Date.now()}`;
    navigate(`/video/${roomCode}`);
  };

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
        />
      )}
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