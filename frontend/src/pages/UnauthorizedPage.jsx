import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem', textAlign: 'center' }}>
      <ShieldOff size={64} color="var(--danger)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Access Denied</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 400 }}>
        You do not have permission to view this page. Administrator access is required.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link to="/dashboard" className="btn btn-secondary">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <Link to="/" className="btn btn-primary">
          Home
        </Link>
      </div>
    </div>
  );
}
