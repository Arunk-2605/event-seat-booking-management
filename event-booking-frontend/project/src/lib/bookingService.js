import { supabase } from '@/lib/supabaseClient';

// Thrown when the .env file is missing (no Supabase client could be created).
export class NotConnectedError extends Error {
  constructor() {
    super('The app is not connected to Supabase. Add your URL and anon key to the .env file.');
    this.name = 'NotConnectedError';
  }
}

// Thrown when the database rejects a request.
//   message = human readable text from the database
//   hint    = machine code, e.g. SEATS_TAKEN, HOLD_EXPIRED, NOT_ORGANIZER
//   code    = PostgreSQL error code
export class BookingError extends Error {
  constructor(message, { code, hint, details } = {}) {
    super(message || 'The request could not be completed.');
    this.name = 'BookingError';
    this.code = code ?? null;
    this.hint = hint ?? null;
    this.details = details ?? null;
  }
}

async function callRpc(functionName, params) {
  if (!supabase) throw new NotConnectedError();
  const { data, error } = await supabase.rpc(functionName, params);
  if (error) {
    throw new BookingError(error.message, {
      code: error.code,
      hint: error.hint,
      details: error.details,
    });
  }
  return data;
}

// Every function name and parameter name below comes from
// 003_booking_functions_corrected.sql. The database makes every booking
// decision; this file only sends requests and returns the answers.
export const bookingService = {
  // list_events(p_include_past, p_include_cancelled) -> rows
  listEvents: ({ includePast = false, includeCancelled = false } = {}) =>
    callRpc('list_events', {
      p_include_past: includePast,
      p_include_cancelled: includeCancelled,
    }),

  // get_event(p_event_id) -> rows (one row), so we return the first one
  getEvent: async (eventId) => {
    const rows = await callRpc('get_event', { p_event_id: eventId });
    return rows?.[0] ?? null;
  },

  // get_seat_map(p_event_id) -> rows: seat_id, row_label, seat_number, status, is_mine, booking_id
  getSeatMap: (eventId) => callRpc('get_seat_map', { p_event_id: eventId }),

  // hold_seats(p_event_id, p_seat_ids) -> booking summary JSON
  holdSeats: (eventId, seatIds) =>
    callRpc('hold_seats', { p_event_id: eventId, p_seat_ids: seatIds }),

  // confirm_booking(p_booking_id) -> booking summary JSON
  confirmBooking: (bookingId) => callRpc('confirm_booking', { p_booking_id: bookingId }),

  // cancel_booking(p_booking_id) -> booking summary JSON
  cancelBooking: (bookingId) => callRpc('cancel_booking', { p_booking_id: bookingId }),

  // get_my_bookings(p_limit, p_offset) -> rows
  listMyBookings: ({ limit = 50, offset = 0 } = {}) =>
    callRpc('get_my_bookings', { p_limit: limit, p_offset: offset }),

  // ----- organizer only (the database checks the role) -----

  // create_event(p_name, p_venue, p_starts_at, p_grid_rows, p_seats_per_row, p_description)
  createEvent: ({ name, venue, startsAt, gridRows, seatsPerRow, description }) =>
    callRpc('create_event', {
      p_name: name,
      p_venue: venue,
      p_starts_at: startsAt,
      p_grid_rows: gridRows,
      p_seats_per_row: seatsPerRow,
      p_description: description || null,
    }),

  // cancel_event(p_event_id) -> { event_id, status, cancelled_bookings }
  cancelEvent: (eventId) => callRpc('cancel_event', { p_event_id: eventId }),

  // get_event_bookings(p_event_id, p_status) -> rows (p_status left out = all)
  listEventBookings: (eventId) => callRpc('get_event_bookings', { p_event_id: eventId }),

  // release_expired_holds() -> number of holds released
  releaseExpiredHolds: () => callRpc('release_expired_holds'),
};
