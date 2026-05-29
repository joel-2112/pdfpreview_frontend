import React, { useEffect, useState } from 'react';
import useAutofill from '../../hooks/useAutofill';
import { ArrowRightLeft, Save, CheckCircle, RefreshCw } from 'lucide-react';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';
import ErrorMessage from '../shared/ErrorMessage';

const PROFILE_OPTIONS = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email Address' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'dob', label: 'Date of Birth' },
  { value: 'passportNumber', label: 'Passport Number' },
  { value: 'address', label: 'Street Address' },
  { value: 'nationality', label: 'Nationality' },
];

export const FieldMapper = ({ docId, fields }) => {
  const { mappings, loading, error, fetchMappings, saveMappings } = useAutofill();
  const [localMappings, setLocalMappings] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (docId) fetchMappings(docId);
  }, [docId, fetchMappings]);

  useEffect(() => {
    if (mappings) {
      const initial = {};
      fields.forEach(f => {
        initial[f.name] = mappings[f.name] || '';
      });
      setLocalMappings(initial);
    }
  }, [mappings, fields]);

  const handleSelectionChange = (pdfFieldName, profileKey) => {
    setLocalMappings(prev => ({
      ...prev,
      [pdfFieldName]: profileKey
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaved(false);
    try {
      const success = await saveMappings(docId, localMappings);
      if (success) setSaved(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && Object.keys(localMappings).length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center space-x-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400 animate-fade-in">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="font-semibold">PDF field mapping configuration updated successfully.</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/10 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 bg-slate-900/50 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <div className="col-span-5">PDF Form Field Name</div>
          <div className="col-span-2 text-center">Direction</div>
          <div className="col-span-5">System Profile Property</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-850 max-h-[450px] overflow-y-auto px-6">
          {fields.map((field) => (
            <div key={field.name} className="grid grid-cols-12 gap-4 py-4 items-center transition-all hover:bg-slate-900/20">
              {/* Left Column: PDF field name */}
              <div className="col-span-5 space-y-1">
                <span className="text-sm font-semibold text-white tracking-tight">{field.name}</span>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{field.type} Field</span>
              </div>

              {/* Middle Column: Link indicator */}
              <div className="col-span-2 flex justify-center text-slate-600">
                <ArrowRightLeft className="h-4.5 w-4.5" />
              </div>

              {/* Right Column: Drodown selector */}
              <div className="col-span-5">
                <select
                  value={localMappings[field.name] || ''}
                  onChange={(e) => handleSelectionChange(field.name, e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-4 text-sm text-slate-300 outline-none focus:border-brand-500 focus:bg-slate-950/60 transition-all duration-200"
                >
                  <option value="">-- Skip Field --</option>
                  {PROFILE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-850">
        <Button
          onClick={handleSave}
          icon={Save}
          className="px-8"
        >
          Save Mapping Mappings
        </Button>
      </div>
    </div>
  );
};

export default FieldMapper;
