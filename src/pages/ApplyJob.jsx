import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  Clock, 
  Sparkles, 
  FileCode, 
  UploadCloud, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  Trash2, 
  Check, 
  ArrowRight, 
  X, 
  Printer, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../context/JobContext';
import { resumeApi } from '../services/api';
import AtsResumeDocument from '../components/common/AtsResumeDocument';

const ApplyJob = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { 
    jobs, 
    user, 
    isAuthenticated, 
    atsResume, 
    calculateAtsScore, 
    submitApplication,
    candidateAppliedJobs
  } = useJobContext();

  // Find target job by slug, _id, or id
  const targetJob = useMemo(() => {
    if (!slug) return null;
    return jobs.find(j => 
      String(j.slug) === String(slug) || 
      String(j._id) === String(slug) || 
      String(j.id) === String(slug)
    ) || {
      id: slug,
      slug: slug,
      title: 'Senior Software Developer',
      company: 'Enterprise Technology Solutions',
      location: 'Bengaluru, Karnataka (Hybrid)',
      salary: '₹14 - ₹22 LPA',
      type: 'Full-Time',
      workplaceType: 'Hybrid',
      category: 'Software & Technology',
      experience: '2-5 Years',
      skills: ['React.js', 'Node.js', 'JavaScript', 'Tailwind CSS', 'API Integration']
    };
  }, [jobs, slug]);

  const alreadyApplied = useMemo(() => {
    if (!targetJob) return false;
    const targetId = targetJob._id || targetJob.id;
    return candidateAppliedJobs.some(app => app.jobId === targetId || app.jobId === targetJob.id);
  }, [candidateAppliedJobs, targetJob]);

  const [resumeOption, setResumeOption] = useState('built_in'); // 'built_in' | 'outer_file'
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    experience: user?.experience || '1-3 Years',
    currentLocation: user?.location || 'Bengaluru',
    currentCtc: '₹8 LPA',
    expectedCtc: '₹12 LPA',
    noticePeriod: 'Immediate / 15 Days',
    coverNote: ''
  });

  const [outerFile, setOuterFile] = useState(null);
  const [outerFileName, setOuterFileName] = useState('');
  const [outerFileSize, setOuterFileSize] = useState('');
  const [outerFileDataUrl, setOuterFileDataUrl] = useState('');

  // Derived Built-in ATS Resume Data
  const builtInResumeData = useMemo(() => {
    if (atsResume && (atsResume.personalInfo?.fullName || atsResume.summary || atsResume.experiences?.length)) {
      return atsResume;
    }
    const cand = user?.candidateProfile || {};
    return {
      personalInfo: {
        fullName: user?.name || 'Candidate',
        email: user?.email || '',
        phone: user?.phone || '',
        location: cand.location || user?.location || 'India',
        title: cand.title || user?.title || 'Professional Candidate',
        linkedin: '',
        github: '',
        portfolio: ''
      },
      summary: cand.about || user?.about || 'Dedicated professional with expertise in technical problem solving, full-lifecycle execution, and team collaboration.',
      experiences: (cand.experienceList || user?.experienceList || []).map((exp, idx) => ({
        id: exp.id || `exp-${idx}`,
        company: exp.company || '',
        role: exp.role || exp.title || '',
        location: exp.location || '',
        startDate: exp.startDate || (exp.period ? exp.period.split('-')[0]?.trim() : '') || '',
        endDate: exp.endDate || (exp.period ? exp.period.split('-')[1]?.trim() : '') || 'Present',
        description: exp.description || ''
      })),
      education: (cand.education || user?.education || []).map((edu, idx) => ({
        id: edu.id || `edu-${idx}`,
        institution: edu.institution || '',
        degree: edu.degree || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        location: edu.location || '',
        year: edu.year || edu.endDate || ''
      })),
      skills: {
        technical: Array.isArray(cand.skills) && cand.skills.length > 0 ? cand.skills : (Array.isArray(user?.skills) && user.skills.length > 0 ? user.skills : (targetJob?.skills || ['JavaScript', 'React.js', 'Problem Solving'])),
        frameworks: [],
        tools: [],
        softSkills: []
      }
    };
  }, [atsResume, user, targetJob]);

  const builtInResumeName = `${(builtInResumeData.personalInfo?.fullName || user?.name || 'Candidate').replace(/\s+/g, '_')}_ATS_Resume.pdf`;
  const calculatedScore = calculateAtsScore(builtInResumeData) || 95;

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        experience: user.experience || user.candidateProfile?.experience || prev.experience,
        currentLocation: user.location || user.candidateProfile?.location || prev.currentLocation
      }));

      if (user.resumeName && !user.resumeName.includes('ATS_Resume')) {
        setOuterFileName(user.resumeName);
        setOuterFileSize(user.resumeSize || '1.2 MB');
        setOuterFileDataUrl(user.resumeDataUrl || user.resumeUrl || '');
      }
    }
  }, [user]);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 1. Validate File Size (Max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        toast.error("File size exceeds 5 MB limit. Please upload a smaller PDF or Word file.", { duration: 5000, icon: '⚠️' });
        e.target.value = '';
        return;
      }

      // 2. Validate File Format (.pdf, .doc, .docx)
      const allowedExts = ['.pdf', '.doc', '.docx'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExts.includes(fileExt)) {
        toast.error("Invalid file format. Only PDF and Word documents (.pdf, .doc, .docx) are allowed.", { duration: 5000, icon: '⚠️' });
        e.target.value = '';
        return;
      }

      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setOuterFile(file);
      setOuterFileName(file.name);
      setOuterFileSize(`${sizeMB} MB`);

      // Upload file directly to backend uploads folder
      const uploadFormData = new FormData();
      uploadFormData.append('resume', file);
      try {
        const uploadRes = await resumeApi.uploadFile(uploadFormData);
        if (uploadRes?.fileUrl) {
          setOuterFileDataUrl(uploadRes.fileUrl);
          toast.success(`Resume "${file.name}" uploaded to server!`);
        }
      } catch (err) {
        console.warn("Backend upload notice:", err.message);
        const reader = new FileReader();
        reader.onload = (event) => {
          setOuterFileDataUrl(event.target.result);
        };
        reader.readAsDataURL(file);
        toast.success(`Resume "${file.name}" attached.`);
      }
    }
  };

  const handleClearOuterFile = (e) => {
    e.stopPropagation();
    setOuterFile(null);
    setOuterFileName('');
    setOuterFileSize('');
    setOuterFileDataUrl('');
    toast.success("Uploaded resume removed.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to your candidate account to apply.", { icon: '🔒' });
      navigate(`/login?redirect=${encodeURIComponent(`/apply/${targetJob.slug || targetJob.id}`)}`);
      return;
    }

    if (resumeOption === 'outer_file' && !outerFileName) {
      toast.error("Please upload a resume file from your computer/device, or select the Website Built ATS Resume option.", {
        icon: '⚠️'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        experience: formData.experience,
        currentLocation: formData.currentLocation,
        currentCtc: formData.currentCtc,
        expectedCtc: formData.expectedCtc,
        noticePeriod: formData.noticePeriod,
        coverNote: formData.coverNote,
        resumeSource: resumeOption, // 'built_in' | 'outer_file'
        resumeName: resumeOption === 'built_in' ? builtInResumeName : outerFileName,
        resumeUrl: resumeOption === 'built_in' ? '' : outerFileDataUrl,
        resumeDataUrl: resumeOption === 'built_in' ? '' : outerFileDataUrl,
        resumeSize: resumeOption === 'built_in' ? '1.5 MB' : outerFileSize,
        atsResumeData: resumeOption === 'built_in' ? builtInResumeData : null
      };

      const success = await submitApplication(targetJob, payload);
      if (success) {
        setSubmittedData(payload);
        setIsSubmittedSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error("Apply submit error:", err);
      toast.error("An error occurred while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!targetJob) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Job Posting Not Found</h2>
        <p className="text-slate-500 mt-2">The job opportunity you are trying to apply for does not exist or has expired.</p>
        <Link to="/jobs" className="mt-6 inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl">
          Browse Active Jobs
        </Link>
      </div>
    );
  }

  // =========================================================================
  // SUCCESS VIEW STATE (AFTER SUCCESSFUL APPLICATION SUBMISSION)
  // =========================================================================
  if (isSubmittedSuccess) {
    return (
      <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-300">
          
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Application Delivered to Employer
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Application Submitted Successfully!
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Your profile and selected resume have been sent directly to the recruiting team at <strong className="text-slate-900">{targetJob.company}</strong>.
          </p>

          {/* Submission Details Card */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left my-8 max-w-xl mx-auto space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 text-xs">
              <span className="text-slate-500 font-bold uppercase">Applied Position</span>
              <span className="font-extrabold text-slate-900">{targetJob.title}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 text-xs">
              <span className="text-slate-500 font-bold uppercase">Company</span>
              <span className="font-extrabold text-blue-600">{targetJob.company}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 text-xs">
              <span className="text-slate-500 font-bold uppercase">Applicant Name</span>
              <span className="font-bold text-slate-800">{submittedData?.name || user?.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold uppercase">Submitted Resume</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {submittedData?.resumeSource === 'built_in' ? (
                  <>
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>Website Built ATS Resume (Verified)</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>{submittedData?.resumeName || 'Uploaded Outer File'}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Actions Button Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link
              to="/messages"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Recruiter Chat</span>
            </Link>
            <Link
              to="/candidate-dashboard"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition"
            >
              <span>Track in Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <Link to="/jobs" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition">
              ← Return to Browse More Career Opportunities
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN APPLICATION PAGE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            <span>/</span>
            <Link to="/jobs" className="hover:text-blue-600 transition">Jobs</Link>
            <span>/</span>
            <Link to={`/career-opportunities/${targetJob.slug}`} className="hover:text-blue-600 transition truncate max-w-[200px]">
              {targetJob.title}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Apply</span>
          </div>

          <Link
            to={`/career-opportunities/${targetJob.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job Details</span>
          </Link>
        </div>

        {/* ALREADY APPLIED ALERT */}
        {alreadyApplied && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900">You have already submitted an application for this position</h4>
                <p className="text-[11px] text-amber-700">Track your status or message the recruitment team directly in your messaging portal.</p>
              </div>
            </div>
            <Link 
              to="/messages"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Open Recruiter Messages
            </Link>
          </div>
        )}

        {/* TOP JOB BANNER CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                {targetJob.company ? targetJob.company.substring(0, 3).toUpperCase() : 'JOB'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold text-blue-600">{targetJob.company}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Employer Posting
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {targetJob.title}
                </h1>
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-600 mt-2 flex-wrap font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {targetJob.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    {targetJob.salary || 'Competitive CTC'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {targetJob.experience || '1-3 Years'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-slate-700 flex items-center gap-3 max-w-sm shrink-0">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>Direct fast-track pipeline: Your submission goes directly to the hiring manager.</span>
            </div>
          </div>
        </div>

        {/* MAIN TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 8 COLS: THE APPLICATION FORM */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* STEP 1: CANDIDATE INFO */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
                    Candidate Contact Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Current Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.currentLocation}
                      onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2: PROFESSIONAL PROFILE */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
                    Experience & Compensation
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Total Experience
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold transition"
                    >
                      <option value="Fresher (0-1 yrs)">Fresher (0-1 yrs)</option>
                      <option value="1-3 Years">1-3 Years</option>
                      <option value="3-5 Years">3-5 Years</option>
                      <option value="5-8 Years">5-8 Years</option>
                      <option value="8+ Years">8+ Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Notice Period
                    </label>
                    <select
                      value={formData.noticePeriod}
                      onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold transition"
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="60 Days">60 Days</option>
                      <option value="90 Days">90 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Expected CTC
                    </label>
                    <input
                      type="text"
                      value={formData.expectedCtc}
                      onChange={(e) => setFormData({ ...formData, expectedCtc: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold transition"
                      placeholder="e.g. ₹10 LPA"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* STEP 3: RESUME SUBMISSION - 2 SELECTABLE OPTIONS */}
              {/* ========================================================= */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
                      Select Resume to Send to Employer *
                    </h3>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold">
                    Choose option 1 (Portal ATS) or option 2 (Outer File)
                  </span>
                </div>

                {/* The 2 Option Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  
                  {/* OPTION 1 CARD: Website Built ATS Resume */}
                  <div 
                    onClick={() => setResumeOption('built_in')}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      resumeOption === 'built_in'
                        ? 'bg-blue-50/70 border-blue-600 shadow-md ring-2 ring-blue-600/10'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                          resumeOption === 'built_in' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          <FileCode className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                            Built-in ATS Resume
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-black uppercase">
                              Website
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">Resume created on Balaji portal</p>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        resumeOption === 'built_in' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {resumeOption === 'built_in' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  {/* OPTION 2 CARD: Upload Outer File */}
                  <div 
                    onClick={() => setResumeOption('outer_file')}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      resumeOption === 'outer_file'
                        ? 'bg-blue-50/70 border-blue-600 shadow-md ring-2 ring-blue-600/10'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                          resumeOption === 'outer_file' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                            Upload Outer File
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[10px] font-black uppercase">
                              Device
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">PDF, DOCX from your computer</p>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        resumeOption === 'outer_file' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {resumeOption === 'outer_file' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                </div>

                {/* OPTION 1 CONTENT: Built-in Website ATS Resume Details */}
                {resumeOption === 'built_in' && (
                  <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-2xl animate-in fade-in duration-200 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                          ATS
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block truncate max-w-[280px] sm:max-w-md">
                            {builtInResumeName}
                          </span>
                          <span className="text-xs text-slate-500">
                            Verified ATS Resume • {builtInResumeData.experiences?.length || 0} Experience(s) • {builtInResumeData.education?.length || 0} Academic Record(s)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          ATS Score: {calculatedScore}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsPreviewModalOpen(true)}
                          className="px-3.5 py-2 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview Resume</span>
                        </button>
                      </div>
                    </div>

                    {/* Skill Pills preview */}
                    {builtInResumeData.skills?.technical && builtInResumeData.skills.technical.length > 0 && (
                      <div className="pt-3 border-t border-blue-100 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Included Skills:</span>
                        {builtInResumeData.skills.technical.slice(0, 6).map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-blue-200 text-slate-700 rounded-lg text-xs font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* OPTION 2 CONTENT: Outer File Upload */}
                {resumeOption === 'outer_file' && (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in duration-200">
                    {outerFileName ? (
                      /* File selected state */
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-200 shadow-xs flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {outerFileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block truncate max-w-[240px] sm:max-w-md">
                              {outerFileName}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span>{outerFileSize || 'Ready'}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Ready to Send to Recruiter
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label 
                            htmlFor="page-resume-file-replace" 
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition"
                          >
                            Replace File
                            <input
                              type="file"
                              id="page-resume-file-replace"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleClearOuterFile}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop Upload Zone */
                      <div className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-2xl p-6 bg-white text-center transition-colors">
                        <input
                          type="file"
                          id="page-resume-file-outer"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="page-resume-file-outer" className="cursor-pointer block">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-2">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                              Click or Drag & Drop to upload outer resume file
                            </span>
                            <span className="text-xs text-slate-400 mt-1 font-medium">
                              Supports PDF, DOC, DOCX up to 5 MB
                            </span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* STEP 4: COVER LETTER / MESSAGE */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
                    Note to Hiring Team (Optional)
                  </h3>
                </div>

                <textarea
                  rows={3}
                  value={formData.coverNote}
                  onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                  className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                  placeholder="Introduce yourself, highlight specific achievements, and share why you are the ideal fit for this role..."
                />
              </div>

              {/* SUBMIT BUTTON & DISCLAIMER */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Submitting with: <strong className="text-slate-800">{resumeOption === 'built_in' ? 'Website Built ATS Resume' : (outerFileName || 'Outer File')}</strong>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    to={`/career-opportunities/${targetJob.slug}`}
                    className="w-1/2 sm:w-auto text-center px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Submitting..." : "Send Application to Employer"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* RIGHT 4 COLS: JOB OVERVIEW & RECRUITER INFO */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Job Snapshot */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
                Job Snapshot
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Job Category</span>
                  <span className="font-bold text-slate-900">{targetJob.category || 'Information Technology'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Work Mode</span>
                  <span className="font-bold text-slate-900">{targetJob.workplaceType || 'Hybrid / On-site'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Employment Type</span>
                  <span className="font-bold text-slate-900">{targetJob.type || 'Full-Time'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Offered CTC</span>
                  <span className="font-bold text-emerald-600">{targetJob.salary || 'Competitive'}</span>
                </div>
              </div>

              {/* Skills required */}
              {targetJob.skills && targetJob.skills.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Required Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {targetJob.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recruiter Trust & Verification Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Balaji Direct Apply Guarantee</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you submit this application, your selected resume and verified candidate profile are automatically routed into {targetJob.company}'s employer dashboard.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>Instant Recruiter Messaging Enabled</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* QUICK ATS RESUME PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  ATS
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    {builtInResumeData.personalInfo?.fullName || user?.name || 'Candidate'} — ATS Resume
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                      {calculatedScore}% ATS Match
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Live preview in the exact single-column format generated by the website</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                  title="Print / Save PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print CV</span>
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Sheet Viewer */}
            <div className="py-4 overflow-y-auto flex-1 bg-slate-100/70 rounded-2xl p-2 sm:p-6 my-2 flex justify-center items-start">
              <AtsResumeDocument 
                resumeData={builtInResumeData} 
                candidate={user} 
                className="w-full"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                100% Machine-Readable Format • Guaranteed Parser Friendly
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 shadow-sm"
                >
                  Confirm & Use This Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplyJob;
