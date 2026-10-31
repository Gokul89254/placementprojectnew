import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import API from '../../services/api';
import {
  Activity,
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  GraduationCap,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Users,
  XCircle
} from 'lucide-react';
import DepartmentSummaryCards, { getDepartmentColor } from './DepartmentSummaryCards';

const DepartmentStudentChart = lazy(() => import('./DepartmentStudentChart'));

const statusStyles = {
  applied: 'border-blue-200 bg-blue-50 text-blue-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  shortlisted: 'border-violet-200 bg-violet-50 text-violet-700',
  selected: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700'
};

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [minimumCgpa, setMinimumCgpa] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/admin/applications');
      const data = response.data.data;
      setApplications(data.applications);
      setDepartments(data.departments);
      setTotalStudents(data.total_students);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load application records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const statistics = useMemo(() => applications.reduce((counts, application) => {
    const status = (application.status || '').toLowerCase();
    if (status === 'applied' || status === 'pending') counts.pending += 1;
    if (status === 'shortlisted') counts.shortlisted += 1;
    if (status === 'selected') counts.selected += 1;
    if (status === 'rejected') counts.rejected += 1;
    return counts;
  }, { pending: 0, shortlisted: 0, selected: 0, rejected: 0 }), [applications]);

  const filteredApps = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications.filter(application => {
      const matchesDepartment = !selectedDepartment || application.department === selectedDepartment;
      const matchesSearch = !query
        || [application.student_name, application.student_email, application.company_name, application.job_title, application.department]
          .some(value => String(value || '').toLowerCase().includes(query));
      const status = (application.status || '').toLowerCase();
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'pending' && (status === 'applied' || status === 'pending'))
        || status === statusFilter;
      const cgpa = Number(application.cgpa);
      const matchesCgpa = minimumCgpa === '' || (Number.isFinite(cgpa) && cgpa >= Number(minimumCgpa));
      return matchesDepartment && matchesSearch && matchesStatus && matchesCgpa;
    });
  }, [applications, selectedDepartment, search, statusFilter, minimumCgpa]);

  const chartData = useMemo(() => departments.map((department, index) => ({
    ...department,
    fill: getDepartmentColor(index)
  })), [departments]);

  const selectDepartmentFromChart = (event) => {
    const department = event?.activePayload?.[0]?.payload?.department
      || event?.payload?.department
      || event?.department;
    if (department) setSelectedDepartment(department);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedDepartment(null);
    setStatusFilter('all');
    setMinimumCgpa('');
  };

  const statCards = [
    { title: 'Total applications', value: applications.length, icon: FileText, color: 'blue', filter: 'all', caption: 'Across all recruitment drives' },
    { title: 'Pending applications', value: statistics.pending, icon: Clock3, color: 'amber', filter: 'pending', caption: 'Awaiting recruiter review' },
    { title: 'Shortlisted', value: statistics.shortlisted, icon: Award, color: 'violet', filter: 'shortlisted', caption: 'Moving forward in process' },
    { title: 'Selected', value: statistics.selected, icon: CheckCircle2, color: 'emerald', filter: 'selected', caption: 'Successful applications' },
    { title: 'Rejected', value: statistics.rejected, icon: XCircle, color: 'red', filter: 'rejected', caption: 'Closed applications' }
  ];
  const statColors = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    red: 'bg-red-50 text-red-700 ring-red-100'
  };

  const activeFilters = Boolean(search.trim() || selectedDepartment || statusFilter !== 'all' || minimumCgpa !== '');

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-[#f5f7fc] to-blue-50/40">
      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm shadow-slate-200/50 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 sm:flex">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Recruitment operations</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Application Management</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor, review, and manage student applications across departments and recruitment drives.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total applications</p>
              <p className="text-xl font-extrabold leading-6 text-slate-900">
                {loading ? <span className="inline-block h-5 w-12 animate-pulse rounded bg-blue-100 align-middle" /> : applications.length.toLocaleString()}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <button type="button" onClick={fetchApplications} className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-white px-3.5 py-2 font-semibold transition hover:bg-red-100">
              <RotateCcw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        <section aria-label="Application statistics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map(({ title, value, icon: Icon, color, filter, caption }) => (
            <button
              key={title}
              type="button"
              onClick={() => setStatusFilter(filter)}
              aria-pressed={statusFilter === filter}
              className={`group rounded-2xl border bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                statusFilter === filter ? 'border-blue-300 ring-2 ring-blue-500/20' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${statColors[color]}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <Activity className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
              </div>
              <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                {loading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-slate-100" /> : Number(value).toLocaleString()}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700">{title}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{caption}</p>
            </button>
          ))}
        </section>

        <section aria-labelledby="department-summary-title" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                <h2 id="department-summary-title" className="text-lg font-extrabold text-slate-900">Department Summary</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">Registered student distribution · choose a department to focus the application list.</p>
            </div>
            {selectedDepartment && (
              <button type="button" onClick={() => setSelectedDepartment(null)} className="text-sm font-bold text-blue-700 transition hover:text-blue-900">
                Clear department selection
              </button>
            )}
          </div>
          <DepartmentSummaryCards
            departments={departments}
            totalStudents={totalStudents}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={setSelectedDepartment}
            loading={loading}
            compact
            emptyMessage="Department analytics will appear when students register."
          />
        </section>

        <Suspense fallback={<div className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />}>
          <DepartmentStudentChart
            chartData={chartData}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={selectDepartmentFromChart}
            chartType="dashboard"
          />
        </Suspense>

        <section aria-labelledby="application-directory-title" className="space-y-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Application directory</p>
                <h2 id="application-directory-title" className="mt-1 text-xl font-extrabold text-slate-900">
                  {selectedDepartment ? `${selectedDepartment} Applications` : 'All Applications'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing <span className="font-bold text-slate-800">{filteredApps.length.toLocaleString()}</span> of {applications.length.toLocaleString()} applications
                  {selectedDepartment ? ` · ${departments.find(item => item.department === selectedDepartment)?.percentage || 0}% of registered students` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!activeFilters}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
              >
                <RotateCcw className="h-4 w-4" /> Reset filters
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_minmax(180px,1fr)_minmax(150px,.8fr)_minmax(180px,1fr)]">
              <label className="relative block">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search student, company, role..."
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="relative">
                <Filter className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <select
                  value={selectedDepartment || ''}
                  onChange={event => setSelectedDepartment(event.target.value || null)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  aria-label="Filter by department"
                >
                  <option value="">All departments</option>
                  {departments.map(item => <option key={item.department} value={item.department}>{item.department}</option>)}
                </select>
                <SlidersHorizontal className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
              </label>
              <label className="relative">
                <Award className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Min CGPA"
                  value={minimumCgpa}
                  onChange={event => setMinimumCgpa(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  aria-label="Minimum CGPA"
                />
              </label>
              <label className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={event => setStatusFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  aria-label="Filter by application status"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
                <SlidersHorizontal className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
              </label>
            </div>
            {activeFilters && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">Active filters:</span>
                {selectedDepartment && <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">{selectedDepartment}</span>}
                {statusFilter !== 'all' && <span className="rounded-full bg-violet-50 px-2.5 py-1 font-semibold capitalize text-violet-700">{statusFilter}</span>}
                {minimumCgpa !== '' && <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">CGPA ≥ {minimumCgpa}</span>}
                {search.trim() && <span className="max-w-48 truncate rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">“{search.trim()}”</span>}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Building2 className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-bold text-slate-900">Applications</p>
                  <p className="text-xs text-slate-500">Latest submissions first</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{filteredApps.length.toLocaleString()} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">CGPA</th>
                    <th className="px-5 py-4">Company</th>
                    <th className="px-5 py-4">Job role</th>
                    <th className="px-5 py-4">Applied on</th>
                    <th className="px-5 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading
                    ? Array.from({ length: 6 }, (_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 7 }, (_, cell) => <td key={cell} className="px-5 py-5"><div className="h-4 animate-pulse rounded-md bg-slate-100" /></td>)}
                      </tr>
                    ))
                    : filteredApps.map(application => {
                      const status = (application.status || '').toLowerCase();
                      const displayStatus = status === 'applied' ? 'Applied' : status || 'Pending';
                      const badgeClass = statusStyles[status] || statusStyles.pending;
                      const departmentIndex = departments.findIndex(item => item.department === application.department);
                      const departmentColor = getDepartmentColor(Math.max(departmentIndex, 0));
                      const cgpa = Number(application.cgpa);
                      return (
                        <tr key={application.application_id} className="group transition-colors hover:bg-blue-50/40">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-extrabold text-blue-800">
                                {(application.student_name || '?').split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-bold text-slate-900">{application.student_name || 'Unknown student'}</span>
                                <span className="mt-0.5 block truncate text-xs text-slate-500">{application.student_email}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex max-w-48 items-center gap-1.5 truncate rounded-full border px-2.5 py-1 text-xs font-semibold"
                              style={{ borderColor: `${departmentColor}33`, backgroundColor: `${departmentColor}0d`, color: departmentColor }}>
                              <GraduationCap className="h-3.5 w-3.5 shrink-0" />{application.department || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-extrabold tabular-nums text-slate-800">{Number.isFinite(cgpa) ? cgpa.toFixed(2) : '—'}</span>
                            {Number.isFinite(cgpa) && <span className="mt-1 block h-1 w-16 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${Math.min(Math.max(cgpa, 0), 10) * 10}%` }} /></span>}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 font-semibold text-slate-800"><Building2 className="h-4 w-4 text-slate-400" />{application.company_name || '—'}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">{application.job_title || '—'}</td>
                          <td className="px-5 py-4 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />{application.applied_at ? new Date(application.applied_at).toLocaleDateString() : '—'}</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${badgeClass}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />{displayStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  {!loading && filteredApps.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Search className="h-5 w-5" /></span>
                        <p className="mt-4 font-bold text-slate-800">{applications.length === 0 ? 'No applications yet' : 'No applications match these filters'}</p>
                        <p className="mt-1 text-sm text-slate-500">{applications.length === 0 ? 'Student applications will appear here when submitted.' : 'Adjust your search or filters to see more results.'}</p>
                        {activeFilters && <button type="button" onClick={clearFilters} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">Clear filters</button>}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminApplications;
