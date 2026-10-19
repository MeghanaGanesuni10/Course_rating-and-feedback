import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Crown, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'student';

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, googleAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Clear error when role changes
  useEffect(() => { setError(''); }, [selectedRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);

      // Role mismatch check — prevent student logging in via Admin tab and vice versa
      if (user.role !== selectedRole) {
        // Log them out immediately
        localStorage.removeItem('cr_token');
        localStorage.removeItem('cr_user');
        setError(
          selectedRole === 'admin'
            ? '⛔ This account does not have administrator access. Please use the Student login.'
            : '⛔ This is an administrator account. Please use the Admin login tab.'
        );
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setError('');
    setLoading(true);
    try {
      const user = await googleAuth(credential, selectedRole);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = selectedRole === 'admin';

  return (
    <div className="auth-page">
      {/* Background blurs */}
      <div className="auth-bg-blur" style={{
        width: 600, height: 600,
        background: isAdmin ? '#92400E' : '#4F46E5',
        top: -200, left: -200,
        transition: 'background 0.4s ease'
      }} />
      <div className="auth-bg-blur" style={{
        width: 400, height: 400,
        background: isAdmin ? '#D97706' : '#7C3AED',
        bottom: -100, right: -100,
        transition: 'background 0.4s ease'
      }} />

      <div className="auth-card" style={{ maxWidth: 440 }}>

        {/* Logo */}
        <div className="auth-logo" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className="auth-logo-icon" style={{ background: isAdmin ? '#D97706' : 'var(--primary)', transition: 'background 0.3s' }}>
            <GraduationCap size={24} color="#fff" />
          </div>
          <span className="auth-logo-text">CourseRate</span>
        </div>

        {/* Role Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.625rem',
          marginBottom: '1.75rem',
          padding: '0.375rem',
          background: '#F1F5F9',
          borderRadius: 12,
        }}>
          {/* Student Tab */}
          <button
            id="role-tab-student"
            type="button"
            onClick={() => { setSelectedRole('student'); setForm({ email: '', password: '' }); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 9,
              border: 'none',
              fontFamily: 'var(--font)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: !isAdmin ? '#fff' : 'transparent',
              color: !isAdmin ? 'var(--primary)' : '#94A3B8',
              boxShadow: !isAdmin ? '0 2px 8px rgba(79,70,229,0.15)' : 'none',
            }}
          >
            <BookOpen size={17} />
            Student
          </button>

          {/* Admin Tab */}
          <button
            id="role-tab-admin"
            type="button"
            onClick={() => { setSelectedRole('admin'); setForm({ email: '', password: '' }); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 9,
              border: 'none',
              fontFamily: 'var(--font)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: isAdmin ? '#fff' : 'transparent',
              color: isAdmin ? '#D97706' : '#94A3B8',
              boxShadow: isAdmin ? '0 2px 8px rgba(217,119,6,0.18)' : 'none',
            }}
          >
            <Crown size={17} />
            Admin
          </button>
        </div>

        {/* Role Badge */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.25rem',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.3rem 0.9rem',
            borderRadius: 99,
            fontSize: '0.8rem',
            fontWeight: 600,
            background: isAdmin ? '#FEF3C7' : 'var(--primary-50)',
            color: isAdmin ? '#92400E' : 'var(--primary)',
            border: `1px solid ${isAdmin ? '#FDE68A' : 'var(--primary-100)'}`,
            transition: 'all 0.3s',
          }}>
            {isAdmin ? <Crown size={13} /> : <BookOpen size={13} />}
            {isAdmin ? 'Administrator Login' : 'Student Login'}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.25rem', borderColor: isAdmin ? (error ? '' : 'transparent') : '' }}
                placeholder={isAdmin ? 'admin@courserate.dev' : 'student@courserate.dev'}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowPw(!showPw)}
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn w-full"
            style={{
              marginTop: '0.25rem',
              padding: '0.8rem',
              background: isAdmin
                ? 'linear-gradient(135deg, #D97706, #92400E)'
                : 'linear-gradient(135deg, #4F46E5, #3730A3)',
              color: '#fff',
              fontSize: '0.9375rem',
              fontWeight: 700,
              transition: 'all 0.3s',
              border: 'none',
              borderRadius: 8,
            }}
            disabled={loading}
          >
            {loading ? (
              <><div className="spinner spinner-sm spinner-white" /> Signing in…</>
            ) : (
              isAdmin ? <><Crown size={16} /> Sign In as Admin</> : <><BookOpen size={16} /> Sign In as Student</>
            )}
          </button>
        </form>

        <div style={{ margin: '1.25rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ height: 1, flex: 1, background: 'var(--border)' }} />
            or continue with
            <span style={{ height: 1, flex: 1, background: 'var(--border)' }} />
          </div>
          <GoogleAuthButton onCredential={handleGoogleCredential} disabled={loading} />
        </div>

        {/* Register link — students and admins */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don&apos;t have an {isAdmin ? 'admin' : 'student'} account?{' '}
          <Link to={`/register?role=${selectedRole}`} style={{ color: isAdmin ? '#D97706' : 'var(--primary)', fontWeight: 600 }}>
            Create it
          </Link>
        </p>
      </div>
    </div>
  );
}
