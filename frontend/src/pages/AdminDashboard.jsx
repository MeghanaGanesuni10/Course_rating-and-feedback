import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, Star, MessageSquare, TrendingUp, ArrowRight, Crown,
  BarChart3, PieChart, Activity, Layers
} from 'lucide-react';
import { StarDisplay } from '../components/Stars';
import api from '../lib/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/recent-feedback?limit=5'),
    ])
      .then(([analyticsRes, feedbackRes]) => {
        setData(analyticsRes.data);
        setRecentFeedback(feedbackRes.data.feedback);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  const { stats, ratingDistribution, topCourses, recentUsers } = data;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <Crown size={22} color="var(--warning)" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin Dashboard</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Platform overview with real data from MongoDB Atlas.</p>
      </div>

      {/* Stats */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        {[
          { icon: Users, label: 'Total Students', value: stats.totalStudents, color: 'var(--primary)', bg: 'var(--primary-50)' },
          { icon: BookOpen, label: 'Total Courses', value: stats.totalCourses, color: '#10B981', bg: '#F0FDF4' },
          { icon: MessageSquare, label: 'Total Reviews', value: stats.totalFeedback, color: '#F59E0B', bg: '#FFFBEB' },
          { icon: Star, label: 'Avg Platform Rating', value: stats.avgRating || '—', color: '#EF4444', bg: '#FEF2F2' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <Crown size={22} color="#D97706" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalAdmins || 0}</div>
            <div className="stat-label">Admin Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EDE9FE' }}>
            <Layers size={22} color="#7C3AED" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalDepartments || 0}</div>
            <div className="stat-label">Departments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ECFDF5' }}>
            <Activity size={22} color="#10B981" />
          </div>
          <div className="stat-info">
            <div className="stat-value">
              {stats.totalCourses > 0 ? (stats.totalFeedback / stats.totalCourses).toFixed(1) : '0'}
            </div>
            <div className="stat-label">Avg Reviews/Course</div>
          </div>
        </div>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '2rem', alignItems: 'start' }}>
        {/* Rating distribution */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Rating Distribution</h3>
            <span className="badge badge-neutral">{stats.totalFeedback} reviews</span>
          </div>
          {stats.totalFeedback === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No reviews yet.</p>
          ) : (
            [5, 4, 3, 2, 1].map((star) => {
              const item = ratingDistribution.find((r) => r._id === star);
              const count = item?.count || 0;
              const pct = stats.totalFeedback ? Math.round((count / stats.totalFeedback) * 100) : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, width: 24, textAlign: 'right' }}>{star}★</span>
                  <div style={{ flex: 1, height: 10, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: star >= 4 ? 'var(--success)' : star === 3 ? 'var(--warning)' : 'var(--danger)', borderRadius: 99, transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', width: 52, textAlign: 'right' }}>{count} ({pct}%)</span>
                </div>
              );
            })
          )}
        </div>

        {/* Top courses */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Top Rated Courses</h3>
            <Link to="/admin/courses" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
              Manage <ArrowRight size={13} />
            </Link>
          </div>
          {topCourses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No courses yet.</p>
          ) : (
            topCourses.map((c, i) => (
              <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: i < topCourses.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ width: 24, height: 24, background: i < 3 ? 'var(--warning)' : 'var(--primary-50)', color: i < 3 ? '#fff' : 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.courseCode} · {c.reviewCount} reviews</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9375rem' }}>
                  {c.averageRating ? c.averageRating.toFixed(1) : '—'}★
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        <Link to="/admin/courses" className="card card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={20} color="#10B981" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem' }}>Manage Courses</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats.totalCourses} courses</p>
          </div>
          <ArrowRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
        </Link>

        <Link to="/admin/users" className="card card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem' }}>Manage Users</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats.totalStudents + (stats.totalAdmins || 0)} users</p>
          </div>
          <ArrowRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
        </Link>

        <Link to="/admin/feedback" className="card card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} color="#F59E0B" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem' }}>Manage Feedback</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats.totalFeedback} reviews</p>
          </div>
          <ArrowRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
        </Link>
      </div>

      {/* Recent feedback */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3>Recent Feedback</h3>
          <Link to="/admin/feedback" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {recentFeedback.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No feedback submitted yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Rating</th>
                  <th>Review (excerpt)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentFeedback.map((fb) => (
                  <tr key={fb._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fb.student?.name}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-50)', padding: '0.15rem 0.5rem', borderRadius: 99, marginRight: '0.5rem' }}>
                        {fb.course?.courseCode}
                      </span>
                      {fb.course?.title}
                    </td>
                    <td><StarDisplay rating={fb.overallRating} size="sm" /></td>
                    <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fb.review}
                    </td>
                    <td>{new Date(fb.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
