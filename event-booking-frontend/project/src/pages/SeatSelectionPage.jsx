import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, RotateCcw } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { bookingService } from '@/lib/bookingService';
import { formatEventDate, formatEventTime } from '@/lib/formatters';
import SeatGrid, { SeatLegend } from '@/components/events/SeatGrid';
import BookingSummary from '@/components/events/BookingSummary';
import InlineAlert from '@/components/ui/InlineAlert';
import LoadingState from '@/components/ui/LoadingState';

// After these errors the seat map on screen is out of date, so we reload it.
const RELOAD_ON = ['SEATS_TAKEN', 'ACTIVE_HOLD_EXISTS', 'EVENT_NOT_BOOKABLE', 'INVALID_SEATS'];

export default function SeatSelectionPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { data, error, loading, reload } = useAsyncData(async () => {
    const [event, seats] = await Promise.all([
      bookingService.getEvent(eventId),
      bookingService.getSeatMap(eventId),
    ]);
    return { event, seats };
  }, [eventId]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [holding, setHolding] = useState(false);
  const [actionError, setActionError] = useState(null);

  if (loading && !data) return <LoadingState message="Loading seat map..." />;

  if (error) {
    const notFound = error.hint === 'NOT_FOUND';
    return (
      <PageShell>
        <InlineAlert variant={notFound ? 'warning' : 'error'} title={notFound ? 'Event not found' : 'We could not load this seat map'}>
          {error.message || 'Please check your connection and try again.'}
        </InlineAlert>
        <div className="mt-4 flex gap-3">
          {!notFound && (
            <button type="button" onClick={reload} className="btn-secondary">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          )}
          <Link to="/" className="btn-secondary">Back to events</Link>
        </div>
      </PageShell>
    );
  }

  const { event, seats } = data;
  const maxSeats = event.max_seats_per_booking;
  const holdMinutes = event.hold_duration_seconds ? Math.round(event.hold_duration_seconds / 60) : null;
  const availableCount = seats.filter((seat) => seat.status === 'available').length;

  // Only keep selected seats that are still available after a refresh.
  const selectedSeats = seats.filter((seat) => selectedIds.has(seat.seat_id) && seat.status === 'available');

  let disabledReason = null;
  if (event.my_hold_booking_id) disabledReason = 'Confirm or cancel your current hold first.';
  else if (!event.is_bookable) disabledReason = 'This event is not open for booking.';

  const toggleSeat = (seat) => {
    setActionError(null);
    if (!selectedIds.has(seat.seat_id)) {
      if (seat.status !== 'available') return;
      if (maxSeats && selectedSeats.length >= maxSeats) {
        setActionError(`You can select at most ${maxSeats} seats.`);
        return;
      }
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seat.seat_id)) next.delete(seat.seat_id);
      else next.add(seat.seat_id);
      return next;
    });
  };

  const handleHold = async () => {
    setHolding(true);
    setActionError(null);
    try {
      // The database decides if these seats are free. Nothing is checked only in the browser.
      const summary = await bookingService.holdSeats(eventId, selectedSeats.map((seat) => seat.seat_id));
      navigate(`/bookings/${summary.booking_id}/confirm`, { state: { summary } });
    } catch (err) {
      setActionError(err.message);
      if (RELOAD_ON.includes(err.hint)) {
        setSelectedIds(new Set());
        reload();
      }
      setHolding(false);
    }
  };

  return (
    <PageShell>
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-navy-600 transition hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to events
      </Link>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">Choose your seats</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy-900">{event.name}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-navy-600">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-accent-600" aria-hidden="true" />
              {formatEventDate(event.starts_at)} &middot; {formatEventTime(event.starts_at)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent-600" aria-hidden="true" />
              {event.venue}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="rounded-full bg-success-100 px-4 py-2 text-sm font-semibold text-success-700">
            {availableCount} seats available
          </span>
          <button type="button" onClick={reload} disabled={loading} className="btn-secondary !px-3.5 !py-2">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </header>

      {event.my_hold_booking_id && (
        <div className="mt-6">
          <InlineAlert variant="info" title="You already have seats on hold for this event">
            <Link to={`/bookings/${event.my_hold_booking_id}/confirm`} className="font-semibold underline underline-offset-4">
              Go to your hold to confirm or cancel it
            </Link>
          </InlineAlert>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="card p-5 sm:p-8">
          <SeatGrid seats={seats} selectedIds={selectedIds} onToggle={toggleSeat} />
          <div className="mt-8 border-t border-navy-100 pt-6">
            <SeatLegend />
          </div>
        </section>

        <div className="space-y-4">
          {actionError && <InlineAlert variant="error" title="Action not completed">{actionError}</InlineAlert>}
          <BookingSummary
            selectedSeats={selectedSeats}
            onRemove={toggleSeat}
            onHold={handleHold}
            holding={holding}
            maxSeats={maxSeats}
            holdMinutes={holdMinutes}
            disabledReason={disabledReason}
          />
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ children }) {
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">{children}</div>;
}
