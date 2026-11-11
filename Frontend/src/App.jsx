import React, { useEffect, useState } from 'react';
import Login from './Login.jsx';
import Student from './student';
import UnilakSupervisorView from './supervisor';
import HostSupervisorView from './host';
import api from './api';

const ROLE_LABELS = {
  student: 'Student Portal',
  unilak_supervisor: 'UNILAK Faculty Supervisor',
  host_supervisor: 'Host Company Supervisor',
};

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('unilak_token');
    if (!token) {
      setCheckingSession(false);
      return;
    }

    api.get('/api/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('unilak_token');
        setUser(null);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('unilak_token');
    setUser(null);
  };

  if (checkingSession) {
    return <div className="session-check">Checking your session…</div>;
  }

  if (!user) {
    return <Login onLoggedIn={setUser} />;
  }

  return (
    <div>
      <div className="app-nav">
        <span className="app-brand">🎓 UNILAK Internship Tracker</span>
        <div className="app-nav-right">
          <span className="app-user">{user.name} · {ROLE_LABELS[user.role]}</span>
          <button type="button" className="btn btn-logout" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {user.role === 'student' && <Student user={user} />}
        {user.role === 'unilak_supervisor' && <UnilakSupervisorView />}
        {user.role === 'host_supervisor' && <HostSupervisorView />}
      </div>
    </div>
  );
}
