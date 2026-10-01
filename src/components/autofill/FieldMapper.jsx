import React, { useEffect, useState, useMemo } from 'react';
import useAutofill from '../../hooks/useAutofill';
import { 
  ArrowRight, 
  Save, 
  CheckCircle2, 
  Wand2, 
  Search, 
  RotateCcw, 
  Sparkles, 
  SlidersHorizontal,
  Info,
  Check
} from 'lucide-react';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';
import ErrorMessage from '../shared/ErrorMessage';

const PROFILE_OPTIONS = [
  { 
    value: 'firstName', 
    label: 'First Name / Given Name', 
    synonyms: ['given', 'first', 'fname', 'givenname', 'firstname', 'first_name', 'prenom'] 
  },
  { 
    value: 'lastName', 
    label: 'Last Name / Family Name', 
    synonyms: ['family', 'last', 'lname', 'surname', 'familyname', 'lastname', 'last_name', 'nom'] 
  },
  { 
    value: 'email', 
    label: 'Email Address', 
    synonyms: ['email', 'mail', 'e-mail', 'emailaddress', 'user_email', 'courriel'] 
  },
  { 
    value: 'phone', 
    label: 'Phone Number', 
    synonyms: ['phone', 'tel', 'mobile', 'cell', 'telephone', 'phonenumber', 'cellular'] 
  },
  { 
    value: 'dob', 
    label: 'Date of Birth (Full / Year / Day / Month)', 
    synonyms: ['birth', 'dob', 'birthdate', 'date_of_birth', 'birthday', 'dobyear', 'dobmonth', 'dobday', 'dateofbirth'] 
  },
  { 
    value: 'gender', 
    label: 'Gender / Sex', 
    synonyms: ['sex', 'gender', 'male', 'female', 'sexe'] 
  },
  { 
    value: 'passportNumber', 
    label: 'Passport / Travel Document Number', 
    synonyms: ['passport', 'pass', 'idnumber', 'passport_no', 'passportnumber', 'document_id', 'passeport'] 
  },
  { 
    value: 'address', 
    label: 'Street Address / Residence', 
    synonyms: ['address', 'street', 'addr', 'residence', 'location', 'resaddrstreet', 'resaddrcity'] 
  },
  { 
    value: 'nationality', 
    label: 'Country of Citizenship / Nationality', 
    synonyms: ['nation', 'nationality', 'citizenship', 'citizen', 'placebirthcountry', 'countryofcitizenship', 'country'] 
  },
  { 
    value: 'birthCity', 
    label: 'Place of Birth: City / Town', 
    synonyms: ['birthcity', 'placebirthcity', 'cityofbirth', 'placeofbirth'] 
  },
  { 
    value: 'maritalStatus', 
    label: 'Marital Status', 
    synonyms: ['marital', 'maritalstatus', 'marriage', 'married', 'single'] 
  },
  { 
    value: 'uciId', 
    label: 'UCI / Client Identifier Number', 
    synonyms: ['uci', 'clientid', 'uciclientid', 'uniqueclientidentifier'] 
  },
];

export const FieldMapper = ({ docId, fields = [] }) => {
  const { mappings, loading, error, fetchMappings, saveMappings } = useAutofill();
  const [localMappings, setLocalMappings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const [autoMatchedCount, setAutoMatchedCount] = useState(0);
  const [filterType, setFilterType] = useState('all'); // 'all', 'mapped', 'unmapped'

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

  // Smart fuzzy auto-match across labels, dataIds, and technical names
  const handleAutoMatch = () => {
    const nextMappings = { ...localMappings };
    let matched = 0;

    fields.forEach(field => {
      // Gather search tokens from label, dataId, and name
      const searchBlob = `${field.label || ''} ${field.dataId || ''} ${field.name || ''}`.toLowerCase();
      const normalizedBlob = searchBlob.replace(/[^a-z0-9\s]/g, ' ');

      for (const option of PROFILE_OPTIONS) {
        const directKey = option.value.toLowerCase();
        const matchesOptionKey = normalizedBlob.includes(directKey);
        const matchesSynonym = option.synonyms.some(syn => {
          // Check for whole word or embedded substring
          const reg = new RegExp(`\\b${syn}\\b|${syn}`, 'i');
          return reg.test(normalizedBlob);
        });

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
    const q = searchQuery.toLowerCase().trim();
    return fields.filter(f => {
      const matchSearch = !q || 
        (f.label && f.label.toLowerCase().includes(q)) ||
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.dataId && f.dataId.toLowerCase().includes(q));

      const isMapped = Boolean(localMappings[f.name]);
      if (filterType === 'mapped') return matchSearch && isMapped;
      if (filterType === 'unmapped') return matchSearch && !isMapped;
      return matchSearch;
    });
  }, [fields, searchQuery, filterType, localMappings]);

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
        <div className="flex items-center justify-between rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 p-3 text-xs text-indigo-800 dark:text-indigo-300 font-semibold animate-fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Smart Auto-Match identified and mapped <strong>{autoMatchedCount}</strong> PDF form fields!</span>
          </div>
          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">Click "Save" below to apply.</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* Toolbar: Search, Filters, Auto-Match, Stats */}
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
            placeholder="Search by label or technical field name..."
            className="glass-input block w-full rounded-xl py-1.5 pl-8.5 pr-3 text-xs"
          />
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Filter toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-[11px]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterType === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              All ({fields.length})
            </button>
            <button
              onClick={() => setFilterType('mapped')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterType === 'mapped' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Mapped ({mappedCount})
            </button>
            <button
              onClick={() => setFilterType('unmapped')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterType === 'unmapped' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Unmapped ({fields.length - mappedCount})
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoMatch}
            icon={Wand2}
            className="text-xs font-semibold bg-brand-50/50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-300"
            title="Auto-detect matches by smart label parsing"
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
          <div className="col-span-6 sm:col-span-6">Detected PDF Form Field</div>
          <div className="col-span-1 sm:col-span-1 text-center">Link</div>
          <div className="col-span-5 sm:col-span-5">Mapped User Profile Value</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-200/80 dark:divide-white/[0.06] max-h-[500px] overflow-y-auto px-4 sm:px-6 custom-scrollbar">
          {filteredFields.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-600 dark:text-slate-300">No form fields found</p>
              <p className="text-[11px]">Try adjusting your search query or filter toggle above.</p>
            </div>
          ) : (
            filteredFields.map((field) => {
              const isMapped = Boolean(localMappings[field.name]);
              const displayTitle = field.label || field.name;
              const fieldTypeBadge = field.type || 'text';

              return (
                <div
                  key={field.name}
                  className={`grid grid-cols-12 gap-3 py-3 items-center transition-all ${
                    isMapped ? 'bg-brand-50/30 dark:bg-brand-500/[0.03]' : ''
                  }`}
                >
                  {/* Left Column: Human-Readable Label + Tech Key */}
                  <div className="col-span-6 sm:col-span-6 space-y-1 pr-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {displayTitle}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 flex-wrap gap-1 text-[10px]">
                      {/* Field Type Badge */}
                      <span className="px-1.5 py-0.5 rounded-md font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {fieldTypeBadge}
                      </span>

                      {/* Technical Key Chip */}
                      <span className="px-1.5 py-0.5 rounded-md font-mono text-slate-400 dark:text-slate-500 truncate max-w-[180px]" title={field.name}>
                        Key: {field.name}
                      </span>

                      {/* Options indicator */}
                      {field.choices && field.choices.length > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-mono">
                          ({field.choices.length} options)
                        </span>
                      )}
                      {field.options && field.options.length > 0 && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                          (Radio: {field.options.map(o => o.label).join(' / ')})
                        </span>
                      )}
                      {field.required && (
                        <span className="text-rose-500 font-semibold">*Required</span>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Link Arrow */}
                  <div className="col-span-1 sm:col-span-1 flex justify-center">
                    <div className={`p-1.5 rounded-full transition-colors ${
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
                      className={`glass-input block w-full rounded-xl py-2 px-3 text-xs sm:text-sm cursor-pointer transition-all ${
                        isMapped
                          ? 'border-brand-400 dark:border-brand-500/50 bg-brand-50/50 dark:bg-brand-950/20 font-semibold text-brand-700 dark:text-brand-300'
                          : 'text-slate-700 dark:text-slate-300'
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
      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {mappedCount} of {fields.length} form fields mapped to user profile
        </span>
        <Button
          onClick={handleSave}
          variant="primary"
          icon={Save}
          className="px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-lg shadow-brand-500/20"
        >
          Save Mapping Configuration
        </Button>
      </div>
    </div>
  );
};

export default FieldMapper;
