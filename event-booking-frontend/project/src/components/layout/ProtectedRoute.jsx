import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/ui/LoadingState';

export default function ProtectedRoute({ children, requireOrganizer = false }) {
  const { user, loading, roleLoading, isOrganizer } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Checking your session..." fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireOrganizer && roleLoading) {
    return <LoadingState message="Checking your permissions..." fullPage />;
  }

  if (requireOrganizer && !isOrganizer) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-100 text-warning-700">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-bold text-navy-900">Organizers only</h1>
        <p className="text-sm leading-relaxed text-navy-600">
          Your account does not have organizer access, so this page is not available.
        </p>
        <Link to="/" className="btn-primary mt-2">Back to events</Link>
      </div>
    );
  }

  return children;
}
