const SEAT_STYLES = {
  available: 'border-success-500 bg-white text-navy-700 hover:-translate-y-0.5 hover:bg-success-50 hover:shadow-sm',
  selected: 'border-accent-600 bg-accent-600 text-white shadow-md',
  mine: 'border-accent-600 bg-accent-100 text-accent-800 cursor-not-allowed',
  held: 'border-warning-500 bg-warning-100 text-warning-700 cursor-not-allowed',
  booked: 'border-navy-300 bg-navy-300 text-navy-600 cursor-not-allowed',
};

const STATUS_LABELS = {
  available: 'Available',
  selected: 'Selected',
  mine: 'Yours',
  held: 'Held by someone else',
  booked: 'Booked',
};

const SEAT_LEGEND = [
  { key: 'available', label: 'Available', swatch: 'border-success-500 bg-white' },
  { key: 'selected', label: 'Selected', swatch: 'border-accent-600 bg-accent-600' },
  { key: 'mine', label: 'Yours', swatch: 'border-accent-600 bg-accent-100' },
  { key: 'held', label: 'Held', swatch: 'border-warning-500 bg-warning-100' },
  { key: 'booked', label: 'Booked', swatch: 'border-navy-300 bg-navy-300' },
];

function groupByRow(seats) {
  const rows = new Map();
  seats.forEach((seat) => {
    if (!rows.has(seat.row_label)) rows.set(seat.row_label, []);
    rows.get(seat.row_label).push(seat);
  });
  return [...rows.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([row, rowSeats]) => ({
      row,
      seats: [...rowSeats].sort((a, b) => a.seat_number - b.seat_number),
    }));
}

// seats come straight from get_seat_map: seat_id, row_label, seat_number, status, is_mine
export default function SeatGrid({ seats, selectedIds, onToggle }) {
  const rows = groupByRow(seats);

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="mx-auto h-2 w-3/4 rounded-full bg-gradient-to-r from-navy-200 via-navy-400 to-navy-200" />
        <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-navy-500">Stage</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex min-w-max flex-col items-center gap-2.5">
          {rows.map(({ row, seats: rowSeats }) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-6 text-center text-xs font-semibold text-navy-500">{row}</span>
              <div className="flex gap-2">
                {rowSeats.map((seat) => {
                  const isSelected = selectedIds.has(seat.seat_id);
                  let state = seat.status;
                  if (seat.is_mine) state = 'mine';
                  if (isSelected) state = 'selected';
                  const selectable = seat.status === 'available';
                  const label = `${seat.row_label}${seat.seat_number}`;
                  return (
                    <button
                      key={seat.seat_id}
                      type="button"
                      disabled={!selectable && !isSelected}
                      onClick={() => onToggle(seat)}
                      aria-pressed={isSelected}
                      aria-label={`Seat ${label}, ${STATUS_LABELS[state]}`}
                      title={`${label} - ${STATUS_LABELS[state]}`}
                      className={`relative flex h-8 w-8 items-center justify-center rounded-t-lg rounded-b-sm border-2 text-[10px] font-semibold transition duration-200 sm:h-9 sm:w-9 ${SEAT_STYLES[state]} disabled:opacity-100`}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SeatLegend() {
  return (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-navy-600">
      {SEAT_LEGEND.map((item) => (
        <li key={item.key} className="flex items-center gap-2">
          <span className={`h-4 w-4 rounded-t-md rounded-b-sm border-2 ${item.swatch}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
