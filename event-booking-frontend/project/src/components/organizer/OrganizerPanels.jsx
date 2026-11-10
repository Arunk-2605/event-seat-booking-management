import { Users } from 'lucide-react';
import { formatEventDate, formatEventTime, seatLabel } from '@/lib/formatters';
import StatusPill from '@/components/events/StatusPill';
import InlineAlert from '@/components/ui/InlineAlert';
import LoadingState from '@/components/ui/LoadingState';

export function EventsTable({ events, selectedEventId, onSelect, onCreate, onCancelEvent, onReleaseHolds, releasing }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-navy-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-navy-900">Events</h2>
          <p className="text-sm text-navy-600">Select an event to review its bookings.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onReleaseHolds} disabled={releasing} className="btn-secondary">
            {releasing ? 'Releasing...' : 'Release expired holds'}
          </button>
          <button type="button" onClick={onCreate} className="btn-accent">New event</button>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-navy-600">There are no events yet. Create the first one.</p>
      ) : (
        <div className="overflow-x-auto p-2 sm:p-4">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Seats free</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {events.map((event) => {
                const selected = event.id === selectedEventId;
                return (
                  <tr key={event.id} className={`transition duration-200 ${selected ? 'bg-accent-50' : 'hover:bg-navy-50/60'}`}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-navy-900">{event.name}</p>
                      <p className="text-xs text-navy-500">{event.venue}</p>
                    </td>
                    <td className="px-4 py-4 text-navy-700">
                      {formatEventDate(event.starts_at)}
                      <span className="block text-xs text-navy-500">{formatEventTime(event.starts_at)}</span>
                    </td>
                    <td className="px-4 py-4"><StatusPill status={event.status} /></td>
                    <td className="px-4 py-4 text-navy-700">{event.available_seats} / {event.total_seats}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onSelect(event)}
                          aria-pressed={selected}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition duration-200 ${
                            selected ? 'bg-navy-800 text-white' : 'border border-navy-200 bg-white text-navy-700 hover:bg-navy-50'
                          }`}
                        >
                          {selected ? 'Viewing' : 'View bookings'}
                        </button>
                        {event.status !== 'cancelled' && (
                          <button type="button" onClick={() => onCancelEvent(event)} className="rounded-lg border border-danger-100 bg-white px-3 py-1.5 text-xs font-semibold text-danger-700 hover:bg-danger-50">
                            Cancel event
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function EventBookingsPanel({ event, bookings, loading, error, onRetry }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-navy-900">Bookings</h2>
          <p className="text-sm text-navy-600">{event ? event.name : 'Choose an event to see its bookings.'}</p>
        </div>
        {event && bookings && (
          <span className="flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-700">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
          </span>
        )}
      </div>

      {!event && (
        <div className="rounded-xl border border-dashed border-navy-200 px-4 py-10 text-center text-sm text-navy-500">
          Select an event above to review who has booked seats.
        </div>
      )}

      {event && loading && <LoadingState message="Loading bookings..." />}

      {event && !loading && error && (
        <div className="space-y-4">
          <InlineAlert variant="error" title="We could not load bookings">{error.message}</InlineAlert>
          <button type="button" onClick={onRetry} className="btn-secondary">Try again</button>
        </div>
      )}

      {event && !loading && !error && bookings?.length === 0 && (
        <p className="py-10 text-center text-sm text-navy-600">No bookings for this event yet.</p>
      )}

      {event && !loading && !error && bookings?.length > 0 && (
        <ul className="divide-y divide-navy-100">
          {bookings.map((booking) => (
            <li key={booking.booking_id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-navy-900">{booking.user_full_name || booking.user_email}</p>
                {booking.user_full_name && <p className="text-xs text-navy-500">{booking.user_email}</p>}
                <p className="mt-1 text-sm text-navy-600">
                  {booking.seat_count} {booking.seat_count === 1 ? 'seat' : 'seats'}: {booking.seats.map(seatLabel).join(', ')}
                </p>
              </div>
              <StatusPill status={booking.effective_status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
