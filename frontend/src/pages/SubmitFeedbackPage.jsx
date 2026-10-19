import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, BookOpen } from 'lucide-react';
import { StarInput } from '../components/Stars';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

export default function SubmitFeedbackPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [form, setForm] = useState({
    overallRating: 0,
    teachingQuality: 0,
    difficulty: 0,
    learningResources: 0,
    workload: 0,
    review: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/courses?limit=100&sort=title')
      .then(({ data }) => setCourses(data.courses))
      .catch(console.error)
      .finally(() => setLoadingCourses(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCourse) { setError('Please select a course.'); return; }
    if (form.overallRating === 0) { setError('Please provide an overall rating.'); return; }
    if (form.review.trim().length < 20) { setError('Review must be at least 20 characters.'); return; }

    setLoading(true);
    try {
      await api.post('/feedback', {
        courseId: selectedCourse,
        overallRating: form.overallRating,
        teachingQuality: form.teachingQuality || null,
        difficulty: form.difficulty || null,
        learningResources: form.learningResources || null,
        workload: form.workload || null,
        review: form.review.trim(),
      });
      toast.success('Feedback submitted successfully!');
      navigate('/feedback/my');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit feedback.';
      if (msg.includes('already submitted')) {
        setError('You have already submitted feedback for this course. Go to "My Feedback" to view it.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCourseData = courses.find((c) => c._id === selectedCourse);

  return (
    <div style={{ maxWidth: 700 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={15} /> Back
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Submit Feedback</h1>
        <p style={{ color: 'var(--text-muted)' }}>Share your experience to help peers and improve courses.</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Course selection */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color="var(--primary)" /> Select Course
          </h3>
          <div className="form-group">
            <label htmlFor="feedback-course" className="form-label">Course <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select
              id="feedback-course"
              className="form-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={!!courseId || loadingCourses}
            >
              <option value="">{loadingCourses ? 'Loading courses…' : 'Choose a course…'}</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} — {c.title}
                </option>
              ))}
            </select>
          </div>
          {selectedCourseData && (
            <div className="alert alert-info" style={{ marginTop: '0.75rem' }}>
              <strong>{selectedCourseData.instructor}</strong> · {selectedCourseData.department}
            </div>
          )}
        </div>

        {/* Ratings */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Ratings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <StarInput
              label="Overall Rating *"
              value={form.overallRating}
              onChange={(v) => setForm({ ...form, overallRating: v })}
            />
            <div className="divider" style={{ margin: '0' }} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Optional detailed ratings:
            </p>
            <div className="grid-cols-2">
              <StarInput label="Teaching Quality" value={form.teachingQuality} onChange={(v) => setForm({ ...form, teachingQuality: v })} />
              <StarInput label="Course Difficulty" value={form.difficulty} onChange={(v) => setForm({ ...form, difficulty: v })} />
              <StarInput label="Learning Resources" value={form.learningResources} onChange={(v) => setForm({ ...form, learningResources: v })} />
              <StarInput label="Workload" value={form.workload} onChange={(v) => setForm({ ...form, workload: v })} />
            </div>
          </div>
        </div>

        {/* Written review */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Written Review</h3>
          <div className="form-group">
            <label htmlFor="feedback-review" className="form-label">
              Your review <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="feedback-review"
              className="form-textarea"
              style={{ minHeight: 150 }}
              placeholder="Share your experience with this course — what you learned, how it was taught, and any advice for future students…"
              value={form.review}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
              maxLength={2000}
            />
            <div className="form-hint" style={{ textAlign: 'right' }}>
              {form.review.length}/2000 · min. 20 characters
            </div>
          </div>
        </div>

        <button
          id="feedback-submit-btn"
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading}
        >
          {loading ? (
            <><div className="spinner spinner-sm spinner-white" /> Submitting…</>
          ) : (
            <><Send size={16} /> Submit Feedback</>
          )}
        </button>
      </form>
    </div>
  );
}
