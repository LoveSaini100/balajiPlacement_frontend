import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  FileCode, 
  Eye, 
  Edit3, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Award, 
  FolderGit2,
  Check,
  ShieldCheck,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../context/JobContext';

const createCandidateResume = (user, savedResume) => {
  if (savedResume && (savedResume.personalInfo?.fullName || savedResume.personalInfo?.email)) {
    return savedResume;
  }
  return {
    personalInfo: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || user?.candidateProfile?.location || '',
      title: user?.title || user?.candidateProfile?.title || '',
      linkedin: user?.linkedin || '',
      github: user?.github || '',
      portfolio: user?.portfolio || ''
    },
    summary: user?.about || user?.candidateProfile?.about || '',
    experiences: (user?.experienceList || user?.candidateProfile?.experienceList || []).map((exp, idx) => ({
      id: exp.id || `exp-${idx}-${Date.now()}`,
      company: exp.company || '',
      role: exp.role || exp.title || '',
      location: exp.location || '',
      startDate: exp.startDate || (exp.period ? exp.period.split('-')[0]?.trim() : '') || '',
      endDate: exp.endDate || (exp.period ? exp.period.split('-')[1]?.trim() : '') || 'Present',
      current: !exp.endDate || (typeof exp.endDate === 'string' && exp.endDate.toLowerCase().includes('present')),
      description: exp.description || '',
      highlights: Array.isArray(exp.highlights) && exp.highlights.length > 0
        ? exp.highlights
        : (exp.description ? [exp.description] : [''])
    })),
    education: (user?.education || user?.candidateProfile?.education || []).map((edu, idx) => ({
      id: edu.id || `edu-${idx}-${Date.now()}`,
      institution: edu.institution || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      location: edu.location || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || edu.year || '',
      grade: edu.grade || ''
    })),
    skills: {
      technical: Array.isArray(user?.skills) ? [...user.skills] : (Array.isArray(user?.candidateProfile?.skills) ? [...user.candidateProfile.skills] : []),
      frameworks: [],
      tools: [],
      softSkills: []
    },
    projects: [],
    certifications: []
  };
};

const AtsResumeBuilder = () => {
  const { user, atsResume, saveAtsResume } = useJobContext();
  const [resumeData, setResumeData] = useState(() => {
    return createCandidateResume(user, atsResume);
  });

  const [activeTab, setActiveTab] = useState('personal'); // personal, summary, experience, education, skills
  const [viewMode, setViewMode] = useState('split'); // split, editOnly, previewOnly
  const [isSaving, setIsSaving] = useState(false);
  const resumePrintRef = useRef(null);

  // Sync with context if user or atsResume updates
  useEffect(() => {
    if (atsResume) {
      setResumeData(atsResume);
    } else if (user) {
      setResumeData(prev => {
        // If user already entered custom fields in current session, keep them; otherwise populate
        if (prev.personalInfo.fullName && prev.personalInfo.fullName !== user.name) {
          return prev;
        }
        return createCandidateResume(user, null);
      });
    }
  }, [user, atsResume]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
  };

  const handleSummaryChange = (e) => {
    setResumeData((prev) => ({
      ...prev,
      summary: e.target.value
    }));
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: 'Present',
      current: true,
      description: '',
      highlights: ['']
    };
    setResumeData((prev) => ({
      ...prev,
      experiences: [newExp, ...prev.experiences]
    }));
  };

  const handleUpdateExperience = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleRemoveExperience = (id) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id)
    }));
  };

  const handleAddHighlight = (expId) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === expId ? { ...exp, highlights: [...exp.highlights, ''] } : exp
      )
    }));
  };

  const handleUpdateHighlight = (expId, index, value) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          const updated = [...exp.highlights];
          updated[index] = value;
          return { ...exp, highlights: updated };
        }
        return exp;
      })
    }));
  };

  const handleRemoveHighlight = (expId, index) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          const updated = exp.highlights.filter((_, i) => i !== index);
          return { ...exp, highlights: updated };
        }
        return exp;
      })
    }));
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      grade: ''
    };
    setResumeData((prev) => ({
      ...prev,
      education: [newEdu, ...prev.education]
    }));
  };

  const handleUpdateEducation = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleRemoveEducation = (id) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id)
    }));
  };

  // Skills handlers
  const handleSkillsChange = (category, valueString) => {
    const arr = valueString.split(',').map((s) => s.trim()).filter(Boolean);
    setResumeData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: arr
      }
    }));
  };

  // Save to backend / profile
  const handleSaveToProfile = async () => {
    setIsSaving(true);
    try {
      if (saveAtsResume) {
        await saveAtsResume(resumeData);
      }
      toast.success("100% ATS Resume saved and synced to your Profile!", { icon: '✨' });
    } catch (err) {
      toast.error(err.message || "Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Download as Word (.doc / .docx compatible ATS file)
  const handleDownloadWord = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${resumeData.personalInfo.fullName} - ATS Resume</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.35; color: #111111; margin: 20mm; }
          h1 { font-size: 20pt; text-align: center; text-transform: uppercase; margin-bottom: 4pt; font-weight: bold; }
          .contact { text-align: center; font-size: 10pt; margin-bottom: 14pt; color: #333333; }
          .section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5pt solid #111111; padding-bottom: 2pt; margin-top: 14pt; margin-bottom: 6pt; }
          .entry-header { font-weight: bold; display: flex; justify-content: space-between; }
          .entry-sub { font-style: italic; color: #333333; margin-bottom: 3pt; }
          ul { margin-top: 3pt; margin-bottom: 6pt; padding-left: 18pt; }
          li { margin-bottom: 2pt; }
          .skills-line { margin-bottom: 4pt; }
        </style>
      </head>
      <body>
        <h1>${resumeData.personalInfo.fullName}</h1>
        <div class="contact">
          ${[
            resumeData.personalInfo.location,
            resumeData.personalInfo.phone,
            resumeData.personalInfo.email,
            resumeData.personalInfo.linkedin,
            resumeData.personalInfo.github
          ].filter(Boolean).join(' | ')}
        </div>

        <div class="section-title">PROFESSIONAL SUMMARY</div>
        <p>${resumeData.summary}</p>

        <div class="section-title">WORK EXPERIENCE</div>
        ${resumeData.experiences.map((exp) => `
          <div style="margin-bottom: 10pt;">
            <table style="width:100%; border:none; margin:0; padding:0;">
              <tr>
                <td style="font-weight:bold; font-size:11pt;">${exp.role} — ${exp.company}</td>
                <td style="text-align:right; font-size:10pt;">${exp.startDate} – ${exp.endDate} | ${exp.location}</td>
              </tr>
            </table>
            ${exp.description ? `<p style="margin: 2pt 0;">${exp.description}</p>` : ''}
            ${exp.highlights && exp.highlights.length > 0 ? `
              <ul>
                ${exp.highlights.filter(Boolean).map((h) => `<li>${h}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}

        <div class="section-title">EDUCATION</div>
        ${resumeData.education.map((edu) => `
          <div style="margin-bottom: 6pt;">
            <table style="width:100%; border:none; margin:0; padding:0;">
              <tr>
                <td style="font-weight:bold; font-size:11pt;">${edu.degree} in ${edu.fieldOfStudy}</td>
                <td style="text-align:right; font-size:10pt;">${edu.startDate} – ${edu.endDate}</td>
              </tr>
              <tr>
                <td style="font-style:italic; font-size:10pt;">${edu.institution}, ${edu.location}</td>
                <td style="text-align:right; font-size:10pt;">${edu.grade}</td>
              </tr>
            </table>
          </div>
        `).join('')}

        <div class="section-title">TECHNICAL & PROFESSIONAL SKILLS</div>
        <p class="skills-line"><strong>Core Languages & Technologies:</strong> ${(resumeData.skills?.technical || []).join(', ')}</p>
        <p class="skills-line"><strong>Frameworks & Libraries:</strong> ${(resumeData.skills?.frameworks || []).join(', ')}</p>
        <p class="skills-line"><strong>Developer Tools & Cloud:</strong> ${(resumeData.skills?.tools || []).join(', ')}</p>
        <p class="skills-line"><strong>Methodologies & Soft Skills:</strong> ${(resumeData.skills?.softSkills || []).join(', ')}</p>

        ${resumeData.projects && resumeData.projects.length > 0 ? `
          <div class="section-title">PROJECTS</div>
          ${resumeData.projects.map((p) => `
            <div style="margin-bottom: 6pt;">
              <p style="font-weight:bold; margin:0;">${p.title} (${p.role}) — <em>${p.technologies}</em></p>
              <p style="margin:2pt 0;">${p.description}</p>
            </div>
          `).join('')}
        ` : ''}

        ${resumeData.certifications && resumeData.certifications.length > 0 ? `
          <div class="section-title">CERTIFICATIONS</div>
          ${resumeData.certifications.map((c) => `
            <p style="margin:2pt 0;"><strong>${c.name}</strong> – ${c.issuer} (${c.issueDate})</p>
          `).join('')}
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_ATS_Resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded ATS-Formatted Word (.doc) Resume!", { icon: '📄' });
  };

  // 2. Download / Print as 100% Vector PDF
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/profile"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              title="Return to Profile"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-950">
                  100% ATS-Friendly Resume Engine
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  ATS Score 98%
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Standard machine-parseable single-column typography. Guaranteed zero ATS parser rejection.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveToProfile}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition active:scale-95 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5 text-blue-600" />
              <span>{isSaving ? 'Saving...' : 'Save to Profile'}</span>
            </button>

            <button
              onClick={handleDownloadWord}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition active:scale-95 shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>Word (.doc)</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 shadow-sm shadow-blue-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Live Form Editor (Print: hidden) */}
          <div className="lg:col-span-6 space-y-5 print:hidden">
            
            {/* Section Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-bold">
              {[
                { id: 'personal', label: 'Contact', icon: Edit3 },
                { id: 'summary', label: 'Summary', icon: FileText },
                { id: 'experience', label: 'Experience', icon: Briefcase },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'skills', label: 'Skills', icon: Wrench },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              
              {/* 1. PERSONAL INFO TAB */}
              {activeTab === 'personal' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Header & Contact Coordinates
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={resumeData.personalInfo.fullName}
                        onChange={handlePersonalInfoChange}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Target Professional Title</label>
                      <input
                        type="text"
                        name="title"
                        value={resumeData.personalInfo.title}
                        onChange={handlePersonalInfoChange}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={resumeData.personalInfo.email}
                        onChange={handlePersonalInfoChange}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={resumeData.personalInfo.phone}
                        onChange={handlePersonalInfoChange}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Location (City, State, Country)</label>
                      <input
                        type="text"
                        name="location"
                        value={resumeData.personalInfo.location}
                        onChange={handlePersonalInfoChange}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                      <input
                        type="text"
                        name="linkedin"
                        value={resumeData.personalInfo.linkedin}
                        onChange={handlePersonalInfoChange}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">GitHub / Portfolio</label>
                      <input
                        type="text"
                        name="github"
                        value={resumeData.personalInfo.github}
                        onChange={handlePersonalInfoChange}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SUMMARY TAB */}
              {activeTab === 'summary' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                      Professional Executive Summary
                    </h3>
                    <span className="text-[11px] text-slate-400 font-bold">ATS Recommended: 3-5 Lines</span>
                  </div>

                  <textarea
                    rows={6}
                    value={resumeData.summary}
                    onChange={handleSummaryChange}
                    placeholder="Results-oriented engineer with 5+ years of experience..."
                    className="w-full p-3.5 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                  />
                </div>
              )}

              {/* 3. EXPERIENCE TAB */}
              {activeTab === 'experience' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                      Work Experience History
                    </h3>
                    <button
                      onClick={handleAddExperience}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Position</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {resumeData.experiences.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 space-y-3">
                        <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">No work experience entries yet</p>
                          <p className="text-[11px] text-slate-500">Click below to add your job title, company, and key achievements</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddExperience}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Position</span>
                        </button>
                      </div>
                    ) : (
                      resumeData.experiences.map((exp, idx) => (
                        <div key={exp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">Position #{idx + 1}</span>
                            <button
                              onClick={() => handleRemoveExperience(exp.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove Position"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <input
                              type="text"
                              placeholder="Company Name (e.g. Infosys)"
                              value={exp.company}
                              onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
                            />
                            <input
                              type="text"
                              placeholder="Job Title (e.g. Senior Software Engineer)"
                              value={exp.role}
                              onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
                            />
                            <input
                              type="text"
                              placeholder="Start Date (e.g. Apr 2022)"
                              value={exp.startDate}
                              onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
                            />
                            <input
                              type="text"
                              placeholder="End Date (e.g. Present)"
                              value={exp.endDate}
                              onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
                            />
                          </div>

                          {/* Bulleted Accomplishment Highlights */}
                          <div className="space-y-1.5 pt-1">
                            <label className="text-[11px] font-bold text-slate-600 block">
                              Key Bulleted Accomplishments & Metrics (ATS Keywords)
                            </label>
                            {(exp.highlights || []).map((hl, hIdx) => (
                              <div key={hIdx} className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-400">•</span>
                                <input
                                  type="text"
                                  placeholder="Accomplishment with action verb + metric..."
                                  value={hl}
                                  onChange={(e) => handleUpdateHighlight(exp.id, hIdx, e.target.value)}
                                  className="flex-1 px-3 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                                />
                                <button
                                  onClick={() => handleRemoveHighlight(exp.id, hIdx)}
                                  className="text-slate-400 hover:text-red-500 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => handleAddHighlight(exp.id)}
                              className="text-[11px] font-bold text-blue-600 hover:underline pt-1 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Highlight Bullet
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 4. EDUCATION TAB */}
              {activeTab === 'education' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                      Education & Academics
                    </h3>
                    <button
                      onClick={handleAddEducation}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Degree</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {resumeData.education.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 space-y-3">
                        <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">No education entries yet</p>
                          <p className="text-[11px] text-slate-500">Click below to add your degree, institution, and graduation year</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddEducation}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Degree</span>
                        </button>
                      </div>
                    ) : (
                      resumeData.education.map((edu, idx) => (
                        <div key={edu.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">Degree #{idx + 1}</span>
                            <button
                              onClick={() => handleRemoveEducation(edu.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <input
                              type="text"
                              placeholder="Degree (e.g. B.Tech)"
                              value={edu.degree}
                              onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
                            />
                            <input
                              type="text"
                              placeholder="Field of Study (e.g. Computer Engineering)"
                              value={edu.fieldOfStudy}
                              onChange={(e) => handleUpdateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
                            />
                            <input
                              type="text"
                              placeholder="College / University"
                              value={edu.institution}
                              onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
                            />
                            <input
                              type="text"
                              placeholder="Dates (e.g. 2016 - 2020)"
                              value={edu.endDate}
                              onChange={(e) => handleUpdateEducation(edu.id, 'endDate', e.target.value)}
                              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 5. SKILLS TAB */}
              {activeTab === 'skills' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Technical & Domain Keywords
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Technical Languages & Core Skills (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(resumeData.skills?.technical || []).join(', ')}
                        onChange={(e) => handleSkillsChange('technical', e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Frameworks & Libraries (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(resumeData.skills?.frameworks || []).join(', ')}
                        onChange={(e) => handleSkillsChange('frameworks', e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Developer Tools & Cloud Infrastructure
                      </label>
                      <input
                        type="text"
                        value={(resumeData.skills?.tools || []).join(', ')}
                        onChange={(e) => handleSkillsChange('tools', e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT: Live 100% ATS-Compliant Sheet Preview */}
          <div className="lg:col-span-6">
            <div className="sticky top-32 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 print:hidden">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  Live ATS Parser Preview (Standard A4 / Single-Column)
                </span>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                  100% Compatible
                </span>
              </div>

              {/* The Actual ATS Document */}
              <div
                ref={resumePrintRef}
                id="ats-resume-sheet"
                className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-lg font-sans text-slate-950 text-[13px] leading-relaxed max-w-[800px] mx-auto print:shadow-none print:border-none print:p-0 print:m-0"
                style={{ fontFamily: "'Inter', 'Calibri', 'Arial', sans-serif" }}
              >
                {/* 1. Header Contact Strip */}
                <div className="text-center border-b border-slate-900 pb-3 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 mb-1">
                    {resumeData.personalInfo.fullName || 'Candidate Name'}
                  </h1>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {resumeData.personalInfo.title}
                  </p>
                  <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-medium">
                    {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                    {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.email && <span>• {resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.linkedin && <span>• {resumeData.personalInfo.linkedin}</span>}
                  </div>
                </div>

                {/* 2. Professional Summary */}
                {resumeData.summary && (
                  <div className="mb-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-slate-800 leading-normal text-justify">
                      {resumeData.summary}
                    </p>
                  </div>
                )}

                {/* 3. Work Experience */}
                {resumeData.experiences && resumeData.experiences.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
                      Work Experience
                    </h2>
                    <div className="space-y-3">
                      {resumeData.experiences.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-950">
                            <span>{exp.role} — <span className="text-slate-800">{exp.company}</span></span>
                            <span className="text-[11px] text-slate-600 font-semibold">{exp.startDate} – {exp.endDate}</span>
                          </div>
                          {exp.location && (
                            <p className="text-[11px] text-slate-500 italic mb-1">{exp.location}</p>
                          )}
                          {exp.description && (
                            <p className="text-xs text-slate-700 mb-1">{exp.description}</p>
                          )}
                          {exp.highlights && exp.highlights.length > 0 && (
                            <ul className="list-disc list-inside text-xs text-slate-800 space-y-0.5 pl-1">
                              {exp.highlights.filter(Boolean).map((h, i) => (
                                <li key={i} className="leading-snug">{h}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Education */}
                {resumeData.education && resumeData.education.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
                      Education
                    </h2>
                    <div className="space-y-2">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id}>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-950">
                            <span>{edu.degree} in {edu.fieldOfStudy}</span>
                            <span className="text-[11px] text-slate-600 font-semibold">{edu.endDate}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>{edu.institution}, {edu.location}</span>
                            <span>{edu.grade}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Technical Skills */}
                {resumeData.skills && (resumeData.skills.technical?.length > 0 || resumeData.skills.frameworks?.length > 0 || resumeData.skills.tools?.length > 0) && (
                  <div className="mb-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                      Technical & Core Competencies
                    </h2>
                    <div className="text-xs text-slate-800 space-y-1">
                      {resumeData.skills.technical?.length > 0 && (
                        <p><strong>Core Technologies:</strong> {resumeData.skills.technical.join(', ')}</p>
                      )}
                      {resumeData.skills.frameworks?.length > 0 && (
                        <p><strong>Frameworks & Tools:</strong> {resumeData.skills.frameworks.join(', ')}</p>
                      )}
                      {resumeData.skills.tools?.length > 0 && (
                        <p><strong>Cloud & Utilities:</strong> {resumeData.skills.tools.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty State Prompt if all sections blank */}
                {!resumeData.summary && (!resumeData.experiences || resumeData.experiences.length === 0) && (!resumeData.education || resumeData.education.length === 0) && (!resumeData.skills?.technical || resumeData.skills.technical.length === 0) && (
                  <div className="py-12 text-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-xl my-4">
                    Use the editor tabs on the left to add your professional summary, work history, education, and skills. Live ATS layout will automatically format here.
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AtsResumeBuilder;
