import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Pencil, Save, ShieldCheck, ShieldPlus, Trash2, UserRound, X } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const fieldClass = 'mt-1.5 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const MAJOR_ADMIN_EMAIL = 'gokulravi89254@gmail.com';

const Feedback = ({ message, type }) => {
  if (!message) return null;
  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;
  return (
    <div role={isSuccess ? 'status' : 'alert'} className={`mb-5 flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${isSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

const AdminAccount = () => {
  const { user } = useAuth();
  const isMajorAdmin = user?.role === 'admin' && user.email?.trim().toLowerCase() === MAJOR_ADMIN_EMAIL;
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState('');
  const [adminListReloadKey, setAdminListReloadKey] = useState(0);
  const [adminListFeedback, setAdminListFeedback] = useState({ type: '', message: '' });
  const [deletingAdminId, setDeletingAdminId] = useState(null);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editingAdminForm, setEditingAdminForm] = useState({ name: '', email: '' });
  const [updatingAdmin, setUpdatingAdmin] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });
  const [adminFeedback, setAdminFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    let active = true;
    setAdminsLoading(true);
    setAdminsError('');
    const loadAdmins = async () => {
      try {
        const response = await API.get('/admin/admins');
        if (active) setAdmins(response.data.data.admins);
      } catch (requestError) {
        if (active) {
          const message = requestError.response?.status === 404
            ? 'Admin directory API is unavailable. Restart the backend server, then retry.'
            : requestError.response?.data?.message || `Unable to load admin accounts: ${requestError.message}`;
          setAdminsError(message);
        }
      } finally {
        if (active) setAdminsLoading(false);
      }
    };
    loadAdmins();
    return () => { active = false; };
  }, [adminListReloadKey]);

  const updatePassword = async (event) => {
    event.preventDefault();
    setPasswordFeedback({ type: '', message: '' });
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordBusy(true);
    try {
      const { current_password, new_password } = passwordForm;
      const response = await API.patch('/admin/account/password', { current_password, new_password });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setPasswordFeedback({ type: 'success', message: response.data.message });
    } catch (requestError) {
      setPasswordFeedback({
        type: 'error',
        message: requestError.response?.data?.message || 'Unable to update password. Please try again.'
      });
    } finally {
      setPasswordBusy(false);
    }
  };

  const createAdmin = async (event) => {
    event.preventDefault();
    setAdminFeedback({ type: '', message: '' });
    setAdminBusy(true);
    try {
      const response = await API.post('/admin/admins', adminForm);
      setAdminForm({ name: '', email: '', password: '' });
      setAdminFeedback({
        type: 'success',
        message: `Admin account for ${response.data.data.admin.email} was created. They can now sign in.`
      });
      setAdmins(currentAdmins => [...currentAdmins, response.data.data.admin]);
      setAdminsError('');
    } catch (requestError) {
      setAdminFeedback({
        type: 'error',
        message: requestError.response?.data?.message || 'Unable to create admin account. Please try again.'
      });
    } finally {
      setAdminBusy(false);
    }
  };

  const deleteAdmin = async (admin) => {
    if (!window.confirm(`Delete the admin account for ${admin.name} (${admin.email})? This cannot be undone.`)) return;

    setDeletingAdminId(admin.id);
    setAdminListFeedback({ type: '', message: '' });
    try {
      await API.delete(`/admin/admins/${admin.id}`);
      setAdmins(currentAdmins => currentAdmins.filter(item => item.id !== admin.id));
      setAdminListFeedback({ type: 'success', message: `Admin account for ${admin.email} was deleted.` });
    } catch (requestError) {
      setAdminListFeedback({
        type: 'error',
        message: requestError.response?.data?.message || 'Unable to delete admin account. Please try again.'
      });
    } finally {
      setDeletingAdminId(null);
    }
  };

  const startEditingAdmin = (admin) => {
    setEditingAdminId(admin.id);
    setEditingAdminForm({ name: admin.name, email: admin.email });
    setAdminListFeedback({ type: '', message: '' });
  };

  const updateAdmin = async (adminId) => {
    setUpdatingAdmin(true);
    setAdminListFeedback({ type: '', message: '' });
    try {
      const response = await API.patch(`/admin/admins/${adminId}`, editingAdminForm);
      setAdmins(currentAdmins => currentAdmins.map(admin => admin.id === adminId ? response.data.data.admin : admin));
      setEditingAdminId(null);
      setAdminListFeedback({ type: 'success', message: `Admin account for ${response.data.data.admin.email} was updated.` });
    } catch (requestError) {
      setAdminListFeedback({
        type: 'error',
        message: requestError.response?.data?.message || 'Unable to update admin account. Please try again.'
      });
    } finally {
      setUpdatingAdmin(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Administrator settings</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Admin account management</h1>
        <p className="mt-2 text-sm text-slate-500">
          Signed in as <span className="font-semibold text-slate-700">{user?.email}</span>. Change your password{isMajorAdmin ? ' or manage administrator accounts.' : '.'}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><KeyRound className="h-5 w-5" /></span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Change password</h2>
              <p className="mt-1 text-sm text-slate-500">Confirm your current password before setting a new one.</p>
            </div>
          </div>
          <Feedback {...passwordFeedback} />
          <form onSubmit={updatePassword} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Current password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={passwordForm.current_password}
                onChange={event => setPasswordForm({ ...passwordForm, current_password: event.target.value })}
                className={fieldClass}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              New password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={passwordForm.new_password}
                onChange={event => setPasswordForm({ ...passwordForm, new_password: event.target.value })}
                className={fieldClass}
              />
              <span className="mt-1 block text-xs text-slate-400">Use at least 8 characters.</span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={passwordForm.confirm_password}
                onChange={event => setPasswordForm({ ...passwordForm, confirm_password: event.target.value })}
                className={fieldClass}
              />
            </label>
            <button type="submit" disabled={passwordBusy} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60">
              <KeyRound className="h-4 w-4" />{passwordBusy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        {isMajorAdmin && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldPlus className="h-5 w-5" /></span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create another admin</h2>
              <p className="mt-1 text-sm text-slate-500">New administrators can sign in with their own credentials.</p>
            </div>
          </div>
          <Feedback {...adminFeedback} />
          <form onSubmit={createAdmin} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <span className="relative block">
                <UserRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={adminForm.name}
                  onChange={event => setAdminForm({ ...adminForm, name: event.target.value })}
                  placeholder="Admin name"
                  className={`${fieldClass} pl-10`}
                />
              </span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email address
              <input
                type="email"
                autoComplete="email"
                required
                value={adminForm.email}
                onChange={event => setAdminForm({ ...adminForm, email: event.target.value })}
                placeholder="admin@example.com"
                className={fieldClass}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Initial password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={adminForm.password}
                onChange={event => setAdminForm({ ...adminForm, password: event.target.value })}
                className={fieldClass}
              />
              <span className="mt-1 block text-xs text-slate-400">Use at least 8 characters and share it securely with the new admin.</span>
            </label>
            <button type="submit" disabled={adminBusy} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
              <ShieldPlus className="h-4 w-4" />{adminBusy ? 'Creating…' : 'Create admin account'}
            </button>
          </form>
        </section>}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><ShieldCheck className="h-5 w-5" /></span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Administrator directory</h2>
            <p className="mt-1 text-sm text-slate-500">View administrator accounts and contact emails.{isMajorAdmin ? ' You can update or remove other admins.' : ''}</p>
          </div>
        </div>
        <Feedback type="error" message={adminsError} />
        <Feedback {...adminListFeedback} />
        {adminsLoading ? (
          <p className="text-sm text-slate-500">Loading administrator accounts…</p>
        ) : adminsError ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">The administrator directory could not be loaded.</p>
            <button
              type="button"
              onClick={() => setAdminListReloadKey(key => key + 1)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Retry
            </button>
          </div>
        ) : admins.length === 0 && !adminsError ? (
          <p className="text-sm text-slate-500">No administrator accounts were found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-semibold">Name</th>
                  <th className="px-3 py-3 font-semibold">Email</th>
                  <th className="px-3 py-3 font-semibold">Created</th>
                  {isMajorAdmin && <th className="px-3 py-3 text-right font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map(admin => {
                  const isMajor = admin.email?.toLowerCase() === MAJOR_ADMIN_EMAIL;
                  return (
                    <tr key={admin.id}>
                      <td className="px-3 py-4 font-medium text-slate-900">
                        {editingAdminId === admin.id ? (
                          <input
                            type="text"
                            aria-label="Admin name"
                            required
                            value={editingAdminForm.name}
                            onChange={event => setEditingAdminForm({ ...editingAdminForm, name: event.target.value })}
                            className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm"
                          />
                        ) : admin.name}
                        {isMajor && <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">Major admin</span>}
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {editingAdminId === admin.id ? (
                          <input
                            type="email"
                            aria-label="Admin email"
                            required
                            value={editingAdminForm.email}
                            onChange={event => setEditingAdminForm({ ...editingAdminForm, email: event.target.value })}
                            className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm"
                          />
                        ) : admin.email}
                      </td>
                      <td className="px-3 py-4 text-slate-600">{admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '—'}</td>
                      {isMajorAdmin && (
                        <td className="px-3 py-4 text-right">
                          {!isMajor && (
                            editingAdminId === admin.id ? (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingAdmin}
                                  onClick={() => updateAdmin(admin.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Save className="h-3.5 w-3.5" />{updatingAdmin ? 'Saving…' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  disabled={updatingAdmin}
                                  onClick={() => setEditingAdminId(null)}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <X className="h-3.5 w-3.5" />Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditingAdmin(admin)}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                  <Pencil className="h-3.5 w-3.5" />Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingAdminId === admin.id}
                                  onClick={() => deleteAdmin(admin)}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {deletingAdminId === admin.id ? 'Deleting…' : 'Delete'}
                                </button>
                              </>
                            )
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAccount;
