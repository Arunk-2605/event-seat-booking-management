import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { bookingService } from '@/lib/bookingService';
import HeroSection from '@/components/landing/HeroSection';
import EventDashboard from '@/components/events/EventDashboard';
import LoadingState from '@/components/ui/LoadingState';

// list_events needs a signed-in user, so it is only called here.
function SignedInHome() {
  const { data, error, loading, reload } = useAsyncData(() => bookingService.listEvents());

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <EventDashboard events={data} loading={loading} error={error} onRetry={reload} />
    </div>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState message="Checking your session..." fullPage />;
  if (!user) return <HeroSection />;
  return <SignedInHome />;
}
