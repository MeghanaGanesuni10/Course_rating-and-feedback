import { useState } from 'react';
import { Menu, Bell, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ onMenuClick, title }) {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          id="sidebar-toggle"
          className="btn btn-ghost btn-icon"
          onClick={onMenuClick}
          style={{ display: 'flex' }}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap size={20} color="var(--primary)" />
          <span className="topbar-title">{title || 'CourseRate'}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: '#fff',
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
