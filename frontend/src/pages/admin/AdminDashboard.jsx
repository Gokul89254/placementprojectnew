import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { GraduationCap, Building2, Briefcase, FileText, CheckCircle2, Award, Clock, ArrowRight, CheckSquare, CalendarDays, Search, RotateCcw, X } from 'lucide-react';

const PAGE_SIZE = 10;

const statisticCards = [
  { key: 'students', label: 'Total Students', metric: 'total_students', icon: GraduationCap, color: 'blue' },
  { key: 'companies', label: 'Total Companies', metric: 'total_companies', icon: Building2, color: 'emerald' },
  { key: 'jobs', label: 'Total Jobs', metric: 'total_jobs', icon: Briefcase, color: 'violet' },
  { key: 'applications', label: 'Total Applications', metric: 'total_applications', icon: FileText, color: 'cyan' },
  { key: 'pending-applications', label: 'Pending Applications', metric: 'pending_applications', icon: Clock, color: 'amber' },
  { key: 'shortlisted-applications', label: 'Shortlisted Applications', metric: 'total_shortlisted', icon: CheckCircle2, color: 'orange' },
  { key: 'selected-students', label: 'Selected Students', metric: 'total_selected', icon: Award, color: 'green' }
];

const tableColumns = {
  students: [
    { key: 'id', label: 'Student ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'cgpa', label: 'CGPA', render: row => Number(row.cgpa).toFixed(2) },
    { key: 'phone', label: 'Phone' },
    { key: 'user_created_at', label: 'Registration Date', date: true },
    { key: 'status', label: 'Status', render: () => 'Registered' }
  ],
  companies: [
    { key: 'id', label: 'Company ID' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'recruiter_name', label: 'Recruiter Name' },
    { key: 'recruiter_email', label: 'Email' },
    { key: 'industry', label: 'Industry', render: row => row.industry || 'Not provided' },
    { key: 'location', label: 'Location' },
    { key: 'created_at', label: 'Registration Date', date: true }
  ],
  jobs: [
    { key: 'id', label: 'Job ID' },
    { key: 'title', label: 'Job Title' },
    { key: 'company_name', label: 'Company' },
    { key: 'location', label: 'Location' },
    { key: 'expected_package', label: 'Salary', render: row => row.expected_package == null ? '—' : row.expected_package },
    { key: 'employment_type', label: 'Job Type' },
    { key: 'created_at', label: 'Posted Date', date: true },
    { key: 'status', label: 'Status' }
  ],
  applications: [
    { key: 'application_id', label: 'Application ID' },
    { key: 'student_name', label: 'Student Name' },
    { key: 'student_email', label: 'Student Email' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'applied_at', label: 'Applied Date', date: true },
    { key: 'status', label: 'Application Status', render: row => row.status === 'applied' ? 'Pending' : row.status }
  ],
  'pending-applications': [
    { key: 'application_id', label: 'Application ID' },
    { key: 'student_name', label: 'Student Name' },
    { key: 'student_email', label: 'Student Email' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'applied_at', label: 'Applied Date', date: true },
    { key: 'status', label: 'Application Status', render: () => 'Pending' }
  ],
  'shortlisted-applications': [
    { key: 'application_id', label: 'Application ID' },
    { key: 'student_name', label: 'Student Name' },
    { key: 'student_email', label: 'Student Email' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'applied_at', label: 'Applied Date', date: true },
    { key: 'status', label: 'Application Status' }
  ],
  'selected-students': [
    { key: 'student_name', label: 'Student Name' },
    { key: 'student_email', label: 'Email' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'selection_date', label: 'Selection Date', date: true },
    { key: 'status', label: 'Status' }
  ]
};

const formatDate = value => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toLocaleDateString();
};

const getLegacyDashboardRecords = async (section) => {
  const endpointBySection = {
    students: '/admin/students',
    companies: '/admin/companies',
    jobs: '/admin/jobs',
    applications: '/admin/applications',
    'pending-applications': '/admin/applications',
    'shortlisted-applications': '/admin/applications',
    'selected-students': '/admin/applications'
  };
  const response = await API.get(endpointBySection[section]);
  const data = response.data.data;

  if (section === 'students') return data.students;
  if (section === 'companies') return data.companies;
  if (section === 'jobs') return data.jobs;
  if (section === 'applications') return data.applications;

  const statusBySection = {
    'pending-applications': 'applied',
    'shortlisted-applications': 'shortlisted',
    'selected-students': 'selected'
  };
  const status = statusBySection[section];
  return data.applications
    .filter(application => application.status === status)
    .map(application => ({
      ...application,
      selection_date: status === 'selected' ? application.updated_at : null
    }));
};

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionRecords, setSectionRecords] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAdminData = async () => {
    setLoading(true);
    setDashboardError('');
    try {
      const [dashRes, jobsRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/jobs')
      ]);

      setMetrics(dashRes.data.data.metrics);
      setJobs(jobsRes.data.data.jobs);
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'Unable to load dashboard statistics. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchSectionRecords = async (section) => {
    setSectionLoading(true);
    setSectionError('');
    setSectionRecords([]);
    try {
      try {
        const response = await API.get(`/admin/dashboard/records/${section}`);
        setSectionRecords(response.data.data.records);
      } catch (err) {
        if (err.response?.status !== 404) throw err;
        setSectionRecords(await getLegacyDashboardRecords(section));
      }
    } catch (err) {
      setSectionError(
        err.response?.data?.message
        || (err.response ? `Request failed (${err.response.status}). Please retry.` : err.message)
        || 'Unable to load these records. Please retry.'
      );
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSection) fetchSectionRecords(selectedSection);
  }, [selectedSection]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sectionRecords;
    return sectionRecords.filter(record => Object.values(record).some(value => (
      value !== null && value !== undefined && String(value).toLowerCase().includes(query)
    )));
  }, [sectionRecords, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSection]);

  const handleApproveJob = async (jobId, newStatus) => {
    try {
      await API.patch(`/admin/jobs/${jobId}/status`, { status: newStatus });
      setJobs(currentJobs => currentJobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const selectedCard = statisticCards.find(card => card.key === selectedSection);
  const selectedColumns = selectedSection ? tableColumns[selectedSection] : [];
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold px-3 py-1 bg-white/10 rounded-full text-emerald-300 inline-block mb-2">
            Placement Cell Oversight
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Administration Overview</h1>
          <p className="text-blue-100 text-sm mt-1">Monitor campus recruitment metrics, manage registered users, and approve corporate job postings.</p>
        </div>
      </div>

      {dashboardError && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span>{dashboardError}</span>
          <button type="button" onClick={fetchAdminData} className="inline-flex items-center gap-2 font-semibold"><RotateCcw className="h-4 w-4" /> Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statisticCards.map(card => {
          const Icon = card.icon;
          const active = selectedSection === card.key;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            violet: 'bg-violet-50 text-violet-700 border-violet-200',
            cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
            amber: 'bg-amber-50 text-amber-700 border-amber-200',
            orange: 'bg-orange-50 text-orange-700 border-orange-200',
            green: 'bg-green-50 text-green-700 border-green-200'
          };
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => {
                if (selectedSection === card.key) fetchSectionRecords(card.key);
                else setSelectedSection(card.key);
              }}
              aria-pressed={active}
              className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-200'
              }`}
            >
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${colorClasses[card.color]}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-500">{card.label}</span>
              <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                {loading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-slate-200" /> : Number(metrics?.[card.metric] || 0).toLocaleString()}
              </span>
              <span className="mt-2 block text-xs font-semibold text-blue-600 group-hover:text-blue-800">View records <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></span>
            </button>
          );
        })}
      </div>

      {selectedCard && (
        <section aria-live="polite" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Dashboard details</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">{selectedCard.label}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {sectionLoading ? 'Loading records…' : `Showing ${filteredRecords.length.toLocaleString()} of ${sectionRecords.length.toLocaleString()} records`}
                {metrics && ` · ${Number(metrics[selectedCard.metric] || 0).toLocaleString()} total`}
              </p>
              {selectedSection === 'pending-applications' && (
                <p className="mt-1 text-xs text-slate-400">Pending applications use the database status “applied”.</p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block sm:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search these records..."
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <button
                type="button"
                onClick={() => { setSelectedSection(null); setSearch(''); setSectionRecords([]); }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" /> Clear / Back
              </button>
            </div>
          </div>

          {sectionError && (
            <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <span>{sectionError}</span>
              <button type="button" onClick={() => fetchSectionRecords(selectedSection)} className="inline-flex items-center gap-2 font-semibold"><RotateCcw className="h-4 w-4" /> Retry</button>
            </div>
          )}

          {sectionLoading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm font-medium text-slate-500">
              <span className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /> Loading records…
            </div>
          ) : sectionError ? null : filteredRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              {sectionRecords.length ? 'No records match your search.' : 'No records are available in this section.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-max border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {selectedColumns.map(column => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedRecords.map((record, index) => (
                      <tr key={record.application_id || record.id || `${currentPage}-${index}`} className="transition hover:bg-blue-50/40">
                        {selectedColumns.map(column => {
                          const value = column.render
                            ? column.render(record)
                            : column.date ? formatDate(record[column.key]) : record[column.key];
                          return <td key={column.key} className="whitespace-nowrap px-4 py-3.5 text-slate-700">{value === null || value === undefined || value === '' ? '—' : value}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>Page {currentPage} of {pageCount} · {filteredRecords.length.toLocaleString()} matching records</span>
                <div className="flex gap-2">
                  <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(page => page - 1)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                  <button type="button" disabled={currentPage >= pageCount} onClick={() => setCurrentPage(page => page + 1)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {!selectedSection && <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/admin/interviews" className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50">
          <span className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-blue-700" /><span><span className="block font-bold text-slate-900">View interview schedules</span><span className="text-xs text-slate-500">Review recruiter-managed interview rounds</span></span></span>
          <ArrowRight className="h-4 w-4 text-blue-700" />
        </Link>
        <Link to="/admin/placements" className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/50">
          <span className="flex items-center gap-3"><Award className="h-5 w-5 text-emerald-700" /><span><span className="block font-bold text-slate-900">View placement results</span><span className="text-xs text-slate-500">Review outcomes reported by recruiters</span></span></span>
          <ArrowRight className="h-4 w-4 text-emerald-700" />
        </Link>
      </div>

      {/* Job Approval Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" /> Pending Corporate Job Approvals
            </h2>
            <p className="text-xs text-slate-500">Review job posting details before publishing to students</p>
          </div>
          <Link to="/admin/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All Job Postings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingJobs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
            <p className="font-semibold text-emerald-700">All pending job postings are approved and verified!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Job Title</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Min CGPA</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {pendingJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-4 font-bold text-slate-900">{job.company_name}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{job.title}</td>
                    <td className="py-4 px-4 text-slate-600 text-xs">{job.location}</td>
                    <td className="py-4 px-4 font-bold text-blue-600 text-xs">{parseFloat(job.minimum_cgpa).toFixed(2)}</td>
                    <td className="py-4 px-4 text-slate-500 text-xs">{new Date(job.deadline).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleApproveJob(job.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          Approve Job
                        </button>
                        <button
                          onClick={() => handleApproveJob(job.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>}
    </div>
  );
};

export default AdminDashboard;
