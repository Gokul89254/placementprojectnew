import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, ShieldCheck, CheckCircle2, ArrowRight, Award, FileSpreadsheet, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Automated College Placement Ecosystem
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Digitize & Streamline College Placements
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              A unified full-stack platform for Students, Corporate Recruiters, and Placement Cells. Check job eligibility in real-time, apply with one click, and manage shortlisting seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                Register Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 shadow-sm transition-all"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Role Feature Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Student Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">For Students</h3>
            <ul className="space-y-3 text-slate-600 text-sm mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Build academic profile & skill tags</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Real-time server-side eligibility check</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>One-click job application & status tracking</span>
              </li>
            </ul>
          </div>

          {/* Recruiter Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">For Recruiters</h3>
            <ul className="space-y-3 text-slate-600 text-sm mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Post job opportunities & minimum criteria</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Filter applicants by CGPA, department & skills</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Shortlist & select candidates efficiently</span>
              </li>
            </ul>
          </div>

          {/* Admin Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Placement Cell / Admin</h3>
            <ul className="space-y-3 text-slate-600 text-sm mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Monitor overall placement drive analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Manage companies & approve job postings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Comprehensive placement statistics & reporting</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Placemate — Student Placement Management System (React, Node.js, Express, MySQL)</p>
      </footer>
    </div>
  );
};

export default LandingPage;
