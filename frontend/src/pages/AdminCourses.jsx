import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, BookMarked, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

const EMPTY_FORM = { title: '', courseCode: '', department: '', instructor: '', description: '', credits: 3, semester: '' };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();

  const fetchCourses = () => {
    setLoading(true);
    api.get(`/courses?page=${page}&limit=15`)
      .then(({ data }) => { setCourses(data.courses); setPagination(data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, [page]);

  const openCreate = () => { setEditCourse(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit = (c) => { setEditCourse(c); setForm({ title: c.title, courseCode: c.courseCode, department: c.department, instructor: c.instructor, description: c.description, credits: c.credits || 3, semester: c.semester || '' }); setFormError(''); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.courseCode || !form.department || !form.instructor || !form.description) {
      setFormError('All required fields must be filled.');
      return;
    }
    setFormLoading(true);
    try {
      if (editCourse) {
        await api.patch(`/courses/${editCourse._id}`, form);
        toast.success('Course updated.');
      } else {
        await api.post('/courses', form);
        toast.success('Course created.');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted.');
      setDeletingId(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const f = (id, label, key, type = 'text', required = true, extra = {}) => (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}</label>
      {type === 'textarea' ? (
        <textarea id={id} className="form-textarea" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...extra} />
      ) : (
        <input id={id} type={type} className="form-input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} {...extra} />
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Course Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>{pagination.total || 0} courses in the database</p>
        </div>
        <button id="create-course-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Course
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookMarked size={48} className="empty-icon" />
          <h3 className="empty-title">No courses yet</h3>
          <p className="empty-description">Add your first course or run the seed script.</p>
          <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: '1rem' }}>Add Course</button>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Instructor</th>
                  <th>Credits</th>
                  <th>Rating</th>
                  <th>Reviews</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-50)', padding: '0.15rem 0.5rem', borderRadius: 99, fontSize: '0.75rem' }}>
                        {c.courseCode}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                    <td>{c.department}</td>
                    <td>{c.instructor}</td>
                    <td>{c.credits}</td>
                    <td>{c.averageRating ? `${c.averageRating.toFixed(1)}★` : '—'}</td>
                    <td>{c.reviewCount}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)} id={`edit-course-${c._id}`} title="Edit course">
                          <Edit2 size={13} />
                        </button>
                        {deletingId === c._id ? (
                          <>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)} title="Confirm delete">
                              <Check size={13} />
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setDeletingId(null)} title="Cancel">
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => setDeletingId(c._id)} id={`delete-course-${c._id}`} title="Delete course">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editCourse ? 'Edit Course' : 'Add New Course'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && <div className="alert alert-error">{formError}</div>}
                <div className="grid-cols-2">
                  {f('modal-title', 'Course Title', 'title', 'text', true, { placeholder: 'Introduction to…' })}
                  {f('modal-code', 'Course Code', 'courseCode', 'text', true, { placeholder: 'CS101', style: { textTransform: 'uppercase' } })}
                </div>
                <div className="grid-cols-2">
                  {f('modal-dept', 'Department', 'department', 'text', true, { placeholder: 'Computer Science' })}
                  {f('modal-instructor', 'Instructor', 'instructor', 'text', true, { placeholder: 'Dr. Jane Smith' })}
                </div>
                {f('modal-desc', 'Description', 'description', 'textarea', true, { placeholder: 'Brief course overview…', style: { minHeight: 80 } })}
                <div className="grid-cols-2">
                  {f('modal-credits', 'Credits', 'credits', 'number', false, { min: 1, max: 6 })}
                  {f('modal-semester', 'Semester', 'semester', 'text', false, { placeholder: 'Fall 2025' })}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading} id="save-course-btn">
                  {formLoading ? <><div className="spinner spinner-sm spinner-white" /> Saving…</> : <><Save size={15} /> {editCourse ? 'Save Changes' : 'Create Course'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
