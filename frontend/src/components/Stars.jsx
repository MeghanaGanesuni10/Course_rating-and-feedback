import { Star } from 'lucide-react';

export function StarDisplay({ rating, size = 'default' }) {
  const filled = Math.round(rating);
  const fontSize = size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem';

  return (
    <div className="stars" title={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`star ${i <= filled ? 'filled' : ''}`}
          style={{ fontSize }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function StarInput({ value, onChange, label }) {
  return (
    <div>
      {label && <div className="form-label" style={{ marginBottom: '0.375rem' }}>{label}</div>}
      <div className="stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`star interactive ${i <= value ? 'filled' : ''}`}
            style={{ fontSize: '1.5rem' }}
            onClick={() => onChange(i)}
            role="button"
            aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onChange(i)}
          >
            ★
          </span>
        ))}
        {value > 0 && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}
