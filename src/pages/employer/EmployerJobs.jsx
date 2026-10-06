import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Users2, 
  MapPin, 
  IndianRupee, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  X, 
  PauseCircle, 
  PlayCircle, 
  ExternalLink, 
  ChevronRight 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../../context/JobContext';
import EmployerLayout from './EmployerLayout';

const EmployerJobs = () => {
  const { 
    myEmployerJobs: jobs = [], 
    myEmployerApplicants: applicants = [], 
    deleteJobPosting, 
    toggleJobStatus 
  } = useJobContext();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteConfirmJob, setDeleteConfirmJob] = useState(null);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return (jobs || []).filter(job => {
      const title = (job.title || '').toLowerCase();
      const location = (job.location || '').toLowerCase();
      const category = (job.category || '').toLowerCase();
      const searchTerm = search.toLowerCase();

      const matchSearch = title.includes(searchTerm) ||
                          location.includes(searchTerm) ||
                          category.includes(searchTerm);
      
      const currentStatus = job.status || 'Active';
      const matchStatus = statusFilter === 'All' || currentStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [jobs, search, statusFilter]);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmJob) return;
    await deleteJobPosting(deleteConfirmJob.id || deleteConfirmJob._id, deleteConfirmJob.title);
    setDeleteConfirmJob(null);
  };

  return (
    <EmployerLayout>
      <div className="space-y-5">
        
        {/* Top Action Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950">
              Manage Job Postings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Create, edit full details, pause, and track candidate applications across all open positions.
            </p>
          </div>

          <Link
            to="/employer/post-job"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md shadow-blue-600/20 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Post a New Job</span>
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title or location..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['All', 'Active', 'Paused', 'Closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter.toLowerCase() === status.toLowerCase()
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List Table / Cards */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const jobApps = applicants.filter(a => String(a.jobId) === String(job.id || job._id) || a.jobTitle === job.title);
              const isPaused = job.status === 'Paused' || job.status === 'paused';
              const isClosed = job.status === 'Closed' || job.status === 'closed';

              return (
                <div
                  key={job.id || job._id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isPaused ? 'border-slate-300 bg-slate-50/50' : isClosed ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {/* Left: Job details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base tracking-wider shrink-0 shadow-xs bg-slate-900"
                    >
                      {job.logoText || (job.company ? job.company.substring(0, 3).toUpperCase() : 'JOB')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        {/* Interactive Status Selector (Active, Paused, Closed) */}
                        <select
                          value={job.status || 'Active'}
                          onChange={(e) => toggleJobStatus(job.id || job._id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer focus:outline-none transition-all ${
                            isClosed 
                              ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                              : isPaused 
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          }`}
                          title="Change Job Publication Status"
                        >
                          <option value="Active">● Active (Open)</option>
                          <option value="Paused">⏸ Paused (On Hold)</option>
                          <option value="Closed">🔒 Closed (Filled)</option>
                        </select>

                        {job.urgent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            Urgent Hiring
                          </span>
                        )}
                        {job.featured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            Featured
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-medium">
                          {job.category}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                        {job.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-900">
                          <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
                          {job.salary || job.salaryDisplay}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location} ({job.workplaceType || job.workMode || 'On-site'})
                        </span>
                        <span>•</span>
                        <span>{job.experience}</span>
                        <span>•</span>
                        <span className="text-slate-400">{job.vacancies || 1} Openings</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Metrics */}
                  <div className="flex items-center gap-2.5 self-end lg:self-center flex-wrap pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    
                    {/* View Applicants Pill */}
                    <Link
                      to={`/employer/applicants?jobId=${job.id || job._id}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors shadow-xs"
                      title="View all candidates applied for this job"
                    >
                      <Users2 className="w-4 h-4" />
                      <span>{jobApps.length} Applicants</span>
                    </Link>

                    {/* View Public Post */}
                    <Link
                      to={`/career-opportunities/${job.slug || job.id}`}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                      title="View Public Job Page"
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Toggle Status (Pause / Activate) */}
                    <button
                      onClick={() => toggleJobStatus(job.id || job._id, isPaused ? 'Active' : 'Paused')}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={isPaused ? "Resume / Activate Job" : "Pause Job"}
                    >
                      {isPaused ? <PlayCircle className="w-4 h-4 text-blue-600" /> : <PauseCircle className="w-4 h-4 text-slate-600" />}
                    </button>

                    {/* Edit Full Job Details in Full Form Page */}
                    <Link
                      to={`/employer/edit-job/${job.id || job._id}`}
                      className="px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Edit Full Job Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </Link>

                    {/* Delete Job */}
                    <button
                      onClick={() => setDeleteConfirmJob(job)}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Jobs Found</h3>
            <p className="text-xs text-slate-500 mb-6">No job postings match your current filter query.</p>
            <Link
              to="/employer/post-job"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-block"
            >
              Post a New Position
            </Link>
          </div>
        )}

      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 text-center shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Job Posting?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to permanently delete <strong>"{deleteConfirmJob.title}"</strong>? This will also remove associated applicant records.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteConfirmJob(null)}
                className="py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-900 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </EmployerLayout>
  );
};

export default EmployerJobs;
