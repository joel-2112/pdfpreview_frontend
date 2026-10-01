import React, { useEffect, useState, useMemo } from 'react';
import useAutofill from '../../hooks/useAutofill';
import { ArrowRight, Save, CheckCircle2, Wand2, Search, RotateCcw, Link2, Sparkles, Hash } from 'lucide-react';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';
import ErrorMessage from '../shared/ErrorMessage';

const PROFILE_OPTIONS = [
  { value: 'firstName', label: 'First Name', synonyms: ['first', 'fname', 'given', 'firstname', 'first_name', 'prenom'] },
  { value: 'lastName', label: 'Last Name', synonyms: ['last', 'lname', 'surname', 'family', 'lastname', 'last_name', 'nom'] },
  { value: 'email', label: 'Email Address', synonyms: ['email', 'mail', 'e-mail', 'emailaddress', 'user_email'] },
  { value: 'phone', label: 'Phone Number', synonyms: ['phone', 'tel', 'mobile', 'cell', 'telephone', 'phonenumber'] },
  { value: 'dob', label: 'Date of Birth', synonyms: ['dob', 'birth', 'birthdate', 'date_of_birth', 'birthday'] },
  { value: 'passportNumber', label: 'Passport / ID Number', synonyms: ['passport', 'pass', 'id', 'idnumber', 'passport_no', 'document_id'] },
  { value: 'address', label: 'Street Address', synonyms: ['address', 'street', 'addr', 'residence', 'location'] },
  { value: 'nationality', label: 'Nationality / Country', synonyms: ['nation', 'nationality', 'country', 'citizenship', 'citizen'] },
];

export const FieldMapper = ({ docId, fields }) => {
  const { mappings, loading, error, fetchMappings, saveMappings } = useAutofill();
  const [localMappings, setLocalMappings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const [autoMatchedCount, setAutoMatchedCount] = useState(0);

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
    setAutoMatchedCount(0);
  };

  // Smart fuzzy auto-match
  const handleAutoMatch = () => {
    const nextMappings = { ...localMappings };
    let matched = 0;

    fields.forEach(field => {
      const cleanName = field.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      for (const option of PROFILE_OPTIONS) {
        const matchesOptionKey = option.value.toLowerCase() === cleanName;
        const matchesSynonym = option.synonyms.some(syn => cleanName.includes(syn));

        if (matchesOptionKey || matchesSynonym) {
          if (!nextMappings[field.name]) {
            nextMappings[field.name] = option.value;
            matched++;
          }
          break;
        }
      }
    });

    setLocalMappings(nextMappings);
    setAutoMatchedCount(matched);
    setSaved(false);
  };

  const handleClearAll = () => {
    const cleared = {};
    fields.forEach(f => {
      cleared[f.name] = '';
    });
    setLocalMappings(cleared);
    setSaved(false);
    setAutoMatchedCount(0);
  };

  const handleSave = async () => {
    setSaved(false);
    try {
      const success = await saveMappings(docId, localMappings);
      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFields = useMemo(() => {
    return fields.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [fields, searchQuery]);

  const mappedCount = Object.values(localMappings).filter(Boolean).length;

  if (loading && Object.keys(localMappings).length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {saved && (
        <div className="flex items-center space-x-3 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-semibold animate-fade-in shadow-xs">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Field mapping dictionary synchronized and saved!</span>
        </div>
      )}

      {autoMatchedCount > 0 && (
        <div className="flex items-center space-x-3 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 p-3 text-xs text-indigo-800 dark:text-indigo-300 font-semibold animate-fade-in">
          <Sparkles className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
          <span>Auto-suggest matched {autoMatchedCount} fields based on dictionary keys!</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* Toolbar: Search, Auto-Match, Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter fields by name..."
            className="glass-input block w-full rounded-xl py-1.5 pl-8.5 pr-3 text-xs"
          />
        </div>

        {/* Action Controls & Metric */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {mappedCount} / {fields.length} Mapped
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoMatch}
            icon={Wand2}
            className="text-xs"
            title="Auto-detect matches by name"
          >
            Auto-Match
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearAll}
            icon={RotateCcw}
            className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Mapping Rows Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-slate-900/40 overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-3 bg-slate-50/80 dark:bg-slate-900/80 px-4 sm:px-6 py-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="col-span-5 sm:col-span-5">PDF Field Key</div>
          <div className="col-span-2 sm:col-span-2 text-center">Direction</div>
          <div className="col-span-5 sm:col-span-5">Target User Property</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-200/80 dark:divide-white/[0.06] max-h-[460px] overflow-y-auto px-4 sm:px-6">
          {filteredFields.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No field keys match "{searchQuery}"
            </div>
          ) : (
            filteredFields.map((field) => {
              const isMapped = Boolean(localMappings[field.name]);
              return (
                <div
                  key={field.name}
                  className={`grid grid-cols-12 gap-3 py-3 items-center transition-all ${
                    isMapped ? 'bg-brand-50/30 dark:bg-brand-500/[0.03]' : ''
                  }`}
                >
                  {/* Left Column: PDF field name */}
                  <div className="col-span-5 sm:col-span-5 space-y-0.5 truncate pr-2">
                    <span className="text-xs sm:text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 truncate block" title={field.name}>
                      {field.name}
                    </span>
                    <span className="inline-block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {field.type || 'Field'}
                    </span>
                  </div>

                  {/* Middle Column: Connection indicator */}
                  <div className="col-span-2 sm:col-span-2 flex justify-center">
                    <div className={`p-1.5 rounded-full ${
                      isMapped
                        ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Right Column: Dropdown selector */}
                  <div className="col-span-5 sm:col-span-5">
                    <select
                      value={localMappings[field.name] || ''}
                      onChange={(e) => handleSelectionChange(field.name, e.target.value)}
                      className={`glass-input block w-full rounded-xl py-1.5 px-3 text-xs sm:text-sm cursor-pointer transition-all ${
                        isMapped
                          ? 'border-brand-400 dark:border-brand-500/50 bg-brand-50/50 dark:bg-brand-950/20 font-semibold'
                          : ''
                      }`}
                    >
                      <option value="">-- Do Not Populate --</option>
                      {PROFILE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Save CTA */}
      <div className="flex justify-end pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
        <Button
          onClick={handleSave}
          variant="primary"
          icon={Save}
          className="px-6 py-2.5 text-xs sm:text-sm"
        >
          Save Mapping Configuration
        </Button>
      </div>
    </div>
  );
};

export default FieldMapper;

