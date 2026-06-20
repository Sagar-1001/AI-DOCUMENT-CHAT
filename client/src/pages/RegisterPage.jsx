import { useState } from 'react';
import { registerUser } from '../services/api';

export default function RegisterPage({ onLogin, onGoToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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
          <input
            type="text"
            placeholder="Sagar Singh"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
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