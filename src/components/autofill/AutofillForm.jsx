import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import { User, Mail, Calendar, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Button from '../shared/Button';
import ErrorMessage from '../shared/ErrorMessage';

const DEFAULT_PROFILE_FIELDS = [
  { key: 'firstName', label: 'First Name', type: 'text', icon: User, placeholder: 'John' },
  { key: 'lastName', label: 'Last Name', type: 'text', icon: User, placeholder: 'Doe' },
  { key: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'john@example.com' },
  { key: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: '+1 (555) 019-2834' },
  { key: 'dob', label: 'Date of Birth', type: 'date', icon: Calendar, placeholder: '' },
  { key: 'passportNumber', label: 'Passport Number', type: 'text', icon: ShieldAlert, placeholder: 'A1234567' },
  { key: 'address', label: 'Street Address', type: 'text', icon: User, placeholder: '123 Main St' },
  { key: 'nationality', label: 'Nationality', type: 'text', icon: User, placeholder: 'American' },
];

export const AutofillForm = () => {
  const { user, updateProfileData } = useAuth();
  const [formData, setFormData] = useState(() => {
    const data = {};
    DEFAULT_PROFILE_FIELDS.forEach(f => {
      data[f.key] = (user?.profileData && user.profileData[f.key]) || '';
    });
    return data;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (key, val) => {
    setFormData(prev => ({
      ...prev,
      [key]: val
    }));
    setSuccess(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.put('/api/auth/profile', { profileData: formData });
      if (res.data.success) {
        updateProfileData(formData);
        setSuccess(true);
      }
    } catch (err) {
      const parseError = (await import('../../utils/errorHandler')).default;
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="space-y-6">
      {success && (
        <div className="flex items-center space-x-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="font-semibold">User profile data saved and updated successfully.</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {DEFAULT_PROFILE_FIELDS.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className="space-y-2">
              <label htmlFor={field.key} className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                {field.label}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5 text-slate-500">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <input
                  id={field.key}
                  type={field.type}
                  value={formData[field.key]}
                  placeholder={field.placeholder}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/40 py-3 pl-12 pr-4.5 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-500 focus:bg-slate-950/60 transition-all duration-200"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="px-8"
        >
          Save Profile Values
        </Button>
      </div>
    </form>
  );
};

export default AutofillForm;
