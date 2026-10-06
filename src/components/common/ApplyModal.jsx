import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Briefcase, 
  MapPin, 
  IndianRupee, 
  Sparkles, 
  ArrowRight,
  FileCode,
  Eye,
  Check,
  Award,
  GraduationCap,
  ExternalLink,
  Trash2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../../context/JobContext';

const ApplyModal = () => {
  const { 
    applyModalJob, 
    isApplyModalOpen, 
    closeApplyModal, 
    submitApplication, 
    user,
    atsResume,
    calculateAtsScore
  } = useJobContext();

  const [resumeOption, setResumeOption] = useState('built_in'); // 'built_in' | 'outer_file'
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    experience: user?.experience || '1-3 Years',
    currentLocation: user?.location || 'Bengaluru',
    currentCtc: '₹8 LPA',
    expectedCtc: '₹12 LPA',
    noticePeriod: 'Immediate / 15 Days',
    coverNote: '',
    resumeName: ''
  });

  const [outerFile, setOuterFile] = useState(null);
  const [outerFileName, setOuterFileName] = useState('');
  const [outerFileSize, setOuterFileSize] = useState('');
  const [outerFileDataUrl, setOuterFileDataUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived Built-in ATS Resume Data
  const builtInResumeData = React.useMemo(() => {
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
        title: cand.title || user?.title || 'Professional',
        linkedin: '',
        github: '',
        portfolio: ''
      },
      summary: cand.about || user?.about || 'Dedicated professional seeking new career opportunities.',
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
        technical: Array.isArray(cand.skills) ? cand.skills : (Array.isArray(user?.skills) ? user.skills : ['Communication', 'Problem Solving']),
        frameworks: [],
        tools: [],
        softSkills: []
      }
    };
  }, [atsResume, user]);

  const builtInResumeName = `${(builtInResumeData.personalInfo?.fullName || user?.name || 'Candidate').replace(/\s+/g, '_')}_ATS_Resume.pdf`;
  const calculatedScore = calculateAtsScore(builtInResumeData) || 92;

  useEffect(() => {
    if (isApplyModalOpen && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        experience: user.experience || user.candidateProfile?.experience || prev.experience,
        currentLocation: user.location || user.candidateProfile?.location || prev.currentLocation,
        resumeName: prev.resumeName || user.resumeName || builtInResumeName
      }));

      // If user already had an outer file uploaded in profile, preserve it as default outer option
      if (user.resumeName && !user.resumeName.includes('ATS_Resume')) {
        setOuterFileName(user.resumeName);
        setOuterFileSize(user.resumeSize || '1.2 MB');
        setOuterFileDataUrl(user.resumeDataUrl || user.resumeUrl || '');
      }
    }
  }, [isApplyModalOpen, user, builtInResumeName]);

  if (!isApplyModalOpen || !applyModalJob) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setOuterFile(file);
      setOuterFileName(file.name);
      setOuterFileSize(`${sizeMB} MB`);

      const reader = new FileReader();
      reader.onload = (event) => {
        setOuterFileDataUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearOuterFile = (e) => {
    e.stopPropagation();
    setOuterFile(null);
    setOuterFileName('');
    setOuterFileSize('');
    setOuterFileDataUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (resumeOption === 'outer_file' && !outerFileName) {
      toast.error("Please upload a resume file from your device, or switch to the Built-in Website Resume option.", {
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

      await submitApplication(applyModalJob, payload);
    } catch (err) {
      console.error("Apply submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={closeApplyModal}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Fast-Track Application & Recruiter Connect
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white pr-8 line-clamp-1">
            {applyModalJob.title}
          </h2>

          <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-300 mt-1 flex-wrap">
            <span className="font-bold text-white">{applyModalJob.company}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {applyModalJob.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <IndianRupee className="w-3.5 h-3.5" />
              {applyModalJob.salary || 'Competitive CTC'}
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Personal Info Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              1. Candidate Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              2. Experience & Compensation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Experience
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold"
                >
                  <option value="Fresher (0-1 yrs)">Fresher (0-1 yrs)</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5-8 Years">5-8 Years</option>
                  <option value="8+ Years">8+ Years</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notice Period
                </label>
                <select
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expected CTC
                </label>
                <input
                  type="text"
                  value={formData.expectedCtc}
                  onChange={(e) => setFormData({ ...formData, expectedCtc: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold"
                  placeholder="e.g. ₹10 LPA"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RESUME SELECTION: 2 OPTIONS (BUILT-IN VS OUTER FILE) */}
          {/* ========================================================= */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Choose Resume Submission Option *
              </label>
              <span className="text-[11px] text-blue-600 font-medium">
                Sent directly to hiring manager
              </span>
            </div>

            {/* Option Tabs / Radio Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {/* OPTION 1: Built-in Website Resume */}
              <div 
                onClick={() => setResumeOption('built_in')}
                className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  resumeOption === 'built_in'
                    ? 'bg-blue-50/70 border-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      resumeOption === 'built_in' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        Built-in ATS Resume
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-extrabold uppercase">
                          Website
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">From portal ATS builder & profile</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    resumeOption === 'built_in' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {resumeOption === 'built_in' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* OPTION 2: Upload Outer File */}
              <div 
                onClick={() => setResumeOption('outer_file')}
                className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  resumeOption === 'outer_file'
                    ? 'bg-blue-50/70 border-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      resumeOption === 'outer_file' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        Upload Outer File
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-extrabold uppercase">
                          Device
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">PDF, DOCX from your computer</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    resumeOption === 'outer_file' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {resumeOption === 'outer_file' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>

            {/* OPTION 1 CONTENT: Built-in Website ATS Resume Details */}
            {resumeOption === 'built_in' && (
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl animate-in fade-in duration-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                      ATS
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block truncate max-w-[240px] sm:max-w-xs">
                        {builtInResumeName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Portal Formatted • {builtInResumeData.experiences?.length || 0} Experience(s) • {builtInResumeData.education?.length || 0} Education
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      ATS Score: {calculatedScore}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {/* Skills tags preview */}
                {builtInResumeData.skills?.technical && builtInResumeData.skills.technical.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-blue-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Included Skills:</span>
                    {builtInResumeData.skills.technical.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white border border-blue-200 text-slate-700 rounded-md text-[10px] font-semibold">
                        {skill}
                      </span>
                    ))}
                    {builtInResumeData.skills.technical.length > 5 && (
                      <span className="text-[10px] text-blue-600 font-bold">
                        +{builtInResumeData.skills.technical.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* OPTION 2 CONTENT: Outer File Upload */}
            {resumeOption === 'outer_file' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in duration-200">
                {outerFileName ? (
                  /* Uploaded File Selected State */
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-blue-200 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {outerFileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block truncate max-w-[200px] sm:max-w-sm">
                          {outerFileName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{outerFileSize || 'Attached'}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ready to Send
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label 
                        htmlFor="resume-file-replace" 
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition"
                      >
                        Replace
                        <input
                          type="file"
                          id="resume-file-replace"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleClearOuterFile}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty Dropzone State */
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-xl p-5 bg-white text-center transition-colors">
                    <input
                      type="file"
                      id="resume-file-outer"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="resume-file-outer" className="cursor-pointer block">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-1.5">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          Click to upload outer resume from computer / device
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          Supports PDF, DOC, DOCX up to 10MB
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cover note */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              4. Short Note to Hiring Team (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.coverNote}
              onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
              placeholder="Highlight key achievements, domain skills, or why you are a great fit..."
            />
          </div>

          {/* Sticky Actions Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-400">
              Selected: <span className="font-bold text-slate-700">{resumeOption === 'built_in' ? 'Website Built ATS Resume' : (outerFileName || 'Outer File')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeApplyModal}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                <span>{isSubmitting ? "Submitting Application..." : "Submit to Employer"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* QUICK ATS RESUME PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Website Built ATS Resume Preview</h3>
                  <p className="text-[10px] text-slate-500">How the employer will receive and evaluate your profile</p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Header Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h2 className="text-base font-extrabold text-slate-900">{builtInResumeData.personalInfo?.fullName || user?.name}</h2>
                <p className="text-xs font-bold text-blue-600">{builtInResumeData.personalInfo?.title || 'Professional Candidate'}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-2 flex-wrap">
                  <span>{builtInResumeData.personalInfo?.email || user?.email}</span>
                  <span>•</span>
                  <span>{builtInResumeData.personalInfo?.phone || user?.phone}</span>
                  <span>•</span>
                  <span>{builtInResumeData.personalInfo?.location || user?.location}</span>
                </div>
              </div>

              {/* Summary */}
              {builtInResumeData.summary && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">Professional Summary</h4>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {builtInResumeData.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5">Work Experience</h4>
                {builtInResumeData.experiences && builtInResumeData.experiences.length > 0 ? (
                  <div className="space-y-2">
                    {builtInResumeData.experiences.map((exp, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{exp.role || 'Role'}</span>
                          <span className="text-[10px] text-slate-500">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <span className="text-blue-600 text-[11px] font-semibold block">{exp.company}</span>
                        {exp.description && <p className="text-slate-600 text-[11px] mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No formal experience records added.</p>
                )}
              </div>

              {/* Education */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5">Education</h4>
                {builtInResumeData.education && builtInResumeData.education.length > 0 ? (
                  <div className="space-y-2">
                    {builtInResumeData.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{edu.degree}</span>
                          <span className="text-[10px] text-slate-500">{edu.year}</span>
                        </div>
                        <span className="text-slate-600 text-[11px]">{edu.institution}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No education records added.</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5">Core Competencies & Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(builtInResumeData.skills?.technical || []).map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700"
              >
                Looks Good, Use This Resume
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplyModal;
