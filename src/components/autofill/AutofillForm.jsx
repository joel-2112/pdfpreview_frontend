import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import { User, Mail, Calendar, Phone, ShieldAlert, CheckCircle2, MapPin, Globe, Save } from 'lucide-react';
import Button from '../shared/Button';
import ErrorMessage from '../shared/ErrorMessage';
import { API_ROUTES } from '../../constants/apiRoutes';

const DEFAULT_PROFILE_FIELDS = [
  { key: 'firstName', label: 'First Name / Given Name', type: 'text', icon: User, placeholder: 'Alex' },
  { key: 'lastName', label: 'Last Name / Family Name', type: 'text', icon: User, placeholder: 'Morgan' },
  { key: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'alex.morgan@company.com' },
  { key: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: '+1 (555) 234-5678' },
  { key: 'dob', label: 'Date of Birth', type: 'date', icon: Calendar, placeholder: '' },
  { key: 'gender', label: 'Sex / Gender', type: 'text', icon: User, placeholder: 'Male / Female' },
  { key: 'passportNumber', label: 'Passport / ID Number', type: 'text', icon: ShieldAlert, placeholder: 'P12345678' },
  { key: 'birthCity', label: 'Place of Birth: City / Town', type: 'text', icon: MapPin, placeholder: 'Toronto' },
  { key: 'nationality', label: 'Country of Citizenship / Nationality', type: 'text', icon: Globe, placeholder: 'Canada' },
  { key: 'address', label: 'Street Address', type: 'text', icon: MapPin, placeholder: '742 Evergreen Terrace' },
  { key: 'maritalStatus', label: 'Marital Status', type: 'text', icon: User, placeholder: 'Single / Married' },
  { key: 'uciId', label: 'UCI / Client Identifier Number', type: 'text', icon: ShieldAlert, placeholder: '12345678' },
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
      const res = await api.put(API_ROUTES.AUTH.UPDATE_PROFILE, { profileData: formData });
      if (res.data.success) {
        updateProfileData(formData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      const parseError = (await import('../../utils/errorHandler')).default;
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="space-y-5">
      {success && (
        <div className="flex items-center space-x-3 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-semibold animate-fade-in shadow-xs">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>User profile schema values saved successfully. Ready to inject!</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DEFAULT_PROFILE_FIELDS.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className="space-y-1.5">
              <label htmlFor={field.key} className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {field.label}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Icon className="h-4 w-4" />
                </div>
                <input
                  id={field.key}
                  type={field.type}
                  value={formData[field.key] || ''}
                  placeholder={field.placeholder}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="glass-input block w-full rounded-xl py-2 pl-10 pr-3.5 text-xs sm:text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          variant="primary"
          icon={Save}
          className="px-6 py-2.5 text-xs sm:text-sm"
        >
          Save Profile Schema
        </Button>
      </div>
    </form>
  );
};

export default AutofillForm;

