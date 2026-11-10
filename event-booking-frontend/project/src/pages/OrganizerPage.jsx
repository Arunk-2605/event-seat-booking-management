import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarRange, Loader2, Ticket } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { bookingService } from '@/lib/bookingService';
import CreateEventModal from '@/components/organizer/CreateEventModal';
import { EventBookingsPanel, EventsTable } from '@/components/organizer/OrganizerPanels';
import InlineAlert from '@/components/ui/InlineAlert';
import LoadingState from '@/components/ui/LoadingState';
import Modal from '@/components/ui/Modal';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">{label}</p>
        <p className="text-2xl font-bold text-navy-900">{value}</p>
      </div>
    </div>
  );
}

export default function OrganizerPage() {
  // Past and cancelled events are included so the organizer sees everything.
  const eventsState = useAsyncData(() =>
    bookingService.listEvents({ includePast: true, includeCancelled: true })
  );
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [releasing, setReleasing] = useState(false);
  const [notice, setNotice] = useState(null);

  const selectedId = selectedEvent?.id ?? null;
  const bookingsState = useAsyncData(async () => {
    if (!selectedId) return null;
    return bookingService.listEventBookings(selectedId);
  }, [selectedId]);

  const handleCreate = async (input) => {
    await bookingService.createEvent(input);
    setNotice({ variant: 'success', text: `"${input.name}" has been created.` });
    eventsState.reload();
  };

  const handleCancelEvent = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const result = await bookingService.cancelEvent(eventToCancel.id);
      setNotice({
        variant: 'success',
        text: `"${eventToCancel.name}" was cancelled. ${result.cancelled_bookings} booking(s) were cancelled.`,
      });
      setEventToCancel(null);
      eventsState.reload();
      if (selectedId === eventToCancel.id) bookingsState.reload();
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleReleaseHolds = async () => {
    setReleasing(true);
    setNotice(null);
    try {
      const count = await bookingService.releaseExpiredHolds();
      setNotice({ variant: 'success', text: `${count} expired hold(s) released.` });
      eventsState.reload();
    } catch (err) {
      setNotice({ variant: 'error', text: err.message });
    } finally {
      setReleasing(false);
    }
  };

  const events = eventsState.data ?? [];
  const totalSeats = events.reduce((sum, event) => sum + (event.total_seats ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">Organizer</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy-900">Organizer dashboard</h1>
          <p className="mt-2 text-sm text-navy-600">Create events and keep track of who has booked seats.</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 self-start text-sm font-medium text-navy-600 transition hover:text-navy-900 sm:self-auto">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Public events
        </Link>
      </header>

      {notice && (
        <div className="mt-6">
          <InlineAlert variant={notice.variant}>{notice.text}</InlineAlert>
        </div>
      )}

      {eventsState.loading && !eventsState.data && <LoadingState message="Loading events..." />}

      {eventsState.error && !eventsState.loading && (
        <div className="mt-8 space-y-4">
          <InlineAlert variant="error" title="We could not load events">{eventsState.error.message}</InlineAlert>
          <button type="button" onClick={eventsState.reload} className="btn-secondary">Try again</button>
        </div>
      )}

      {eventsState.data && !eventsState.error && (
        <div className="mt-8 space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={CalendarRange} label="Events" value={events.length} />
            <StatCard icon={Ticket} label="Total seats" value={totalSeats} />
            <StatCard icon={Ticket} label="Viewing bookings for" value={selectedEvent ? selectedEvent.name : 'None selected'} />
          </div>

          <EventsTable
            events={events}
            selectedEventId={selectedId}
            onSelect={setSelectedEvent}
            onCreate={() => setCreateOpen(true)}
            onCancelEvent={(event) => setEventToCancel(event)}
            onReleaseHolds={handleReleaseHolds}
            releasing={releasing}
          />

          <EventBookingsPanel
            event={selectedEvent}
            bookings={bookingsState.data}
            loading={bookingsState.loading}
            error={bookingsState.error}
            onRetry={bookingsState.reload}
          />
        </div>
      )}

      <CreateEventModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />

      <Modal
        open={Boolean(eventToCancel)}
        title="Cancel this event?"
        onClose={() => {
          if (cancelling) return;
          setEventToCancel(null);
          setCancelError(null);
        }}
      >
        {eventToCancel && (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-navy-600">
              <span className="font-semibold text-navy-900">{eventToCancel.name}</span> will be cancelled and every
              booking and hold for it will be cancelled too. This cannot be undone.
            </p>
            {cancelError && <InlineAlert variant="error">{cancelError}</InlineAlert>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { setEventToCancel(null); setCancelError(null); }} disabled={cancelling} className="btn-secondary">
                Keep event
              </button>
              <button type="button" onClick={handleCancelEvent} disabled={cancelling} className="btn-danger !bg-danger-700 !text-white hover:!bg-danger-500">
                {cancelling && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {cancelling ? 'Cancelling...' : 'Yes, cancel event'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
