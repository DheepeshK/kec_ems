import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthLayout } from './components/layout/AuthLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrganizationsPage } from './pages/admin/OrganizationsPage';
import { StudentsPage } from './pages/admin/StudentsPage';
import { EventsListPage } from './pages/events/EventsListPage';
import { EventFormPage } from './pages/events/EventFormPage';
import { ApprovalsPage } from './pages/events/ApprovalsPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { LandingPage } from './pages/public/LandingPage';
import { PublicEventsPage } from './pages/public/PublicEventsPage';
import { PublicEventDetailPage } from './pages/public/PublicEventDetailPage';
import { PublicOrganizationsPage } from './pages/public/PublicOrganizationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/events" element={<PublicEventsPage />} />
              <Route path="/events/:id" element={<PublicEventDetailPage />} />
              <Route path="/organizations" element={<PublicOrganizationsPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />

            <Route element={<AuthLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/admin/organizations"
                element={
                  <ProtectedRoute roles={['super_admin', 'club_admin']}>
                    <OrganizationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute roles={['super_admin']}>
                    <StudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/manage"
                element={
                  <ProtectedRoute roles={['super_admin', 'club_admin', 'faculty']}>
                    <EventsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/manage/new"
                element={
                  <ProtectedRoute roles={['super_admin', 'club_admin', 'faculty']}>
                    <EventFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/manage/:id"
                element={
                  <ProtectedRoute roles={['super_admin', 'club_admin', 'faculty']}>
                    <EventFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/approvals"
                element={
                  <ProtectedRoute roles={['super_admin', 'club_admin']}>
                    <ApprovalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance/:sessionId"
                element={
                  <ProtectedRoute roles={['super_admin', 'club_admin', 'faculty', 'volunteer']}>
                    <AttendancePage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
