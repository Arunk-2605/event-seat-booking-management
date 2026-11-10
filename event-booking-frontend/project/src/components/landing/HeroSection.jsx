import { ShieldCheck, Ticket, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const HIGHLIGHTS = [
  { icon: Ticket, title: 'Pick your exact seat', text: 'See the full seat map and choose the seats you want.' },
  { icon: ShieldCheck, title: 'No double bookings', text: 'Seats are held for you while you confirm. Nobody else can take them.' },
  { icon: Users, title: 'Built for organizers', text: 'Create events and see who has booked from one page.' },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-accent-900" aria-hidden="true" />

      <div className="relative mx-auto max-w-4xl space-y-8 px-4 pb-16 pt-16 text-center sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
        <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
          Find your seat. <span className="text-accent-200">Book it with confidence.</span>
        </h1>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
          Sign in to browse upcoming events, pick seats on an interactive map, and manage your bookings.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/login" className="btn-accent !px-6 !py-3.5">Sign in</Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-white/10"
          >
            Register
          </Link>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-white/5">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-200">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-navy-200">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
