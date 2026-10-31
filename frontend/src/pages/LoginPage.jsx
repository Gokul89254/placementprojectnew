import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  FileCheck2,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

const features = [
  { title: 'Discover job opportunities', icon: BriefcaseBusiness },
  { title: 'Track your applications', icon: FileCheck2 },
  { title: 'Connect with recruiters', icon: Users }
];

const DEMO_SEED_PASSWORD = 'Password123';

const demoAccounts = [
  {
    role: 'Student',
    icon: GraduationCap,
    email: import.meta.env.VITE_DEMO_STUDENT_EMAIL || 'student@example.com',
    password: import.meta.env.VITE_DEMO_STUDENT_PASSWORD || DEMO_SEED_PASSWORD,
    styles: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300',
    selectedStyles: 'border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-200'
  },
  {
    role: 'Recruiter',
    icon: BriefcaseBusiness,
    email: import.meta.env.VITE_DEMO_RECRUITER_EMAIL || 'recruiter@example.com',
    password: import.meta.env.VITE_DEMO_RECRUITER_PASSWORD || DEMO_SEED_PASSWORD,
    styles: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300',
    selectedStyles: 'border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200'
  },
  {
    role: 'Admin',
    icon: ShieldCheck,
    email: import.meta.env.VITE_DEMO_ADMIN_EMAIL,
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD,
    styles: 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300',
    selectedStyles: 'border-violet-500 bg-violet-100 text-violet-800 ring-2 ring-violet-200'
  }
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedDemo, setSelectedDemo] = useState('');
  const [demoMessage, setDemoMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (requestError) {
      console.error('Login error details:', requestError);
      setError(requestError.response?.data?.message || requestError.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectDemo = ({ role, email: demoEmail, password: demoPassword }) => {
    setSelectedDemo(role);
    setError('');
    if (!demoEmail || !demoPassword) {
      setDemoMessage('Admin demo sign-in is unavailable. Enter your admin credentials above.');
      return;
    }

    setEmail(demoEmail);
    setPassword(demoPassword);
    setDemoMessage(`${role} demo credentials are filled in. Review them, then select Sign in.`);
  };

  const inputClass = 'block h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <AuthShell
      title="Welcome Back!"
      subtitle="Your journey towards a successful career starts here."
      features={features}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h1>
        <p className="mt-1.5 text-sm text-slate-500">Enter your credentials to continue.</p>
      </div>

      {error && (
        <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div><p className="font-bold">Unable to sign in</p><p className="mt-0.5 leading-5">{error}</p></div>
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">Password</label>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter your password"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(value => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-2.5 rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
          {!submitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="whitespace-nowrap text-[10px] font-bold tracking-[0.12em] text-slate-400">OR TRY A DEMO ACCOUNT</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {demoAccounts.map(account => {
          const Icon = account.icon;
          const isSelected = selectedDemo === account.role;
          return (
            <button
              key={account.role}
              type="button"
              onClick={() => selectDemo(account)}
              aria-pressed={isSelected}
              className={`flex min-h-12 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                isSelected ? account.selectedStyles : account.styles
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{account.role}</span>
            </button>
          );
        })}
      </div>
      {demoMessage && (
        <p role="status" className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
          {demoMessage}
        </p>
      )}
      <p className="mt-5 text-center text-sm text-slate-500">
        New to Placemate?{' '}
        <Link to="/register" className="font-semibold text-blue-700 transition hover:text-blue-900">Create an account</Link>
      </p>
    </AuthShell>
  );
};

export default LoginPage;
