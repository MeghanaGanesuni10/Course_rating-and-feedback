import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--primary)', opacity: 0.15, lineHeight: 1, marginBottom: '1rem' }}>404</div>
      <AlertTriangle size={56} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 400 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} /> Back to Home
      </Link>
    </div>
  );
}
