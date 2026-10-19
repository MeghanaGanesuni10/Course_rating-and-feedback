import { useState } from 'react';
import { User, Lock, BadgeCheck, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', studentId: user?.studentId || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await api.patch('/auth/profile', profileForm);
      updateUser(data.user);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return; }

    setPwLoading(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>Profile &amp; Settings</h1>

      {/* Avatar card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
          {initials}
        </div>
        <div>
          <h3 style={{ fontSize: '1.125rem' }}>{user?.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
          <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-primary'}`} style={{ marginTop: '0.5rem' }}>
            {user?.role === 'admin' ? '⚡ Administrator' : '🎓 Student'}
          </span>
        </div>
      </div>

      {/* Profile form */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={17} color="var(--primary)" /> Personal Information
        </h3>
        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="profile-name" className="form-label">Full Name</label>
            <input id="profile-name" type="text" className="form-input" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-email" className="form-label">Email Address</label>
            <input id="profile-email" type="email" className="form-input" value={user?.email || ''} disabled style={{ background: '#F8FAFC', color: 'var(--text-muted)' }} />
            <span className="form-hint">Email cannot be changed.</span>
          </div>
          <div className="form-group">
            <label htmlFor="profile-studentid" className="form-label">Student ID (optional)</label>
            <input id="profile-studentid" type="text" className="form-input" value={profileForm.studentId} onChange={(e) => setProfileForm({ ...profileForm, studentId: e.target.value })} placeholder="e.g. 22CS001" />
          </div>
          <button id="save-profile-btn" type="submit" className="btn btn-primary" disabled={profileLoading}>
            {profileLoading ? <><div className="spinner spinner-sm spinner-white" /> Saving…</> : <><Save size={15} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={17} color="var(--primary)" /> Change Password
        </h3>

        {pwError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{pwError}</div>}

        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="current-password" className="form-label">Current Password</label>
            <input id="current-password" type="password" className="form-input" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div className="form-group">
            <label htmlFor="new-password" className="form-label">New Password</label>
            <input id="new-password" type="password" className="form-input" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Min. 8 characters" autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">Confirm New Password</label>
            <input id="confirm-password" type="password" className="form-input" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Repeat new password" />
          </div>
          <button id="change-password-btn" type="submit" className="btn btn-primary" disabled={pwLoading}>
            {pwLoading ? <><div className="spinner spinner-sm spinner-white" /> Changing…</> : <><Lock size={15} /> Change Password</>}
          </button>
        </form>
      </div>
    </div>
  );
}
