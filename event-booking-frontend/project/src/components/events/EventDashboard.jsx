import { useMemo, useState } from 'react';
import { CalendarCheck, RotateCcw, Search, SearchX } from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import InlineAlert from '@/components/ui/InlineAlert';
import LoadingState from '@/components/ui/LoadingState';

export default function EventDashboard({ events, loading, error, onRetry }) {
  const [query, setQuery] = useState('');

  const visibleEvents = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (events ?? []).filter(
      (event) =>
        !term ||
        event.name.toLowerCase().includes(term) ||
        event.venue.toLowerCase().includes(term)
    );
  }, [events, query]);

  return (
    <section id="events" className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">Event dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy-900">Upcoming events</h1>
        </div>
        <label className="relative w-full lg:max-w-sm">
          <span className="sr-only">Search events</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by event or venue"
            className="input-field pl-10"
          />
        </label>
      </div>

      {loading && !events && <LoadingState message="Loading upcoming events..." />}

      {error && !loading && (
        <div className="space-y-4">
          <InlineAlert variant="error" title="We could not load events">
            {error.message || 'Please check your connection and try again.'}
          </InlineAlert>
          <button type="button" onClick={onRetry} className="btn-secondary">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {!loading && !error && visibleEvents.length === 0 && (
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-500">
            {events?.length ? <SearchX className="h-6 w-6" /> : <CalendarCheck className="h-6 w-6" />}
          </span>
          <h2 className="text-lg font-semibold text-navy-900">
            {events?.length ? 'No events match your search' : 'No upcoming events yet'}
          </h2>
          <p className="max-w-sm text-sm text-navy-600">
            {events?.length ? 'Try a different name or venue.' : 'Check back soon for new events.'}
          </p>
        </div>
      )}

      {!error && visibleEvents.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
