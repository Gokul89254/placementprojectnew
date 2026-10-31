import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Award, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  FileText 
} from 'lucide-react';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, jobsRes, appsRes] = await Promise.all([
          API.get('/students/me'),
          API.get('/jobs'),
          API.get('/students/me/applications')
        ]);

        setStudent(profileRes.data.data.student);
        setRecentJobs(jobsRes.data.data.jobs.slice(0, 3));
        setRecentApps(appsRes.data.data.applications.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = student?.stats || { total_applications: 0, shortlisted_count: 0, selected_count: 0, pending_count: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Placement Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Welcome back, {student?.name}! 👋
          </h1>
          <p className="text-blue-50 text-sm sm:text-base leading-relaxed mb-6">
            Department: <span className="font-semibold text-white">{student?.department}</span> | Graduation Year: <span className="font-semibold text-white">{student?.graduation_year}</span> | CGPA: <span className="font-bold text-emerald-300">{parseFloat(student?.cgpa).toFixed(2)}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/student/jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 rounded-xl font-bold text-sm shadow hover:bg-blue-50 transition-colors"
            >
              <Briefcase className="w-4 h-4" /> Explore Available Jobs
            </Link>
            <Link
              to="/student/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm backdrop-blur-md transition-colors"
            >
              Update Profile & Skills
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applications</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.total_applications}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.shortlisted_count}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selections</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.selected_count}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your CGPA</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{parseFloat(student?.cgpa || 0).toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Jobs & Applications */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recommended Recent Jobs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Recent Job Openings
              </h2>
              <Link to="/student/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentJobs.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No active job postings right now.</p>
              ) : (
                recentJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{job.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{job.company_name} • {job.location}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                          Package: {job.expected_package === null || job.expected_package === undefined ? 'Not disclosed' : `${Number(job.expected_package).toFixed(2)} LPA`}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                          Min CGPA: {parseFloat(job.minimum_cgpa).toFixed(2)}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/student/jobs"
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shrink-0"
                    >
                      Details
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* My Applications Track */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Application Statuses
              </h2>
              <Link to="/student/applications" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View Tracker <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentApps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm mb-3">You haven't submitted any job applications yet.</p>
                  <Link to="/student/jobs" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 inline-block">
                    Explore & Apply Jobs
                  </Link>
                </div>
              ) : (
                recentApps.map((app) => (
                  <div key={app.application_id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{app.job_title}</h4>
                      <p className="text-xs text-slate-500">{app.company_name} • Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                      app.status === 'selected' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'shortlisted' ? 'bg-amber-100 text-amber-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
