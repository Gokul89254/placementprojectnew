import React from 'react';
import {
  Building2,
  Cog,
  Cpu,
  GraduationCap,
  Monitor,
  Radio,
  Users,
  Zap
} from 'lucide-react';

const departmentThemes = [
  { color: '#2563eb', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-700' },
  { color: '#7c3aed', light: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: 'bg-violet-100 text-violet-700' },
  { color: '#059669', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-700' },
  { color: '#ea580c', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'bg-orange-100 text-orange-700' },
  { color: '#0891b2', light: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', icon: 'bg-cyan-100 text-cyan-700' }
];

const getDepartmentIcon = (department) => {
  const normalized = department.toLowerCase();
  if (normalized.includes('computer') || normalized.includes('software')) return Monitor;
  if (normalized.includes('information technology') || normalized === 'it') return Cpu;
  if (normalized.includes('electronic') || normalized.includes('communication')) return Radio;
  if (normalized.includes('electrical')) return Zap;
  if (normalized.includes('civil')) return Building2;
  if (normalized.includes('mechanical')) return Cog;
  return GraduationCap;
};

export const getDepartmentColor = (index) => departmentThemes[index % departmentThemes.length].color;

const DepartmentSummaryCards = ({
  departments,
  totalStudents,
  selectedDepartment,
  onSelectDepartment,
  loading,
  compact = false,
  emptyMessage = 'Department analytics will appear when students register.'
}) => (
  <div className={`grid gap-3 ${compact ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'}`}>
    {loading
      ? Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={`${compact ? 'h-28' : 'h-36'} animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm`}>
          <div className="h-8 w-8 rounded-xl bg-slate-100" />
          <div className="mt-3 h-4 w-3/4 rounded bg-slate-100" />
          <div className="mt-2 h-6 w-1/2 rounded bg-slate-100" />
        </div>
      ))
      : (
        <>
          <button
            type="button"
            aria-pressed={!selectedDepartment}
            onClick={() => onSelectDepartment(null)}
            className={`group rounded-2xl border text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              compact ? 'p-4' : 'p-5'
            } ${
              !selectedDepartment ? 'border-blue-200 bg-blue-50/60 ring-2 ring-blue-600 ring-offset-1' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`inline-flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 ${compact ? 'h-8 w-8' : 'h-10 w-10'}`}>
                <Users className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">100%</span>
            </div>
            <p className={`${compact ? 'mt-3 min-h-5' : 'mt-4 min-h-10'} text-sm font-semibold leading-5 text-slate-700`}>All Departments</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">{totalStudents.toLocaleString()}</span>
              <span className="text-xs text-slate-500">students</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full rounded-full bg-slate-500" />
            </div>
          </button>
          {departments.map((item, index) => {
            const theme = departmentThemes[index % departmentThemes.length];
            const Icon = getDepartmentIcon(item.department);
            const isSelected = selectedDepartment === item.department;
            return (
              <button
                type="button"
                key={item.department}
                aria-pressed={isSelected}
                onClick={() => onSelectDepartment(isSelected ? null : item.department)}
                className={`group rounded-2xl border text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  compact ? 'p-4' : 'p-5'
                } ${
                  isSelected ? `${theme.border} ${theme.light} ring-2 ring-offset-1` : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                style={isSelected ? { '--tw-ring-color': theme.color } : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`inline-flex items-center justify-center rounded-xl ${compact ? 'h-8 w-8' : 'h-10 w-10'} ${theme.icon}`}>
                    <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${theme.light} ${theme.text}`}>
                    {item.percentage}%
                  </span>
                </div>
                <p className={`${compact ? 'mt-3 min-h-5 line-clamp-1' : 'mt-4 min-h-10 line-clamp-2'} text-sm font-semibold leading-5 text-slate-700`}>{item.department}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-slate-900">{item.student_count.toLocaleString()}</span>
                  <span className="text-xs text-slate-500">students</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.percentage}%`, backgroundColor: theme.color }} />
                </div>
              </button>
            );
          })}
          {departments.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <GraduationCap className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 font-semibold text-slate-800">No registered students yet</p>
              <p className="mt-1 text-sm text-slate-500">{emptyMessage}</p>
            </div>
          )}
        </>
      )}
  </div>
);

export default DepartmentSummaryCards;
