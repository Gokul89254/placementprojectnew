import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Building2, Save, CheckCircle2, AlertCircle, User } from 'lucide-react';

const CompanyProfile = () => {
  const { user, updateUserProfileState } = useAuth();
  const [companyId, setCompanyId] = useState(null);
  const [companyStatus, setCompanyStatus] = useState('');

  const [formData, setFormData] = useState({
    recruiter_name: '',
    recruiter_email: '',
    company_name: '',
    description: '',
    website: '',
    location: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const meRes = await API.get('/auth/me');
        const currentUser = meRes.data.data.user;
        const companies = currentUser.companies || [];

        if (companies.length > 0) {
          const comp = companies[0];
          setCompanyId(comp.id);
          setCompanyStatus(comp.status || 'pending');
          setFormData({
            recruiter_name: currentUser.name || '',
            recruiter_email: currentUser.email || '',
            company_name: comp.company_name || '',
            description: comp.description || '',
            website: comp.website || '',
            location: comp.location || ''
          });
        } else {
          setFormData(prev => ({
            ...prev,
            recruiter_name: currentUser.name || '',
            recruiter_email: currentUser.email || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching company details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      if (companyId) {
        const res = await API.put(`/companies/${companyId}`, formData);
        const updatedComp = res.data.data.company;
        setCompanyStatus(updatedComp.status || companyStatus);

        if (user) {
          updateUserProfileState({
            ...user,
            name: formData.recruiter_name,
            email: formData.recruiter_email
          });
        }

        setMessage({ type: 'success', text: 'Company & Recruiter profile updated successfully!' });
      } else {
        const res = await API.post('/companies', formData);
        setCompanyId(res.data.data.company.id);
        setCompanyStatus(res.data.data.company.status || 'pending');
        setMessage({ type: 'success', text: 'Company profile submitted. An admin must approve it before you can post jobs.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save company profile.' });
    } finally {
      setSaving(false);
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
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dynamic Corporate Profile & Recruiter Credentials</h1>
            <p className="text-xs text-slate-500">Edit your recruiter contact details and official corporate profile</p>
          </div>
        </div>

        {companyStatus && (
          <div className={`mb-6 rounded-xl border p-4 text-sm ${
            companyStatus === 'approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
            companyStatus === 'rejected' ? 'border-red-200 bg-red-50 text-red-800' :
            'border-amber-200 bg-amber-50 text-amber-800'
          }`}>
            Company review status: <strong className="uppercase">{companyStatus}</strong>
            {companyStatus !== 'approved' && ' — job posting is unavailable until an admin approves this company.'}
          </div>
        )}

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter Name *</label>
              <input
                type="text"
                name="recruiter_name"
                required
                value={formData.recruiter_name}
                onChange={handleChange}
                placeholder="e.g. Sarah Jenkins"
                className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter Email *</label>
              <input
                type="email"
                name="recruiter_email"
                required
                value={formData.recruiter_email}
                onChange={handleChange}
                placeholder="recruiter@company.com"
                className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                name="company_name"
                required
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g. Global Tech Solutions"
                className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website URL</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://company.example.com"
                className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore, India"
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Overview & Mission</label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your company's domain, technology stack, and engineering culture..."
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
