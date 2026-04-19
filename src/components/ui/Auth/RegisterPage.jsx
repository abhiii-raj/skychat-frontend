import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { handleRegister, handleLogin } = useAuth();

  const [form, setForm] = useState({ name: '', username: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await handleRegister(form.name, form.username, form.password);
      await handleLogin(form.username, form.password);
      navigate('/chat');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const pw = form.password;
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)      s++;
    if (/[A-Z]/.test(pw))    s++;
    if (/[0-9]/.test(pw))    s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  })();

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'var(--sky-red)', 'var(--sky-amber)', 'var(--sky-blue)', 'var(--sky-green)'];

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">
          <div className="auth-logo-icon">
            <MessageCircle size={22} color="#fff" strokeWidth={2} />
          </div>
          <span className="auth-logo-name">SkyChat</span>
        </div>
        <h1 className="auth-tagline">
          Start chatting<br />in <span>seconds.</span>
        </h1>
        <p className="auth-sub">
          Create your free account and join thousands of teams already using SkyChat to
          communicate faster and smarter.
        </p>
        <div className="auth-features">
          {[
            'Free forever for personal use',
            'Unlimited messages & history',
            'End-to-end encrypted conversations',
          ].map((t) => (
            <div key={t} className="auth-feature">
              <CheckCircle size={14} style={{ color: 'var(--sky-green)', flexShrink: 0 }} />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card-title">Create account</h2>
          <p className="auth-card-sub">Free forever. No credit card required.</p>

          {error && (
            <div className="sky-alert sky-alert-error">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="sky-field">
              <label className="sky-label" htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="sky-input"
                placeholder="Aryan Kumar"
                value={form.name}
                onChange={onChange}
                required
              />
            </div>

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
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={onChange}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="sky-input-icon"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1, height: '3px', borderRadius: '4px',
                          background: i <= strength ? strengthColors[strength] : 'var(--sky-border)',
                          transition: 'background 0.2s',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className="sky-field">
              <label className="sky-label" htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                className="sky-input"
                placeholder="••••••••"
                value={form.confirm}
                onChange={onChange}
                required
              />
            </div>

            <button
              type="submit"
              className="sky-btn sky-btn-primary"
              style={{ marginTop: '6px' }}
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer-link">
            Already have an account?
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;