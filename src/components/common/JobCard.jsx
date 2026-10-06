import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Bookmark, 
  BookmarkCheck, 
  ChevronRight, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useJobContext } from '../../context/JobContext';

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { toggleSaveJob, isJobSaved, openApplyModal } = useJobContext();
  const saved = isJobSaved(job.id);

  // Clean, concise salary format (e.g. ₹14 - 22 LPA)
  const formattedSalary = job.salaryMinLpa && job.salaryMaxLpa 
    ? `₹${job.salaryMinLpa} - ${job.salaryMaxLpa} LPA`
    : (job.salary?.includes('PA') 
        ? job.salary.replace(' PA', '').replace(/,00,000/g, 'L').replace(/,000/g, 'k') 
        : (job.salary || 'Best in Industry'));

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-600/5 transition-all duration-200 flex flex-col justify-between relative">
      
      {/* Top Header: Logo + Company Info + Bookmark */}
      <div className="flex items-start justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-white text-xs sm:text-sm tracking-wider shrink-0 shadow-2xs bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-800"
          >
            {job.logoText || job.company.substring(0, 3).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link 
              to={`/companies/${job.companySlug || 'infosys-technologies'}`}
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors truncate"
            >
              <span className="truncate">{job.company}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-50 shrink-0" />
            </Link>
            {job.urgent && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500 shrink-0" />
                <span>Actively Hiring</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaveJob(job.id, job.title);
          }}
          className={`p-1.5 sm:p-2 rounded-xl transition-all border shrink-0 ${
            saved
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
              : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-slate-200'
          }`}
          title={saved ? "Saved to Bookmarks" : "Save Job"}
          aria-label="Save Job"
        >
          {saved ? <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" /> : <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
      </div>

      {/* Job Title */}
      <div className="mb-3">
        <Link 
          to={`/career-opportunities/${job.slug}`}
          className="text-xs sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 group-hover:underline"
        >
          {job.title}
        </Link>
      </div>

      {/* Essential Coordinates Only: Location • Experience • Salary */}
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-slate-600 mb-3.5">
        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 truncate max-w-[120px] sm:max-w-none">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{job.location}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
          <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
          <span>{job.experience || '2+ Yrs'}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-700 font-bold">
          <IndianRupee className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{formattedSalary}</span>
        </span>
      </div>

      {/* Footer: Posted time + Details & Apply actions */}
      <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
          {job.postedDate || 'Recent'}
        </span>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to={`/career-opportunities/${job.slug}`}
            className="text-[11px] sm:text-xs font-bold text-slate-600 hover:text-blue-600 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Details
          </Link>
          <button
            onClick={() => openApplyModal(job, navigate)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1"
          >
            <span>Apply</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default JobCard;
