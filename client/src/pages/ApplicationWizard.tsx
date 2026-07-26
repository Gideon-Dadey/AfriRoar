import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Save,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, formatDeadline, getFundingTypeLabel, getLevelLabel } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { Application, Document, Scholarship } from '@/types';
import {
  INTENDED_DEGREE_LEVELS,
  STUDY_FIELD_CATEGORIES,
  STUDY_FIELD_OTHER,
  isListedStudyField,
} from '@/data/studyFields';

const STEPS = [
  { title: 'Programme', blurb: 'Degree level and field you are applying for' },
  { title: 'Personal', blurb: 'Identity and contact details' },
  { title: 'Academic', blurb: 'Education background' },
  { title: 'Statements', blurb: 'Personal statement and motivation' },
  { title: 'Documents', blurb: 'Supporting uploads' },
  { title: 'Review', blurb: 'Confirm and submit' },
] as const;

const TOTAL_STEPS = STEPS.length;

const DOC_HINTS = [
  'Passport or national ID',
  'Academic transcripts',
  'Degree certificate or diploma',
  'CV / resume',
  'Recommendation letters (optional)',
];

const COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon',
  'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo',
  'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea',
  'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea',
  'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya',
  'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco',
  'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe',
  'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan',
  'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
  'Bangladesh', 'Brazil', 'Colombia', 'India', 'Indonesia', 'Mexico', 'Nepal',
  'Pakistan', 'Peru', 'Philippines', 'Sri Lanka', 'Vietnam', 'United Kingdom',
  'United States', 'Canada', 'Germany', 'France', 'Netherlands', 'China', 'Japan',
] as const;

type ProgrammeData = {
  intendedLevel: string;
  intendedField: string;
  specialization: string;
};

type PersonalData = {
  firstName: string;
  lastName: string;
  otherName: string;
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

const emptyProgramme = (): ProgrammeData => ({
  intendedLevel: '',
  intendedField: '',
  specialization: '',
});

const emptyPersonal = (): PersonalData => ({
  firstName: '',
  lastName: '',
  otherName: '',
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

function composeFullName(p: Pick<PersonalData, 'firstName' | 'lastName' | 'otherName'>) {
  return [p.firstName, p.otherName, p.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
}

function personalFromStored(raw: Record<string, unknown> | Partial<PersonalData> | undefined): PersonalData {
  const data = (raw || {}) as Partial<PersonalData> & { fullName?: string };
  if (data.firstName || data.lastName || data.otherName) {
    return {
      ...emptyPersonal(),
      firstName: String(data.firstName || ''),
      lastName: String(data.lastName || ''),
      otherName: String(data.otherName || ''),
      phone: String(data.phone || ''),
      country: String(data.country || ''),
      dateOfBirth: String(data.dateOfBirth || '').slice(0, 10),
      address: String(data.address || ''),
      nationality: String(data.nationality || ''),
    };
  }

  const parts = String(data.fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    ...emptyPersonal(),
    firstName: parts[0] || '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
    otherName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    phone: String(data.phone || ''),
    country: String(data.country || ''),
    dateOfBirth: String(data.dateOfBirth || '').slice(0, 10),
    address: String(data.address || ''),
    nationality: String(data.nationality || ''),
  };
}

function splitAccountName(name?: string) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
    otherName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
  };
}

function looksLikePersonalData(data: Record<string, unknown> | undefined) {
  if (!data) return false;
  return Boolean(
    data.fullName ||
      data.firstName ||
      data.lastName ||
      data.phone ||
      data.nationality ||
      data.country,
  );
}

function programmeFromScholarship(s?: Scholarship | null): ProgrammeData {
  if (!s) return emptyProgramme();
  const fieldHint = String(s.field || '').trim();
  const genericField = !fieldHint || /^(any|any field|n\/?a|general)$/i.test(fieldHint);
  return {
    intendedLevel: s.level && s.level !== 'any' ? s.level : '',
    intendedField: genericField ? '' : fieldHint,
    specialization: '',
  };
}

const inputClass =
  'w-full border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[16px] text-[var(--color-sr-text)] outline-none transition-colors placeholder:text-[var(--color-sr-muted)]/70 focus:border-[var(--color-sr-navy)] disabled:cursor-not-allowed disabled:bg-[var(--color-sr-bg)] disabled:text-[var(--color-sr-muted)]';

function Field({
  id,
  label,
  hint,
  className = '',
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-[12px] leading-snug text-[var(--color-sr-muted)]">{hint}</p> : null}
    </div>
  );
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

function statusTone(status: string) {
  switch (status) {
    case 'submitted':
      return 'border-sky-200 bg-sky-50 text-sky-900';
    case 'under_review':
      return 'border-amber-200 bg-amber-50 text-amber-900';
    case 'accepted':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900';
    case 'rejected':
      return 'border-red-200 bg-red-50 text-red-900';
    case 'withdrawn':
      return 'border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] text-[var(--color-sr-muted)]';
    default:
      return 'border-[var(--color-sr-border)] bg-white text-[var(--color-sr-navy)]';
  }
}

function ReviewBlock({
  title,
  onEdit,
  locked,
  children,
}: {
  title: string;
  onEdit?: () => void;
  locked: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[var(--color-sr-border)] p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
          {title}
        </h3>
        {!locked && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="text-[12px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
          >
            Edit
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function ApplicationWizard() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const seedScholarshipId = params.get('scholarshipId') || params.get('scholarship') || '';

  const [application, setApplication] = useState<Application | null>(null);
  const [scholarshipId, setScholarshipId] = useState(seedScholarshipId);
  const [step, setStep] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerLevel, setPickerLevel] = useState('');
  const [pickerFunding, setPickerFunding] = useState('');

  const [programme, setProgramme] = useState<ProgrammeData>(emptyProgramme());
  const [fieldChoice, setFieldChoice] = useState('');
  const [personal, setPersonal] = useState<PersonalData>(emptyPersonal());
  const [academic, setAcademic] = useState<AcademicData>(emptyAcademic());
  const [personalStatement, setPersonalStatement] = useState('');
  const [motivation, setMotivation] = useState('');
  const [baselineKey, setBaselineKey] = useState('');

  const pickerMode = !id && !scholarshipId;

  const {
    data: scholarships = [],
    isLoading: loadingScholarships,
    isError: scholarshipsError,
    refetch: refetchScholarships,
  } = useQuery({
    queryKey: ['apply-scholarships'],
    queryFn: async () => {
      const { data } = await api.get('/scholarships', { params: { limit: 100, status: 'approved' } });
      return (data.data?.scholarships || data.data || []) as Scholarship[];
    },
    enabled: pickerMode,
  });

  const { data: existingApps = [] } = useQuery({
    queryKey: ['applications', 'picker-existing'],
    queryFn: async () => {
      const { data } = await api.get('/applications', { params: { limit: 100 } });
      return (data.data?.applications || []) as Application[];
    },
    enabled: pickerMode,
    staleTime: 30_000,
  });

  const existingByScholarship = useMemo(() => {
    const map = new Map<string, Application>();
    for (const app of existingApps) {
      const sid =
        typeof app.scholarshipId === 'object' && app.scholarshipId
          ? (app.scholarshipId as Scholarship)._id
          : String(app.scholarshipId || '');
      if (!sid) continue;
      const prev = map.get(sid);
      if (!prev) {
        map.set(sid, app);
        continue;
      }
      // Prefer draft so the student can continue unfinished work.
      if (prev.status !== 'draft' && app.status === 'draft') map.set(sid, app);
    }
    return map;
  }, [existingApps]);

  const filteredScholarships = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return scholarships
      .filter((s) => {
        if (pickerLevel && s.level !== pickerLevel) return false;
        if (pickerFunding && s.fundingType !== pickerFunding) return false;
        if (!q) return true;
        const hay = [s.title, s.country, s.field, s.shortDescription, ...(s.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
      .slice()
      .sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
        const db = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
        return da - db;
      });
  }, [scholarships, pickerQuery, pickerLevel, pickerFunding]);

  const profileScore = user?.profileCompletionScore ?? 0;
  const needsProfile = profileScore < 60;

  const scholarship = useMemo(() => {
    const fromApp = application?.scholarshipId;
    if (fromApp && typeof fromApp === 'object') return fromApp as Scholarship;
    return scholarships.find((s) => s._id === scholarshipId);
  }, [application, scholarships, scholarshipId]);

  const snapshotKey = useMemo(
    () =>
      JSON.stringify({
        programme,
        personal,
        academic,
        personalStatement,
        motivation,
        docs: (application?.documents || []).map((d) => d.url),
      }),
    [programme, personal, academic, personalStatement, motivation, application?.documents],
  );

  const dirty = Boolean(baselineKey) && snapshotKey !== baselineKey;
  const locked = ['submitted', 'under_review', 'accepted', 'rejected'].includes(
    application?.status || '',
  );

  useEffect(() => {
    if (!user || application) return;
    const fromAccount = splitAccountName(user.name);
    setPersonal((prev) => ({
      ...prev,
      firstName: prev.firstName || fromAccount.firstName,
      lastName: prev.lastName || fromAccount.lastName,
      otherName: prev.otherName || fromAccount.otherName,
      phone: prev.phone || user.profile?.phone || '',
      country: prev.country || user.profile?.country || '',
      dateOfBirth: prev.dateOfBirth || (user.profile?.dateOfBirth || '').slice(0, 10),
      nationality: prev.nationality || user.profile?.country || '',
    }));
    setAcademic((prev) => ({
      ...prev,
      educationLevel: prev.educationLevel || user.profile?.educationLevel || '',
      institution: prev.institution || user.profile?.institution || '',
      fieldOfStudy: prev.fieldOfStudy || user.profile?.fieldOfStudy || '',
      gpa: prev.gpa || (user.profile?.gpa != null ? String(user.profile.gpa) : ''),
      languages: prev.languages || (user.profile?.languages || []).join(', '),
    }));
  }, [user, application]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoadError(false);
      try {
        const { data } = await api.get(`/applications/${id}`);
        const app = data.data.application as Application;
        setApplication(app);
        const lockedStatuses = ['submitted', 'under_review', 'accepted', 'rejected'];
        const isLocked = lockedStatuses.includes(app.status);
        setStep(isLocked ? TOTAL_STEPS : Math.min(TOTAL_STEPS, Math.max(1, app.currentStep || 1)));
        setPersonalStatement(app.personalStatement || '');
        setMotivation(app.motivation || '');
        setLastSavedAt(app.lastSavedAt || app.updatedAt || null);

        const step1 = (app.steps?.find((s) => s.stepNumber === 1)?.data || {}) as Record<
          string,
          unknown
        >;
        const legacy = looksLikePersonalData(step1);

        let nextProgramme = emptyProgramme();
        let nextPersonal = emptyPersonal();
        let nextAcademic = emptyAcademic();
        let statements: { personalStatement?: string; motivation?: string } = {};

        if (legacy) {
          const sch =
            app.scholarshipId && typeof app.scholarshipId === 'object'
              ? (app.scholarshipId as Scholarship)
              : null;
          nextProgramme = programmeFromScholarship(sch);
          nextPersonal = personalFromStored(step1);
          nextAcademic = {
            ...emptyAcademic(),
            ...((app.steps?.find((s) => s.stepNumber === 2)?.data || {}) as Partial<AcademicData>),
          };
          statements = (app.steps?.find((s) => s.stepNumber === 3)?.data || {}) as {
            personalStatement?: string;
            motivation?: string;
          };
        } else {
          nextProgramme = {
            ...emptyProgramme(),
            ...(step1 as Partial<ProgrammeData>),
          };
          nextPersonal = personalFromStored(
            (app.steps?.find((s) => s.stepNumber === 2)?.data || {}) as Record<string, unknown>,
          );
          nextAcademic = {
            ...emptyAcademic(),
            ...((app.steps?.find((s) => s.stepNumber === 3)?.data || {}) as Partial<AcademicData>),
          };
          statements = (app.steps?.find((s) => s.stepNumber === 4)?.data || {}) as {
            personalStatement?: string;
            motivation?: string;
          };
        }

        const nextStatement = app.personalStatement || statements.personalStatement || '';
        const nextMotivation = app.motivation || statements.motivation || '';

        setProgramme(nextProgramme);
        if (nextProgramme.intendedField && isListedStudyField(nextProgramme.intendedField)) {
          setFieldChoice(nextProgramme.intendedField);
        } else if (nextProgramme.intendedField) {
          setFieldChoice(STUDY_FIELD_OTHER);
        } else {
          setFieldChoice('');
        }
        setPersonal(nextPersonal);
        setAcademic(nextAcademic);
        setPersonalStatement(nextStatement);
        setMotivation(nextMotivation);

        setBaselineKey(
          JSON.stringify({
            programme: nextProgramme,
            personal: nextPersonal,
            academic: nextAcademic,
            personalStatement: nextStatement,
            motivation: nextMotivation,
            docs: (app.documents || []).map((d) => d.url),
          }),
        );
      } catch (err: unknown) {
        setLoadError(true);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not load application.';
        toast.error(message);
      }
    };
    load();
  }, [id]);

  // Prefill programme from scholarship when draft still has empty programme fields
  useEffect(() => {
    if (!scholarship || locked) return;
    setProgramme((prev) => {
      const fromSch = programmeFromScholarship(scholarship);
      const next = {
        intendedLevel: prev.intendedLevel || fromSch.intendedLevel,
        intendedField: prev.intendedField || fromSch.intendedField,
        specialization: prev.specialization || '',
      };
      if (
        next.intendedLevel === prev.intendedLevel &&
        next.intendedField === prev.intendedField &&
        next.specialization === prev.specialization
      ) {
        return prev;
      }
      if (next.intendedField && isListedStudyField(next.intendedField)) {
        setFieldChoice(next.intendedField);
      } else if (next.intendedField) {
        setFieldChoice(STUDY_FIELD_OTHER);
      }
      return next;
    });
  }, [scholarship, locked]);

  useEffect(() => {
    if (!dirty || locked) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty, locked]);

  const startApplication = async (selectedId: string) => {
    setSaving(true);
    try {
      const { data } = await api.post('/applications', { scholarshipId: selectedId });
      const app = data.data.application as Application;
      toast.success('Draft created.');
      navigate(`/dashboard/applications/${app._id}`, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not start application.';
      if (String(msg).toLowerCase().includes('already applied')) {
        toast.error('You already have an application for this scholarship.');
        navigate('/dashboard/applications');
      } else {
        toast.error(msg);
        setScholarshipId('');
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!id && scholarshipId) startApplication(scholarshipId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, scholarshipId]);

  const buildStepsPayload = (markCurrentComplete: boolean) => {
    const steps = [
      {
        stepNumber: 1,
        title: 'Programme of study',
        data: programme,
        completed: step > 1,
      },
      {
        stepNumber: 2,
        title: 'Personal Information',
        data: {
          ...personal,
          fullName: composeFullName(personal),
        },
        completed: step > 2,
      },
      {
        stepNumber: 3,
        title: 'Academic Background',
        data: academic,
        completed: step > 3,
      },
      {
        stepNumber: 4,
        title: 'Statement & Motivation',
        data: { personalStatement, motivation },
        completed: step > 4,
      },
      {
        stepNumber: 5,
        title: 'Documents',
        data: { documentCount: application?.documents?.length || 0 },
        completed: (application?.documents?.length || 0) > 0,
      },
      {
        stepNumber: 6,
        title: 'Review & Submit',
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

  const levelLocked = Boolean(scholarship?.level && scholarship.level !== 'any');

  const validateStep = useCallback(() => {
    if (step === 1) {
      if (!programme.intendedLevel || !programme.intendedField.trim()) {
        toast.error('Select the degree level and field you are applying for.');
        return false;
      }
    }
    if (step === 2) {
      if (!personal.firstName.trim() || !personal.lastName.trim() || !personal.phone.trim() || !personal.country.trim() || !personal.nationality.trim()) {
        toast.error('Complete the required personal fields.');
        return false;
      }
    }
    if (step === 3) {
      if (!academic.educationLevel || !academic.institution.trim() || !academic.fieldOfStudy.trim()) {
        toast.error('Complete the required academic background fields.');
        return false;
      }
    }
    if (step === 4) {
      if (personalStatement.trim().length < 100) {
        toast.error('Personal statement needs at least 100 characters.');
        return false;
      }
      if (motivation.trim().length < 50) {
        toast.error('Motivation needs at least 50 characters.');
        return false;
      }
    }
    if (step === 5 && (!application?.documents || application.documents.length === 0)) {
      toast.error('Upload at least one supporting document.');
      return false;
    }
    return true;
  }, [step, programme, personal, academic, personalStatement, motivation, application?.documents]);

  const saveProgress = async (nextStep?: number, markComplete = true, silent = false) => {
    if (!application || locked) return application;
    setSaving(true);
    try {
      const { data } = await api.patch(`/applications/${application._id}`, {
        currentStep: nextStep || step,
        personalStatement,
        motivation,
        steps: buildStepsPayload(markComplete),
      });
      const saved = data.data.application as Application;
      setApplication(saved);
      setLastSavedAt(saved.lastSavedAt || saved.updatedAt || new Date().toISOString());
      setBaselineKey(
        JSON.stringify({
          programme,
          personal,
          academic,
          personalStatement,
          motivation,
          docs: (saved.documents || []).map((d) => d.url),
        }),
      );
      if (!silent) toast.success('Draft saved.');
      return saved;
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not save progress.',
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    if (locked || !validateStep()) return;
    const next = Math.min(step + 1, TOTAL_STEPS);
    await saveProgress(next, true, true);
    setStep(next);
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const goToStep = (n: number) => {
    if (locked) {
      setStep(n);
      return;
    }
    if (n <= step) setStep(n);
  };

  const discardChanges = () => {
    if (!baselineKey) return;
    try {
      const parsed = JSON.parse(baselineKey) as {
        programme: ProgrammeData;
        personal: PersonalData;
        academic: AcademicData;
        personalStatement: string;
        motivation: string;
      };
      setProgramme(parsed.programme);
      if (parsed.programme.intendedField && isListedStudyField(parsed.programme.intendedField)) {
        setFieldChoice(parsed.programme.intendedField);
      } else if (parsed.programme.intendedField) {
        setFieldChoice(STUDY_FIELD_OTHER);
      } else {
        setFieldChoice('');
      }
      setPersonal(personalFromStored(parsed.personal as unknown as Record<string, unknown>));
      setAcademic(parsed.academic);
      setPersonalStatement(parsed.personalStatement);
      setMotivation(parsed.motivation);
      toast.success('Changes discarded.');
    } catch {
      toast.error('Could not discard changes.');
    }
  };

  const onUpload = async (files: FileList | File[] | null) => {
    if (!files || !application || locked) return;
    const list = Array.from(files);
    if (!list.length) return;

    const tooBig = list.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      toast.error(`“${tooBig.name}” is over 5 MB.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      list.forEach((file) => formData.append('documents', file));
      const { data } = await api.post(`/applications/${application._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const nextApp = (data.data.application || {
        ...application,
        documents: data.data.documents,
      }) as Application;
      setApplication(nextApp);
      setBaselineKey((prev) => {
        try {
          const parsed = JSON.parse(prev || '{}');
          return JSON.stringify({
            ...parsed,
            docs: (nextApp.documents || []).map((d: Document) => d.url),
          });
        } catch {
          return prev;
        }
      });
      toast.success(list.length === 1 ? 'Document uploaded.' : `${list.length} documents uploaded.`);
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Upload failed.',
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeDocument = async (index: number) => {
    if (!application || locked) return;
    const docs = [...(application.documents || [])];
    docs.splice(index, 1);
    setSaving(true);
    try {
      const { data } = await api.patch(`/applications/${application._id}`, {
        documents: docs,
        currentStep: step,
        steps: buildStepsPayload(false),
      });
      const saved = data.data.application as Application;
      setApplication(saved);
      setBaselineKey(
        JSON.stringify({
          programme,
          personal,
          academic,
          personalStatement,
          motivation,
          docs: (saved.documents || []).map((d) => d.url),
        }),
      );
      toast.success('Document removed.');
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not remove document.',
      );
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async () => {
    if (!application || locked) return;

    if (!programme.intendedLevel || !programme.intendedField.trim()) {
      toast.error('Select the degree level and field you are applying for.');
      setStep(1);
      return;
    }
    if (!personal.firstName.trim() || !personal.lastName.trim() || !personal.phone.trim() || !personal.country.trim() || !personal.nationality.trim()) {
      toast.error('Personal details are incomplete.');
      setStep(2);
      return;
    }
    if (!academic.educationLevel || !academic.institution.trim() || !academic.fieldOfStudy.trim()) {
      toast.error('Academic details are incomplete.');
      setStep(3);
      return;
    }
    if (personalStatement.trim().length < 100 || motivation.trim().length < 50) {
      toast.error('Statements are incomplete.');
      setStep(4);
      return;
    }
    if (!application.documents?.length) {
      toast.error('Upload at least one document before submitting.');
      setStep(5);
      return;
    }

    setStep(TOTAL_STEPS);
    setSubmitting(true);
    try {
      await saveProgress(TOTAL_STEPS, true, true);
      const { data } = await api.post(`/applications/${application._id}/submit`);
      setApplication(data.data.application);
      setBaselineKey(snapshotKey);
      toast.success('Application submitted.');
      navigate('/dashboard/applications');
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Submit failed.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Scholarship picker
  if (!id && !scholarshipId) {
    const levelOptions = Array.from(new Set(scholarships.map((s) => s.level).filter(Boolean))).sort();
    const fundingOptions = Array.from(
      new Set(scholarships.map((s) => s.fundingType).filter(Boolean)),
    ).sort();

    return (
      <>
        <Helmet>
          <title>Start application | AfriRoar</title>
        </Helmet>
        <div className="min-h-[70vh] bg-[var(--color-sr-bg)] pb-16">
          <div className="border-b border-[var(--color-sr-border)] bg-white">
            <div className="sr-container py-7 md:py-9">
              <Link
                to="/dashboard/applications"
                className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-sr-muted)] hover:text-[var(--color-sr-navy)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Applications
              </Link>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 max-w-2xl">
                  <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                    New application
                  </p>
                  <h1 className="text-[1.7rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[1.95rem]">
                    Choose a scholarship
                  </h1>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
                    Open a draft for one programme. Save as you go. You can return any time before you submit.
                  </p>
                </div>
                <Link
                  to="/scholarships"
                  className="inline-flex items-center gap-1.5 self-start text-[14px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline lg:self-auto"
                >
                  Browse full listings
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="sr-container mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <div className="border border-[var(--color-sr-border)] bg-white p-4">
                <label htmlFor="picker-search" className="sr-only">
                  Search scholarships
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-sr-muted)]" />
                  <input
                    id="picker-search"
                    value={pickerQuery}
                    onChange={(e) => setPickerQuery(e.target.value)}
                    placeholder="Search by title, country, or field…"
                    className="w-full border border-[var(--color-sr-border)] bg-white py-2.5 pl-10 pr-3 text-[16px] text-[var(--color-sr-text)] outline-none placeholder:text-[var(--color-sr-muted)]/70 focus:border-[var(--color-sr-navy)]"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <select
                    value={pickerLevel}
                    onChange={(e) => setPickerLevel(e.target.value)}
                    className="border border-[var(--color-sr-border)] bg-white px-3 py-2 text-[13px] font-medium text-[var(--color-sr-navy)] outline-none focus:border-[var(--color-sr-navy)]"
                    aria-label="Filter by level"
                  >
                    <option value="">All levels</option>
                    {levelOptions.map((level) => (
                      <option key={level} value={level}>
                        {getLevelLabel(level)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={pickerFunding}
                    onChange={(e) => setPickerFunding(e.target.value)}
                    className="border border-[var(--color-sr-border)] bg-white px-3 py-2 text-[13px] font-medium text-[var(--color-sr-navy)] outline-none focus:border-[var(--color-sr-navy)]"
                    aria-label="Filter by funding"
                  >
                    <option value="">All funding</option>
                    {fundingOptions.map((funding) => (
                      <option key={funding} value={funding}>
                        {getFundingTypeLabel(funding)}
                      </option>
                    ))}
                  </select>
                  {pickerQuery || pickerLevel || pickerFunding ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPickerQuery('');
                        setPickerLevel('');
                        setPickerFunding('');
                      }}
                      className="px-3 py-2 text-[13px] font-semibold text-[var(--color-sr-muted)] hover:text-[var(--color-sr-navy)]"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              </div>

              {loadingScholarships ? (
                <div className="space-y-3" aria-busy="true">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="border border-[var(--color-sr-border)] bg-white p-5">
                      <div className="h-5 w-2/3 animate-pulse bg-[var(--color-sr-border)]" />
                      <div className="mt-3 h-4 w-1/2 animate-pulse bg-[var(--color-sr-border)]" />
                    </div>
                  ))}
                </div>
              ) : scholarshipsError ? (
                <div className="border border-red-200 bg-red-50 p-8 text-center">
                  <p className="font-semibold text-red-900">Could not load scholarships</p>
                  <p className="mt-1 text-[14px] text-red-800/80">
                    The server may be busy or rate-limited. Wait a moment, then retry.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchScholarships()}
                    className="mt-4 border border-red-300 bg-white px-4 py-2 text-[14px] font-semibold text-red-900"
                  >
                    Retry
                  </button>
                </div>
              ) : scholarships.length === 0 ? (
                <div className="border border-[var(--color-sr-border)] bg-white px-6 py-14 text-center">
                  <FileText className="mx-auto h-10 w-10 text-[var(--color-sr-muted)]" />
                  <p className="mt-4 font-semibold text-[var(--color-sr-navy-deeper)]">No scholarships available</p>
                  <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                    Check back soon, or browse the public listings.
                  </p>
                  <Link
                    to="/scholarships"
                    className="mt-5 inline-flex text-[14px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                  >
                    Browse listings →
                  </Link>
                </div>
              ) : filteredScholarships.length === 0 ? (
                <div className="border border-[var(--color-sr-border)] bg-white px-6 py-12 text-center">
                  <p className="font-semibold text-[var(--color-sr-navy-deeper)]">No matches</p>
                  <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                    Try a broader search or clear the filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerQuery('');
                      setPickerLevel('');
                      setPickerFunding('');
                    }}
                    className="mt-4 text-[14px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[13px] text-[var(--color-sr-muted)]">
                    {filteredScholarships.length} programme
                    {filteredScholarships.length === 1 ? '' : 's'} · sorted by deadline
                  </p>
                  <ul className="divide-y divide-[var(--color-sr-border)] border border-[var(--color-sr-border)] bg-white">
                    {filteredScholarships.map((s) => {
                      const existing = existingByScholarship.get(s._id);
                      const isDraft = existing?.status === 'draft';
                      const isLocked =
                        existing &&
                        ['submitted', 'under_review', 'accepted', 'rejected'].includes(existing.status);

                      return (
                        <li key={s._id}>
                          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {s.isFeatured ? (
                                  <span className="border border-[var(--color-sr-yellow)] bg-[var(--color-sr-yellow)]/20 px-2 py-0.5 text-[11px] font-bold text-[var(--color-sr-navy-deeper)]">
                                    Featured
                                  </span>
                                ) : null}
                                {isDraft ? (
                                  <span className="border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-sr-navy)]">
                                    Draft in progress
                                  </span>
                                ) : null}
                                {isLocked ? (
                                  <span className="border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-sky-900">
                                    {existing.status.replace(/_/g, ' ')}
                                  </span>
                                ) : null}
                              </div>

                              <h2 className="mt-2 text-[1.05rem] font-bold leading-snug text-[var(--color-sr-navy-deeper)]">
                                {s.title}
                              </h2>

                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-sr-muted)]">
                                {s.country ? (
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {s.country}
                                  </span>
                                ) : null}
                                {s.level ? <span>{getLevelLabel(s.level)}</span> : null}
                                {s.fundingType ? <span>{getFundingTypeLabel(s.fundingType)}</span> : null}
                                {s.deadline ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatDeadline(s.deadline)}
                                  </span>
                                ) : null}
                              </div>

                              {s.shortDescription ? (
                                <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-[var(--color-sr-text)]/80">
                                  {s.shortDescription}
                                </p>
                              ) : null}
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              {s.slug || s._id ? (
                                <Link
                                  to={`/scholarships/${s.slug || s._id}`}
                                  className="border border-[var(--color-sr-border)] px-3 py-2 text-[13px] font-semibold text-[var(--color-sr-navy)] transition hover:border-[var(--color-sr-navy)]"
                                >
                                  Details
                                </Link>
                              ) : null}

                              {isDraft && existing ? (
                                <Link
                                  to={`/dashboard/applications/${existing._id}`}
                                  className="inline-flex items-center gap-1.5 bg-[var(--color-sr-navy)] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[var(--color-sr-navy-dark)]"
                                >
                                  Continue draft
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                              ) : isLocked && existing ? (
                                <Link
                                  to={`/dashboard/applications/${existing._id}`}
                                  className="inline-flex items-center gap-1.5 border border-[var(--color-sr-navy)] px-4 py-2 text-[13px] font-semibold text-[var(--color-sr-navy)]"
                                >
                                  View application
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => setScholarshipId(s._id)}
                                  className="inline-flex items-center gap-1.5 bg-[var(--color-sr-yellow)] px-4 py-2 text-[13px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)] disabled:opacity-60"
                                >
                                  Start draft
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>

            <aside className="h-fit space-y-4 lg:sticky lg:top-24">
              <div className="border border-[var(--color-sr-border)] bg-white p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
                  Before you start
                </p>
                <ul className="mt-3 space-y-2.5 text-[14px] text-[var(--color-sr-text)]">
                  {[
                    'Legal name and contact details',
                    'Education history and field of study',
                    'Personal statement (100+ characters)',
                    'Motivation for this programme',
                    'ID, transcripts, CV (PDF or images)',
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" strokeWidth={2.5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-[var(--color-sr-border)] bg-white p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
                  Profile readiness
                </p>
                <p className="mt-2 text-[1.5rem] font-bold tabular-nums text-[var(--color-sr-navy)]">
                  {profileScore}%
                </p>
                <div className="mt-2 h-1.5 overflow-hidden bg-[var(--color-sr-border)]">
                  <div
                    className="h-full bg-[var(--color-sr-yellow)]"
                    style={{ width: `${Math.min(100, Math.max(0, profileScore))}%` }}
                  />
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-sr-muted)]">
                  {needsProfile
                    ? 'A stronger profile prefills your draft and improves matching.'
                    : 'Your profile will prefill personal and academic fields.'}
                </p>
                {needsProfile ? (
                  <Link
                    to="/dashboard/profile"
                    className="mt-3 inline-flex text-[13px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                  >
                    Strengthen profile →
                  </Link>
                ) : null}
              </div>

              <div className="border border-[var(--color-sr-navy)] bg-[var(--color-sr-navy)] p-5 text-white">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-yellow)]">
                  How it works
                </p>
                <ol className="mt-3 space-y-2 text-[14px] leading-relaxed text-white/90">
                  <li>1. Pick a programme and open a draft.</li>
                  <li>2. Complete five short steps.</li>
                  <li>3. Upload documents, review, and submit.</li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </>
    );
  }

  if (loadError) {
    return (
      <div className="sr-container py-16 text-center">
        <p className="font-semibold text-[var(--color-sr-navy)]">Application could not be loaded</p>
        <Link to="/dashboard/applications" className="mt-4 inline-flex text-[14px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
          Back to applications →
        </Link>
      </div>
    );
  }

  if (!application) {
    return (
      <>
        <Helmet>
          <title>Preparing application | AfriRoar</title>
        </Helmet>
        <div className="min-h-[50vh] bg-[var(--color-sr-bg)]">
          <div className="sr-container flex flex-col items-center justify-center gap-3 py-24 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-sr-navy)]" />
            <p className="font-semibold text-[var(--color-sr-navy-deeper)]">Opening your draft…</p>
            <p className="max-w-sm text-[14px] text-[var(--color-sr-muted)]">
              Prefilling profile details and setting up the five-step wizard.
            </p>
          </div>
        </div>
      </>
    );
  }

  const progressPct = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <>
      <Helmet>
        <title>
          {scholarship?.title ? `${scholarship.title} · Application` : 'Application'} | AfriRoar
        </title>
      </Helmet>

      <div className={['min-h-[70vh] w-full max-w-[100vw] overflow-x-hidden bg-[var(--color-sr-bg)]', dirty && !locked ? 'pb-36' : 'pb-28'].join(' ')}>
        <div className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container py-7 md:py-9">
            <Link
              to="/dashboard/applications"
              className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-sr-muted)] hover:text-[var(--color-sr-navy)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Applications
            </Link>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                  {locked ? 'Submitted application' : 'Application wizard'}
                </p>
                <h1 className="break-words text-[1.45rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] sm:text-[1.6rem] md:text-[1.9rem]">
                  {scholarship?.title || 'Scholarship application'}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      'inline-flex items-center border px-2.5 py-1 text-[12px] font-semibold capitalize',
                      statusTone(application.status),
                    ].join(' ')}
                  >
                    {statusLabel(application.status)}
                  </span>
                  {scholarship?.deadline ? (
                    <span className="text-[13px] text-[var(--color-sr-muted)]">
                      Deadline {formatDeadline(scholarship.deadline)}
                    </span>
                  ) : null}
                  {application.submittedAt ? (
                    <span className="text-[13px] text-[var(--color-sr-muted)]">
                      Submitted {formatDate(application.submittedAt)}
                    </span>
                  ) : lastSavedAt && !locked ? (
                    <span className="inline-flex items-center gap-1 text-[13px] text-[var(--color-sr-muted)]">
                      <Clock className="h-3.5 w-3.5" />
                      Saved {formatDate(lastSavedAt)}
                    </span>
                  ) : null}
                </div>
              </div>

              {locked ? (
                <div className="max-w-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] leading-relaxed text-emerald-900">
                  <p className="inline-flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Locked for review
                  </p>
                  <p className="mt-1.5 text-emerald-800/90">
                    Edits are closed. You can still read every section and download your documents.
                  </p>
                </div>
              ) : null}
            </div>

            {!locked ? (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                  <span>
                    Step {step} of {STEPS.length}
                  </span>
                  <span className="tabular-nums">{progressPct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden bg-[var(--color-sr-border)]">
                  <div
                    className="h-full bg-[var(--color-sr-yellow)] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="sr-container mt-6 grid min-w-0 gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit min-w-0 border border-[var(--color-sr-border)] bg-white p-3 sm:p-4 lg:sticky lg:top-24">
            <div className="-mx-1 mb-3 flex gap-1 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch] lg:hidden" role="tablist" aria-label="Application steps">
              {STEPS.map((item, idx) => {
                const n = idx + 1;
                const active = step === n;
                const clickable = locked || n <= step;
                return (
                  <button
                    key={`m-${item.title}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled={!clickable}
                    onClick={() => goToStep(n)}
                    className={[
                      'shrink-0 border px-3 py-1.5 text-[12px] font-semibold',
                      active
                        ? 'border-[var(--color-sr-navy)] bg-[var(--color-sr-navy)] text-white'
                        : 'border-[var(--color-sr-border)] text-[var(--color-sr-navy)]',
                      !clickable ? 'opacity-40' : '',
                    ].join(' ')}
                  >
                    {n}. {item.title}
                  </button>
                );
              })}
            </div>
            <ol className="hidden space-y-1 lg:block">
              {STEPS.map((item, idx) => {
                const n = idx + 1;
                const active = step === n;
                const done = Boolean(application.steps?.find((s) => s.stepNumber === n)?.completed) || n < step;
                const clickable = locked || n <= step;
                return (
                  <li key={item.title}>
                    <button
                      type="button"
                      disabled={!clickable}
                      onClick={() => goToStep(n)}
                      className={[
                        'flex w-full items-start gap-3 px-2 py-2.5 text-left transition',
                        active ? 'bg-[var(--color-sr-bg)]' : 'hover:bg-[var(--color-sr-bg)]/70',
                        !clickable ? 'cursor-not-allowed opacity-45' : '',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[11px] font-bold',
                          done || active
                            ? 'bg-[var(--color-sr-navy)] text-white'
                            : 'border border-[var(--color-sr-border)] text-[var(--color-sr-muted)]',
                        ].join(' ')}
                      >
                        {done && !active ? <Check className="h-3 w-3" strokeWidth={3} /> : n}
                      </span>
                      <span>
                        <span
                          className={[
                            'block text-[13px] font-semibold',
                            active ? 'text-[var(--color-sr-navy-deeper)]' : 'text-[var(--color-sr-text)]',
                          ].join(' ')}
                        >
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[var(--color-sr-muted)]">{item.blurb}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {scholarship ? (
              <div className="mt-5 border-t border-[var(--color-sr-border)] pt-4 text-[12px] text-[var(--color-sr-muted)]">
                <p className="font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-navy)]">Listing</p>
                <p className="mt-2 leading-relaxed">
                  {scholarship.country}
                  {scholarship.level ? ` · ${getLevelLabel(scholarship.level)}` : ''}
                </p>
                {scholarship.field ? <p className="mt-1">{scholarship.field}</p> : null}
                {scholarship.fundingType ? (
                  <p className="mt-1">{getFundingTypeLabel(scholarship.fundingType)}</p>
                ) : null}
                {programme.intendedLevel || programme.intendedField ? (
                  <div className="mt-3 border-t border-[var(--color-sr-border)] pt-3">
                    <p className="font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-navy)]">
                      Applying for
                    </p>
                    <p className="mt-2 font-semibold text-[var(--color-sr-navy-deeper)]">
                      {[getLevelLabel(programme.intendedLevel), programme.intendedField]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </p>
                    {programme.specialization ? (
                      <p className="mt-1">{programme.specialization}</p>
                    ) : null}
                  </div>
                ) : null}
                {scholarship.slug || scholarship._id ? (
                  <Link
                    to={`/scholarships/${scholarship.slug || scholarship._id}`}
                    className="mt-3 inline-flex text-[13px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                  >
                    View listing →
                  </Link>
                ) : null}
              </div>
            ) : null}
          </aside>

          <section className="min-w-0 border border-[var(--color-sr-border)] bg-white p-4 sm:p-6 md:p-8">
            <header className="mb-6 border-b border-[var(--color-sr-border)] pb-4">
              <h2 className="text-[1.15rem] font-bold text-[var(--color-sr-navy-deeper)] sm:text-[1.25rem]">
                {STEPS[step - 1].title}
              </h2>
              <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">{STEPS[step - 1].blurb}</p>
            </header>

            {step === 1 && (
              <div className="space-y-5">
                <div className="border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                    Scholarship
                  </p>
                  <p className="mt-1 text-[15px] font-bold text-[var(--color-sr-navy-deeper)]">
                    {scholarship?.title || 'Selected programme'}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--color-sr-muted)]">
                    Tell us the exact degree level and field you want this award to support.
                    This is separate from your past education background.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="app-intended-level"
                    label="Degree level you are applying for *"
                    hint={
                      levelLocked
                        ? 'This listing is limited to one degree level.'
                        : 'Choose Bachelor’s, Master’s, PhD, or another level this scholarship allows.'
                    }
                  >
                    <select
                      id="app-intended-level"
                      disabled={locked || levelLocked}
                      value={programme.intendedLevel}
                      onChange={(e) =>
                        setProgramme({ ...programme, intendedLevel: e.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="">Select degree level…</option>
                      {INTENDED_DEGREE_LEVELS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    id="app-intended-field"
                    label="Field of study *"
                    hint="Pick the subject area for this application (e.g. Information Technology, Civil Engineering)."
                  >
                    <select
                      id="app-intended-field"
                      disabled={locked}
                      value={fieldChoice}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFieldChoice(value);
                        if (value === STUDY_FIELD_OTHER) {
                          setProgramme({
                            ...programme,
                            intendedField: isListedStudyField(programme.intendedField)
                              ? ''
                              : programme.intendedField,
                          });
                        } else {
                          setProgramme({ ...programme, intendedField: value });
                        }
                      }}
                      className={inputClass}
                    >
                      <option value="">Select field of study…</option>
                      {STUDY_FIELD_CATEGORIES.map((group) => (
                        <optgroup key={group.category} label={group.category}>
                          {group.fields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value={STUDY_FIELD_OTHER}>{STUDY_FIELD_OTHER}</option>
                    </select>
                  </Field>

                  {fieldChoice === STUDY_FIELD_OTHER ? (
                    <Field
                      id="app-intended-field-custom"
                      label="Specify your field *"
                      className="sm:col-span-2"
                    >
                      <input
                        id="app-intended-field-custom"
                        disabled={locked}
                        value={programme.intendedField}
                        onChange={(e) =>
                          setProgramme({ ...programme, intendedField: e.target.value })
                        }
                        className={inputClass}
                        placeholder="e.g. Marine Biotechnology"
                      />
                    </Field>
                  ) : null}

                  <Field
                    id="app-specialization"
                    label="Specialization / concentration"
                    className="sm:col-span-2"
                    hint="Optional. Example: Artificial Intelligence within Computer Science, or Structural Engineering within Civil Engineering."
                  >
                    <input
                      id="app-specialization"
                      disabled={locked}
                      value={programme.specialization}
                      onChange={(e) =>
                        setProgramme({ ...programme, specialization: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Optional specialization"
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="app-firstName" label="First name *">
                  <input
                    id="app-firstName"
                    disabled={locked}
                    value={personal.firstName}
                    onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
                    className={inputClass}
                    autoComplete="given-name"
                  />
                </Field>
                <Field id="app-lastName" label="Last name *">
                  <input
                    id="app-lastName"
                    disabled={locked}
                    value={personal.lastName}
                    onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                    className={inputClass}
                    autoComplete="family-name"
                  />
                </Field>
                <Field id="app-otherName" label="Other name" className="sm:col-span-2">
                  <input
                    id="app-otherName"
                    disabled={locked}
                    value={personal.otherName}
                    onChange={(e) => setPersonal({ ...personal, otherName: e.target.value })}
                    className={inputClass}
                    autoComplete="additional-name"
                  />
                </Field>
                <Field id="app-phone" label="Phone *">
                  <input
                    id="app-phone"
                    disabled={locked}
                    value={personal.phone}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                    className={inputClass}
                    autoComplete="tel"
                  />
                </Field>
                <Field id="app-dob" label="Date of birth">
                  <input
                    id="app-dob"
                    type="date"
                    disabled={locked}
                    value={personal.dateOfBirth}
                    onChange={(e) => setPersonal({ ...personal, dateOfBirth: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field id="app-country" label="Country of residence *">
                  <select
                    id="app-country"
                    disabled={locked}
                    value={personal.country}
                    onChange={(e) => setPersonal({ ...personal, country: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select country…</option>
                    {personal.country && !(COUNTRIES as readonly string[]).includes(personal.country) ? (
                      <option value={personal.country}>{personal.country}</option>
                    ) : null}
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id="app-nationality" label="Nationality *">
                  <select
                    id="app-nationality"
                    disabled={locked}
                    value={personal.nationality}
                    onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select nationality…</option>
                    {personal.nationality &&
                    !(COUNTRIES as readonly string[]).includes(personal.nationality) ? (
                      <option value={personal.nationality}>{personal.nationality}</option>
                    ) : null}
                    {COUNTRIES.map((c) => (
                      <option key={`nat-${c}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id="app-address" label="Mailing address" className="sm:col-span-2" hint="Optional, but useful for offer letters.">
                  <input
                    id="app-address"
                    disabled={locked}
                    value={personal.address}
                    onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <p className="sm:col-span-2 text-[14px] text-[var(--color-sr-muted)]">
                  Your current or most recent education — not the programme you are applying for.
                </p>
                <Field id="app-education" label="Highest education completed / in progress *">
                  <select
                    id="app-education"
                    disabled={locked}
                    value={academic.educationLevel}
                    onChange={(e) => setAcademic({ ...academic, educationLevel: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    <option value="high-school">High school</option>
                    <option value="bachelors">Bachelor&apos;s</option>
                    <option value="masters">Master&apos;s</option>
                    <option value="phd">PhD</option>
                    <option value="postdoc">Postdoc</option>
                  </select>
                </Field>
                <Field id="app-institution" label="Institution *">
                  <input
                    id="app-institution"
                    disabled={locked}
                    value={academic.institution}
                    onChange={(e) => setAcademic({ ...academic, institution: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field id="app-field" label="Major / subject studied *">
                  <input
                    id="app-field"
                    disabled={locked}
                    value={academic.fieldOfStudy}
                    onChange={(e) => setAcademic({ ...academic, fieldOfStudy: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field id="app-gpa" label="GPA / grade" hint="Optional. Use your institution’s scale if not 4.0.">
                  <input
                    id="app-gpa"
                    disabled={locked}
                    value={academic.gpa}
                    onChange={(e) => setAcademic({ ...academic, gpa: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field id="app-grad-year" label="Graduation year">
                  <input
                    id="app-grad-year"
                    disabled={locked}
                    value={academic.graduationYear}
                    onChange={(e) => setAcademic({ ...academic, graduationYear: e.target.value })}
                    className={inputClass}
                    placeholder="2026"
                  />
                </Field>
                <Field id="app-languages" label="Languages">
                  <input
                    id="app-languages"
                    disabled={locked}
                    value={academic.languages}
                    onChange={(e) => setAcademic({ ...academic, languages: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <Field
                  id="app-statement"
                  label="Personal statement *"
                  hint="Tell your academic story, achievements, and goals. Minimum 100 characters."
                >
                  <textarea
                    id="app-statement"
                    disabled={locked}
                    rows={9}
                    value={personalStatement}
                    onChange={(e) => setPersonalStatement(e.target.value)}
                    className={`${inputClass} resize-y`}
                  />
                  <p
                    className={[
                      'mt-1.5 text-right text-[12px] tabular-nums',
                      personalStatement.trim().length < 100
                        ? 'text-amber-700'
                        : 'text-[var(--color-sr-muted)]',
                    ].join(' ')}
                  >
                    {personalStatement.length} characters
                  </p>
                </Field>

                <Field
                  id="app-motivation"
                  label="Motivation for this scholarship *"
                  hint="Why this programme, and how the funding returns impact home. Minimum 50 characters."
                >
                  <textarea
                    id="app-motivation"
                    disabled={locked}
                    rows={6}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    className={`${inputClass} resize-y`}
                  />
                  <p
                    className={[
                      'mt-1.5 text-right text-[12px] tabular-nums',
                      motivation.trim().length < 50 ? 'text-amber-700' : 'text-[var(--color-sr-muted)]',
                    ].join(' ')}
                  >
                    {motivation.length} characters
                  </p>
                </Field>
              </div>
            )}

            {step === 5 && (
              <div>
                <p className="mb-4 text-[14px] text-[var(--color-sr-muted)]">
                  Upload clear scans or PDFs. Accepted: PDF, DOC, DOCX, JPG, PNG (max 5 MB each).
                </p>
                <ul className="mb-5 grid gap-2 sm:grid-cols-2">
                  {DOC_HINTS.map((hint) => (
                    <li key={hint} className="flex items-center gap-2 text-[13px] text-[var(--color-sr-text)]">
                      <FileText className="h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                      {hint}
                    </li>
                  ))}
                </ul>

                {!locked ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      onUpload(e.dataTransfer.files);
                    }}
                    className={[
                      'mb-5 flex flex-col items-center justify-center gap-2 border-2 border-dashed px-6 py-10 transition',
                      dragOver
                        ? 'border-[var(--color-sr-navy)] bg-[var(--color-sr-bg)]'
                        : 'border-[var(--color-sr-border)] bg-white',
                    ].join(' ')}
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--color-sr-navy)]" />
                    ) : (
                      <Upload className="h-6 w-6 text-[var(--color-sr-navy)]" />
                    )}
                    <p className="font-semibold text-[var(--color-sr-navy)]">
                      {uploading ? 'Uploading…' : 'Drop files here or browse'}
                    </p>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 text-[13px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline disabled:opacity-50"
                    >
                      Choose files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => onUpload(e.target.files)}
                    />
                  </div>
                ) : null}

                {(application.documents || []).length === 0 ? (
                  <p className="text-[14px] text-[var(--color-sr-muted)]">No documents uploaded yet.</p>
                ) : (
                  <ul className="divide-y divide-[var(--color-sr-border)] border border-[var(--color-sr-border)]">
                    {(application.documents || []).map((doc, index) => (
                      <li key={`${doc.url}-${index}`} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-[14px] font-semibold text-[var(--color-sr-link)] hover:underline"
                          >
                            {doc.name}
                          </a>
                          <p className="mt-0.5 text-[12px] text-[var(--color-sr-muted)]">
                            {[doc.fileType, formatBytes(doc.fileSize)].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        {!locked ? (
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="inline-flex h-9 w-9 items-center justify-center text-red-600 transition hover:bg-red-50"
                            aria-label={`Remove ${doc.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                {locked ? (
                  <div className="border border-[var(--color-sr-navy)]/15 bg-[var(--color-sr-bg)] p-4 md:p-5">
                    <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--color-sr-navy)]">
                      What happens next
                    </p>
                    <ol className="mt-3 space-y-2 text-[14px] leading-relaxed text-[var(--color-sr-text)]">
                      <li className="flex gap-2">
                        <span className="font-semibold text-[var(--color-sr-navy)]">1.</span>
                        AfriRoar confirms your packet is complete.
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-[var(--color-sr-navy)]">2.</span>
                        Reviewers assess eligibility against the programme criteria.
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-[var(--color-sr-navy)]">3.</span>
                        You’ll be notified here and by email when the status changes.
                      </li>
                    </ol>
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <ReviewBlock title="Programme of study" locked={locked} onEdit={() => setStep(1)}>
                    <p className="font-semibold text-[var(--color-sr-navy-deeper)]">
                      {[getLevelLabel(programme.intendedLevel), programme.intendedField]
                        .filter(Boolean)
                        .join(' · ') || '-'}
                    </p>
                    <dl className="mt-3 space-y-1.5 text-[14px]">
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-sr-muted)]">Degree level</dt>
                        <dd className="text-right text-[var(--color-sr-text)]">
                          {getLevelLabel(programme.intendedLevel) || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-sr-muted)]">Field of study</dt>
                        <dd className="max-w-[60%] text-right text-[var(--color-sr-text)]">
                          {programme.intendedField || '-'}
                        </dd>
                      </div>
                      {programme.specialization ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-sr-muted)]">Specialization</dt>
                          <dd className="max-w-[60%] text-right text-[var(--color-sr-text)]">
                            {programme.specialization}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </ReviewBlock>

                  <ReviewBlock title="Personal" locked={locked} onEdit={() => setStep(2)}>
                    <p className="font-semibold text-[var(--color-sr-navy-deeper)]">
                      {composeFullName(personal) || '-'}
                    </p>
                    <dl className="mt-3 space-y-1.5 text-[14px]">
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-sr-muted)]">First name</dt>
                        <dd className="text-right text-[var(--color-sr-text)]">{personal.firstName || '-'}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-sr-muted)]">Last name</dt>
                        <dd className="text-right text-[var(--color-sr-text)]">{personal.lastName || '-'}</dd>
                      </div>
                      {personal.otherName ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-sr-muted)]">Other name</dt>
                          <dd className="text-right text-[var(--color-sr-text)]">{personal.otherName}</dd>
                        </div>
                      ) : null}
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-sr-muted)]">Nationality</dt>
                        <dd className="text-right text-[var(--color-sr-text)]">{personal.nationality || '-'}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-sr-muted)]">Residence</dt>
                        <dd className="text-right text-[var(--color-sr-text)]">{personal.country || '-'}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-sr-muted)]">Phone</dt>
                        <dd className="text-right text-[var(--color-sr-text)]">{personal.phone || '-'}</dd>
                      </div>
                      {personal.dateOfBirth ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-sr-muted)]">Date of birth</dt>
                          <dd className="text-right text-[var(--color-sr-text)]">{personal.dateOfBirth}</dd>
                        </div>
                      ) : null}
                      {personal.address ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-sr-muted)]">Address</dt>
                          <dd className="max-w-[60%] text-right text-[var(--color-sr-text)]">{personal.address}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </ReviewBlock>

                  <ReviewBlock title="Academic background" locked={locked} onEdit={() => setStep(3)}>
                    <p className="font-semibold text-[var(--color-sr-navy-deeper)]">
                      {academic.fieldOfStudy || '-'}
                    </p>
                    <dl className="mt-3 space-y-1.5 text-[14px]">
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-sr-muted)]">Level completed</dt>
                        <dd className="text-right text-[var(--color-sr-text)]">
                          {getLevelLabel(academic.educationLevel) || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-sr-muted)]">Institution</dt>
                        <dd className="max-w-[60%] text-right text-[var(--color-sr-text)]">
                          {academic.institution || '-'}
                        </dd>
                      </div>
                      {academic.gpa ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-sr-muted)]">GPA</dt>
                          <dd className="text-right text-[var(--color-sr-text)]">{academic.gpa}</dd>
                        </div>
                      ) : null}
                      {academic.graduationYear ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-sr-muted)]">Graduation</dt>
                          <dd className="text-right text-[var(--color-sr-text)]">{academic.graduationYear}</dd>
                        </div>
                      ) : null}
                      {academic.languages ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-sr-muted)]">Languages</dt>
                          <dd className="max-w-[60%] text-right text-[var(--color-sr-text)]">{academic.languages}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </ReviewBlock>
                </div>

                <ReviewBlock title="Personal statement" locked={locked} onEdit={() => setStep(4)}>
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-sr-text)]">
                    {personalStatement.trim() || '-'}
                  </p>
                </ReviewBlock>

                <ReviewBlock title="Motivation" locked={locked} onEdit={() => setStep(4)}>
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-sr-text)]">
                    {motivation.trim() || '-'}
                  </p>
                </ReviewBlock>

                <ReviewBlock title="Documents" locked={locked} onEdit={() => setStep(5)}>
                  {(application.documents || []).length === 0 ? (
                    <p className="text-[14px] text-[var(--color-sr-muted)]">No documents attached.</p>
                  ) : (
                    <ul className="divide-y divide-[var(--color-sr-border)] border border-[var(--color-sr-border)]">
                      {(application.documents || []).map((doc, index) => (
                        <li key={`${doc.url}-review-${index}`} className="flex items-center justify-between gap-3 px-3 py-2.5">
                          <div className="min-w-0">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-[14px] font-semibold text-[var(--color-sr-link)] hover:underline"
                            >
                              {doc.name}
                            </a>
                            <p className="mt-0.5 text-[12px] text-[var(--color-sr-muted)]">
                              {[doc.fileType, formatBytes(doc.fileSize)].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          <FileText className="h-4 w-4 shrink-0 text-[var(--color-sr-muted)]" />
                        </li>
                      ))}
                    </ul>
                  )}
                </ReviewBlock>

                {!locked ? (
                  <p className="text-[13px] leading-relaxed text-[var(--color-sr-muted)]">
                    By submitting, you confirm the information is accurate and the documents are authentic.
                    Submitted applications cannot be edited.
                  </p>
                ) : null}
              </div>
            )}

            {!locked ? (
              <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-sr-border)] pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1 || saving || submitting}
                  className="inline-flex w-full items-center justify-center gap-2 border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] disabled:opacity-40 sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => saveProgress(step, false)}
                    disabled={saving || submitting || !dirty}
                    className="inline-flex w-full items-center justify-center gap-2 border border-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] disabled:opacity-40 sm:w-auto"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save draft
                  </button>

                  {step < TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={saving || submitting}
                      className="inline-flex w-full items-center justify-center gap-2 bg-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-60 sm:w-auto"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitApplication}
                      disabled={submitting || saving}
                      className="inline-flex w-full items-center justify-center gap-2 bg-[var(--color-sr-yellow)] px-5 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] disabled:opacity-60 sm:w-auto"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Submit application
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-8 border-t border-[var(--color-sr-border)] pt-6">
                <Link
                  to="/dashboard/applications"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  Back to applications
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      {!locked ? (
        <div
          className={[
            'fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur-sm transition-transform duration-300 pb-[env(safe-area-inset-bottom)]',
            dirty ? 'translate-y-0 border-[var(--color-sr-border)]' : 'translate-y-full border-transparent',
          ].join(' ')}
          aria-hidden={!dirty}
        >
          <div className="sr-container flex flex-col gap-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-[14px] text-[var(--color-sr-muted)]">You have unsaved changes on this draft.</p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={discardChanges}
                disabled={saving || submitting}
                className="border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] transition hover:border-[var(--color-sr-navy)] disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => saveProgress(step, false)}
                disabled={saving || submitting || !dirty}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-sr-yellow)] px-5 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save draft
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
