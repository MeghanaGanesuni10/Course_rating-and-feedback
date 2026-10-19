import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Star, MessageSquare, User,
  LogOut, GraduationCap, BarChart3, BookMarked, Users, ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const StudentNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses', icon: BookOpen, label: 'Course Directory' },
  { to: '/feedback/my', icon: Star, label: 'My Feedback' },
  { to: '/feedback/submit', icon: MessageSquare, label: 'Submit Feedback' },
];

const AdminNav = [
  { to: '/admin', icon: BarChart3, label: 'Admin Dashboard' },
  { to: '/admin/courses', icon: BookMarked, label: 'Course Management' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/feedback', icon: ClipboardList, label: 'Feedback Management' },
  { to: '/courses', icon: BookOpen, label: 'Course Directory' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    success('Logged out successfully.');
    navigate('/');
  };

  const navItems = user?.role === 'admin' ? AdminNav : StudentNav;
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-text">CourseRate</div>
            <div className="sidebar-logo-sub">Feedback Portal</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">
            {user?.role === 'admin' ? 'Administration' : 'Navigation'}
          </div>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin' || to === '/dashboard'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>Account</div>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <User size={17} />
            Profile & Settings
          </NavLink>
        </nav>

        {/* Footer — user info + logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost w-full mt-2"
            style={{ justifyContent: 'flex-start', color: '#64748B', fontSize: '0.8125rem' }}
            onClick={handleLogout}
          >
            <LogOut size={15} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
