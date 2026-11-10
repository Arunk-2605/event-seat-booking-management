import { Outlet } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import InlineAlert from '@/components/ui/InlineAlert';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {!isSupabaseConfigured && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <InlineAlert variant="error" title="Supabase is not configured">
            Create a <code>.env</code> file with <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code>, then restart <code>npm run dev</code>.
          </InlineAlert>
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-navy-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-navy-500 sm:flex-row sm:px-6 lg:px-8">
          <span className="flex items-center gap-2 font-medium text-navy-700">
            <Ticket className="h-4 w-4 text-accent-600" aria-hidden="true" />
            Event Seat Booking System
          </span>
          <span>Reserve your seat with confidence.</span>
        </div>
      </footer>
    </div>
  );
}
