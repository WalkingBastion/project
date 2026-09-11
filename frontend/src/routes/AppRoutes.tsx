import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Route-level code splitting: everything below the home page is only
// downloaded once the user actually navigates there, keeping the
// initial bundle (and first paint) small - the other half of the
// "efficient rendering model" alongside React.memo/React Query.
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const BookingsPage = lazy(() =>
  import('@/pages/BookingsPage').then((m) => ({ default: m.BookingsPage })),
);
const BookingDetailPage = lazy(() =>
  import('@/pages/BookingDetailPage').then((m) => ({ default: m.BookingDetailPage })),
);
const MyReservationsPage = lazy(() =>
  import('@/pages/MyReservationsPage').then((m) => ({ default: m.MyReservationsPage })),
);
const RecommendationsPage = lazy(() =>
  import('@/pages/RecommendationsPage').then((m) => ({ default: m.RecommendationsPage })),
);
const ManagerDashboardPage = lazy(() =>
  import('@/pages/ManagerDashboardPage').then((m) => ({ default: m.ManagerDashboardPage })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading page…" />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/bookings/:id" element={<BookingDetailPage />} />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute managerOnly>
              <ManagerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
