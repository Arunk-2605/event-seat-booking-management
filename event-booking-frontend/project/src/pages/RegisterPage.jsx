import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Lock, Mail, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthShell from '@/components/auth/AuthShell';
import InlineAlert from '@/components/ui/InlineAlert';
import LoadingState from '@/components/ui/LoadingState';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  if (loading) return <LoadingState message="Checking your session..." fullPage />;
  if (user) return <Navigate to="/" replace />;

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Please enter your full name.';
    if (!form.email.trim()) return 'Please enter your email address.';
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      return `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (form.password !== form.confirmPassword) return 'The passwords do not match.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { needsConfirmation } = await signUp({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      if (needsConfirmation) {
        setConfirmationSent(true);
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSent) {
    return (
      <AuthShell title="Check your inbox" subtitle="Your account was created. Confirm your email to start booking.">
        <div className="space-y-5">
          <InlineAlert variant="success">
            We have sent a confirmation link to <span className="font-semibold">{form.email.trim()}</span>.
          </InlineAlert>
          <Link to="/login" className="btn-primary w-full !py-3">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Go to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  const fields = [
    { key: 'fullName', label: 'Full name', type: 'text', icon: UserRound, autoComplete: 'name', placeholder: 'Alex Morgan' },
    { key: 'email', label: 'Email address', type: 'email', icon: Mail, autoComplete: 'email', placeholder: 'you@example.com' },
    { key: 'password', label: 'Password', type: 'password', icon: Lock, autoComplete: 'new-password', placeholder: `At least ${MIN_PASSWORD_LENGTH} characters` },
    { key: 'confirmPassword', label: 'Confirm password', type: 'password', icon: Lock, autoComplete: 'new-password', placeholder: 'Repeat your password' },
  ];

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join to reserve seats, track your bookings and manage your own events."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-white underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <InlineAlert variant="error">{error}</InlineAlert>}

        {fields.map(({ key, label, type, icon: Icon, autoComplete, placeholder }) => (
          <label key={key} className="block space-y-1.5">
            <span className="text-sm font-medium text-navy-700">{label}</span>
            <span className="relative block">
              <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <input
                type={type}
                autoComplete={autoComplete}
                value={form[key]}
                onChange={updateField(key)}
                placeholder={placeholder}
                className="input-field pl-10"
                required
              />
            </span>
          </label>
        ))}

        <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
