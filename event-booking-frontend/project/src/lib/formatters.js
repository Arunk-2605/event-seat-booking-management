export function formatEventDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatEventTime(isoDate) {
  return new Date(isoDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// "A1" style label for one seat from the database fields.
export function seatLabel(seat) {
  return `${seat.row_label}${seat.seat_number}`;
}
