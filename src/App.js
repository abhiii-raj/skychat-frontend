import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
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

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;