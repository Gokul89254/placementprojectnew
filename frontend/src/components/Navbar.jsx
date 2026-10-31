import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Briefcase, 
  UserCheck, 
  LayoutDashboard, 
  FileText, 
  Building2, 
  LogOut, 
  User, 
  PlusCircle, 
  CheckSquare,
  ShieldCheck,
  CalendarDays,
  Award,
  KeyRound
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link to={user ? (user.role === 'student' ? '/student/dashboard' : user.role === 'recruiter' ? '/recruiter/dashboard' : '/admin/dashboard') : '/'} className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-700 to-emerald-600 text-white p-2 rounded-xl shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                Place<span className="text-emerald-600">mate</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links based on Role */}
          <div className="hidden md:flex items-center space-x-1">
            {user && user.role === 'student' && (
              <>
                <Link
                  to="/student/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/student/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link
                  to="/student/jobs"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/student/jobs') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> Jobs
                </Link>
                <Link
                  to="/student/applications"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/student/applications') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" /> My Applications
                </Link>
                <Link
                  to="/student/profile"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/student/profile') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
              </>
            )}

            {user && user.role === 'recruiter' && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/recruiter/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link
                  to="/recruiter/jobs"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/recruiter/jobs') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> My Jobs
                </Link>
                <Link
                  to="/recruiter/jobs/create"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/recruiter/jobs/create') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" /> Post New Job
                </Link>
                <Link
                  to="/recruiter/company"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/recruiter/company') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Company Profile
                </Link>
                <Link
                  to="/recruiter/interviews"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/recruiter/interviews') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" /> Interviews
                </Link>
                <Link
                  to="/recruiter/placements"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/recruiter/placements') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Award className="w-4 h-4" /> Results
                </Link>
              </>
            )}

            {user && user.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Admin Stats
                </Link>
                <Link
                  to="/admin/students"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/students') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" /> Students
                </Link>
                <Link
                  to="/admin/companies"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/companies') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Companies
                </Link>
                <Link
                  to="/admin/jobs"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/jobs') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" /> Manage Jobs
                </Link>
                <Link
                  to="/admin/applications"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/applications') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Applications
                </Link>
                <Link
                  to="/admin/interviews"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/interviews') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" /> Interview oversight
                </Link>
                <Link
                  to="/admin/placements"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/placements') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Award className="w-4 h-4" /> Placement oversight
                </Link>
              </>
            )}
          </div>

          {/* User Profile Info & Action Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link
                    to="/admin/account"
                    aria-label="Admin account settings"
                    title="Admin account settings"
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/admin/account') ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700'
                    }`}
                  >
                    <KeyRound className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                  </Link>
                )}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">{user.name}</span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-blue-600">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
