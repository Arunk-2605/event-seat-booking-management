import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Clock, Loader2, MapPin, RotateCcw, Ticket, TicketX } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { bookingService } from '@/lib/bookingService';
import { formatEventDate, formatEventTime, seatLabel } from '@/lib/formatters';
import InlineAlert from '@/components/ui/InlineAlert';
import LoadingState from '@/components/ui/LoadingState';

function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function ConfirmBookingPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // get_my_bookings is the way to read one booking again (there is no "get one booking" function).
  const { data: booking, error, loading, reload } = useAsyncData(async () => {
    const rows = await bookingService.listMyBookings({ limit: 200 });
    return rows.find((row) => row.booking_id === bookingId) ?? null;
  }, [bookingId]);

  // hold_seats tells us seconds_remaining using the SERVER clock. We read it once,
  // then remove it from the browser history so a page refresh cannot reuse old numbers.
  const [mountedAt] = useState(() => Date.now());
  const [hintSeconds] = useState(() => {
    const summary = location.state?.summary;
    return summary?.booking_id === bookingId ? summary.seconds_remaining : null;
  });
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(null); // 'confirm' | 'cancel' | null
  const [actionError, setActionError] = useState(null);
  const [outcome, setOutcome] = useState(null); // booking summary returned by the database

  const status = outcome ? outcome.effective_status : booking?.effective_status;

  const deadline = useMemo(() => {
    if (hintSeconds != null) return mountedAt + hintSeconds * 1000;
    if (booking?.hold_expires_at) return new Date(booking.hold_expires_at).getTime();
    return null;
  }, [hintSeconds, mountedAt, booking?.hold_expires_at]);

  useEffect(() => {
    if (status !== 'held') return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const remaining = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;

  if (loading && !booking) return <LoadingState message="Loading your booking..." />;

  if (error) {
    return (
      <PageShell>
        <InlineAlert variant="error" title="We could not load this booking">{error.message}</InlineAlert>
        <button type="button" onClick={reload} className="btn-secondary mt-4">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </PageShell>
    );
  }

  if (!booking) {
    return (
      <PageShell>
        <InlineAlert variant="warning" title="Booking not found">
          This booking does not exist or does not belong to your account.
        </InlineAlert>
        <Link to="/bookings" className="btn-secondary mt-4">Go to My Bookings</Link>
      </PageShell>
    );
  }

  const handleConfirm = async () => {
    setBusy('confirm');
    setActionError(null);
    try {
      setOutcome(await bookingService.confirmBooking(bookingId));
    } catch (err) {
      setActionError(err.message);
      if (err.hint === 'HOLD_EXPIRED' || err.hint === 'INVALID_STATE' || err.hint === 'EVENT_NOT_BOOKABLE') reload();
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async () => {
    setBusy('cancel');
    setActionError(null);
    try {
      setOutcome(await bookingService.cancelBooking(bookingId));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const expired = status === 'expired' || (status === 'held' && remaining === 0);

  return (
    <PageShell>
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">Booking confirmation</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy-900">{booking.event_name}</h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-navy-600">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent-600" aria-hidden="true" />
            {formatEventDate(booking.event_starts_at)} &middot; {formatEventTime(booking.event_starts_at)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent-600" aria-hidden="true" />
            {booking.event_venue}
          </span>
        </div>
      </header>

      <section className="card mt-8 space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-500">Seats</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {booking.seats.map((seat) => (
              <span key={seat.seat_id} className="flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-1.5 text-sm font-semibold text-accent-700">
                <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                {seatLabel(seat)}
              </span>
            ))}
          </div>
        </div>

        {status === 'confirmed' && (
          <>
            <InlineAlert variant="success" title="Booking confirmed">
              Your seats are booked. You can see this booking any time under My Bookings.
            </InlineAlert>
            <Link to="/bookings" className="btn-primary w-full sm:w-auto">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Go to My Bookings
            </Link>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <InlineAlert variant="info" title="Booking cancelled">Your seats have been released.</InlineAlert>
            <Link to="/" className="btn-secondary w-full sm:w-auto">Back to events</Link>
          </>
        )}

        {status === 'held' && !expired && (
          <>
            <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${remaining <= 30 ? 'bg-danger-50 text-danger-700' : 'bg-warning-50 text-warning-700'}`}>
              <Clock className="h-5 w-5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">Time left to confirm</p>
                <p className="text-2xl font-bold tabular-nums" role="timer" aria-live="off">{formatCountdown(remaining)}</p>
              </div>
            </div>
            {actionError && <InlineAlert variant="error" title="Action not completed">{actionError}</InlineAlert>}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={handleConfirm} disabled={busy !== null} className="btn-accent">
                {busy === 'confirm' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                {busy === 'confirm' ? 'Confirming...' : 'Confirm booking'}
              </button>
              <button type="button" onClick={handleCancel} disabled={busy !== null} className="btn-danger">
                {busy === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <TicketX className="h-4 w-4" aria-hidden="true" />}
                {busy === 'cancel' ? 'Cancelling...' : 'Cancel hold'}
              </button>
            </div>
          </>
        )}

        {expired && (
          <>
            <InlineAlert variant="warning" title="This hold has expired">
              The time ran out, so these seats were released. Please choose your seats again.
            </InlineAlert>
            {actionError && <InlineAlert variant="error">{actionError}</InlineAlert>}
            <Link to={`/events/${booking.event_id}/seats`} className="btn-primary w-full sm:w-auto">Choose seats again</Link>
          </>
        )}
      </section>
    </PageShell>
  );
}

function PageShell({ children }) {
  return <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:py-12">{children}</div>;
}
