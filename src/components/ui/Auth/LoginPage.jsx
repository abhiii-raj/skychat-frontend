import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, MessageCircle, Zap, Shield, Globe } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { handleLogin, login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await handleLogin(form.username, form.password);
      navigate('/chat');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const profile = await userInfoResponse.json();
        login(`google-${tokenResponse.access_token}`, {
          name: profile.name || profile.email || 'Google User',
          username: profile.email || profile.name || 'google-user',
          email: profile.email || '',
          provider: 'google',
        });
        navigate('/chat');
      } catch {
        setError('Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-in was cancelled.'),
  });

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="auth-left-logo">
          <div className="auth-logo-icon">
            <MessageCircle size={22} color="#fff" strokeWidth={2} />
          </div>
          <span className="auth-logo-name">SkyChat</span>
        </div>

        <h1 className="auth-tagline">
          Connect with your<br />
          team, <span>instantly.</span>
        </h1>

        <p className="auth-sub">
          Real-time messaging that keeps everyone in sync — from quick DMs to full
          team channels, all in one clean space.
        </p>

        <div className="auth-features">
          {[
            { icon: Zap,    text: 'Real-time messaging with Socket.IO' },
            { icon: Shield, text: 'Secure JWT authentication' },
            { icon: Globe,  text: 'Google OAuth in one click' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="auth-feature">
              <div className="auth-feature-dot" />
              <Icon size={14} style={{ color: 'var(--sky-blue)', flexShrink: 0 }} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card-title">Welcome back</h2>
          <p className="auth-card-sub">Sign in to continue your conversations</p>

          {error && (
            <div className="sky-alert sky-alert-error">
              <Shield size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="sky-field">
              <label className="sky-label" htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                className="sky-input"
                placeholder="your-username"
                value={form.username}
                onChange={onChange}
                required
                autoComplete="username"
              />
            </div>

            <div className="sky-field">
              <label className="sky-label" htmlFor="password">Password</label>
              <div className="sky-input-icon-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className="sky-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="sky-input-icon"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <Link
                to="/forgot-password"
                style={{ fontSize: '12px', color: 'var(--sky-blue)', textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="sky-btn sky-btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="sky-divider">
            <div className="sky-divider-line" />
            <span className="sky-divider-text">or continue with</span>
            <div className="sky-divider-line" />
          </div>

          <button
            type="button"
            className="sky-btn sky-btn-outline"
            onClick={() => googleLogin()}
            disabled={loading}
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-footer-link">
            Don't have an account?
            <Link to="/register">Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;