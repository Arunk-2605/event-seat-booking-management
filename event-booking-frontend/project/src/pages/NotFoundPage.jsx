import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-600">
        <SearchX className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold text-navy-900">We could not find that page</h1>
      <p className="text-sm leading-relaxed text-navy-600">The link may be out of date, or the page may have moved.</p>
      <Link to="/" className="btn-primary mt-2">Back to events</Link>
    </div>
  );
}
