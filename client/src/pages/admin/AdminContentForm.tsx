import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ApiResponse, ContentItem } from '@/types';
import {
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  btnPrimary,
  btnSecondary,
  inputClass,
  selectClass,
} from './adminUi';

type FormState = {
  title: string;
  category: ContentItem['category'];
  excerpt: string;
  body: string;
  country: string;
  tags: string;
  status: ContentItem['status'];
};

const emptyForm = (): FormState => ({
  title: '',
  category: 'guide',
  excerpt: '',
  body: '',
  country: '',
  tags: '',
  status: 'draft',
});

function formFromItem(item: ContentItem): FormState {
  return {
    title: item.title || '',
    category: item.category || 'guide',
    excerpt: item.excerpt || '',
    body: item.body || '',
    country: item.country || '',
    tags: (item.tags || []).join(', '),
    status: item.status || 'draft',
  };
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

export default function AdminContentForm() {
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
    queryKey: ['admin', 'content', id],
    enabled: isEdit,
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<{ item: ContentItem }>>(
        `/admin/content/${id}`,
      );
      return res.data!.item;
    },
  });

  useEffect(() => {
    if (existing) setForm(formFromItem(existing));
  }, [existing]);

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.body.trim()) next.body = 'Body is required';
    if (!form.category) next.category = 'Category is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    category: form.category,
    excerpt: form.excerpt.trim() || undefined,
    body: form.body.trim(),
    country: form.country.trim() || undefined,
    tags: form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    status: form.status,
  });

  const uploadCover = async (contentId: string) => {
    if (!coverFile) return;
    const fd = new FormData();
    fd.append('cover', coverFile);
    await api.post(`/admin/content/${contentId}/cover`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (isEdit && id) {
        const { data: res } = await api.put<ApiResponse<{ item: ContentItem }>>(
          `/admin/content/${id}`,
          payload,
        );
        await uploadCover(id);
        return res.data!.item;
      }
      const { data: res } = await api.post<ApiResponse<{ item: ContentItem }>>(
        '/admin/content',
        payload,
      );
      const created = res.data!.item;
      await uploadCover(created._id);
      return created;
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Content updated' : 'Content created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
      navigate('/dashboard/admin/content');
    },
    onError: () => toast.error(isEdit ? 'Could not update content' : 'Could not create content'),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in required fields');
      return;
    }
    saveMutation.mutate();
  };

  if (isEdit && isLoading) return <LoadingBlock label="Loading content…" />;
  if (isEdit && isError) {
    return <ErrorBlock message="Could not load content." onRetry={() => refetch()} />;
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Admin · Edit content' : 'Admin · Add content'} | AfriRoar</title>
      </Helmet>

      <PageHeader
        title={isEdit ? 'Edit content' : 'Add content'}
        description="Publish guides, internships, lists, and job posts."
        actions={
          <Link to="/dashboard/admin/content" className={btnSecondary}>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="category" label="Category" required>
            <select
              id="category"
              className={selectClass}
              value={form.category}
              onChange={set('category')}
            >
              <option value="guide">Guide</option>
              <option value="internship">Internship</option>
              <option value="list">List</option>
              <option value="job">Job</option>
            </select>
          </Field>
          <Field id="status" label="Status">
            <select id="status" className={selectClass} value={form.status} onChange={set('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </div>

        <Field id="excerpt" label="Excerpt">
          <textarea
            id="excerpt"
            rows={3}
            className={inputClass}
            value={form.excerpt}
            onChange={set('excerpt')}
          />
        </Field>

        <Field id="body" label="Body" required>
          <textarea
            id="body"
            rows={12}
            className={inputClass}
            value={form.body}
            onChange={set('body')}
          />
          {errors.body ? <p className="mt-1 text-[12px] text-red-600">{errors.body}</p> : null}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="country" label="Country">
            <input
              id="country"
              className={inputClass}
              value={form.country}
              onChange={set('country')}
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
            {isEdit ? 'Save changes' : 'Create content'}
          </button>
          <Link to="/dashboard/admin/content" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
