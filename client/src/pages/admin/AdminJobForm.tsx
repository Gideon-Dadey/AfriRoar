import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ApiResponse, Job } from '@/types';
import {
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  btnPrimary,
  btnSecondary,
  inputClass,
  selectClass,
} from './adminUi';

const EMPLOYMENT = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
] as const;

const WORKPLACE = [
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
] as const;

type FormState = {
  title: string;
  company: string;
  companyWebsite: string;
  shortDescription: string;
  description: string;
  requirements: string;
  responsibilities: string;
  country: string;
  location: string;
  employmentType: string;
  workplaceType: string;
  field: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryPeriod: string;
  deadline: string;
  applicationUrl: string;
  allowInternalApply: boolean;
  tags: string;
  status: string;
  isFeatured: boolean;
};

const emptyForm = (): FormState => ({
  title: '',
  company: '',
  companyWebsite: '',
  shortDescription: '',
  description: '',
  requirements: '',
  responsibilities: '',
  country: '',
  location: '',
  employmentType: 'full-time',
  workplaceType: 'onsite',
  field: '',
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'USD',
  salaryPeriod: '',
  deadline: '',
  applicationUrl: '',
  allowInternalApply: true,
  tags: '',
  status: 'published',
  isFeatured: false,
});

function toDateInput(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function formFromJob(job: Job): FormState {
  return {
    title: job.title || '',
    company: job.company || '',
    companyWebsite: job.companyWebsite || '',
    shortDescription: job.shortDescription || '',
    description: job.description || '',
    requirements: job.requirements || '',
    responsibilities: job.responsibilities || '',
    country: job.country || '',
    location: job.location || '',
    employmentType: job.employmentType || 'full-time',
    workplaceType: job.workplaceType || 'onsite',
    field: job.field || '',
    salaryMin: job.salary?.min != null ? String(job.salary.min) : '',
    salaryMax: job.salary?.max != null ? String(job.salary.max) : '',
    salaryCurrency: job.salary?.currency || 'USD',
    salaryPeriod: job.salary?.period || '',
    deadline: toDateInput(job.deadline),
    applicationUrl: job.applicationUrl || '',
    allowInternalApply: job.allowInternalApply !== false,
    tags: (job.tags || []).join(', '),
    status: job.status || 'published',
    isFeatured: Boolean(job.isFeatured),
  };
}

function Field({
  id,
  label,
  required,
  children,
  className = '',
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

export default function AdminJobForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    data: existing,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'jobs', id],
    enabled: isEdit,
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<{ job: Job }>>(`/admin/jobs/${id}`);
      return res.data!.job;
    },
  });

  useEffect(() => {
    if (existing) setForm(formFromJob(existing));
  }, [existing]);

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.company.trim()) next.company = 'Company is required';
    if (form.description.trim().length < 20) next.description = 'Description must be at least 20 characters';
    if (!form.country.trim()) next.country = 'Country is required';
    if (!form.deadline) next.deadline = 'Deadline is required';
    if (!form.employmentType) next.employmentType = 'Employment type is required';
    if (!form.workplaceType) next.workplaceType = 'Workplace type is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => {
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      company: form.company.trim(),
      companyWebsite: form.companyWebsite.trim() || '',
      shortDescription: form.shortDescription.trim() || undefined,
      description: form.description.trim(),
      requirements: form.requirements.trim() || undefined,
      responsibilities: form.responsibilities.trim() || undefined,
      country: form.country.trim(),
      location: form.location.trim() || undefined,
      employmentType: form.employmentType,
      workplaceType: form.workplaceType,
      field: form.field.trim() || undefined,
      deadline: new Date(form.deadline).toISOString(),
      applicationUrl: form.applicationUrl.trim() || '',
      allowInternalApply: form.allowInternalApply,
      tags,
      status: form.status || 'published',
      isFeatured: form.isFeatured,
    };
    if (form.salaryMin.trim() || form.salaryMax.trim()) {
      payload.salary = {
        min: form.salaryMin.trim() ? Number(form.salaryMin) : undefined,
        max: form.salaryMax.trim() ? Number(form.salaryMax) : undefined,
        currency: form.salaryCurrency || 'USD',
        period: form.salaryPeriod || '',
      };
    }
    return payload;
  };

  const uploadCover = async (jobId: string) => {
    if (!coverFile) return;
    const fd = new FormData();
    fd.append('cover', coverFile);
    await api.post(`/admin/jobs/${jobId}/cover`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (isEdit && id) {
        const { data: res } = await api.put<ApiResponse<{ job: Job }>>(`/admin/jobs/${id}`, payload);
        await uploadCover(id);
        return res.data!.job;
      }
      const { data: res } = await api.post<ApiResponse<{ job: Job }>>('/admin/jobs', payload);
      const created = res.data!.job;
      await uploadCover(created._id);
      return created;
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Job updated' : 'Job created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      navigate('/dashboard/admin/jobs');
    },
    onError: () => toast.error(isEdit ? 'Could not update job' : 'Could not create job'),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in required fields');
      return;
    }
    saveMutation.mutate();
  };

  if (isEdit && isLoading) return <LoadingBlock label="Loading job…" />;
  if (isEdit && isError) {
    return <ErrorBlock message="Could not load job." onRetry={() => refetch()} />;
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Admin · Edit job' : 'Admin · Add job'} | AfriRoar</title>
      </Helmet>

      <PageHeader
        title={isEdit ? 'Edit job' : 'Add job'}
        description={
          isEdit
            ? 'Update role details, deadlines, and application settings.'
            : 'New roles default to published so candidates can apply immediately.'
        }
        actions={
          <Link to="/dashboard/admin/jobs" className={btnSecondary}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to list
          </Link>
        }
      />

      <form
        onSubmit={onSubmit}
        className="max-w-3xl space-y-4 border border-[var(--color-sr-border)] bg-white p-4 sm:p-5"
      >
        <Field id="title" label="Job title" required>
          <input id="title" className={inputClass} value={form.title} onChange={set('title')} />
          {errors.title ? <p className="mt-1 text-[12px] text-red-600">{errors.title}</p> : null}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="company" label="Company" required>
            <input id="company" className={inputClass} value={form.company} onChange={set('company')} />
            {errors.company ? <p className="mt-1 text-[12px] text-red-600">{errors.company}</p> : null}
          </Field>
          <Field id="companyWebsite" label="Company website">
            <input
              id="companyWebsite"
              type="url"
              className={inputClass}
              value={form.companyWebsite}
              onChange={set('companyWebsite')}
              placeholder="https://"
            />
          </Field>
        </div>

        <Field id="shortDescription" label="Short description">
          <input
            id="shortDescription"
            className={inputClass}
            value={form.shortDescription}
            onChange={set('shortDescription')}
            maxLength={300}
          />
        </Field>

        <Field id="description" label="Full description" required>
          <textarea
            id="description"
            rows={8}
            className={inputClass}
            value={form.description}
            onChange={set('description')}
          />
          {errors.description ? (
            <p className="mt-1 text-[12px] text-red-600">{errors.description}</p>
          ) : null}
        </Field>

        <Field id="responsibilities" label="Responsibilities" className="">
          <textarea
            id="responsibilities"
            rows={5}
            className={inputClass}
            value={form.responsibilities}
            onChange={set('responsibilities')}
            placeholder="One item per line"
          />
        </Field>

        <Field id="requirements" label="Requirements">
          <textarea
            id="requirements"
            rows={5}
            className={inputClass}
            value={form.requirements}
            onChange={set('requirements')}
            placeholder="One item per line"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="country" label="Country" required>
            <input id="country" className={inputClass} value={form.country} onChange={set('country')} />
            {errors.country ? <p className="mt-1 text-[12px] text-red-600">{errors.country}</p> : null}
          </Field>
          <Field id="location" label="City / location">
            <input id="location" className={inputClass} value={form.location} onChange={set('location')} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="employmentType" label="Employment type" required>
            <select
              id="employmentType"
              className={selectClass}
              value={form.employmentType}
              onChange={set('employmentType')}
            >
              {EMPLOYMENT.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="workplaceType" label="Workplace" required>
            <select
              id="workplaceType"
              className={selectClass}
              value={form.workplaceType}
              onChange={set('workplaceType')}
            >
              {WORKPLACE.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="field" label="Field / function">
            <input id="field" className={inputClass} value={form.field} onChange={set('field')} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field id="salaryMin" label="Salary min">
            <input
              id="salaryMin"
              type="number"
              min="0"
              className={inputClass}
              value={form.salaryMin}
              onChange={set('salaryMin')}
            />
          </Field>
          <Field id="salaryMax" label="Salary max">
            <input
              id="salaryMax"
              type="number"
              min="0"
              className={inputClass}
              value={form.salaryMax}
              onChange={set('salaryMax')}
            />
          </Field>
          <Field id="salaryCurrency" label="Currency">
            <input
              id="salaryCurrency"
              className={inputClass}
              value={form.salaryCurrency}
              onChange={set('salaryCurrency')}
            />
          </Field>
          <Field id="salaryPeriod" label="Period">
            <select
              id="salaryPeriod"
              className={selectClass}
              value={form.salaryPeriod}
              onChange={set('salaryPeriod')}
            >
              <option value="">—</option>
              <option value="hour">Hour</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="deadline" label="Application deadline" required>
            <input
              id="deadline"
              type="date"
              className={inputClass}
              value={form.deadline}
              onChange={set('deadline')}
            />
            {errors.deadline ? (
              <p className="mt-1 text-[12px] text-red-600">{errors.deadline}</p>
            ) : null}
          </Field>
          <Field id="applicationUrl" label="External apply URL">
            <input
              id="applicationUrl"
              type="url"
              className={inputClass}
              value={form.applicationUrl}
              onChange={set('applicationUrl')}
              placeholder="https://"
            />
          </Field>
        </div>

        <Field id="tags" label="Tags">
          <input
            id="tags"
            className={inputClass}
            value={form.tags}
            onChange={set('tags')}
            placeholder="Comma-separated"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="status" label="Status">
            <select id="status" className={selectClass} value={form.status} onChange={set('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </Field>
          <div className="flex flex-col justify-end gap-3 pb-1">
            <label className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-sr-navy)]">
              <input
                type="checkbox"
                checked={form.allowInternalApply}
                onChange={set('allowInternalApply')}
                className="h-4 w-4 accent-[var(--color-sr-navy)]"
              />
              Allow apply on AfriRoar
            </label>
            <label className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-sr-navy)]">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={set('isFeatured')}
                className="h-4 w-4 accent-[var(--color-sr-navy)]"
              />
              Featured listing
            </label>
          </div>
        </div>

        <Field id="cover" label="Cover image">
          <input
            id="cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="block w-full text-[13px] text-[var(--color-sr-muted)] file:mr-3 file:border file:border-[var(--color-sr-border)] file:bg-[var(--color-sr-bg)] file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-[var(--color-sr-navy)]"
          />
          {existing?.coverImage && !coverFile ? (
            <img
              src={existing.coverImage}
              alt=""
              className="mt-2 h-28 w-auto max-w-full object-cover"
            />
          ) : null}
        </Field>

        <div className="flex flex-wrap gap-2 border-t border-[var(--color-sr-border)] pt-4">
          <button type="submit" className={btnPrimary} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isEdit ? 'Save changes' : 'Create job'}
          </button>
          <Link to="/dashboard/admin/jobs" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
