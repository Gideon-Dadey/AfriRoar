import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ApiResponse, Scholarship } from '@/types';
import {
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  btnPrimary,
  btnSecondary,
  inputClass,
  selectClass,
} from './adminUi';

const LEVELS = [
  { value: 'high-school', label: 'High School' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'postdoc', label: 'Postdoc' },
  { value: 'any', label: 'Any level' },
] as const;

const FUNDING = [
  { value: 'full', label: 'Fully funded' },
  { value: 'partial', label: 'Partial' },
  { value: 'tuition', label: 'Tuition only' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'travel', label: 'Travel' },
  { value: 'research', label: 'Research' },
] as const;

type FormState = {
  title: string;
  description: string;
  shortDescription: string;
  country: string;
  level: string;
  field: string;
  eligibility: string;
  fundingType: string;
  amountValue: string;
  amountCurrency: string;
  deadline: string;
  applicationUrl: string;
  tags: string;
  status: string;
  isFeatured: boolean;
};

const emptyForm = (): FormState => ({
  title: '',
  description: '',
  shortDescription: '',
  country: '',
  level: 'bachelors',
  field: '',
  eligibility: '',
  fundingType: 'full',
  amountValue: '',
  amountCurrency: 'USD',
  deadline: '',
  applicationUrl: '',
  tags: '',
  status: 'approved',
  isFeatured: false,
});

function toDateInput(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function formFromScholarship(s: Scholarship): FormState {
  return {
    title: s.title || '',
    description: s.description || '',
    shortDescription: s.shortDescription || '',
    country: s.country || '',
    level: s.level || 'bachelors',
    field: s.field || '',
    eligibility: s.eligibility || '',
    fundingType: s.fundingType || 'full',
    amountValue: s.amount?.value != null ? String(s.amount.value) : '',
    amountCurrency: s.amount?.currency || 'USD',
    deadline: toDateInput(s.deadline),
    applicationUrl: s.applicationUrl || '',
    tags: (s.tags || []).join(', '),
    status: s.status || 'approved',
    isFeatured: Boolean(s.isFeatured),
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

export default function AdminScholarshipForm() {
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
    queryKey: ['scholarships', id],
    enabled: isEdit,
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<{ scholarship: Scholarship }>>(
        `/scholarships/${id}`,
      );
      return res.data!.scholarship;
    },
  });

  useEffect(() => {
    if (existing) setForm(formFromScholarship(existing));
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
    if (!form.description.trim()) next.description = 'Description is required';
    if (!form.country.trim()) next.country = 'Country is required';
    if (!form.field.trim()) next.field = 'Field is required';
    if (!form.deadline) next.deadline = 'Deadline is required';
    if (!form.level) next.level = 'Level is required';
    if (!form.fundingType) next.fundingType = 'Funding type is required';
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
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim() || undefined,
      country: form.country.trim(),
      level: form.level,
      field: form.field.trim(),
      eligibility: form.eligibility.trim() || undefined,
      fundingType: form.fundingType,
      deadline: new Date(form.deadline).toISOString(),
      applicationUrl: form.applicationUrl.trim() || undefined,
      tags,
      status: form.status || 'approved',
      isFeatured: form.isFeatured,
    };
    if (form.amountValue.trim()) {
      payload.amount = {
        value: Number(form.amountValue),
        currency: form.amountCurrency || 'USD',
      };
    }
    return payload;
  };

  const uploadCover = async (scholarshipId: string) => {
    if (!coverFile) return;
    const fd = new FormData();
    fd.append('cover', coverFile);
    await api.post(`/admin/scholarships/${scholarshipId}/cover`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (isEdit && id) {
        const { data: res } = await api.put<ApiResponse<{ scholarship: Scholarship }>>(
          `/admin/scholarships/${id}`,
          payload,
        );
        await uploadCover(id);
        return res.data!.scholarship;
      }
      const { data: res } = await api.post<ApiResponse<{ scholarship: Scholarship }>>(
        '/admin/scholarships',
        payload,
      );
      const created = res.data!.scholarship;
      await uploadCover(created._id);
      return created;
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Scholarship updated' : 'Scholarship created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'scholarships'] });
      navigate('/dashboard/admin/scholarships');
    },
    onError: () => toast.error(isEdit ? 'Could not update scholarship' : 'Could not create scholarship'),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in required fields');
      return;
    }
    saveMutation.mutate();
  };

  if (isEdit && isLoading) return <LoadingBlock label="Loading scholarship…" />;
  if (isEdit && isError) {
    return <ErrorBlock message="Could not load scholarship." onRetry={() => refetch()} />;
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Admin · Edit scholarship' : 'Admin · Add scholarship'} | AfriRoar</title>
      </Helmet>

      <PageHeader
        title={isEdit ? 'Edit scholarship' : 'Add scholarship'}
        description={
          isEdit
            ? 'Update listing details and cover image.'
            : 'New listings are published as approved by default.'
        }
        actions={
          <Link to="/dashboard/admin/scholarships" className={btnSecondary}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to list
          </Link>
        }
      />

      <form
        onSubmit={onSubmit}
        className="max-w-3xl space-y-4 border border-[var(--color-sr-border)] bg-white p-4 sm:p-5"
      >
        <Field id="title" label="Title" required>
          <input id="title" className={inputClass} value={form.title} onChange={set('title')} />
          {errors.title ? <p className="mt-1 text-[12px] text-red-600">{errors.title}</p> : null}
        </Field>

        <Field id="shortDescription" label="Short description">
          <input
            id="shortDescription"
            className={inputClass}
            value={form.shortDescription}
            onChange={set('shortDescription')}
            maxLength={300}
          />
        </Field>

        <Field id="description" label="Description" required>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="country" label="Country" required>
            <input
              id="country"
              className={inputClass}
              value={form.country}
              onChange={set('country')}
            />
            {errors.country ? <p className="mt-1 text-[12px] text-red-600">{errors.country}</p> : null}
          </Field>
          <Field id="field" label="Field of study" required>
            <input id="field" className={inputClass} value={form.field} onChange={set('field')} />
            {errors.field ? <p className="mt-1 text-[12px] text-red-600">{errors.field}</p> : null}
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="level" label="Level" required>
            <select id="level" className={selectClass} value={form.level} onChange={set('level')}>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="fundingType" label="Funding type" required>
            <select
              id="fundingType"
              className={selectClass}
              value={form.fundingType}
              onChange={set('fundingType')}
            >
              {FUNDING.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="amountValue" label="Amount value">
            <input
              id="amountValue"
              type="number"
              min="0"
              className={inputClass}
              value={form.amountValue}
              onChange={set('amountValue')}
            />
          </Field>
          <Field id="amountCurrency" label="Currency">
            <input
              id="amountCurrency"
              className={inputClass}
              value={form.amountCurrency}
              onChange={set('amountCurrency')}
            />
          </Field>
          <Field id="deadline" label="Deadline" required>
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
        </div>

        <Field id="eligibility" label="Eligibility">
          <textarea
            id="eligibility"
            rows={4}
            className={inputClass}
            value={form.eligibility}
            onChange={set('eligibility')}
          />
        </Field>

        <Field id="applicationUrl" label="Application URL">
          <input
            id="applicationUrl"
            type="url"
            className={inputClass}
            value={form.applicationUrl}
            onChange={set('applicationUrl')}
            placeholder="https://"
          />
        </Field>

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
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </Field>
          <div className="flex items-end pb-2">
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
            {isEdit ? 'Save changes' : 'Create scholarship'}
          </button>
          <Link to="/dashboard/admin/scholarships" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
