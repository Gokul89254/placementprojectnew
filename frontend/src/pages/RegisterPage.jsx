import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

const features = [
  { title: 'Build your profile', icon: UserRound },
  { title: 'Explore recruitment drives', icon: BriefcaseBusiness },
  { title: 'Achieve your career goals', icon: Award }
];

const RegisterPage = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science',
    graduation_year: 2026,
    cgpa: 8.0,
    company_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await register({ ...formData, role });
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'block h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
  const selectClass = 'block h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <AuthShell
      formSize="max-w-[560px]"
      title="Start Your Career Journey"
      subtitle="Join Placemate and explore opportunities for your future."
      features={features}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-1.5 text-sm text-slate-500">Register to get started with Placemate.</p>
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div><p className="font-bold">Unable to create account</p><p className="mt-0.5 leading-5">{error}</p></div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3" role="group" aria-label="Choose account type">
        <button
          type="button"
          onClick={() => setRole('student')}
          aria-pressed={role === 'student'}
          className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
            role === 'student'
              ? 'border-blue-300 bg-blue-50/80 ring-2 ring-blue-500/15'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${role === 'student' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <GraduationCap className="h-5 w-5" />
          </span>
          <span><span className={`block text-sm font-bold ${role === 'student' ? 'text-blue-900' : 'text-slate-700'}`}>Student</span><span className="mt-0.5 block text-[11px] text-slate-500">Find your next role</span></span>
        </button>
        <button
          type="button"
          onClick={() => setRole('recruiter')}
          aria-pressed={role === 'recruiter'}
          className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
            role === 'recruiter'
              ? 'border-emerald-300 bg-emerald-50/80 ring-2 ring-emerald-500/15'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${role === 'recruiter' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <Building2 className="h-5 w-5" />
          </span>
          <span><span className={`block text-sm font-bold ${role === 'recruiter' ? 'text-emerald-900' : 'text-slate-700'}`}>Recruiter</span><span className="mt-0.5 block text-[11px] text-slate-500">Connect with talent</span></span>
        </button>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input id="register-name" type="text" name="name" autoComplete="name" required value={formData.name} onChange={handleChange} placeholder="Your full name" className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input id="register-email" type="email" name="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input id="register-password" type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password" required minLength={6} value={formData.password} onChange={handleChange} placeholder="At least 6 characters" className={`${inputClass} pr-11`} />
            <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-2.5 rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">Use at least 6 characters.</p>
        </div>

        {role === 'student' && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="register-department" className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
                <select id="register-department" name="department" value={formData.department} onChange={handleChange} className={selectClass}>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Tech</option>
                  <option value="Electronics & Comm">Electronics &amp; Comm</option>
                  <option value="Mechanical Eng">Mechanical Eng</option>
                  <option value="Civil Eng">Civil Eng</option>
                </select>
              </div>
              <div>
                <label htmlFor="register-year" className="mb-1.5 block text-sm font-medium text-slate-700">Graduation year</label>
                <input id="register-year" type="number" name="graduation_year" required value={formData.graduation_year} onChange={handleChange} className={`${selectClass} px-3`} />
              </div>
            </div>
            <div>
              <label htmlFor="register-cgpa" className="mb-1.5 block text-sm font-medium text-slate-700">CGPA <span className="font-normal text-slate-400">(0.0–10.0)</span></label>
              <div className="relative">
                <Award className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input id="register-cgpa" type="number" step="0.01" min="0" max="10" name="cgpa" required value={formData.cgpa} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </>
        )}

        {role === 'recruiter' && (
          <div>
            <label htmlFor="register-company" className="mb-1.5 block text-sm font-medium text-slate-700">Company name</label>
            <div className="relative">
              <BriefcaseBusiness className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input id="register-company" type="text" name="company_name" required value={formData.company_name} onChange={handleChange} placeholder="Your organization" className={inputClass} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : `Create ${role === 'student' ? 'student' : 'recruiter'} account`}
          {!submitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-blue-700 transition hover:text-blue-900">Sign in</Link>
      </p>
    </AuthShell>
  );
};

export default RegisterPage;
