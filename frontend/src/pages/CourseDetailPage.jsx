import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, User, Clock, Star, MessageSquare, ChevronRight } from 'lucide-react';
import { StarDisplay } from '../components/Stars';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [myFeedbackExists, setMyFeedbackExists] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/feedback/course/${id}?page=${page}&limit=5`),
      api.get('/feedback/mine'),
    ])
      .then(([courseRes, feedbackRes, myRes]) => {
        setCourse(courseRes.data.course);
        setFeedback(feedbackRes.data.feedback);
        setPagination(feedbackRes.data.pagination);
        setMyFeedbackExists(myRes.data.feedback.some((f) => f.course?._id === id));
      })
      .catch((err) => {
        if (err.response?.status === 404) navigate('/courses');
      })
      .finally(() => setLoading(false));
  }, [id, page]);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /><p>Loading course…</p></div>;
  if (!course) return null;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedback.filter((f) => f.overallRating === star).length,
    pct: feedback.length ? Math.round((feedback.filter((f) => f.overallRating === star).length / feedback.length) * 100) : 0,
  }));

  return (
    <div>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={15} /> Back
      </button>

      {/* Header card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-50)', padding: '0.25rem 0.75rem', borderRadius: 99 }}>
                {course.courseCode}
              </span>
              {course.semester && (
                <span className="badge badge-neutral">{course.semester}</span>
              )}
            </div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '0.75rem' }}>{course.title}</h1>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <User size={14} /> {course.instructor}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <BookOpen size={14} /> {course.department}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <Clock size={14} /> {course.credits} Credits
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{course.description}</p>
          </div>

          {/* Rating summary */}
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--primary-50)', borderRadius: 16, minWidth: 140 }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
              {course.averageRating ? course.averageRating.toFixed(1) : '—'}
            </div>
            <StarDisplay rating={course.averageRating || 0} size="sm" />
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {course.reviewCount} review{course.reviewCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {myFeedbackExists ? (
            <div className="alert alert-success" style={{ flex: 1 }}>
              ✅ You have already submitted feedback for this course.{' '}
              <Link to="/feedback/my" style={{ color: 'inherit', textDecoration: 'underline' }}>View it here.</Link>
            </div>
          ) : (
            <Link
              to={`/feedback/submit/${id}`}
              id="submit-feedback-btn"
              className="btn btn-primary"
            >
              <MessageSquare size={15} /> Submit Feedback
            </Link>
          )}
        </div>
      </div>

      <div className="grid-cols-2" style={{ alignItems: 'start' }}>
        {/* Rating breakdown */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Rating Breakdown</h3>
          {feedback.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No reviews yet.</p>
          ) : (
            ratingBreakdown.map(({ star, count, pct }) => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', width: 20, textAlign: 'right' }}>{star}★</span>
                <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--warning)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', width: 30 }}>{count}</span>
              </div>
            ))
          )}
        </div>

        {/* Course info */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Course Details</h3>
          {[
            { label: 'Course Code', value: course.courseCode },
            { label: 'Department', value: course.department },
            { label: 'Instructor', value: course.instructor },
            { label: 'Credits', value: `${course.credits} Credits` },
            { label: 'Semester', value: course.semester || 'Not specified' },
            { label: 'Total Reviews', value: course.reviewCount },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          Student Reviews ({pagination.total || 0})
        </h2>

        {feedback.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={40} className="empty-icon" />
            <h4 className="empty-title">No reviews yet</h4>
            <p className="empty-description">Be the first to review this course!</p>
            {!myFeedbackExists && (
              <Link to={`/feedback/submit/${id}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Write a Review
              </Link>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {feedback.map((fb) => (
                <div key={fb._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8125rem', fontWeight: 700 }}>
                        {fb.student?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{fb.student?.name || 'Anonymous'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(fb.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <StarDisplay rating={fb.overallRating} size="sm" />
                  </div>
                  <p style={{ lineHeight: 1.7, fontSize: '0.9375rem' }}>{fb.review}</p>

                  {(fb.teachingQuality || fb.difficulty || fb.learningResources || fb.workload) && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {fb.teachingQuality && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teaching: {fb.teachingQuality}★</span>}
                      {fb.difficulty && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Difficulty: {fb.difficulty}★</span>}
                      {fb.learningResources && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resources: {fb.learningResources}★</span>}
                      {fb.workload && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workload: {fb.workload}★</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage(page + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
