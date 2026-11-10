import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, LogOut, Menu, Ticket, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import InlineAlert from '@/components/ui/InlineAlert';

const NAV_LINKS = [
  { to: '/', label: 'Events', end: true },
  { to: '/bookings', label: 'My Bookings', requiresAuth: true },
  { to: '/organizer', label: 'Organizer', requiresAuth: true, organizerOnly: true },
];

function NavItem({ to, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
          isActive ? 'bg-navy-100 text-navy-900' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, userName, signOut, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signOutError, setSignOutError] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  const visibleLinks = NAV_LINKS.filter(
    (link) => (!link.requiresAuth || user) && (!link.organizerOnly || isOrganizer)
  );

  const closeMenu = () => setMenuOpen(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
      closeMenu();
      navigate('/');
    } catch (error) {
      setSignOutError(error.message);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={closeMenu}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-800 text-white">
            <Ticket className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-bold tracking-tight text-navy-900">
            Event Seat <span className="text-accent-600">Booking</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {visibleLinks.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1.5 text-sm text-navy-700">
                <UserRound className="h-4 w-4 text-accent-600" aria-hidden="true" />
                <span className="max-w-[10rem] truncate">{userName}</span>
              </span>
              <button type="button" onClick={handleSignOut} disabled={signingOut} className="btn-secondary !px-3.5 !py-2">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-4 !py-2">Sign in</Link>
              <Link to="/register" className="btn-primary !px-4 !py-2">Create account</Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-navy-700 transition hover:bg-navy-50 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-navy-100 bg-white px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {visibleLinks.map((link) => (
              <NavItem key={link.to} {...link} onClick={closeMenu} />
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <p className="flex items-center gap-2 px-1 text-sm text-navy-600">
                  <CalendarDays className="h-4 w-4 text-accent-600" aria-hidden="true" />
                  Signed in as {userName}
                </p>
                <button type="button" onClick={handleSignOut} disabled={signingOut} className="btn-secondary">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="btn-secondary">Sign in</Link>
                <Link to="/register" onClick={closeMenu} className="btn-primary">Create account</Link>
              </>
            )}
          </div>
          {signOutError && (
            <div className="mt-3">
              <InlineAlert variant="error">{signOutError}</InlineAlert>
            </div>
          )}
        </div>
      )}
      {signOutError && !menuOpen && (
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
          <InlineAlert variant="error">{signOutError}</InlineAlert>
        </div>
      )}
    </header>
  );
}
