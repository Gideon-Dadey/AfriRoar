import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  Trash2,
} from 'lucide-react';
import type { Application, Scholarship } from '@/types';
import { useAuthStore } from '@/stores/authStore';

const STEPS = [
  'Personal Information',
  'Academic Background',
  'Statement & Motivation',
  'Documents',
  'Review & Submit',
];

const DOC_HINTS = [
  'Passport / National ID (PDF or image)',
  'Academic transcripts',
  'Degree certificate / diploma',
  'Curriculum Vitae (CV) / Resume',
  'Recommendation letters (optional)',
];

type PersonalData = {
  fullName: string;
  phone: string;
  country: string;
  dateOfBirth: string;
  address: string;
  nationality: string;
};

type AcademicData = {
  educationLevel: string;
  institution: string;
  fieldOfStudy: string;
  gpa: string;
  graduationYear: string;
  languages: string;
};

const emptyPersonal = (): PersonalData => ({
  fullName: '',
  phone: '',
  country: '',
  dateOfBirth: '',
  address: '',
  nationality: '',
});

const emptyAcademic = (): AcademicData => ({
  educationLevel: '',
  institution: '',
  fieldOfStudy: '',
  gpa: '',
  graduationYear: '',
  languages: '',
});

export default function ApplicationWizard() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [application, setApplication] = useState<Application | null>(null);
  const [scholarshipId, setScholarshipId] = useState(params.get('scholarshipId') || '');
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [personal, setPersonal] = useState<PersonalData>(emptyPersonal());
  const [academic, setAcademic] = useState<AcademicData>(emptyAcademic());
  const [personalStatement, setPersonalStatement] = useState('');
  const [motivation, setMotivation] = useState('');

  const { data: scholarships = [], isLoading: loadingScholarships } = useQuery({
    queryKey: ['apply-scholarships'],
    queryFn: async () => {
      const { data } = await api.get('/scholarships', { params: { limit: 50, status: 'approved' } });
      return (data.data?.scholarships || data.data || []) as Scholarship[];
    },
    enabled: !id && !scholarshipId,
  });

  const scholarship = useMemo(() => {
    const fromApp = application?.scholarshipId;
    if (fromApp && typeof fromApp === 'object') return fromApp as Scholarship;
    return scholarships.find((s) => s._id === scholarshipId);
  }, [application, scholarships, scholarshipId]);

  useEffect(() => {
    if (!user) return;
    setPersonal((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || '',
      phone: prev.phone || user.profile?.phone || '',
      country: prev.country || user.profile?.country || '',
      dateOfBirth: prev.dateOfBirth || (user.profile?.dateOfBirth || '').slice(0, 10),
    }));
    setAcademic((prev) => ({
      ...prev,
      educationLevel: prev.educationLevel || user.profile?.educationLevel || '',
      institution: prev.institution || user.profile?.institution || '',
      fieldOfStudy: prev.fieldOfStudy || user.profile?.fieldOfStudy || '',
      gpa: prev.gpa || (user.profile?.gpa != null ? String(user.profile.gpa) : ''),
      languages: prev.languages || (user.profile?.languages || []).join(', '),
    }));
  }, [user]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/applications/${id}`);
        const app = data.data.application as Application;
        setApplication(app);
        setStep(app.currentStep || 1);
        setPersonalStatement(app.personalStatement || '');
        setMotivation(app.motivation || '');

        const p = app.steps?.find((s) => s.stepNumber === 1)?.data || {};
        const a = app.steps?.find((s) => s.stepNumber === 2)?.data || {};
        setPersonal({ ...emptyPersonal(), ...(p as PersonalData) });
        setAcademic({ ...emptyAcademic(), ...(a as AcademicData) });
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Could not load application.');
        navigate('/dashboard/applications');
      }
    };
    load();
  }, [id, navigate]);

  const startApplication = async (selectedId: string) => {
    setSaving(true);
    try {
      const { data } = await api.post('/applications', { scholarshipId: selectedId });
      const app = data.data.application as Application;
      toast.success('Application draft created.');
      navigate(`/dashboard/applications/${app._id}`, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not start application.';
      if (String(msg).toLowerCase().includes('already applied')) {
        toast.error('You already have an application for this scholarship.');
        navigate('/dashboard/applications');
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!id && scholarshipId) {
      startApplication(scholarshipId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, scholarshipId]);

  const buildStepsPayload = (markCurrentComplete: boolean) => {
    const steps = [
      {
        stepNumber: 1,
        title: STEPS[0],
        data: personal,
        completed: markCurrentComplete ? step > 1 || step === 1 : step > 1,
      },
      {
        stepNumber: 2,
        title: STEPS[1],
        data: academic,
        completed: step > 2,
      },
      {
        stepNumber: 3,
        title: STEPS[2],
        data: { personalStatement, motivation },
        completed: step > 3,
      },
      {
        stepNumber: 4,
        title: STEPS[3],
        data: { documentCount: application?.documents?.length || 0 },
        completed: (application?.documents?.length || 0) > 0,
      },
      {
        stepNumber: 5,
        title: STEPS[4],
        data: {},
        completed: false,
      },
    ];

    if (markCurrentComplete) {
      const idx = step - 1;
      if (steps[idx]) steps[idx].completed = true;
    }

    return steps;
  };

  const validateStep = () => {
    if (step === 1) {
      if (!personal.fullName || !personal.phone || !personal.country || !personal.nationality) {
        toast.error('Please complete all required personal fields.');
        return false;
      }
    }
    if (step === 2) {
      if (!academic.educationLevel || !academic.institution || !academic.fieldOfStudy) {
        toast.error('Please complete all required academic fields.');
        return false;
      }
    }
    if (step === 3) {
      if (personalStatement.trim().length < 100) {
        toast.error('Personal statement must be at least 100 characters.');
        return false;
      }
      if (motivation.trim().length < 50) {
        toast.error('Motivation statement must be at least 50 characters.');
        return false;
      }
    }
    if (step === 4 && (!application?.documents || application.documents.length === 0)) {
      toast.error('Upload at least one supporting document.');
      return false;
    }
    return true;
  };

  const saveProgress = async (nextStep?: number, markComplete = true) => {
    if (!application) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/applications/${application._id}`, {
        currentStep: nextStep || step,
        personalStatement,
        motivation,
        steps: buildStepsPayload(markComplete),
      });
      setApplication(data.data.application);
      return data.data.application as Application;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not save progress.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    if (!validateStep()) return;
    const next = Math.min(step + 1, 5);
    await saveProgress(next, true);
    setStep(next);
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const onUpload = async (files: FileList | null) => {
    if (!files?.length || !application) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('documents', file));
      const { data } = await api.post(`/applications/${application._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setApplication(data.data.application || { ...application, documents: data.data.documents });
      toast.success('Documents uploaded.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (index: number) => {
    if (!application) return;
    const docs = [...(application.documents || [])];
    docs.splice(index, 1);
    setSaving(true);
    try {
      const { data } = await api.patch(`/applications/${application._id}`, {
        documents: docs,
        currentStep: step,
        steps: buildStepsPayload(false),
      });
      setApplication(data.data.application);
      toast.success('Document removed.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not remove document.');
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async () => {
    if (!application) return;
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await saveProgress(5, true);
      const { data } = await api.post(`/applications/${application._id}/submit`);
      setApplication(data.data.application);
      toast.success('Application submitted successfully!');
      navigate('/dashboard/applications');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submit failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Scholarship picker
  if (!id && !scholarshipId) {
    return (
      <div className="sr-container py-10">
        <Helmet>
          <title>Start application | AfriRoar</title>
        </Helmet>
        <h1 className="text-[26px] font-bold text-[var(--color-sr-navy)] mb-2">Start a scholarship application</h1>
        <p className="text-[var(--color-sr-muted)] mb-6">
          Choose a program to begin. You can save as draft and return anytime.
        </p>
        {loadingScholarships ? (
          <div className="flex items-center gap-2 text-[var(--color-sr-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading scholarships…
          </div>
        ) : (
          <div className="grid gap-4">
            {scholarships.map((s) => (
              <button
                key={s._id}
                type="button"
                disabled={saving}
                onClick={() => setScholarshipId(s._id)}
                className="text-left bg-white border border-[var(--color-sr-border)] p-5 hover:border-[var(--color-sr-navy)] transition-colors"
              >
                <div className="font-bold text-[var(--color-sr-navy)] text-lg">{s.title}</div>
                <div className="text-sm text-[var(--color-sr-muted)] mt-1">
                  {s.country} · {s.level} · Deadline {new Date(s.deadline).toLocaleDateString()}
                </div>
              </button>
            ))}
            {scholarships.length === 0 && (
              <p className="text-[var(--color-sr-muted)]">No scholarships available yet. Please check back soon.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!application) {
    return (
      <div className="sr-container py-16 flex items-center justify-center gap-2 text-[var(--color-sr-muted)]">
        <Loader2 className="w-5 h-5 animate-spin" /> Preparing your application…
      </div>
    );
  }

  const locked = ['submitted', 'accepted', 'rejected'].includes(application.status);

  return (
    <>
      <Helmet>
        <title>Application | AfriRoar</title>
      </Helmet>

      <div className="bg-[var(--color-sr-navy)] text-white">
        <div className="sr-container py-6">
          <Link to="/dashboard/applications" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-[var(--color-sr-yellow)] mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to applications
          </Link>
          <h1 className="text-2xl font-bold">{scholarship?.title || 'Scholarship application'}</h1>
          <p className="text-white/80 mt-1 text-sm capitalize">Status: {application.status.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="sr-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="bg-white border border-[var(--color-sr-border)] p-4 h-fit">
            <ol className="space-y-3">
              {STEPS.map((label, idx) => {
                const n = idx + 1;
                const active = step === n;
                const done = application.steps?.find((s) => s.stepNumber === n)?.completed;
                return (
                  <li key={label} className={`flex items-start gap-2 text-sm ${active ? 'font-bold text-[var(--color-sr-navy)]' : 'text-[var(--color-sr-muted)]'}`}>
                    <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${done || active ? 'bg-[var(--color-sr-navy)] text-white' : 'bg-slate-200'}`}>
                      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
                    </span>
                    {label}
                  </li>
                );
              })}
            </ol>
          </aside>

          <section className="bg-white border border-[var(--color-sr-border)] p-6 md:p-8">
            <h2 className="text-xl font-bold text-[var(--color-sr-navy)] mb-6">{STEPS[step - 1]}</h2>

            {step === 1 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ['fullName', 'Full legal name *'],
                  ['phone', 'Phone number *'],
                  ['country', 'Country of residence *'],
                  ['nationality', 'Nationality *'],
                  ['dateOfBirth', 'Date of birth'],
                  ['address', 'Mailing address'],
                ].map(([key, label]) => (
                  <div key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-semibold mb-1">{label}</label>
                    <input
                      type={key === 'dateOfBirth' ? 'date' : 'text'}
                      disabled={locked}
                      value={(personal as any)[key]}
                      onChange={(e) => setPersonal({ ...personal, [key]: e.target.value })}
                      className="w-full border border-[var(--color-sr-border)] px-3 py-2.5 outline-none focus:border-[var(--color-sr-navy)]"
                    />
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Education level *</label>
                  <select
                    disabled={locked}
                    value={academic.educationLevel}
                    onChange={(e) => setAcademic({ ...academic, educationLevel: e.target.value })}
                    className="w-full border border-[var(--color-sr-border)] px-3 py-2.5"
                  >
                    <option value="">Select…</option>
                    <option value="high-school">High school</option>
                    <option value="bachelors">Bachelor&apos;s</option>
                    <option value="masters">Master&apos;s</option>
                    <option value="phd">PhD</option>
                    <option value="postdoc">Postdoc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Institution *</label>
                  <input disabled={locked} value={academic.institution} onChange={(e) => setAcademic({ ...academic, institution: e.target.value })} className="w-full border border-[var(--color-sr-border)] px-3 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Field of study *</label>
                  <input disabled={locked} value={academic.fieldOfStudy} onChange={(e) => setAcademic({ ...academic, fieldOfStudy: e.target.value })} className="w-full border border-[var(--color-sr-border)] px-3 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">GPA / Grade</label>
                  <input disabled={locked} value={academic.gpa} onChange={(e) => setAcademic({ ...academic, gpa: e.target.value })} className="w-full border border-[var(--color-sr-border)] px-3 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Graduation year</label>
                  <input disabled={locked} value={academic.graduationYear} onChange={(e) => setAcademic({ ...academic, graduationYear: e.target.value })} className="w-full border border-[var(--color-sr-border)] px-3 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Languages</label>
                  <input disabled={locked} value={academic.languages} onChange={(e) => setAcademic({ ...academic, languages: e.target.value })} placeholder="English, French, Swahili" className="w-full border border-[var(--color-sr-border)] px-3 py-2.5" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-1">Personal statement * (min 100 characters)</label>
                  <textarea
                    disabled={locked}
                    rows={8}
                    value={personalStatement}
                    onChange={(e) => setPersonalStatement(e.target.value)}
                    className="w-full border border-[var(--color-sr-border)] px-3 py-2.5 outline-none focus:border-[var(--color-sr-navy)]"
                    placeholder="Tell your academic story, achievements, and goals…"
                  />
                  <p className="text-xs text-[var(--color-sr-muted)] mt-1">{personalStatement.length} characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Motivation for this scholarship * (min 50 characters)</label>
                  <textarea
                    disabled={locked}
                    rows={5}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    className="w-full border border-[var(--color-sr-border)] px-3 py-2.5 outline-none focus:border-[var(--color-sr-navy)]"
                    placeholder="Why this program, and how will it impact your community in Africa?"
                  />
                  <p className="text-xs text-[var(--color-sr-muted)] mt-1">{motivation.length} characters</p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="text-sm text-[var(--color-sr-muted)] mb-4">
                  Upload clear scans or PDFs. Accepted: PDF, DOC, DOCX, JPG, PNG (max 5MB each).
                </p>
                <ul className="mb-5 space-y-1 text-sm text-[var(--color-sr-text)]">
                  {DOC_HINTS.map((hint) => (
                    <li key={hint} className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--color-sr-navy)]" /> {hint}
                    </li>
                  ))}
                </ul>

                {!locked && (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--color-sr-border)] p-8 cursor-pointer hover:border-[var(--color-sr-navy)] mb-5">
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 text-[var(--color-sr-navy)]" />}
                    <span className="font-semibold text-[var(--color-sr-navy)]">Click to upload documents</span>
                    <input type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(e) => onUpload(e.target.files)} />
                  </label>
                )}

                <div className="space-y-2">
                  {(application.documents || []).map((doc, index) => (
                    <div key={`${doc.url}-${index}`} className="flex items-center justify-between border border-[var(--color-sr-border)] px-3 py-2">
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-[var(--color-sr-link)] hover:underline text-sm font-medium">
                        {doc.name}
                      </a>
                      {!locked && (
                        <button type="button" onClick={() => removeDocument(index)} className="text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 text-sm">
                <div className="border border-[var(--color-sr-border)] p-4">
                  <h3 className="font-bold mb-2">Personal</h3>
                  <p>{personal.fullName} · {personal.nationality} · {personal.country}</p>
                  <p>{personal.phone}</p>
                </div>
                <div className="border border-[var(--color-sr-border)] p-4">
                  <h3 className="font-bold mb-2">Academic</h3>
                  <p>{academic.educationLevel} · {academic.fieldOfStudy}</p>
                  <p>{academic.institution}</p>
                </div>
                <div className="border border-[var(--color-sr-border)] p-4">
                  <h3 className="font-bold mb-2">Documents</h3>
                  <p>{application.documents?.length || 0} file(s) uploaded</p>
                </div>
                <p className="text-[var(--color-sr-muted)]">
                  By submitting, you confirm that the information provided is accurate and that documents are authentic.
                </p>
              </div>
            )}

            {!locked && (
              <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-[var(--color-sr-border)]">
                <button type="button" onClick={goBack} disabled={step === 1 || saving} className="px-4 py-2 border border-[var(--color-sr-border)] font-semibold disabled:opacity-40 inline-flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => saveProgress(step, false)} disabled={saving} className="px-4 py-2 border border-[var(--color-sr-navy)] text-[var(--color-sr-navy)] font-semibold disabled:opacity-60">
                    {saving ? 'Saving…' : 'Save draft'}
                  </button>
                  {step < 5 ? (
                    <button type="button" onClick={goNext} disabled={saving} className="px-4 py-2 bg-[var(--color-sr-navy)] text-white font-semibold inline-flex items-center gap-2 disabled:opacity-60">
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={submitApplication} disabled={submitting || saving} className="px-4 py-2 bg-[var(--color-sr-yellow)] text-[var(--color-sr-navy-deeper)] font-bold inline-flex items-center gap-2 disabled:opacity-60">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Submit application
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
