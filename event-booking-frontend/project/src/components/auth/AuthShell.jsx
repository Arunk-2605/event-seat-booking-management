import { Ticket } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-accent-900" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-navy-400/30 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-6 flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-navy-800 shadow-lift">
            <Ticket className="h-6 w-6" aria-hidden="true" />
          </span>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-lift sm:p-10">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-navy-900">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">{subtitle}</p>
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-navy-200">{footer}</div>}
      </div>
    </div>
  );
}
