import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Standard 100% ATS-Compliant Single-Column Resume Document
 * Matches the exact engine and visual sheet format generated across the Balaji Placement platform.
 */
export const AtsResumeDocument = ({ resumeData = {}, candidate = {}, className = "" }) => {
  // Normalize data between atsResume structure and user/candidate profile structure
  const personal = resumeData.personalInfo || {
    fullName: candidate.name || candidate.applicantName || 'Candidate Name',
    title: candidate.currentTitle || candidate.candidateProfile?.title || candidate.jobTitle || 'Professional Candidate',
    email: candidate.email || candidate.applicantEmail || '',
    phone: candidate.phone || candidate.applicantPhone || '',
    location: candidate.location || candidate.candidateProfile?.location || 'India',
    linkedin: candidate.linkedin || '',
    github: candidate.github || '',
    portfolio: candidate.portfolio || ''
  };

  const summary = resumeData.summary || candidate.about || candidate.candidateProfile?.about || candidate.recruiterNotes || '';

  const experiences = (resumeData.experiences && resumeData.experiences.length > 0)
    ? resumeData.experiences
    : (candidate.experienceList || candidate.candidateProfile?.experienceList || []).map(exp => ({
        id: exp.id,
        role: exp.role || exp.title || 'Role',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || (exp.period ? exp.period.split('-')[0]?.trim() : '') || '',
        endDate: exp.endDate || (exp.period ? exp.period.split('-')[1]?.trim() : '') || 'Present',
        description: exp.description || '',
        highlights: exp.highlights || []
      }));

  const education = (resumeData.education && resumeData.education.length > 0)
    ? resumeData.education
    : (candidate.education || candidate.candidateProfile?.education || []).map(edu => ({
        id: edu.id,
        degree: edu.degree || 'Degree',
        fieldOfStudy: edu.fieldOfStudy || '',
        institution: edu.institution || '',
        location: edu.location || '',
        endDate: edu.endDate || edu.year || '',
        grade: edu.grade || ''
      }));

  const technicalSkills = resumeData.skills?.technical || (Array.isArray(candidate.skills) ? candidate.skills : (candidate.candidateProfile?.skills || []));
  const frameworks = resumeData.skills?.frameworks || [];
  const tools = resumeData.skills?.tools || [];
  const softSkills = resumeData.skills?.softSkills || [];
  const projects = resumeData.projects || [];
  const certifications = resumeData.certifications || [];

  return (
    <div
      id="ats-resume-document"
      className={`bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-lg font-sans text-slate-950 text-[13px] leading-relaxed max-w-[800px] mx-auto print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full ${className}`}
      style={{ fontFamily: "'Inter', 'Calibri', 'Arial', sans-serif" }}
    >
      {/* 1. Header Contact Strip */}
      <div className="text-center border-b-2 border-slate-900 pb-3.5 mb-4">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 mb-1">
          {personal.fullName || 'Candidate Name'}
        </h1>
        {personal.title && (
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {personal.title}
          </p>
        )}
        <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-medium">
          {personal.location && <span>{personal.location}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.email && <span>• {personal.email}</span>}
          {personal.linkedin && <span>• {personal.linkedin}</span>}
          {personal.github && <span>• {personal.github}</span>}
        </div>
      </div>

      {/* 2. Professional Executive Summary */}
      {summary && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-xs text-slate-800 leading-normal text-justify">
            {summary}
          </p>
        </div>
      )}

      {/* 3. Work Experience */}
      {experiences && experiences.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
            Work Experience
          </h2>
          <div className="space-y-3">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-950">
                  <span>{exp.role} — <span className="text-slate-800">{exp.company}</span></span>
                  <span className="text-[11px] text-slate-600 font-semibold">{exp.startDate ? `${exp.startDate} – ${exp.endDate || 'Present'}` : (exp.period || exp.endDate || 'Present')}</span>
                </div>
                {exp.location && (
                  <p className="text-[11px] text-slate-500 italic mb-1">{exp.location}</p>
                )}
                {exp.description && (
                  <p className="text-xs text-slate-700 mb-1 leading-snug">{exp.description}</p>
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

      {/* 4. Education & Academic Background */}
      {education && education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={edu.id || idx}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-950">
                  <span>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</span>
                  <span className="text-[11px] text-slate-600 font-semibold">{edu.endDate || edu.year}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</span>
                  {edu.grade && <span className="font-medium">{edu.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Technical & Core Competencies */}
      {(technicalSkills.length > 0 || frameworks.length > 0 || tools.length > 0 || softSkills.length > 0) && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
            Technical & Core Competencies
          </h2>
          <div className="text-xs text-slate-800 space-y-1">
            {technicalSkills.length > 0 && (
              <p><strong>Core Technologies:</strong> {technicalSkills.join(', ')}</p>
            )}
            {frameworks.length > 0 && (
              <p><strong>Frameworks & Libraries:</strong> {frameworks.join(', ')}</p>
            )}
            {tools.length > 0 && (
              <p><strong>Developer Tools & Cloud:</strong> {tools.join(', ')}</p>
            )}
            {softSkills.length > 0 && (
              <p><strong>Professional Methodologies:</strong> {softSkills.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* 6. Projects (if any) */}
      {projects && projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
            Key Projects
          </h2>
          <div className="space-y-2">
            {projects.map((p, idx) => (
              <div key={p.id || idx}>
                <p className="text-xs font-bold text-slate-950">
                  {p.title} {p.role ? `(${p.role})` : ''} {p.technologies ? `— ${p.technologies}` : ''}
                </p>
                {p.description && <p className="text-xs text-slate-700 leading-snug">{p.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Certifications (if any) */}
      {certifications && certifications.length > 0 && (
        <div className="mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
            Certifications & Credentials
          </h2>
          <div className="text-xs text-slate-800 space-y-0.5">
            {certifications.map((c, idx) => (
              <p key={c.id || idx}>
                <strong>{c.name}</strong> {c.issuer ? `– ${c.issuer}` : ''} {c.issueDate ? `(${c.issueDate})` : ''}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Verification Footer Note */}
      <div className="pt-4 border-t border-slate-200 mt-6 flex items-center justify-between text-[10px] text-slate-400 font-medium print:hidden">
        <span className="flex items-center gap-1 text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Verified Machine-Readable Single-Column ATS Format
        </span>
        <span>Generated via Balaji Placement Portal</span>
      </div>
    </div>
  );
};

export default AtsResumeDocument;
