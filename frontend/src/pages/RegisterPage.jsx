import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, BadgeCheck, Crown, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'student';
  const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '', confirm: '', role: initialRole });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, googleAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, studentId: form.role === 'student' ? form.studentId : '', password: form.password, role: form.role });
      toast.success('Account created! Welcome to CourseRate.');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setError('');
    setLoading(true);
    try {
      const user = await googleAuth(credential, form.role, 'register');
      toast.success(`Account ready. Welcome, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, type, icon, key, opts = {}) => (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}{opts.required && <span> *</span>}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          className="form-input"
          style={{ paddingLeft: icon ? '2.25rem' : '0.875rem' }}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          {...opts}
        />
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-bg-blur" style={{ width: 600, height: 600, background: '#4F46E5', top: -200, right: -200 }} />
      <div className="auth-bg-blur" style={{ width: 400, height: 400, background: '#0EA5E9', bottom: -100, left: -100 }} />

      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <GraduationCap size={24} color="#fff" />
          </div>
          <span className="auth-logo-text">CourseRate</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Create a student or admin account to get started.</p>

        <div role="group" aria-label="Account type" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', margin: '1rem 0 1.25rem', padding: '0.375rem', background: '#F1F5F9', borderRadius: 12 }}>
          {[
            { role: 'student', label: 'Student', Icon: BookOpen },
            { role: 'admin', label: 'Admin', Icon: Crown },
          ].map(({ role, label, Icon }) => (
            <button key={role} type="button" onClick={() => setForm({ ...form, role })} aria-pressed={form.role === role} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 600, background: form.role === role ? '#fff' : 'transparent', color: role === 'admin' && form.role === role ? '#D97706' : 'var(--primary)', boxShadow: form.role === role ? '0 2px 8px rgba(79,70,229,0.15)' : 'none' }}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <span>{error}{(error.includes('already registered') || error.includes('registered as')) && <> <Link to={`/login?role=${encodeURIComponent(error.match(/registered as (?:a )?(student|admin)/)?.[1] || form.role)}`} style={{ fontWeight: 700 }}>Sign in</Link></>}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {field('reg-name', 'Full Name', 'text', <User size={16} />, 'name', { required: true, placeholder: 'Jane Smith', autoComplete: 'name' })}
          {field('reg-email', 'Email Address', 'email', <Mail size={16} />, 'email', { required: true, placeholder: 'you@example.com', autoComplete: 'email' })}
          {form.role === 'student' && field('reg-studentid', 'Student ID (optional)', 'text', <BadgeCheck size={16} />, 'studentId', { placeholder: 'e.g. 22CS001' })}

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
              />
              <button type="button" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">Confirm Password <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-confirm"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? <><div className="spinner spinner-sm spinner-white" /> Creating account…</> : 'Create Account'}
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

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
