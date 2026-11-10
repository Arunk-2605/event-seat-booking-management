import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import InlineAlert from '@/components/ui/InlineAlert';

const EMPTY_FORM = {
  name: '',
  venue: '',
  description: '',
  startsAt: '',
  gridRows: '',
  seatsPerRow: '',
};

// These checks only give quick feedback. create_event checks everything again.
function validateForm(form) {
  if (!form.name.trim()) return 'Please give your event a name.';
  if (!form.venue.trim()) return 'Please enter the venue.';
  if (!form.startsAt) return 'Please choose a date and time.';
  if (new Date(form.startsAt) <= new Date()) return 'The event date must be in the future.';
  const rows = Number(form.gridRows);
  if (!Number.isInteger(rows) || rows < 1 || rows > 26) return 'Rows must be a whole number from 1 to 26.';
  const perRow = Number(form.seatsPerRow);
  if (!Number.isInteger(perRow) || perRow < 1 || perRow > 50) return 'Seats per row must be a whole number from 1 to 50.';
  return null;
}

export default function CreateEventModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleClose = () => {
    if (submitting) return;
    setForm(EMPTY_FORM);
    setError(null);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        name: form.name.trim(),
        venue: form.venue.trim(),
        description: form.description.trim(),
        startsAt: new Date(form.startsAt).toISOString(),
        gridRows: Number(form.gridRows),
        seatsPerRow: Number(form.seatsPerRow),
      });
      setForm(EMPTY_FORM);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalSeats = Number(form.gridRows) * Number(form.seatsPerRow);

  return (
    <Modal open={open} title="Create a new event" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <InlineAlert variant="error">{error}</InlineAlert>}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-navy-700">Event name</span>
          <input className="input-field" value={form.name} onChange={updateField('name')} placeholder="Summer Concert" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-navy-700">Venue</span>
          <input className="input-field" value={form.venue} onChange={updateField('venue')} placeholder="Grand Hall" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-navy-700">Description (optional)</span>
          <textarea className="input-field" rows={3} value={form.description} onChange={updateField('description')} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-navy-700">Date and time</span>
          <input type="datetime-local" className="input-field" value={form.startsAt} onChange={updateField('startsAt')} />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-navy-700">Rows (1-26)</span>
            <input type="number" min="1" max="26" step="1" className="input-field" value={form.gridRows} onChange={updateField('gridRows')} placeholder="9" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-navy-700">Seats per row (1-50)</span>
            <input type="number" min="1" max="50" step="1" className="input-field" value={form.seatsPerRow} onChange={updateField('seatsPerRow')} placeholder="20" />
          </label>
        </div>
        {totalSeats > 0 && <p className="text-sm text-navy-600">This creates {totalSeats} seats.</p>}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleClose} disabled={submitting} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-accent">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            {submitting ? 'Creating...' : 'Create event'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
