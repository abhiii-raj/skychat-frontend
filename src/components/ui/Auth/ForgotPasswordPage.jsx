import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Shield, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestResetCode = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await authAPI.requestPasswordReset({ username });
      setResetCode(data.resetToken || '');
      setMessage('Reset code generated. Use it to set a new password below.');
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not generate reset code.');
    } finally {
      setLoading(false);
    }
  };

  const completeReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword({
        username,
        resetToken: resetCode,
        newPassword,
      });

      setMessage('Password updated successfully. You can now sign in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

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
          Reset your<br />
          password <span>securely.</span>
        </h1>

        <p className="auth-sub">
          Generate a one-time reset code with your username, then use it to create a new password.
        </p>

        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-dot" />
            <Shield size={14} style={{ color: 'var(--sky-blue)', flexShrink: 0 }} />
            <span>Protected recovery flow</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card-title">Forgot password?</h2>
          <p className="auth-card-sub">
            {step === 1
              ? 'Enter your username to generate a reset code.'
              : 'Enter the reset code and your new password.'}
          </p>

          {message && (
            <div className="sky-alert sky-alert-success" style={{ marginBottom: 18 }}>
              <Shield size={14} />
              {message}
            </div>
          )}

          {error && (
            <div className="sky-alert sky-alert-error" style={{ marginBottom: 18 }}>
              <Shield size={14} />
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={requestResetCode}>
              <div className="sky-field">
                <label className="sky-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  className="sky-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  required
                />
              </div>

              <button type="submit" className="sky-btn sky-btn-primary" disabled={loading}>
                <KeyRound size={14} />
                {loading ? 'Generating code…' : 'Generate reset code'}
              </button>
            </form>
          ) : (
            <form onSubmit={completeReset}>
              <div className="sky-field">
                <label className="sky-label" htmlFor="reset-code">Reset code</label>
                <input
                  id="reset-code"
                  className="sky-input"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  required
                />
              </div>

              <div className="sky-field">
                <label className="sky-label" htmlFor="new-password">New password</label>
                <div className="sky-input-icon-wrap">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="sky-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    required
                  />
                  <button
                    type="button"
                    className="sky-input-icon"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="sky-field">
                <label className="sky-label" htmlFor="confirm-password">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  className="sky-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>

              <button type="submit" className="sky-btn sky-btn-primary" disabled={loading}>
                <KeyRound size={14} />
                {loading ? 'Updating…' : 'Reset password'}
              </button>
            </form>
          )}

          <div style={{ marginTop: 16 }}>
            <Link to="/login" className="sky-btn sky-btn-outline" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;