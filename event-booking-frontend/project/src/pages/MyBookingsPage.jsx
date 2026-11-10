import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Loader2, MapPin, Ticket, TicketX } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { bookingService } from '@/lib/bookingService';
import { formatEventDate, formatEventTime, seatLabel } from '@/lib/formatters';
import StatusPill from '@/components/events/StatusPill';
import InlineAlert from '@/components/ui/InlineAlert';
import LoadingState from '@/components/ui/LoadingState';
import Modal from '@/components/ui/Modal';

export default function MyBookingsPage() {
  const { data, error, loading, reload } = useAsyncData(() => bookingService.listMyBookings({ limit: 200 }));
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [notice, setNotice] = useState(null);

  const closeCancelDialog = () => {
    if (cancelling) return;
    setBookingToCancel(null);
    setCancelError(null);
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await bookingService.cancelBooking(bookingToCancel.booking_id);
      setNotice({ variant: 'success', text: `Your booking for ${bookingToCancel.event_name} was cancelled.` });
      setBookingToCancel(null);
      reload();
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const bookings = data ?? [];
  const isHold = bookingToCancel?.effective_status === 'held';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">Your tickets</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy-900">My bookings</h1>
        <p className="mt-2 text-sm text-navy-600">Review your reservations and cancel any upcoming booking you no longer need.</p>
      </header>

      <div className="mt-8 space-y-5">
        {notice && <InlineAlert variant={notice.variant}>{notice.text}</InlineAlert>}

        {loading && !data && <LoadingState message="Loading your bookings..." />}

        {error && !loading && (
          <InlineAlert variant="error" title="We could not load your bookings">
            {error.message}
            <button type="button" onClick={reload} className="mt-2 block font-semibold underline-offset-4 hover:underline">
              Try again
            </button>
          </InlineAlert>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-500">
              <Ticket className="h-6 w-6" />
            </span>
            <h2 className="text-lg font-semibold text-navy-900">No bookings yet</h2>
            <p className="max-w-sm text-sm text-navy-600">Once you reserve seats for an event, your tickets will show up here.</p>
            <Link to="/" className="btn-primary mt-2">Browse events</Link>
          </div>
        )}

        {!error && bookings.map((booking) => (
          <BookingCard key={booking.booking_id} booking={booking} onCancel={() => setBookingToCancel(booking)} />
        ))}
      </div>

      <Modal open={Boolean(bookingToCancel)} title={isHold ? 'Cancel this hold?' : 'Cancel this booking?'} onClose={closeCancelDialog}>
        {bookingToCancel && (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-navy-600">
              Your seats for <span className="font-semibold text-navy-900">{bookingToCancel.event_name}</span> will be released.
              This action cannot be undone.
            </p>
            {cancelError && <InlineAlert variant="error">{cancelError}</InlineAlert>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeCancelDialog} disabled={cancelling} className="btn-secondary">
                Keep it
              </button>
              <button type="button" onClick={handleCancel} disabled={cancelling} className="btn-danger !bg-danger-700 !text-white hover:!bg-danger-500">
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <TicketX className="h-4 w-4" aria-hidden="true" />}
                {cancelling ? 'Cancelling...' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function BookingCard({ booking, onCancel }) {
  // Use effective_status: it already treats a timed-out hold as "expired".
  const status = booking.effective_status;
  const eventStarted = new Date(booking.event_starts_at) <= new Date();
  // These buttons are only a convenience. The database re-checks everything.
  const canConfirm = status === 'held';
  const canCancel = status === 'held' || (status === 'confirmed' && !eventStarted);

  return (
    <article className="card flex flex-col gap-5 p-5 transition duration-300 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-navy-900">{booking.event_name}</h2>
          <StatusPill status={status} />
          {booking.event_status === 'cancelled' && <StatusPill status="cancelled" />}
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-navy-600">
          <li className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent-600" aria-hidden="true" />
            {formatEventDate(booking.event_starts_at)} &middot; {formatEventTime(booking.event_starts_at)}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent-600" aria-hidden="true" />
            {booking.event_venue}
          </li>
        </ul>
        <div className="flex flex-wrap gap-2">
          {booking.seats.map((seat) => (
            <span key={seat.seat_id} className="rounded-lg bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">
              Seat {seatLabel(seat)}
            </span>
          ))}
        </div>
      </div>

      {(canConfirm || canCancel) && (
        <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
          {canConfirm && (
            <Link to={`/bookings/${booking.booking_id}/confirm`} className="btn-accent">Confirm</Link>
          )}
          {canCancel && (
            <button type="button" onClick={onCancel} className="btn-danger">
              {status === 'held' ? 'Cancel hold' : 'Cancel booking'}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
