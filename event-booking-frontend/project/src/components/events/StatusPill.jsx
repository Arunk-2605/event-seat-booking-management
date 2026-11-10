const STATUS_STYLES = {
  confirmed: 'bg-success-100 text-success-700',
  held: 'bg-warning-100 text-warning-700',
  expired: 'bg-navy-100 text-navy-600',
  cancelled: 'bg-danger-100 text-danger-700',
  published: 'bg-success-100 text-success-700',
};

const STATUS_LABELS = {
  confirmed: 'Confirmed',
  held: 'On hold',
  expired: 'Expired',
  cancelled: 'Cancelled',
  published: 'Published',
};

export default function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? 'bg-navy-100 text-navy-700'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
