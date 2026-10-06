import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Grid, 
  List, 
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import JobCard from '../components/common/JobCard';
import JobFilterSidebar from '../components/common/JobFilterSidebar';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs } = useJobContext();

  // URL query params initialization
  const initialQuery = searchParams.get('query') || '';
  const initialCategory = searchParams.get('category') || 'All Categories';
  const initialLocation = searchParams.get('location') || 'All Locations';
  const initialMode = searchParams.get('mode') || 'All Modes';

  const [filters, setFilters] = useState({
    query: initialQuery,
    category: initialCategory,
    location: initialLocation,
    workMode: initialMode,
    experience: 'All Experience',
    employmentType: 'All Types',
    salaryRange: 'All Salaries'
  });

  const [sortBy, setSortBy] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Sync state if URL searchParams change
  useEffect(() => {
    const q = searchParams.get('query');
    const cat = searchParams.get('category');
    const loc = searchParams.get('location');
    const mode = searchParams.get('mode');

    setFilters(prev => ({
      ...prev,
      query: q !== null ? q : prev.query,
      category: cat !== null ? cat : prev.category,
      location: loc !== null ? loc : prev.location,
      workMode: mode !== null ? mode : prev.workMode
    }));
  }, [searchParams]);

  const handleResetFilters = () => {
    setFilters({
      query: '',
      category: 'All Categories',
      location: 'All Locations',
      workMode: 'All Modes',
      experience: 'All Experience',
      employmentType: 'All Types',
      salaryRange: 'All Salaries'
    });
    setSearchParams({});
    setCurrentPage(1);
  };

  // Filter and Sort Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Keyword search (title, company, skills, overview)
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesOverview = job.overview ? job.overview.toLowerCase().includes(q) : false;
        const matchesSkills = job.skills ? job.skills.some(s => s.toLowerCase().includes(q)) : false;
        if (!matchesTitle && !matchesCompany && !matchesOverview && !matchesSkills) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'All Categories' && job.category !== filters.category) {
        return false;
      }

      // Location filter
      if (filters.location !== 'All Locations' && job.location !== filters.location) {
        return false;
      }

      // Work Mode filter
      if (filters.workMode !== 'All Modes' && job.workMode !== filters.workMode) {
        return false;
      }

      // Experience filter
      if (filters.experience !== 'All Experience' && job.expBracket && job.expBracket !== filters.experience) {
        return false;
      }

      // Employment Type filter
      if (filters.employmentType !== 'All Types' && job.employmentType !== filters.employmentType) {
        return false;
      }

      // Salary Range filter
      if (filters.salaryRange !== 'All Salaries') {
        if (filters.salaryRange === '₹3 - ₹6 LPA' && (job.salaryMinLpa > 6 || job.salaryMaxLpa < 3)) return false;
        if (filters.salaryRange === '₹6 - ₹12 LPA' && (job.salaryMinLpa > 12 || job.salaryMaxLpa < 6)) return false;
        if (filters.salaryRange === '₹12 - ₹20 LPA' && (job.salaryMinLpa > 20 || job.salaryMaxLpa < 12)) return false;
        if (filters.salaryRange === '₹20+ LPA' && job.salaryMaxLpa < 20) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'salary-high') {
        return (b.salaryMaxLpa || 0) - (a.salaryMaxLpa || 0);
      }
      if (sortBy === 'newest') {
        return b.id - a.id;
      }
      return 0;
    });
  }, [jobs, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  // Active filter tags for chip display
  const activeChips = [];
  if (filters.query) activeChips.push({ key: 'query', label: `Search: "${filters.query}"`, clear: () => setFilters(f => ({ ...f, query: '' })) });
  if (filters.category !== 'All Categories') activeChips.push({ key: 'category', label: filters.category, clear: () => setFilters(f => ({ ...f, category: 'All Categories' })) });
  if (filters.location !== 'All Locations') activeChips.push({ key: 'location', label: filters.location, clear: () => setFilters(f => ({ ...f, location: 'All Locations' })) });
  if (filters.workMode !== 'All Modes') activeChips.push({ key: 'workMode', label: filters.workMode, clear: () => setFilters(f => ({ ...f, workMode: 'All Modes' })) });
  if (filters.experience !== 'All Experience') activeChips.push({ key: 'experience', label: filters.experience, clear: () => setFilters(f => ({ ...f, experience: 'All Experience' })) });
  if (filters.employmentType !== 'All Types') activeChips.push({ key: 'employmentType', label: filters.employmentType, clear: () => setFilters(f => ({ ...f, employmentType: 'All Types' })) });
  if (filters.salaryRange !== 'All Salaries') activeChips.push({ key: 'salaryRange', label: filters.salaryRange, clear: () => setFilters(f => ({ ...f, salaryRange: 'All Salaries' })) });

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Jobs in India</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Explore Verified Job Openings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Showing <strong className="text-blue-600 font-bold">{filteredJobs.length}</strong> available job opportunities matching your criteria.
              </p>
            </div>
          </div>
        </div>

        {/* Top Search Bar with Filters & Sort in Row on Mobile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2.5 sm:p-4 mb-8 shadow-sm">
          <div className="flex flex-row items-center gap-2 sm:gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, query: e.target.value }));
                  setCurrentPage(1);
                }}
                placeholder="Search jobs, companies, skills..."
                className="w-full pl-8 sm:pl-10 pr-2.5 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium truncate"
              />
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-slate-800 shrink-0 transition-colors shadow-xs"
              title="Open Filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Filters</span>
              {activeChips.length > 0 && (
                <span className="bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {activeChips.length}
                </span>
              )}
            </button>

            {/* Sorted by Filter on right side */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-600 font-medium shrink-0">
              <span className="font-bold text-slate-500 whitespace-nowrap hidden md:inline">Sorted by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer shadow-xs"
              >
                <option value="newest">Most Recent</option>
                <option value="salary-high">Highest Salary</option>
              </select>
            </div>
          </div>

          {/* Active Chips Strip */}
          {activeChips.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">Active Filters:</span>
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {chip.label}
                  <button onClick={chip.clear} className="hover:text-blue-900 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleResetFilters}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold ml-2 underline"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <JobFilterSidebar
              filters={filters}
              setFilters={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1);
              }}
              onReset={handleResetFilters}
              totalCount={filteredJobs.length}
            />
          </div>

          {/* Job Listings Column */}
          <div className="lg:col-span-8 xl:col-span-9">
            
            {/* Jobs List / Grid */}
            {paginatedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-1">
                  No Jobs Found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                  We couldn't find any job openings matching your specific filter criteria. Try clearing some filters or searching with broader keywords.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all shadow-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600 shadow-blue-600/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm lg:hidden">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-950">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <JobFilterSidebar
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
              totalCount={filteredJobs.length}
            />

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full mt-6 bg-blue-600 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-blue-600/25"
            >
              Show {filteredJobs.length} Results
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Jobs;
