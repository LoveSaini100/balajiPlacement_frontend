import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import { 
  PlusCircle, 
  Briefcase, 
  CheckCircle2, 
  Building2, 
  IndianRupee, 
  MapPin, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  ShieldCheck,
  Edit3,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../context/JobContext';
import { categoriesData } from '../data/categoriesData';
import { locationsList, experienceFilters, employmentTypes, workModes } from '../data/jobsData';
import EmployerLayout from './employer/EmployerLayout';

const PostJob = () => {
  const navigate = useNavigate();
  const { jobId: paramJobId } = useParams();
  const [searchParams] = useSearchParams();
  const editJobId = paramJobId || searchParams.get('jobId') || searchParams.get('id');
  const isEditing = Boolean(editJobId);

  const { jobs, addJobPosting, updateJobPosting, employerProfile } = useJobContext();

  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdJobSlug, setCreatedJobSlug] = useState('');

  // Ref to prevent continuous re-initialization while user is typing
  const populatedJobIdRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    company: employerProfile?.companyName || 'SJ tech',
    companyWebsite: employerProfile?.website || 'https://sjtech.com',
    location: '',
    category: 'IT & Software Development',
    categorySlug: 'it-software',
    employmentType: 'Full Time',
    workMode: 'Hybrid',
    salary: '₹12,00,000 - ₹18,00,000 PA',
    salaryMinLpa: 12,
    salaryMaxLpa: 18,
    experience: '3 - 6 Years',
    expBracket: 'Mid-Level (3-6 yrs)',
    qualification: 'B.Tech / B.E. / MCA / Any Graduate',
    vacancies: 3,
    overview: '',
    responsibilities: [
      'Collaborate with cross-functional engineering and product teams to design and build scalable services.',
      'Maintain clean architecture, code quality, and automated test coverage.',
      'Participate in code reviews and optimize system performance under high traffic.'
    ],
    requirements: [
      'Relevant degree or equivalent practical industry experience.',
      'Proven hands-on experience in the required technical domain.',
      'Strong communication and problem-solving analytical mindset.'
    ],
    skills: ['React', 'JavaScript', 'Problem Solving', 'Teamwork'],
    benefits: ['Health Insurance', 'Performance Bonus', 'Flexible Working Hours', 'Paid Leaves'],
    status: 'Active'
  });

  // Prepopulate exactly ONCE when opening an existing job
  useEffect(() => {
    if (!isEditing) {
      populatedJobIdRef.current = null;
      return;
    }

    if (isEditing && jobs?.length > 0 && populatedJobIdRef.current !== String(editJobId)) {
      const existingJob = jobs.find(j => 
        String(j.id) === String(editJobId) || 
        String(j._id) === String(editJobId) || 
        j.slug === editJobId
      );

      if (existingJob) {
        populatedJobIdRef.current = String(editJobId);
        setFormData({
          title: existingJob.title || '',
          company: existingJob.company || employerProfile?.companyName || 'SJ tech',
          companyWebsite: existingJob.companyWebsite || employerProfile?.website || 'https://sjtech.com',
          location: existingJob.location || '',
          category: existingJob.category || 'IT & Software Development',
          categorySlug: existingJob.categorySlug || 'it-software',
          employmentType: existingJob.jobType || existingJob.employmentType || 'Full Time',
          workMode: existingJob.workMode || existingJob.workplaceType || 'Hybrid',
          salary: existingJob.salary || existingJob.salaryDisplay || '₹12,00,000 - ₹18,00,000 LPA',
          salaryMinLpa: existingJob.salaryMinLpa || 12,
          salaryMaxLpa: existingJob.salaryMaxLpa || 18,
          experience: existingJob.experience || '3 - 6 Years',
          expBracket: existingJob.expBracket || 'Mid-Level (3-6 yrs)',
          qualification: existingJob.qualification || 'B.Tech / B.E. / MCA / Any Graduate',
          vacancies: existingJob.vacancies || 1,
          status: existingJob.status || 'Active',
          overview: existingJob.overview || existingJob.description || '',
          responsibilities: Array.isArray(existingJob.responsibilities) && existingJob.responsibilities.length > 0 
            ? existingJob.responsibilities 
            : [
                'Collaborate with cross-functional engineering and product teams to design and build scalable services.',
                'Maintain clean architecture, code quality, and automated test coverage.',
                'Participate in code reviews and optimize system performance under high traffic.'
              ],
          requirements: Array.isArray(existingJob.requirements) && existingJob.requirements.length > 0
            ? existingJob.requirements
            : [
                'Relevant degree or equivalent practical industry experience.',
                'Proven hands-on experience in the required technical domain.',
                'Strong communication and problem-solving analytical mindset.'
              ],
          skills: Array.isArray(existingJob.skills) && existingJob.skills.length > 0 ? existingJob.skills : ['React', 'JavaScript'],
          benefits: Array.isArray(existingJob.benefits) && existingJob.benefits.length > 0 ? existingJob.benefits : ['Health Insurance', 'Performance Bonus']
        });
      }
    }
  }, [isEditing, editJobId, jobs]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleBenefitToggle = (benefit) => {
    setFormData(prev => {
      const exists = prev.benefits.includes(benefit);
      return {
        ...prev,
        benefits: exists ? prev.benefits.filter(b => b !== benefit) : [...prev.benefits, benefit]
      };
    });
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.overview) {
      toast.error("Please fill in all mandatory fields before submitting");
      return;
    }

    if (isEditing) {
      const existingJob = jobs.find(j => 
        String(j.id) === String(editJobId) || 
        String(j._id) === String(editJobId) || 
        j.slug === editJobId
      );
      const targetId = existingJob?.id || existingJob?._id || editJobId;

      await updateJobPosting(targetId, {
        ...formData,
        salaryDisplay: formData.salary,
        description: formData.overview,
        overview: formData.overview
      });
      setCreatedJobSlug(existingJob?.slug || (formData.title + "-" + formData.location).toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      setIsSuccess(true);
    } else {
      const newJob = await addJobPosting(formData);
      setCreatedJobSlug(newJob?.slug || (formData.title + "-" + formData.location).toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      setIsSuccess(true);
    }
  };

  const perksList = [
    "Health Insurance",
    "Performance Bonus",
    "Flexible Working Hours",
    "Paid Leaves",
    "PF & Gratuity",
    "Remote Work Option",
    "Subsidized Meals",
    "Learning & Course Stipend"
  ];

  if (isSuccess) {
    return (
      <EmployerLayout>
        <div className="py-12 flex items-center justify-center">
          <div className="max-w-lg w-full mx-4 bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-950 mb-2">
              {isEditing ? 'Job Opening Details Updated!' : 'Job Opening Published Successfully!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-medium">
              Your posting <strong>"{formData.title}"</strong> at <strong>"{formData.company}"</strong> has been {isEditing ? 'updated and saved successfully' : 'published live across JobPortal candidate feeds'}.
            </p>

            <div className="space-y-3">
              <Link
                to="/employer/jobs"
                className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-95"
              >
                Go to Manage Postings & Applicants
              </Link>
              <Link
                to={`/career-opportunities/${createdJobSlug}`}
                target="_blank"
                className="w-full block bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm py-3.5 rounded-xl transition-colors"
              >
                View Public Live Listing
              </Link>
            </div>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
              {isEditing ? <Edit3 className="w-3.5 h-3.5 text-blue-600" /> : <PlusCircle className="w-3.5 h-3.5 text-blue-600" />}
              {isEditing ? 'Job Modification & Edit Wizard' : 'Recruiter Job Creation Wizard'}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950">
              {isEditing ? `Edit Job Opening: ${formData.title || 'Role Details'}` : 'Create & Publish a Verified Opening'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isEditing 
                ? 'Update role specifics, offered compensation, requirements, or employee benefits.' 
                : 'Reach over 1,200,000+ candidate profiles across India with instant pipeline delivery.'}
            </p>
          </div>

          {isEditing && (
            <Link
              to="/employer/jobs"
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Job Postings</span>
            </Link>
          )}
        </div>

        {/* Multi-step progress bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2.5 sm:p-3 shadow-xs">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Role Basics" },
              { num: 2, label: "Requirements" },
              { num: 3, label: "Perks & CTC" },
              { num: 4, label: isEditing ? "Review & Save" : "Review & Publish" }
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2 flex-1 justify-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === s.num
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100'
                    : step > s.num
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`text-xs font-bold hidden sm:inline ${
                  step === s.num ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <form onSubmit={(e) => e.preventDefault()}>
            
            {/* STEP 1: ROLE BASICS */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-950">
                    Step 1: Role Overview & Company
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Provide basic job information and hiring organization details.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, title: val }));
                      }}
                      placeholder="e.g. Senior React Developer, QA Lead..."
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hiring Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, company: val }));
                      }}
                      placeholder="e.g. Acme Innovations"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, category: val }));
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold cursor-pointer"
                    >
                      {categoriesData.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Location
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, location: val }));
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold cursor-pointer"
                    >
                      {locationsList.filter(l => l !== 'All Locations').map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Work Mode
                    </label>
                    <select
                      value={formData.workMode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, workMode: val }));
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold cursor-pointer"
                    >
                      {workModes.filter(m => m !== 'All Modes').map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Job Overview & Impact *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.overview}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, overview: val }));
                    }}
                    placeholder="Describe the role mission, key expectations, and team structure..."
                    className="w-full px-3 py-2 font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-sm text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: REQUIREMENTS & SKILLS */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-950">
                    Step 2: Candidate Qualifications & Skills
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Define experience criteria, education benchmarks, and required skills.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Experience Requirement
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, experience: val }));
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold cursor-pointer"
                    >
                      <option value="Fresher (0-1 yrs)">Fresher (0-1 yrs)</option>
                      <option value="1 - 3 Years">1 - 3 Years</option>
                      <option value="3 - 6 Years">3 - 6 Years</option>
                      <option value="6 - 10 Years">6 - 10 Years</option>
                      <option value="10+ Years">10+ Years (Lead / Director)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Minimum Qualification
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, qualification: val }));
                      }}
                      placeholder="e.g. B.Tech / MCA / Any Graduate"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* Skills tags input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Key Technical & Functional Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill (e.g. React, Docker, AWS) and press Add"
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                    >
                      Add Skill
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {formData.skills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-xl border border-blue-200">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-blue-400 hover:text-blue-900 font-bold cursor-pointer">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: COMPENSATION & PERKS */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-950">
                    Step 3: Compensation & Employee Perks
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Provide transparent compensation details to attract top-tier talent.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Offered CTC Range (Annual) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.salary}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, salary: val }));
                      }}
                      placeholder="e.g. ₹8,00,000 - ₹14,00,000 PA"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Open Vacancies
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formData.vacancies}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 1;
                        setFormData(prev => ({ ...prev, vacancies: val }));
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Publication Status
                    </label>
                    <select
                      value={formData.status || 'Active'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, status: val }));
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold cursor-pointer"
                    >
                      <option value="Active">● Active (Open)</option>
                      <option value="Paused">⏸ Paused (On Hold)</option>
                      <option value="Closed">🔒 Closed (Filled)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Employee Benefits & Perks
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {perksList.map((perk) => {
                      const selected = formData.benefits.includes(perk);
                      return (
                        <button
                          key={perk}
                          type="button"
                          onClick={() => handleBenefitToggle(perk)}
                          className={`p-2.5 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer ${
                            selected
                              ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '}{perk}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PUBLISH */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-950">
                    Step 4: Review & {isEditing ? 'Save Changes' : 'Live Publishing'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Verify details before releasing the posting to candidate feeds.</p>
                </div>

                {/* Preview Box */}
                <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-start justify-between gap-4 mb-2.5">
                    <div>
                      <span className="text-xs font-bold text-blue-600">{formData.category}</span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-950">{formData.title || 'Untitled Role'}</h3>
                      <span className="text-xs font-semibold text-slate-700">{formData.company || 'Company Name'}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                      {formData.salary}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap font-medium">
                    <span>📍 {formData.location} ({formData.workMode})</span>
                    <span>💼 {formData.experience}</span>
                    <span>🎓 {formData.qualification}</span>
                    <span>👥 {formData.vacancies} Vacancies</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {formData.overview || 'No overview provided.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {formData.skills.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Your job will be flagged with a <strong>Verified Employer</strong> badge and indexed in real-time candidate search.</span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1 && (!formData.title || !formData.company || !formData.overview)) {
                      toast.error("Please enter job title, company, and overview");
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>{isEditing ? 'Save Changes & Update Job' : 'Publish Job Now'}</span>
                  {isEditing ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </EmployerLayout>
  );
};

export default PostJob;
