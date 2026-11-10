import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

const VARIANTS = {
  error: { Icon: AlertCircle, classes: 'border-danger-100 bg-danger-50 text-danger-700' },
  warning: { Icon: TriangleAlert, classes: 'border-warning-300 bg-warning-50 text-warning-700' },
  success: { Icon: CheckCircle2, classes: 'border-success-100 bg-success-50 text-success-700' },
  info: { Icon: Info, classes: 'border-accent-200 bg-accent-50 text-accent-800' },
};

export default function InlineAlert({ variant = 'info', title, children }) {
  const { Icon, classes } = VARIANTS[variant];
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${classes}`}>
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <div className="space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
