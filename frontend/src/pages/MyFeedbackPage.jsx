import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Edit2, Trash2, BookOpen, X, Check } from 'lucide-react';
import { StarDisplay, StarInput } from '../components/Stars';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

export default function MyFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchFeedback = () => {
    setLoading(true);
    api.get('/feedback/mine')
      .then(({ data }) => setFeedbackList(data.feedback))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeedback(); }, []);

  const startEdit = (fb) => {
    setEditingId(fb._id);
    setEditForm({
      overallRating: fb.overallRating,
      teachingQuality: fb.teachingQuality || 0,
      difficulty: fb.difficulty || 0,
      learningResources: fb.learningResources || 0,
      workload: fb.workload || 0,
      review: fb.review,
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/feedback/${id}`, {
        ...editForm,
        teachingQuality: editForm.teachingQuality || null,
        difficulty: editForm.difficulty || null,
        learningResources: editForm.learningResources || null,
        workload: editForm.workload || null,
      });
      toast.success('Feedback updated.');
      setEditingId(null);
      fetchFeedback();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/feedback/${id}`);
      toast.success('Feedback deleted.');
      setDeletingId(null);
      fetchFeedback();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>My Feedback</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {feedbackList.length} review{feedbackList.length !== 1 ? 's' : ''} submitted
        </p>
      </div>

      {feedbackList.length === 0 ? (
        <div className="empty-state">
          <Star size={48} className="empty-icon" />
          <h3 className="empty-title">No feedback yet</h3>
          <p className="empty-description">Browse courses and submit your first review.</p>
          <Link to="/feedback/submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Submit Feedback
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {feedbackList.map((fb) => (
            <div key={fb._id} className="card" style={{ padding: '1.5rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-50)', padding: '0.15rem 0.5rem', borderRadius: 99 }}>
                      {fb.course?.courseCode}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(fb.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{fb.course?.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{fb.course?.instructor} · {fb.course?.department}</p>
                </div>
                {editingId !== fb._id && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(fb)} id={`edit-feedback-${fb._id}`}>
                      <Edit2 size={13} /> Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeletingId(fb._id)} id={`delete-feedback-${fb._id}`}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Edit mode */}
              {editingId === fb._id ? (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                    <StarInput label="Overall Rating" value={editForm.overallRating} onChange={(v) => setEditForm({ ...editForm, overallRating: v })} />
                    <div className="grid-cols-2">
                      <StarInput label="Teaching Quality" value={editForm.teachingQuality} onChange={(v) => setEditForm({ ...editForm, teachingQuality: v })} />
                      <StarInput label="Difficulty" value={editForm.difficulty} onChange={(v) => setEditForm({ ...editForm, difficulty: v })} />
                      <StarInput label="Learning Resources" value={editForm.learningResources} onChange={(v) => setEditForm({ ...editForm, learningResources: v })} />
                      <StarInput label="Workload" value={editForm.workload} onChange={(v) => setEditForm({ ...editForm, workload: v })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Review</label>
                      <textarea className="form-textarea" value={editForm.review} onChange={(e) => setEditForm({ ...editForm, review: e.target.value })} style={{ minHeight: 100 }} maxLength={2000} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(fb._id)}>
                      <Check size={13} /> Save
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <StarDisplay rating={fb.overallRating} size="sm" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{fb.overallRating}/5</span>
                  </div>
                  <p style={{ lineHeight: 1.7, fontSize: '0.9375rem' }}>{fb.review}</p>
                  {(fb.teachingQuality || fb.difficulty || fb.learningResources || fb.workload) && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {fb.teachingQuality && <span style={{ fontSize: '0.75rem', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: 6 }}>Teaching: {fb.teachingQuality}★</span>}
                      {fb.difficulty && <span style={{ fontSize: '0.75rem', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: 6 }}>Difficulty: {fb.difficulty}★</span>}
                      {fb.learningResources && <span style={{ fontSize: '0.75rem', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: 6 }}>Resources: {fb.learningResources}★</span>}
                      {fb.workload && <span style={{ fontSize: '0.75rem', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: 6 }}>Workload: {fb.workload}★</span>}
                    </div>
                  )}
                </>
              )}

              {/* Delete confirm */}
              {deletingId === fb._id && (
                <div className="alert alert-error" style={{ marginTop: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Are you sure you want to delete this review?</span>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', paddingLeft: '1rem' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(fb._id)}>Yes, Delete</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setDeletingId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
