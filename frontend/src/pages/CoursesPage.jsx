import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import api from '../lib/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('title');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  // Fetch departments once
  useEffect(() => {
    api.get('/courses/departments')
      .then(({ data }) => setDepartments(data.departments))
      .catch(console.error);
  }, []);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12, sort });
    if (search) params.set('search', search);
    if (department) params.set('department', department);
    if (minRating) params.set('minRating', minRating);

    api.get(`/courses?${params}`)
      .then(({ data }) => {
        setCourses(data.courses);
        setPagination(data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, department, minRating, sort, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setDepartment('');
    setMinRating('');
    setSort('title');
    setPage(1);
  };

  const hasFilters = search || department || minRating || sort !== 'title';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Course Directory</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Browse {pagination.total || 0} courses, search, filter and sort.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 240 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              id="course-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search courses, codes, instructors…"
              aria-label="Search courses"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          <select
            className="form-select"
            style={{ width: 180 }}
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            aria-label="Filter by department"
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            className="form-select"
            style={{ width: 160 }}
            value={minRating}
            onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
            aria-label="Minimum rating"
          >
            <option value="">Any Rating</option>
            <option value="4">4★ &amp; above</option>
            <option value="3">3★ &amp; above</option>
            <option value="2">2★ &amp; above</option>
          </select>

          <select
            className="form-select"
            style={{ width: 160 }}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            aria-label="Sort courses"
          >
            <option value="title">A–Z Title</option>
            <option value="-title">Z–A Title</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>

          <button id="course-search-btn" type="submit" className="btn btn-primary">
            <Search size={15} /> Search
          </button>

          {hasFilters && (
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>
              <X size={15} /> Clear
            </button>
          )}
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner spinner-lg" />
          <p>Loading courses…</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <Search size={48} className="empty-icon" />
          <h3 className="empty-title">No courses found</h3>
          <p className="empty-description">
            Try adjusting your search or filters. If the database is empty, run <code>npm run seed</code> in the backend folder.
          </p>
          {hasFilters && (
            <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '1rem' }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
