import { Loader2, Lock, Ticket, X } from 'lucide-react';
import { seatLabel } from '@/lib/formatters';

export default function BookingSummary({
  selectedSeats,
  onRemove,
  onHold,
  holding,
  maxSeats,
  holdMinutes,
  disabledReason,
}) {
  const hasSeats = selectedSeats.length > 0;
  const disabled = !hasSeats || holding || Boolean(disabledReason);

  return (
    <aside className="card p-6 lg:sticky lg:top-24">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy-900">Your selection</h2>
        <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
          {selectedSeats.length}{maxSeats ? ` of ${maxSeats}` : ''} {selectedSeats.length === 1 ? 'seat' : 'seats'}
        </span>
      </div>

      {hasSeats ? (
        <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {selectedSeats.map((seat) => (
            <li key={seat.seat_id} className="flex items-center justify-between rounded-xl bg-navy-50 px-3 py-2.5 text-sm">
              <span className="flex items-center gap-2 font-medium text-navy-800">
                <Ticket className="h-4 w-4 text-accent-600" aria-hidden="true" />
                Seat {seatLabel(seat)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(seat)}
                disabled={holding}
                className="rounded-md p-1 text-navy-400 transition hover:bg-white hover:text-danger-700 disabled:opacity-50"
                aria-label={`Remove seat ${seatLabel(seat)}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-navy-200 px-4 py-8 text-center text-sm text-navy-500">
          Select available seats on the map.
        </div>
      )}

      <button type="button" onClick={onHold} disabled={disabled} className="btn-accent mt-5 w-full">
        {holding ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
        {holding ? 'Holding seats...' : 'Hold seats'}
      </button>
      {disabledReason && <p className="mt-3 text-center text-xs text-warning-700">{disabledReason}</p>}
      <p className="mt-3 text-center text-xs text-navy-500">
        {holdMinutes
          ? `Held seats are reserved for ${holdMinutes} ${holdMinutes === 1 ? 'minute' : 'minutes'} while you confirm.`
          : 'Held seats are reserved for a short time while you confirm.'}
      </p>
    </aside>
  );
}
