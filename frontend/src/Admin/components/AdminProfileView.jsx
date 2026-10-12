import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import { UserCircle, Lock, Save, Camera, Loader2 } from 'lucide-react';

export function AdminProfileView() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    birthday: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/api/admin/profile');
        const p = data.profile;
        setProfile(p);
        setForm({
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          gender: p.gender || '',
          birthday: p.birthday || '',
          address: p.address || '',
          city: p.city || '',
          state: p.state || '',
          zip: p.zip || '',
        });
        setAvatarPreview(p.avatar || '');
      } catch (error) {
        console.error('Failed to load profile from API, using auth context:', error);
        if (user) {
          setProfile(user);
          setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender || '',
            birthday: user.birthday || '',
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            zip: user.zip || '',
          });
          setAvatarPreview(user.avatar || '');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg('');

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const { data } = await apiClient.put('/api/admin/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = data.profile;
      setProfile(updated);
      setAvatarPreview(updated.avatar || avatarPreview);
      updateUser(updated);
      setProfileMsg('Profile updated successfully');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (error) {
      setProfileMsg(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg('');
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      setPasswordSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      setPasswordSaving(false);
      return;
    }

    try {
      await apiClient.put('/api/admin/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordMsg('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (error) {
      setPasswordError(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-3 text-sm text-slate-500 font-medium">Loading profile...</span>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-amber-600" />
            Admin Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage your account information</p>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                  <span className="text-3xl font-black text-slate-400">
                    {(form.name || form.email || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <Camera className="w-5 h-5 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{form.name || 'Admin'}</p>
              <p className="text-xs text-slate-400">{form.email}</p>
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">Administrator</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className={inputClass}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className={inputClass}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                className={inputClass}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                value={form.gender}
                onChange={(e) => handleFormChange('gender', e.target.value)}
                className={inputClass}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Birthday</label>
              <input
                type="date"
                value={form.birthday}
                onChange={(e) => handleFormChange('birthday', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                className={inputClass}
                placeholder="Street address"
              />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleFormChange('city', e.target.value)}
                className={inputClass}
                placeholder="City"
              />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleFormChange('state', e.target.value)}
                className={inputClass}
                placeholder="State"
              />
            </div>
            <div>
              <label className={labelClass}>ZIP / Postal Code</label>
              <input
                type="text"
                value={form.zip}
                onChange={(e) => handleFormChange('zip', e.target.value)}
                className={inputClass}
                placeholder="ZIP code"
              />
            </div>
          </div>

          {profileMsg && (
            <p className={`mt-4 text-xs font-bold ${profileMsg.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>
              {profileMsg}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 focus:outline-none"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            Change Password
          </h2>
          <p className="text-xs text-slate-400 mt-1">Update your account password</p>
        </div>

        <form onSubmit={handleChangePassword} className="p-6">
          <div className="max-w-md space-y-5">
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className={inputClass}
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className={inputClass}
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className={inputClass}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          {passwordMsg && (
            <p className="mt-4 text-xs font-bold text-emerald-600">{passwordMsg}</p>
          )}
          {passwordError && (
            <p className="mt-4 text-xs font-bold text-red-500">{passwordError}</p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={passwordSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 focus:outline-none"
            >
              {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {passwordSaving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
