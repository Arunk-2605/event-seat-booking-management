import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...', fullPage = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 text-navy-600 ${
        fullPage ? 'min-h-[60vh]' : 'py-16'
      }`}
    >
      <Loader2 className="h-8 w-8 animate-spin text-accent-600" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
