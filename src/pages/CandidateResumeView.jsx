import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  UploadCloud, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  Layers, 
  Sparkles, 
  FileCheck2, 
  Clock, 
  User,   
  Briefcase, 
  GraduationCap, 
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../context/JobContext';
import { getBackendFileUrl } from '../services/api';

const CandidateResumeView = () => {
  const navigate = useNavigate();
  const { user, uploadCandidateResume, deleteCandidateResume, calculateAtsScore } = useJobContext();

  const [viewMode, setViewMode] = useState('uploaded'); // 'uploaded' or 'ats'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Resume Upload Handler with 5MB validation
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadCandidateResume) {
      const res = await uploadCandidateResume(file);
      if (res) {
        setViewMode('uploaded');
      }
    }
    e.target.value = '';
  };

  const activeUser = user || {
    name: 'Candidate',
    email: '',
    phone: '',
    title: '',
    location: '',
    resumeName: ''
  };

  const rawResumeSource = activeUser.resumeBlobUrl || activeUser.resumeDataUrl || activeUser.resumeUrl;
  const activeResumeSource = getBackendFileUrl(rawResumeSource);
  const fileName = (activeUser.resumeName || activeResumeSource || '').toLowerCase();
  const isPdfFile = fileName.endsWith('.pdf') || fileName.includes('.pdf') || activeUser.resumeType === 'application/pdf';
  const isDocFile = fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.includes('.doc');
  const isImageFile = fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || (activeUser.resumeType && activeUser.resumeType.startsWith('image/'));

  // Direct Download Handler
  const handleDownloadResume = () => {
    if (activeResumeSource) {
      const a = document.createElement('a');
      a.href = activeResumeSource;
      a.target = '_blank';
      a.download = activeUser.resumeName || `${(activeUser.name || 'candidate').replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloading ${activeUser.resumeName || 'Resume'}`);
    } else {
      toast.error("No file uploaded yet. Upload your PDF or use ATS Builder to download Word/PDF.", { icon: '📄' });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Resume link copied to clipboard!");
    } else {
      toast.success("Resume ready for recruiter sharing.");
    }
  };

  const atsScore = calculateAtsScore ? calculateAtsScore(activeUser) : (activeUser.atsScore || 0);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 text-slate-900 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 overflow-y-auto' : ''}`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── 1. TOP HEADER & BREADCRUMB ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2 sm:p-4 rounded-3xl border border-slate-200 shadow-xs">
          
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors shrink-0"
              title="Return to Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  Candidate Resume Viewer
                </h1>
               
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{activeUser.name || 'Candidate'} {activeUser.title ? `• ${activeUser.title}` : ''}</span>
                {activeUser.resumeName && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{activeUser.resumeName}</span>
                    <span>•</span>
                    <span>Uploaded: {activeUser.resumeUploadDate || 'Recently'}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center">
              <button
                type="button"
                onClick={() => setViewMode('uploaded')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'uploaded'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Uploaded File</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('ats')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'ats'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ATS Formatted CV</span>
              </button>
            </div>

            <Link
              to="/resume-builder"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ATS Builder</span>
            </Link>

            {activeResumeSource && (
              <button
                type="button"
                onClick={handleDownloadResume}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
              title="Share Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {activeResumeSource && (
              <button
                type="button"
                onClick={deleteCandidateResume}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200 transition active:scale-95 cursor-pointer shadow-2xs"
                title="Delete Uploaded Resume"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold cursor-pointer border border-slate-200 transition shadow-2xs">
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>{activeResumeSource ? 'Replace File' : 'Upload File'}</span>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden lg:inline-flex p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* ── 2. MAIN DOCUMENT DISPLAY GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Document Viewer Column */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Document Frame Header Bar */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeResumeSource ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="font-bold text-slate-900">
                  {viewMode === 'uploaded' ? 'Uploaded Document View' : 'Standardized ATS Parser Resume'}
                </span>
                {activeUser.resumeSize && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span>{activeUser.resumeSize}</span>
                  </>
                )}
              </div>

              <span className="text-[11px] font-medium text-slate-500">
                {activeResumeSource ? 'Active Application Document' : 'No Document Attached'}
              </span>
            </div>

            {/* Document Content Canvas - Clean A4 view without scrollbars */}
            <div className="p-2 sm:p-4 flex-1 bg-slate-100/60 flex justify-center items-start [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              
              {/* MODE A: UPLOADED FILE VIEWER */}
              {viewMode === 'uploaded' && (
                <div className="w-full h-full flex flex-col items-center">
                  {activeResumeSource ? (
                    isPdfFile ? (
                      <div className="w-full max-w-[794px] h-[950px] sm:h-[1123px] bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 truncate max-w-xs">{activeUser.resumeName || 'Resume Document.pdf'}</span>
                          <a 
                            href={activeResumeSource} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold hover:underline"
                          >
                            <span>Open in Full Tab</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <iframe
                          src={`${activeResumeSource}#toolbar=1&navpanes=0`}
                          title="Candidate Uploaded Resume"
                          className="w-full flex-1 border-0 bg-white"
                        />
                      </div>
                    ) : isDocFile ? (
                      <div className="w-full max-w-[794px] bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-md flex flex-col items-center text-center space-y-6 my-auto">
                        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
                          <FileText className="w-10 h-10" />
                        </div>
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
                            Microsoft Word Document ({fileName.endsWith('.docx') ? '.DOCX' : '.DOC'})
                          </span>
                          <h3 className="text-xl font-black text-slate-900">
                            {activeUser.resumeName || 'Candidate Resume.docx'}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {activeUser.resumeSize || 'Verified Document'} • Ready for recruiter evaluation
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
                          <a
                            href={activeResumeSource}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={activeUser.resumeName || 'Resume.docx'}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download & View Word File</span>
                          </a>
                          <label className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition cursor-pointer inline-flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-blue-600" />
                            <span>Replace Document</span>
                            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full max-w-[794px] min-h-[1123px] bg-white p-4 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center">
                        <img 
                          src={activeResumeSource} 
                          alt="Uploaded Resume Dossier" 
                          className="w-full h-auto max-h-[1100px] object-contain rounded-xl border border-slate-100"
                        />
                      </div>
                    )
                  ) : (
                    /* Fallback when no direct blob */
                    <div className="w-full max-w-xl bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md text-center space-y-5 my-auto">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
                        <FileCheck2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-950">
                          No Resume Uploaded Yet
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                          Upload your PDF resume or switch to the ATS Formatted CV tab to view your profile credentials in ATS layout.
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <label className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs">
                          <span>Upload PDF Resume</span>
                          <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleResumeUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={() => setViewMode('ats')}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition"
                        >
                          View ATS Layout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE B: ATS FORMATTED CV VIEW */}
              {viewMode === 'ats' && (
                <div className="w-full max-w-[794px] min-h-[1123px] bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 font-sans text-slate-900 mx-auto">
                  
                  {/* CV Header */}
                  <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                        {activeUser.name || 'Candidate Name'}
                      </h2>
                      <p className="text-sm font-bold text-blue-700 mt-1">
                        {activeUser.title || 'Professional Candidate'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activeUser.location || 'Location Not Specified'} {activeUser.experience ? `• ${activeUser.experience} Experience` : ''}
                      </p>
                    </div>

                    <div className="text-xs sm:text-right space-y-1 text-slate-600 font-medium">
                      <p className="font-bold text-slate-900">{activeUser.email || 'No email'}</p>
                      <p>{activeUser.phone || 'No phone'}</p>
                    </div>
                  </div>

                  {/* CV Summary */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Professional Summary
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {activeUser.about || (
                        <span className="text-slate-400 italic">
                          No summary added yet. Go to your Profile page to add a professional bio.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* CV Technical Skills */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Core Competencies & Technical Skills
                    </h3>
                    {(activeUser.skills || []).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {activeUser.skills.map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No skills listed in profile.</p>
                    )}
                  </div>

                  {/* CV Work Experience */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Professional Work Experience
                    </h3>
                    {(activeUser.experienceList || []).length > 0 ? (
                      <div className="space-y-5">
                        {activeUser.experienceList.map((exp, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                              <span className="font-bold text-slate-950 text-sm">{exp.title}</span>
                              <span className="text-slate-500 font-semibold">{exp.period}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                              <span>{exp.company}</span>
                              {exp.location && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-500 font-medium">{exp.location}</span>
                                </>
                              )}
                            </div>
                            {exp.description && (
                              <p className="text-xs text-slate-600 leading-relaxed font-normal pt-1">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No work experience entries added.</p>
                    )}
                  </div>

                  {/* CV Education */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Education & Academic Credentials
                    </h3>
                    {(activeUser.education || []).length > 0 ? (
                      <div className="space-y-3">
                        {activeUser.education.map((edu, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-950">{edu.degree}</p>
                              <p className="text-slate-600 font-medium">{edu.institution} {edu.grade ? `• ${edu.grade}` : ''}</p>
                            </div>
                            <span className="text-slate-500 font-semibold">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No education records added.</p>
                    )}
                  </div>

                  {/* CV Verification Footer */}
                  <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified Candidate Dossier • JobPortal ATS Network</span>
                    </div>
                    <span>Direct Employer Connect</span>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Right Column: ATS Score & Management */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ATS Score Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-950">ATS Resume Score</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${atsScore >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                  {atsScore >= 70 ? 'High Match' : atsScore > 0 ? 'Good Start' : 'Not Calculated'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${atsScore > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-black text-xl shrink-0 shadow-md`}>
                  {atsScore > 0 ? atsScore : '0'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {atsScore > 0 ? `${atsScore} / 100 ATS Compliance` : 'No Resume Attached'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {atsScore > 0 ? 'Passes standard enterprise keyword parsing.' : 'Upload your resume to calculate your score.'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${(activeUser.skills || []).length >= 3 ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>3+ Skills listed in profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${(activeUser.experienceList || []).length > 0 ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Employment history added</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${(activeUser.education || []).length > 0 ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Education credentials added</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${activeUser.about ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Professional summary bio</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-950">Resume Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/profile"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                >
                  <User className="w-4 h-4" />
                  <span>Edit Profile Information</span>
                </Link>
                <Link
                  to="/resume-builder"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open ATS Resume Builder</span>
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CandidateResumeView;
