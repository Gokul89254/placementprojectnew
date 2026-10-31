import React from 'react';
import { ArrowUpRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthShell = ({ children, formSize = 'max-w-[440px]', title, subtitle, features = [] }) => (
  <div className="min-h-[calc(100vh-7rem)] bg-slate-50 p-3 sm:p-5 lg:p-7">
    <div className="mx-auto grid min-h-[min(820px,calc(100vh-9rem))] max-w-[1240px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.3)] lg:grid-cols-[0.88fr_1.12fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 px-9 py-10 text-white lg:flex lg:flex-col xl:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-10 top-40 h-44 w-44 rounded-full border border-white/10" />

        <Link to="/" className="relative z-10 inline-flex w-fit items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">Place<span className="text-emerald-300">mate</span></span>
        </Link>

        <div className="relative z-10 my-auto max-w-md py-10">
          <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-emerald-200 shadow-lg shadow-blue-950/15">
            <GraduationCap className="h-14 w-14" strokeWidth={1.4} />
          </div>
          <h1 className="max-w-sm text-4xl font-bold leading-tight tracking-tight">{title}</h1>
          <p className="mt-4 max-w-sm text-base leading-7 text-blue-100/90">{subtitle}</p>

          <ul className="mt-9 space-y-4">
            {features.map(({ title: featureTitle, icon: Icon }) => (
              <li key={featureTitle} className="flex items-center gap-3 text-sm font-medium text-blue-50">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-emerald-200">
                  <Icon className="h-4 w-4" />
                </span>
                {featureTitle}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-blue-100/70">
          <span>Helping you take your next career step</span>
          <ArrowUpRight className="h-4 w-4 text-emerald-300" />
        </div>
      </aside>

      <section className="flex min-w-0 flex-col justify-center px-5 py-7 sm:px-10 sm:py-10 lg:px-12 xl:px-16">
        <Link to="/" className="mb-7 flex items-center justify-center gap-2.5 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">Place<span className="text-emerald-600">mate</span></span>
        </Link>
        <div className={`mx-auto w-full ${formSize}`}>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            {children}
          </section>
          <p className="mt-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} Placemate · Student Placement Management</p>
        </div>
      </section>
    </div>
  </div>
);

export default AuthShell;
