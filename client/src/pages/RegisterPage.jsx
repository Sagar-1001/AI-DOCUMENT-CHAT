import { useState } from 'react';
import { registerUser } from '../services/api';

export default function RegisterPage({ onLogin, onGoToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ----- Email validation -----
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  // ----- Password strength logic -----
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };

  const passedCount = Object.values(checks).filter(Boolean).length;

  // Only counts as "valid" once ALL four conditions are met
  const isPasswordValid = passedCount === 4;

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and a number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerUser({ name, email, password });
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">📄 DocChat</h1>
        <p className="auth-subtitle">Create your account</p>
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-field">
          <label>Name</label>
          <input type="text" placeholder="Sagar Singh" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="auth-field">
          <label>Email</label>
          <div className="password-input-wrap">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {email.length > 0 && (
              <span className={`password-status-icon ${isEmailValid ? 'valid' : 'invalid'}`}>
                {isEmailValid ? '✓' : '✕'}
              </span>
            )}
          </div>
        </div>
        <div className="auth-field">
          <label>Password</label>
          <div className="password-input-wrap">
            <input
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {password.length > 0 && (
              <span className={`password-status-icon ${isPasswordValid ? 'valid' : 'invalid'}`}>
                {isPasswordValid ? '✓' : '✕'}
              </span>
            )}
          </div>
          <p className="password-instructions">
            Must be 8+ characters with uppercase, lowercase, and a number
          </p>
        </div>
        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="auth-switch">
          Already have an account?{' '}
          <span onClick={onGoToLogin}>Login</span>
        </p>
      </div>
    </div>
  );
}