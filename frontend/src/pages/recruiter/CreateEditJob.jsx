import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import { PlusCircle, Save, Plus, X, AlertCircle, Pencil } from 'lucide-react';

const CreateEditJob = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditing = Boolean(jobId);
  const [companyId, setCompanyId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Bangalore, India',
    employment_type: 'Full-Time',
    minimum_cgpa: 7.5,
    expected_package: '',
    graduation_year: 2026,
    deadline: '2026-12-31'
  });

  const [skills, setSkills] = useState(['React', 'Node.js', 'SQL']);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const meRes = await API.get('/auth/me');
        const companies = meRes.data.data.user.companies || [];

        if (companies.length > 0) {
          setCompanyId(companies[0].id);
        } else if (!isEditing) {
          navigate('/recruiter/company');
          return;
        }

        if (isEditing) {
          const jobRes = await API.get(`/jobs/${jobId}`);
          const job = jobRes.data.data.job;
          setFormData({
            title: job.title || '',
            description: job.description || '',
            location: job.location || '',
            employment_type: job.employment_type || 'Full-Time',
            minimum_cgpa: job.minimum_cgpa ?? 0,
            expected_package: job.expected_package ?? '',
            graduation_year: job.graduation_year ?? '',
            deadline: job.deadline ? String(job.deadline).slice(0, 10) : ''
          });
          setSkills(Array.isArray(job.required_skills) ? job.required_skills : []);
        }
      } catch (err) {
        console.error('Error loading job form:', err);
        setError(err.response?.data?.message || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [isEditing, jobId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const jobData = {
        ...formData,
        expected_package: formData.expected_package === '' ? null : Number(formData.expected_package),
        required_skills: skills
      };
      if (isEditing) {
        await API.put(`/jobs/${jobId}`, jobData);
      } else {
        await API.post('/jobs', { ...jobData, company_id: companyId });
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} job posting.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-200">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            {isEditing ? <Pencil className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Job Posting' : 'Post New Campus Job Opportunity'}</h1>
            <p className="text-xs text-slate-500">{isEditing ? 'Update job details, package, and required skills.' : 'Define job criteria, target graduation year, and required technical skills. An admin must approve your posting before students can see it.'}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Software Development Engineer (SDE-1)"
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore, India or Remote"
                className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum CGPA Cutoff (0.00 - 10.00) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="minimum_cgpa"
                required
                value={formData.minimum_cgpa}
                onChange={handleChange}
                className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Annual Package (LPA)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="expected_package"
                value={formData.expected_package}
                onChange={handleChange}
                placeholder="e.g. 6.5"
                className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="mt-1 text-xs text-slate-500">Enter the amount in lakhs per annum (for example, 6.50 displays as 6.50 LPA on job listings and details). Leave blank if not disclosed.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Graduation Batch Year *</label>
              <input
                type="number"
                name="graduation_year"
                required
                value={formData.graduation_year}
                onChange={handleChange}
                className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline Date *</label>
              <input
                type="date"
                name="deadline"
                required
                value={formData.deadline}
                onChange={handleChange}
                className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role & Responsibilities Description *</label>
            <textarea
              name="description"
              rows={5}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of key duties, engineering expectations, and tech stack..."
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
            />
          </div>

          {/* Required Skills Tag Input */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-sm font-bold text-slate-900 mb-2">Required Skills Criteria</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add required skill (e.g. React, Node.js, SQL)"
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-blue-500 hover:text-blue-900 focus:outline-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/recruiter/jobs')}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {submitting ? (isEditing ? 'Saving Changes...' : 'Publishing Job...') : (isEditing ? 'Save Changes' : 'Publish Job Posting')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditJob;
