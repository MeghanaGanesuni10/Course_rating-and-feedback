import { useState, useEffect } from 'react';
import { MessageSquare, Search, Trash2, X, Check, Star, Eye, Filter, ChevronRight } from 'lucide-react';
import { StarDisplay } from '../components/Stars';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

export default function AdminFeedbackPage() {
  const toast = useToast();
  const [feedback, setFeedback] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('-createdAt');
  const [ratingFilter, setRatingFilter] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchFeedback = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15, sort });
    if (ratingFilter) {
      params.set('minRating', ratingFilter);
      params.set('maxRating', ratingFilter);
    }

    api.get(`/admin/all-feedback?${params}`)
      .then(({ data }) => { setFeedback(data.feedback); setPagination(data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeedback(); }, [page, sort, ratingFilter]);

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await api.delete(`/admin/feedback/${id}`);
      toast.success('Feedback deleted successfully.');
      setDeleteConfirmId(null);
      fetchFeedback();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <MessageSquare size={22} color="var(--success)" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Feedback Management</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          {pagination.total || 0} total reviews · View and moderate all feedback
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 180 }}
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            aria-label="Filter by rating"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select
            className="form-select"
            style={{ width: 180 }}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            aria-label="Sort by"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-overallRating">Highest Rating</option>
            <option value="overallRating">Lowest Rating</option>
          </select>

          {ratingFilter && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setRatingFilter(''); setPage(1); }}>
              <X size={14} /> Clear
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing {feedback.length} of {pagination.total || 0}
          </div>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : feedback.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={48} className="empty-icon" />
          <h3 className="empty-title">No feedback found</h3>
          <p className="empty-description">No reviews match your current filters.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {feedback.map((fb) => {
              const studentInitials = fb.student?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
              const isExpanded = expandedId === fb._id;

              return (
                <div key={fb._id} className="card" style={{ padding: '1.25rem', transition: 'all 0.2s ease' }}>
                  {/* Main row */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {/* Student avatar */}
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'var(--primary)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                      color: '#fff', flexShrink: 0,
                    }}>
                      {studentInitials}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                            {fb.student?.name || 'Unknown Student'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {fb.student?.email}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <StarDisplay rating={fb.overallRating} size="sm" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fb.overallRating}/5</span>
                        </div>
                      </div>

                      {/* Course info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)',
                          background: 'var(--primary-50)', padding: '0.15rem 0.5rem', borderRadius: 99,
                        }}>
                          {fb.course?.courseCode}
                        </span>
                        <span style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{fb.course?.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          · {new Date(fb.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Review excerpt / full */}
                      <p style={{
                        fontSize: '0.875rem', color: 'var(--text-secondary)',
                        marginTop: '0.625rem', lineHeight: 1.65,
                        ...(!isExpanded && {
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }),
                      }}>
                        {fb.review}
                      </p>

                      {/* Expanded details */}
                      {isExpanded && (fb.teachingQuality || fb.difficulty || fb.learningResources || fb.workload) && (
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                          {fb.teachingQuality && (
                            <span style={{ fontSize: '0.75rem', background: '#F0FDF4', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: 6, fontWeight: 500 }}>
                              Teaching: {fb.teachingQuality}★
                            </span>
                          )}
                          {fb.difficulty && (
                            <span style={{ fontSize: '0.75rem', background: '#FFFBEB', color: '#92400E', padding: '0.25rem 0.5rem', borderRadius: 6, fontWeight: 500 }}>
                              Difficulty: {fb.difficulty}★
                            </span>
                          )}
                          {fb.learningResources && (
                            <span style={{ fontSize: '0.75rem', background: '#EFF6FF', color: '#1E40AF', padding: '0.25rem 0.5rem', borderRadius: 6, fontWeight: 500 }}>
                              Resources: {fb.learningResources}★
                            </span>
                          )}
                          {fb.workload && (
                            <span style={{ fontSize: '0.75rem', background: '#FEF2F2', color: '#991B1B', padding: '0.25rem 0.5rem', borderRadius: 6, fontWeight: 500 }}>
                              Workload: {fb.workload}★
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions row */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setExpandedId(isExpanded ? null : fb._id)}
                          style={{ fontSize: '0.75rem', color: 'var(--primary)' }}
                        >
                          <Eye size={13} />
                          {isExpanded ? 'Collapse' : 'Read More'}
                        </button>

                        {deleteConfirmId === fb._id ? (
                          <div style={{ display: 'flex', gap: '0.375rem', marginLeft: 'auto' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                              Delete this review?
                            </span>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(fb._id)}
                              disabled={actionLoading === fb._id} style={{ fontSize: '0.75rem' }}>
                              {actionLoading === fb._id ? <div className="spinner spinner-sm" /> : <Check size={12} />} Yes
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirmId(null)}
                              style={{ fontSize: '0.75rem' }}>
                              <X size={12} /> No
                            </button>
                          </div>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirmId(fb._id)}
                            style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
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
  );
}
