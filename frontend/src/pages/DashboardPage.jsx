import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Star, MessageSquare, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StarDisplay } from '../components/Stars';
import api from '../lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/courses?limit=6&sort=rating'),
      api.get('/feedback/mine'),
    ])
      .then(([coursesRes, feedbackRes]) => {
        setCourses(coursesRes.data.courses);
        setMyFeedback(feedbackRes.data.feedback);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Student';

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner spinner-lg" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.375rem' }}>
          👋 Welcome back, {firstName}!
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Here&apos;s your personalized academic feedback overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-50)' }}>
            <BookOpen size={22} color="var(--primary)" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{courses.length}+</div>
            <div className="stat-label">Courses Available</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F0FDF4' }}>
            <MessageSquare size={22} color="var(--success)" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{myFeedback.length}</div>
            <div className="stat-label">Reviews Submitted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFFBEB' }}>
            <Star size={22} color="var(--warning)" />
          </div>
          <div className="stat-info">
            <div className="stat-value">
              {myFeedback.length > 0
                ? (myFeedback.reduce((s, f) => s + f.overallRating, 0) / myFeedback.length).toFixed(1)
                : '—'}
            </div>
            <div className="stat-label">Avg Rating Given</div>
          </div>
        </div>
      </div>

      {/* Top courses */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Top Rated Courses</h2>
          <Link to="/courses" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>No courses yet. Seed the database to get started.</p>
          </div>
        ) : (
          <div className="grid-cols-3">
            {courses.slice(0, 3).map((c) => (
              <div
                key={c._id}
                className="card card-hover"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
                onClick={() => navigate(`/courses/${c._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/courses/${c._id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-50)', padding: '0.15rem 0.5rem', borderRadius: 99 }}>
                    {c.courseCode}
                  </span>
                  <StarDisplay rating={c.averageRating || 0} size="sm" />
                </div>
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{c.title}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{c.instructor}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {c.reviewCount} review{c.reviewCount !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My recent feedback */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>My Recent Feedback</h2>
          <Link to="/feedback/my" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {myFeedback.length === 0 ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <MessageSquare size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ marginBottom: '0.5rem' }}>No feedback yet</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              You haven&apos;t submitted any course reviews yet.
            </p>
            <Link to="/feedback/submit" className="btn btn-primary">
              Submit Your First Review
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myFeedback.slice(0, 3).map((fb) => (
              <div key={fb._id} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Star size={18} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.9375rem' }}>{fb.course?.title}</h4>
                    <StarDisplay rating={fb.overallRating} size="sm" />
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {fb.course?.courseCode} · {fb.course?.department}
                  </p>
                  <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {fb.review}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid-cols-2" style={{ marginTop: '2rem' }}>
        <Link to="/courses" className="card card-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} color="var(--primary)" />
          </div>
          <div>
            <h4>Browse Courses</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Explore the course directory</p>
          </div>
          <ArrowRight size={18} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
        </Link>

        <Link to="/feedback/submit" className="card card-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} color="var(--success)" />
          </div>
          <div>
            <h4>Submit Feedback</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Rate a course you have taken</p>
          </div>
          <ArrowRight size={18} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
        </Link>
      </div>
    </div>
  );
}
