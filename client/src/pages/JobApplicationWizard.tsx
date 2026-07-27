import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  FileText,
  Loader2,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  formatDeadline,
  getEmploymentTypeLabel,
  getWorkplaceTypeLabel,
} from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmModal';
import { useAuthStore } from '@/stores/authStore';
import type { Job, JobApplication, JobApplicationPersonal } from '@/types';

const STEPS = [
  { title: 'Personal', blurb: 'Identity and contact details' },
  { title: 'Application', blurb: 'Cover letter and CV' },
  { title: 'Review', blurb: 'Confirm and submit' },
] as const;

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

const inputClass =
  'w-full border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[16px] text-[var(--color-sr-text)] outline-none transition-colors placeholder:text-[var(--color-sr-muted)]/70 focus:border-[var(--color-sr-navy)] disabled:cursor-not-allowed disabled:bg-[var(--color-sr-bg)] disabled:text-[var(--color-sr-muted)]';

function emptyPersonal(): JobApplicationPersonal {
  return {
    firstName: '',
    lastName: '',
    otherName: '',
    email: '',
    phone: '',
    country: '',
    linkedIn: '',
  };
}

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[12px] text-[var(--color-sr-muted)]">{hint}</p> : null}
    </div>
  );
}

function asJob(value: JobApplication['jobId'] | undefined | null): Job | null {
  return value && typeof value === 'object' ? (value as Job) : null;
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function JobApplicationWizard() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const seedJobId = searchParams.get('jobId') || '';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { confirm, dialog } = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState<JobApplicationPersonal>(emptyPersonal());
  const [coverLetter, setCoverLetter] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const bootstrapped = useRef(false);

  const {
    data: application,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['job-application', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get(`/job-applications/${id}`);
      return data.data.application as JobApplication;
    },
  });

  const { data: openJobs = [] } = useQuery({
    queryKey: ['jobs-picker'],
    enabled: !id && !seedJobId,
    queryFn: async () => {
      const { data } = await api.get('/jobs', {
        params: { limit: 40, open: 'true', sort: 'deadline' },
      });
      return (data.data.jobs || []) as Job[];
    },
  });

  useEffect(() => {
    if (!application) return;
    setPersonal({
      ...emptyPersonal(),
      ...application.personal,
      otherName: application.personal?.otherName || '',
      linkedIn: application.personal?.linkedIn || '',
    });
    setCoverLetter(application.coverLetter || '');
    setStep(Math.min(3, Math.max(1, application.currentStep || 1)));
  }, [application]);

  useEffect(() => {
    if (id || !seedJobId || bootstrapped.current) return;
    bootstrapped.current = true;
    const create = async () => {
      setCreating(true);
      try {
        const { data } = await api.post('/job-applications', { jobId: seedJobId });
        const created = data.data.application as JobApplication;
        queryClient.invalidateQueries({ queryKey: ['job-applications'] });
        navigate(`/dashboard/job-applications/${created._id}`, { replace: true });
      } catch (err) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not start application';
        toast.error(message);
        navigate('/jobs', { replace: true });
      } finally {
        setCreating(false);
      }
    };
    void create();
  }, [id, seedJobId, navigate, queryClient]);

  const job = useMemo(() => asJob(application?.jobId), [application]);
  const locked = Boolean(
    application &&
      ['submitted', 'under_review', 'accepted', 'rejected'].includes(application.status),
  );
  const readOnly = locked || application?.status === 'withdrawn';

  const startForJob = async (jobId: string) => {
    setCreating(true);
    try {
      const { data } = await api.post('/job-applications', { jobId });
      const created = data.data.application as JobApplication;
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      navigate(`/dashboard/job-applications/${created._id}`, { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not start application';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const save = async (nextStep?: number, silent = false) => {
    if (!id || readOnly) return false;
    setSaving(true);
    try {
      await api.patch(`/job-applications/${id}`, {
        personal,
        coverLetter,
        currentStep: nextStep ?? step,
      });
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      if (!silent) toast.success('Saved');
      return true;
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not save';
      toast.error(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const validateStep = (n: number) => {
    if (n === 1) {
      if (!personal.firstName.trim() || !personal.lastName.trim()) {
        toast.error('First and last name are required');
        return false;
      }
      if (!personal.email.trim() || !personal.phone.trim()) {
        toast.error('Email and phone are required');
        return false;
      }
      if (!personal.country.trim()) {
        toast.error('Country is required');
        return false;
      }
    }
    if (n === 2) {
      if (coverLetter.trim().length < 80) {
        toast.error('Cover letter must be at least 80 characters');
        return false;
      }
      if (!(application?.documents?.length || 0)) {
        toast.error('Upload at least one document (CV / resume)');
        return false;
      }
    }
    return true;
  };

  const goNext = async () => {
    if (!validateStep(step)) return;
    const next = Math.min(3, step + 1);
    const ok = await save(next, true);
    if (ok) setStep(next);
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const onUpload = async (files: FileList | null) => {
    if (!id || !files?.length || readOnly) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('documents', f));
      await api.post(`/job-applications/${id}/documents`, fd);
      await refetch();
      toast.success('Document uploaded');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not upload document';
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeDoc = async (index: number) => {
    if (!id || readOnly) return;
    try {
      await api.delete(`/job-applications/${id}/documents/${index}`);
      await refetch();
      toast.success('Document removed');
    } catch {
      toast.error('Could not remove document');
    }
  };

  const submit = async () => {
    if (!id || readOnly) return;
    if (!validateStep(1) || !validateStep(2)) {
      setStep(!validateStep(1) ? 1 : 2);
      return;
    }
    setSubmitting(true);
    try {
      await save(3, true);
      await api.post(`/job-applications/${id}/submit`);
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application submitted');
      await refetch();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not submit';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const withdraw = async () => {
    if (!id || !application) return;
    const ok = await confirm({
      title: 'Withdraw this application?',
      description: 'You will stop the review process for this role. You can start a new application later if the job is still open.',
      confirmLabel: 'Withdraw application',
      variant: 'danger',
    });
    if (ok === false) return;
    try {
      await api.post(`/job-applications/${id}/withdraw`);
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application withdrawn');
      await refetch();
    } catch {
      toast.error('Could not withdraw');
    }
  };

  if ((!id && seedJobId) || creating) {
    return (
      <div className="sr-container flex items-center justify-center gap-2 py-20 text-[14px] text-[var(--color-sr-muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Starting application…
      </div>
    );
  }

  if (!id && !seedJobId) {
    return (
      <>
        <Helmet>
          <title>Apply for a job | AfriRoar</title>
        </Helmet>
        <div className="min-h-[70vh] bg-[var(--color-sr-bg)] pb-12">
          <div className="border-b border-[var(--color-sr-border)] bg-white">
            <div className="sr-container py-7 md:py-9">
              <Link
                to="/dashboard/job-applications"
                className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-sr-muted)] hover:text-[var(--color-sr-navy)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Job applications
              </Link>
              <h1 className="text-[1.7rem] font-bold text-[var(--color-sr-navy-deeper)]">
                Choose a role
              </h1>
              <p className="mt-2 max-w-xl text-[15px] text-[var(--color-sr-muted)]">
                Select an open job to start a tracked application with your CV and cover letter.
              </p>
            </div>
          </div>
          <div className="sr-container mt-8 space-y-3">
            {openJobs.length === 0 ? (
              <div className="border border-[var(--color-sr-border)] bg-white px-6 py-12 text-center">
                <Briefcase className="mx-auto h-10 w-10 text-[var(--color-sr-muted)]" />
                <p className="mt-4 font-semibold text-[var(--color-sr-navy-deeper)]">
                  No open roles right now
                </p>
                <Link to="/jobs" className="mt-4 inline-flex text-[14px] font-semibold text-[var(--color-sr-navy)] underline">
                  Browse jobs
                </Link>
              </div>
            ) : (
              openJobs.map((j) => (
                <button
                  key={j._id}
                  type="button"
                  disabled={creating}
                  onClick={() => startForJob(j._id)}
                  className="flex w-full flex-col gap-1 border border-[var(--color-sr-border)] bg-white p-4 text-left transition hover:border-[var(--color-sr-navy)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-[var(--color-sr-navy-deeper)]">{j.title}</p>
                    <p className="mt-0.5 text-[13px] text-[var(--color-sr-muted)]">
                      {j.company} · {j.country} · Deadline {formatDeadline(j.deadline)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--color-sr-navy)]">
                    Apply
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="sr-container flex items-center justify-center gap-2 py-20 text-[14px] text-[var(--color-sr-muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading application…
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="sr-container py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold">Application not found</h1>
        <Link to="/dashboard/job-applications" className="sr-load-more">
          Back to job applications
        </Link>
      </div>
    );
  }

  return (
    <>
      {dialog}
      <Helmet>
        <title>
          {job ? `${job.title} application` : 'Job application'} | AfriRoar
        </title>
      </Helmet>

      <div className="min-h-[70vh] bg-[var(--color-sr-bg)] pb-12">
        <div className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container py-6 md:py-8">
            <Link
              to="/dashboard/job-applications"
              className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-sr-muted)] hover:text-[var(--color-sr-navy)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Job applications
            </Link>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
                  Job application · {application.status.replace(/_/g, ' ')}
                </p>
                <h1 className="mt-1 text-[1.5rem] font-bold text-[var(--color-sr-navy-deeper)] md:text-[1.75rem]">
                  {job?.title || 'Role'}
                </h1>
                <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                  {[
                    job?.company,
                    job?.country,
                    job ? getEmploymentTypeLabel(job.employmentType) : null,
                    job ? getWorkplaceTypeLabel(job.workplaceType) : null,
                    job?.deadline ? `Deadline ${formatDeadline(job.deadline)}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              {job?.slug ? (
                <Link
                  to={`/jobs/${job.slug}`}
                  className="text-[14px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  View listing
                </Link>
              ) : null}
            </div>

            {!readOnly ? (
              <ol className="mt-6 grid grid-cols-3 gap-2">
                {STEPS.map((s, i) => {
                  const n = i + 1;
                  const active = step === n;
                  const done = step > n;
                  return (
                    <li
                      key={s.title}
                      className={[
                        'border px-3 py-2',
                        active
                          ? 'border-[var(--color-sr-navy)] bg-[var(--color-sr-navy)] text-white'
                          : done
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] text-[var(--color-sr-muted)]',
                      ].join(' ')}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wider">
                        Step {n}
                      </p>
                      <p className="text-[13px] font-bold">{s.title}</p>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </div>
        </div>

        <div className="sr-container mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="border border-[var(--color-sr-border)] bg-white p-5 md:p-6">
            {step === 1 || readOnly ? (
              <div className={step === 1 || readOnly ? 'space-y-4' : 'hidden'}>
                {(step === 1 || readOnly) && (
                  <>
                    <h2 className="text-lg font-bold text-[var(--color-sr-navy)]">Personal details</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="firstName" label="First name" required>
                        <input
                          id="firstName"
                          className={inputClass}
                          value={personal.firstName}
                          disabled={readOnly}
                          onChange={(e) => setPersonal((p) => ({ ...p, firstName: e.target.value }))}
                        />
                      </Field>
                      <Field id="lastName" label="Last name" required>
                        <input
                          id="lastName"
                          className={inputClass}
                          value={personal.lastName}
                          disabled={readOnly}
                          onChange={(e) => setPersonal((p) => ({ ...p, lastName: e.target.value }))}
                        />
                      </Field>
                    </div>
                    <Field id="otherName" label="Other name">
                      <input
                        id="otherName"
                        className={inputClass}
                        value={personal.otherName || ''}
                        disabled={readOnly}
                        onChange={(e) => setPersonal((p) => ({ ...p, otherName: e.target.value }))}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="email" label="Email" required>
                        <input
                          id="email"
                          type="email"
                          className={inputClass}
                          value={personal.email}
                          disabled={readOnly}
                          onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))}
                        />
                      </Field>
                      <Field id="phone" label="Phone" required>
                        <input
                          id="phone"
                          className={inputClass}
                          value={personal.phone}
                          disabled={readOnly}
                          onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="country" label="Country" required>
                        <select
                          id="country"
                          className={inputClass}
                          value={personal.country}
                          disabled={readOnly}
                          onChange={(e) => setPersonal((p) => ({ ...p, country: e.target.value }))}
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field id="linkedIn" label="LinkedIn" hint="Optional profile URL">
                        <input
                          id="linkedIn"
                          type="url"
                          className={inputClass}
                          value={personal.linkedIn || ''}
                          disabled={readOnly}
                          onChange={(e) => setPersonal((p) => ({ ...p, linkedIn: e.target.value }))}
                          placeholder="https://"
                        />
                      </Field>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {step === 2 && !readOnly ? (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[var(--color-sr-navy)]">
                  Cover letter & documents
                </h2>
                <Field
                  id="coverLetter"
                  label="Cover letter"
                  required
                  hint={`${coverLetter.trim().length} characters · minimum 80`}
                >
                  <textarea
                    id="coverLetter"
                    rows={10}
                    className={inputClass}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Explain why you are a strong fit for this role…"
                  />
                </Field>

                <div>
                  <p className="mb-1.5 text-[13px] font-semibold text-[var(--color-sr-navy)]">
                    Documents <span className="text-red-600">*</span>
                  </p>
                  <p className="mb-3 text-[13px] text-[var(--color-sr-muted)]">
                    Upload your CV / resume (PDF preferred, max 10MB). Optional: portfolio or certificates.
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    multiple
                    className="hidden"
                    onChange={(e) => onUpload(e.target.files)}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] hover:border-[var(--color-sr-navy)]"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload files
                  </button>
                  <ul className="mt-4 divide-y divide-[var(--color-sr-border)] border border-[var(--color-sr-border)]">
                    {(application.documents || []).map((doc, index) => (
                      <li
                        key={`${doc.url}-${index}`}
                        className="flex items-center justify-between gap-3 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-[14px] font-semibold text-[var(--color-sr-link)] hover:underline"
                          >
                            {doc.name}
                          </a>
                          <p className="text-[12px] text-[var(--color-sr-muted)]">
                            {[doc.fileType, formatBytes(doc.fileSize)].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDoc(index)}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </li>
                    ))}
                    {(application.documents || []).length === 0 ? (
                      <li className="px-3 py-4 text-[13px] text-[var(--color-sr-muted)]">
                        No documents yet.
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>
            ) : null}

            {(step === 3 || readOnly) && step !== 1 ? (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-[var(--color-sr-navy)]">
                  {readOnly ? 'Submitted application' : 'Review & submit'}
                </h2>
                {readOnly && step === 1 ? null : (
                  <>
                    {readOnly ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-sr-muted)]">
                            Personal
                          </p>
                          <p className="mt-1 text-[14px]">
                            {[personal.firstName, personal.otherName, personal.lastName]
                              .filter(Boolean)
                              .join(' ')}
                          </p>
                          <p className="text-[13px] text-[var(--color-sr-muted)]">
                            {[personal.email, personal.phone, personal.country]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-sr-muted)]">
                            Cover letter
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed">
                            {coverLetter || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-sr-muted)]">
                            Documents
                          </p>
                          <ul className="space-y-1">
                            {(application.documents || []).map((doc, i) => (
                              <li key={`${doc.url}-${i}`}>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[14px] font-semibold text-[var(--color-sr-link)] hover:underline"
                                >
                                  {doc.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {application.feedback ? (
                          <div className="border border-amber-200 bg-amber-50 p-3 text-[14px]">
                            <p className="font-semibold text-amber-900">Feedback</p>
                            <p className="mt-1 text-amber-950">{application.feedback}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-3 text-[14px]">
                        <div className="border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] p-4">
                          <p className="font-semibold text-[var(--color-sr-navy)]">
                            {[personal.firstName, personal.otherName, personal.lastName]
                              .filter(Boolean)
                              .join(' ')}
                          </p>
                          <p className="mt-1 text-[var(--color-sr-muted)]">
                            {personal.email} · {personal.phone} · {personal.country}
                          </p>
                        </div>
                        <div className="border border-[var(--color-sr-border)] p-4">
                          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-sr-muted)]">
                            Cover letter
                          </p>
                          <p className="whitespace-pre-wrap leading-relaxed">{coverLetter}</p>
                        </div>
                        <div className="border border-[var(--color-sr-border)] p-4">
                          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-sr-muted)]">
                            Documents ({application.documents?.length || 0})
                          </p>
                          <ul className="space-y-1">
                            {(application.documents || []).map((doc, i) => (
                              <li key={`${doc.url}-${i}`} className="inline-flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-[var(--color-sr-muted)]" />
                                {doc.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-[13px] text-[var(--color-sr-muted)]">
                          Submitting locks this application. You can withdraw later if needed.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}

            {readOnly && step === 1 ? (
              <div className="mt-6 space-y-4 border-t border-[var(--color-sr-border)] pt-6">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-sr-muted)]">
                    Cover letter
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed">
                    {coverLetter || '-'}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-sr-muted)]">
                    Documents
                  </p>
                  <ul className="space-y-1">
                    {(application.documents || []).map((doc, i) => (
                      <li key={`${doc.url}-${i}`}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[14px] font-semibold text-[var(--color-sr-link)] hover:underline"
                        >
                          {doc.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {!readOnly ? (
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-[var(--color-sr-border)] pt-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-1.5 border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => save()}
                  className="inline-flex items-center gap-1.5 border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save draft
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={goNext}
                    className="inline-flex items-center gap-1.5 bg-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-white"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting || saving}
                    onClick={submit}
                    className="inline-flex items-center gap-1.5 bg-[var(--color-sr-yellow)] px-4 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)]"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Submit application
                  </button>
                )}
              </div>
            ) : ['submitted', 'under_review', 'draft'].includes(application.status) ? (
              <div className="mt-8 border-t border-[var(--color-sr-border)] pt-4">
                <button
                  type="button"
                  onClick={withdraw}
                  className="text-[14px] font-semibold text-red-700 underline-offset-2 hover:underline"
                >
                  Withdraw application
                </button>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[var(--color-sr-border)] bg-white p-4 text-[13px]">
              <p className="font-semibold text-[var(--color-sr-navy)]">Required to submit</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[var(--color-sr-muted)]">
                <li>Personal details (name, email, phone, country)</li>
                <li>Cover letter (minimum 80 characters)</li>
                <li>At least one document - CV / resume (PDF preferred)</li>
              </ul>
              <p className="mt-3 border-t border-[var(--color-sr-border)] pt-3 text-[var(--color-sr-muted)]">
                Save often - drafts stay editable until you submit.
              </p>
              {user?.email ? (
                <p className="mt-2 text-[var(--color-sr-muted)]">Signed in as {user.email}</p>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
