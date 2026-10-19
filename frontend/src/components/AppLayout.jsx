import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/courses': 'Course Directory',
  '/feedback/my': 'My Feedback',
  '/feedback/submit': 'Submit Feedback',
  '/profile': 'Profile & Settings',
  '/admin': 'Admin Dashboard',
  '/admin/courses': 'Course Management',
  '/admin/users': 'User Management',
  '/admin/feedback': 'Feedback Management',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/courses/') ? 'Course Details' : 'CourseRate');

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
