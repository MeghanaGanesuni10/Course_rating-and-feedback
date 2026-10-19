import { useState, useEffect } from 'react';
import { Users, Search, Crown, UserMinus, Trash2, X, Check, Shield, ChevronDown, BookOpen, MessageSquare, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (roleFilter) params.set('role', roleFilter);
    if (search) params.set('search', search);

    api.get(`/admin/users?${params}`)
      .then(({ data }) => { setUsers(data.users); setPagination(data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handlePromote = async (userId, userName) => {
    setActionLoading(userId);
    try {
      await api.patch(`/admin/users/${userId}/promote`);
      toast.success(`${userName} promoted to admin.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Promotion failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async (userId, userName) => {
    setActionLoading(userId);
    try {
      await api.patch(`/admin/users/${userId}/demote`);
      toast.success(`${userName} demoted to student.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Demotion failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully.');
      setDeleteConfirmId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const isSelf = (userId) => userId === currentUser?._id;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <Users size={22} color="var(--primary)" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>User Management</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          {pagination.total || 0} registered users · Manage roles and accounts
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              id="user-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, or student ID…"
              aria-label="Search users"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          <select
            className="form-select"
            style={{ width: 160 }}
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            aria-label="Filter by role"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>

          <button id="user-search-btn" type="submit" className="btn btn-primary">
            <Search size={15} /> Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="empty-icon" />
          <h3 className="empty-title">No users found</h3>
          <p className="empty-description">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Student ID</th>
                  <th>Role</th>
                  <th>Reviews</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const initials = u.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: u.role === 'admin' ? '#D97706' : 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                              {u.name}
                              {isSelf(u._id) && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', marginLeft: '0.375rem' }}>(You)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        {u.studentId ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: 99 }}>
                            {u.studentId}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>
                          {u.role === 'admin' ? '⚡ Admin' : '🎓 Student'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <MessageSquare size={13} color="var(--text-muted)" />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.feedbackCount || 0}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        {deleteConfirmId === u._id ? (
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}
                              disabled={actionLoading === u._id} title="Confirm delete">
                              {actionLoading === u._id ? <div className="spinner spinner-sm" /> : <Check size={13} />}
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirmId(null)} title="Cancel">
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            {u.role === 'student' ? (
                              <button className="btn btn-sm" onClick={() => handlePromote(u._id, u.name)}
                                disabled={actionLoading === u._id}
                                title="Promote to admin"
                                style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', fontSize: '0.75rem' }}>
                                <Crown size={12} /> Promote
                              </button>
                            ) : !isSelf(u._id) && (
                              <button className="btn btn-secondary btn-sm" onClick={() => handleDemote(u._id, u.name)}
                                disabled={actionLoading === u._id}
                                title="Demote to student" style={{ fontSize: '0.75rem' }}>
                                <UserMinus size={12} /> Demote
                              </button>
                            )}
                            {!isSelf(u._id) && (
                              <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirmId(u._id)}
                                title="Delete user" style={{ fontSize: '0.75rem' }}>
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
