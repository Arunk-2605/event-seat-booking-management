import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Ticket } from 'lucide-react';
import { formatEventDate, formatEventTime } from '@/lib/formatters';

export default function EventCard({ event }) {
  const soldOut = event.available_seats === 0;
  const canBook = event.is_bookable && !soldOut;

  return (
    <article className="card flex h-full flex-col gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div>
        <h2 className="text-lg font-bold leading-snug text-navy-900">{event.name}</h2>
        {event.description && (
          <p className="mt-1 line-clamp-2 text-sm text-navy-600">{event.description}</p>
        )}
      </div>

      <ul className="space-y-2 text-sm text-navy-600">
        <li className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 flex-shrink-0 text-accent-600" aria-hidden="true" />
          {formatEventDate(event.starts_at)} &middot; {formatEventTime(event.starts_at)}
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 text-accent-600" aria-hidden="true" />
          <span className="truncate">{event.venue}</span>
        </li>
      </ul>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-navy-100 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-navy-500">Available seats</p>
          <p className={`flex items-center gap-1.5 text-lg font-bold ${soldOut ? 'text-danger-700' : 'text-navy-900'}`}>
            <Ticket className="h-4 w-4 text-success-700" aria-hidden="true" />
            {soldOut ? 'Sold out' : `${event.available_seats} of ${event.total_seats}`}
          </p>
        </div>
        {canBook ? (
          <Link to={`/events/${event.id}/seats`} className="btn-primary !px-4 !py-2.5">
            Select seats
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className="rounded-xl bg-navy-100 px-4 py-2.5 text-sm font-semibold text-navy-500">
            {soldOut ? 'Sold out' : 'Not open'}
          </span>
        )}
      </div>
    </article>
  );
}
