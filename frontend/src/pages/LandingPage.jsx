import { Link } from 'react-router-dom';
import { GraduationCap, Star, BookOpen, Users, Shield, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Course Directory', desc: 'Browse all available courses, search by name, code or department, and see aggregate ratings at a glance.' },
  { icon: Star, title: 'Honest Reviews', desc: 'Submit detailed feedback covering teaching quality, difficulty, resources and overall experience.' },
  { icon: TrendingUp, title: 'Rating Analytics', desc: 'Administrators get real-time charts of rating distributions, top-rated courses and feedback trends.' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT authentication, bcrypt password hashing, and role-based access keep your data safe.' },
  { icon: Users, title: 'Student Focused', desc: 'Built for CSE students to make informed choices and provide constructive academic feedback.' },
  { icon: CheckCircle, title: 'Verified Reviews', desc: 'Only registered students can submit feedback; one review per course prevents spam.' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff' }}>CourseRate</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" className="btn btn-ghost" style={{ color: '#94A3B8' }}>Log In</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        {/* Decorative blurs */}
        <div className="auth-bg-blur" style={{ width: 500, height: 500, background: '#4F46E5', top: -100, left: -100 }} />
        <div className="auth-bg-blur" style={{ width: 400, height: 400, background: '#7C3AED', bottom: -50, right: -50 }} />

        <div className="landing-hero-badge">
          <Star size={13} />
          Course Feedback &amp; Rating Portal
        </div>

        <h1>Rate Courses.<br />Shape Education.</h1>

        <p>
          CourseRate empowers students to share genuine feedback on courses and instructors — 
          helping peers make better academic decisions and administrators improve course quality.
        </p>

        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg" id="hero-register-btn">
            Create Account <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.07)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.15)' }}>
            Log In
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="landing-stats">
        <div className="landing-stat">
          <div className="landing-stat-value">10+</div>
          <div className="landing-stat-label">Sample Courses</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-value">5★</div>
          <div className="landing-stat-label">Rating System</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-value">100%</div>
          <div className="landing-stat-label">Real Data — MongoDB Atlas</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-value">JWT</div>
          <div className="landing-stat-label">Secure Authentication</div>
        </div>
      </div>

      {/* Features */}
      <section className="landing-features">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: '2rem' }}>Everything you need</h2>
          <p style={{ color: '#64748B', marginTop: '0.5rem' }}>
            A complete feedback ecosystem for academic institutions.
          </p>
        </div>
        <div className="features-grid">
          {features.map(({ icon: Icon, title, desc }) => (
            <div className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon size={22} color="var(--primary-light)" />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 4rem', textAlign: 'center', background: 'rgba(79,70,229,0.06)' }}>
        <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem' }}>
          Ready to get started?
        </h2>
        <p style={{ color: '#94A3B8', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
          Join today, browse courses, and share your academic experience.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap size={16} color="var(--primary-light)" />
          <span>CourseRate</span>
        </div>
        <span>© {new Date().getFullYear()} CourseRate — FSD2 Mini Project. Built with MERN Stack.</span>
      </footer>
    </div>
  );
}
