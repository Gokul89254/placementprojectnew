import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Calendar, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  ChevronRight, 
  Sparkles, 
  AlertCircle, 
  CheckSquare 
} from 'lucide-react';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState({});
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minCgpa, setMinCgpa] = useState('');

  // Selected Job for Modal & Eligibility Check
  const [selectedJob, setSelectedJob] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState({ type: '', text: '' });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (minCgpa) params.minCgpa = minCgpa;

      const [jobsRes, appsRes] = await Promise.all([
        API.get('/jobs', { params }),
        API.get('/students/me/applications')
      ]);

      setJobs(jobsRes.data.data.jobs);

      // Create lookup object for student's applications: { jobId: applicationStatus }
      const appMap = {};
      appsRes.data.data.applications.forEach(app => {
        appMap[app.job_id] = app.status;
      });
      setMyApplications(appMap);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, location, minCgpa]);

  const handleOpenJobModal = async (job) => {
    setSelectedJob(job);
    setEligibility(null);
    setApplyMessage({ type: '', text: '' });
    setCheckingEligibility(true);

    try {
      const res = await API.get(`/jobs/${job.id}/eligibility`);
      setEligibility(res.data.data);
    } catch (err) {
      console.error('Error checking eligibility:', err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    setApplyMessage({ type: '', text: '' });

    try {
      await API.post(`/jobs/${selectedJob.id}/apply`);
      setApplyMessage({ type: 'success', text: 'Application submitted successfully! 🎉' });
      setMyApplications({ ...myApplications, [selectedJob.id]: 'applied' });
    } catch (err) {
      setApplyMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to submit application.' 
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-blue-600" /> Available Job Opportunities
        </h1>
        <p className="text-slate-500 text-sm mt-1">Browse active campus drives, check server-verified eligibility, and apply.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search job title, skill, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter location (e.g. Bangalore, Remote)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="relative">
          <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="number"
            step="0.1"
            placeholder="Filter maximum min CGPA (e.g. 7.5)"
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">No job postings match your filter criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const hasApplied = Boolean(myApplications[job.id]);
            const status = myApplications[job.id];

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md inline-block mb-2">
                        {job.company_name}
                      </span>
                      <h3 className="font-bold text-slate-900 text-lg leading-snug">{job.title}</h3>
                    </div>
                    {hasApplied && (
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        status === 'selected' ? 'bg-emerald-100 text-emerald-800' :
                        status === 'shortlisted' ? 'bg-amber-100 text-amber-800' :
                        status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {status}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location} ({job.employment_type})
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" /> Min CGPA: <span className="font-bold text-slate-900">{parseFloat(job.minimum_cgpa).toFixed(2)}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Package: <span className="font-bold text-slate-900">{job.expected_package === null || job.expected_package === undefined ? 'Not disclosed' : `${Number(job.expected_package).toFixed(2)} LPA`}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline: <span className="font-semibold text-slate-800">{new Date(job.deadline).toLocaleDateString()}</span>
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.required_skills && job.required_skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenJobModal(job)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    hasApplied 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  {hasApplied ? 'View Details & Status' : 'Check Eligibility & Apply'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Eligibility Check & Application */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded mb-1 inline-block">
                  {selectedJob.company_name}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">{selectedJob.title}</h2>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900 text-sm">Job Description:</p>
              <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">{selectedJob.description}</p>
              <p className="font-semibold text-slate-900">Expected package: <span className="font-normal text-slate-600">{selectedJob.expected_package === null || selectedJob.expected_package === undefined ? 'Not disclosed' : `${Number(selectedJob.expected_package).toFixed(2)} LPA`}</span></p>
            </div>

            {/* Server-Side Eligibility Status Box */}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" /> Server-Verified Eligibility Check:
              </p>

              {checkingEligibility ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Evaluating academic profile against job criteria...
                </div>
              ) : eligibility ? (
                eligibility.eligible ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>You are Eligible to Apply for this Job!</span>
                    </div>
                    <p className="text-emerald-700">Your CGPA ({eligibility.student_cgpa.toFixed(2)}) meets the minimum requirement ({eligibility.required_cgpa.toFixed(2)}), and required skills match.</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-red-800">
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <span>You are NOT Eligible to Apply</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-red-700">
                      {eligibility.reasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )
              ) : null}
            </div>

            {/* Application Feedback Messages */}
            {applyMessage.text && (
              <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                applyMessage.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
              }`}>
                {applyMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                <span>{applyMessage.text}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
              >
                Close
              </button>

              {!myApplications[selectedJob.id] ? (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!eligibility?.eligible || applying}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  {applying ? 'Submitting Application...' : 'Submit Application'}
                </button>
              ) : (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" /> Application Submitted ({myApplications[selectedJob.id]})
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListings;
