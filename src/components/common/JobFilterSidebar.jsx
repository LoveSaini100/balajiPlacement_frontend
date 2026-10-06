import React from 'react';
import { 
  RotateCcw, 
  MapPin, 
  Briefcase, 
  Layers, 
  IndianRupee, 
  SlidersHorizontal,
  Laptop
} from 'lucide-react';
import { locationsList, experienceFilters, employmentTypes, workModes, salaryRanges } from '../../data/jobsData';
import { categoriesData } from '../../data/categoriesData';

const JobFilterSidebar = ({ filters, setFilters, onReset, totalCount }) => {
  const handleCategoryToggle = (categoryName) => {
    if (filters.category === categoryName) {
      setFilters(prev => ({ ...prev, category: 'All Categories' }));
    } else {
      setFilters(prev => ({ ...prev, category: categoryName }));
    }
  };

  const activeFiltersCount = [
    filters.query,
    filters.location !== 'All Locations' ? filters.location : null,
    filters.category !== 'All Categories' ? filters.category : null,
    filters.experience !== 'All Experience' ? filters.experience : null,
    filters.workMode !== 'All Modes' ? filters.workMode : null,
    filters.employmentType !== 'All Types' ? filters.employmentType : null,
    filters.salaryRange !== 'All Salaries' ? filters.salaryRange : null
  ].filter(Boolean).length;

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-base font-bold text-slate-900">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span>Filter Jobs</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 bg-blue-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          Location
        </label>
        <select
          value={filters.location}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-semibold cursor-pointer"
        >
          {locationsList.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Work Mode Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Laptop className="w-3.5 h-3.5 text-blue-600" />
          Work Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {workModes.map((mode) => {
            const selected = filters.workMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, workMode: selected && mode !== 'All Modes' ? 'All Modes' : mode }))}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  selected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          Category / Industry
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, category: 'All Categories' }))}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
              filters.category === 'All Categories'
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:bg-slate-50 font-medium'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categoriesData.map((cat) => {
            const selected = filters.category === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryToggle(cat.name)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                  selected
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0 font-semibold">{cat.openJobs}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Bracket */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          Experience Level
        </label>
        <select
          value={filters.experience}
          onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-semibold cursor-pointer"
        >
          {experienceFilters.map((exp) => (
            <option key={exp} value={exp}>{exp}</option>
          ))}
        </select>
      </div>

      {/* Salary Range */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
          Salary Range
        </label>
        <div className="space-y-1.5">
          {salaryRanges.map((range) => {
            const selected = filters.salaryRange === range.label;
            return (
              <label
                key={range.label}
                className={`flex items-center gap-2.5 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  selected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <input
                  type="radio"
                  name="salaryRange"
                  checked={selected}
                  onChange={() => setFilters(prev => ({ ...prev, salaryRange: range.label }))}
                  className="accent-blue-600"
                />
                <span>{range.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Employment Type */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Employment Type
        </label>
        <div className="space-y-1.5">
          {employmentTypes.map((type) => {
            const selected = filters.employmentType === type;
            return (
              <label
                key={type}
                className={`flex items-center gap-2.5 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  selected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <input
                  type="radio"
                  name="employmentType"
                  checked={selected}
                  onChange={() => setFilters(prev => ({ ...prev, employmentType: type }))}
                  className="accent-blue-600"
                />
                <span>{type}</span>
              </label>
            );
          })}
        </div>
      </div>

    </aside>
  );
};

export default JobFilterSidebar;
