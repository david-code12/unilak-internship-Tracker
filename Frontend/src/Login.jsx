import React, { useState } from 'react';
import api from './api';

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { data } = await api.post('/api/login', { username, password });
      localStorage.setItem('unilak_token', data.token);
      onLoggedIn(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log in. Check that the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="login-kicker">UNILAK Internship Tracker</p>
        <h1>Sign in</h1>
        <p className="login-copy">Only registered students, faculty, and host supervisors can open this portal.</p>

        {error && <div className="login-error">{error}</div>}

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-approve login-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>

      </form>
    </div>
  );
}
