import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import { useEffect } from 'react';
import LoginPage from './components/ui/Auth/LoginPage';
import ForgotPasswordPage from './components/ui/Auth/ForgotPasswordPage';
import RegisterPage from './components/ui/Auth/RegisterPage';
import ChatPage from './components/ui/Chat/ChatPage';
import ProtectedRoute from './components/ui/Shared/ProtectedRoute';
import VideoMeetComponent from './pages/VideoMeet';
import './styles/skychat.css';

/* Inner app that has access to AuthContext */
const AppRoutes = () => {
  const { token, user } = useAuth();

  return (
    <SocketProvider token={token} userId={user?._id}>
      <GlobalIncomingVideoCallHandler user={user} />
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:url"
          element={
            <ProtectedRoute>
              <VideoMeetComponent />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </SocketProvider>
  );
};

const GlobalIncomingVideoCallHandler = ({ user }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!socket || !user?._id) return undefined;

    const onIncomingCall = ({ callId, roomCode, callType }) => {
      if (callType !== 'video') return;
      if (location.pathname === '/chat') return;

      const shouldJoin = window.confirm('You have an incoming video call. Join now?');
      if (shouldJoin) {
        socket.emit('accept_call', { callId, userId: user._id });
        navigate(`/video/${roomCode}`);
      } else {
        socket.emit('reject_call', { callId, userId: user._id });
      }
    };

    socket.on('incoming_call', onIncomingCall);
    return () => socket.off('incoming_call', onIncomingCall);
  }, [socket, user, navigate, location.pathname]);

  return null;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;