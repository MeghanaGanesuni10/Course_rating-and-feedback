import { useNavigate } from 'react-router-dom';
import { StarDisplay } from './Stars';
import { BookOpen, Users, ChevronRight } from 'lucide-react';

export default function CourseCard({ course, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick(course);
    else navigate(`/courses/${course._id}`);
  };

  return (
    <div className="course-card" onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`View ${course.title}`}
    >
      <div className="course-card-header">
        <span className="course-card-code">{course.courseCode}</span>
        <div
          className="badge badge-neutral"
          style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}
        >
          {course.credits || 3} Credits
        </div>
      </div>

      <div>
        <h3 className="course-card-title">{course.title}</h3>
        <div className="course-card-dept" style={{ marginTop: '0.25rem' }}>
          {course.department}
        </div>
        <div className="course-card-instructor" style={{ marginTop: '0.25rem' }}>
          👤 {course.instructor}
        </div>
      </div>

      <p className="course-card-desc">{course.description}</p>

      {course.semester && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          📅 {course.semester}
        </div>
      )}

      <div className="course-card-footer">
        <div className="course-card-rating">
          <StarDisplay rating={course.averageRating || 0} size="sm" />
          <span className="course-card-rating-value">
            {course.averageRating ? course.averageRating.toFixed(1) : '—'}
          </span>
          <span className="course-card-rating-count">
            ({course.reviewCount || 0} review{course.reviewCount !== 1 ? 's' : ''})
          </span>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
      </div>
    </div>
  );
}
