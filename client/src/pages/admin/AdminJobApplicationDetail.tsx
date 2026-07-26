import type { ReactNode } from 'react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, getEmploymentTypeLabel, getWorkplaceTypeLabel } from '@/lib/utils';
import type { ApiResponse, Job, JobApplication, User } from '@/types';
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatusBadge,
  btnGhost,
  btnPrimary,
} from './adminUi';

function asUser(value: JobApplication['userId']): User | null {
  return value && typeof value === 'object' ? (value as User) : null;
}

function asJob(value: JobApplication['jobId']): Job | null {
  return value && typeof value === 'object' ? (value as Job) : null;
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--color-sr-border)] py-2 last:border-b-0 sm:flex-row sm:justify-between sm:gap-3">
      <dt className="shrink-0 text-[13px] text-[var(--color-sr-muted)]">{label}</dt>
      <dd className="break-words text-[13px] text-[var(--color-sr-text)] sm:max-w-[65%] sm:text-right">
        {value}
      </dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-[var(--color-sr-border)] bg-white p-4">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-sr-muted)]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function AdminJobApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState('');

  const { data: application, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'job-applications', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<{ application: JobApplication }>>(
        `/admin/job-applications/${id}`,
      );
      return res.data!.application;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: 'under_review' | 'accepted' | 'rejected') => {
      const { data: res } = await api.patch(`/admin/job-applications/${id}/status`, {
        status,
        feedback: feedback.trim() || undefined,
      });
      return res.data.application as JobApplication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'job-applications', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'job-applications'] });
      toast.success('Application status updated');
      setFeedback('');
    },
    onError: () => toast.error('Could not update status'),
  });

  const student = application ? asUser(application.userId) : null;
  const job = application ? asJob(application.jobId) : null;
  const personal = application?.personal;

  return (
    <>
      <Helmet>
        <title>Admin · Job application | AfriRoar</title>
      </Helmet>

      <PageHeader
        title="Job application detail"
        description="Candidate packet, documents, and hiring actions."
        actions={
          <Link to="/dashboard/admin/job-applications" className={btnGhost}>
            Back to list
          </Link>
        }
      />

      {isLoading ? <LoadingBlock /> : null}
      {isError ? (
        <ErrorBlock message="Could not load this application." onRetry={() => refetch()} />
      ) : null}

      {!isLoading && !isError && !application ? (
        <EmptyState title="Application not found" description="It may have been removed." />
      ) : null}

      {application ? (
        <div className="space-y-4">
          <section className="border border-[var(--color-sr-border)] bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                  Role
                </p>
                <h2 className="mt-1 text-[1.15rem] font-bold text-[var(--color-sr-navy-deeper)]">
                  {job?.title || 'Job'}
                </h2>
                <p className="mt-1 text-[13px] text-[var(--color-sr-muted)]">
                  {[
                    job?.company,
                    job?.country,
                    job?.employmentType ? getEmploymentTypeLabel(job.employmentType) : null,
                    job?.workplaceType ? getWorkplaceTypeLabel(job.workplaceType) : null,
                    job?.deadline ? `Deadline ${formatDate(job.deadline)}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '-'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={application.status} />
                {job?.slug ? (
                  <Link
                    to={`/jobs/${job.slug}`}
                    className="text-[13px] font-semibold text-[var(--color-sr-link)] hover:underline"
                  >
                    View listing
                  </Link>
                ) : null}
                {job?._id ? (
                  <Link
                    to={`/dashboard/admin/jobs/${job._id}/edit`}
                    className="text-[13px] font-semibold text-[var(--color-sr-link)] hover:underline"
                  >
                    Edit job
                  </Link>
                ) : null}
              </div>
            </div>

            {['submitted', 'under_review', 'accepted', 'rejected', 'draft'].includes(
              application.status,
            ) ? (
              <div className="mt-4 border-t border-[var(--color-sr-border)] pt-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                  Update status
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Optional feedback to the candidate…"
                  rows={2}
                  className="mt-2 w-full border border-[var(--color-sr-border)] px-3 py-2 text-[16px] outline-none focus:border-[var(--color-sr-navy)]"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {(
                    [
                      ['under_review', 'Mark under review'],
                      ['accepted', 'Accept'],
                      ['rejected', 'Reject'],
                    ] as const
                  ).map(([status, label]) => (
                    <button
                      key={status}
                      type="button"
                      disabled={statusMutation.isPending || application.status === status}
                      onClick={() => statusMutation.mutate(status)}
                      className={status === 'accepted' ? btnPrimary : btnGhost}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Candidate account">
              <dl>
                <Field label="Name" value={student?.name || '-'} />
                <Field label="Email" value={student?.email || '-'} />
                <Field
                  label="Joined"
                  value={student?.createdAt ? formatDate(student.createdAt) : '-'}
                />
              </dl>
            </Section>

            <Section title="Submitted personal details">
              <dl>
                <Field label="First name" value={personal?.firstName || '-'} />
                <Field label="Last name" value={personal?.lastName || '-'} />
                <Field label="Other name" value={personal?.otherName || '-'} />
                <Field label="Email" value={personal?.email || '-'} />
                <Field label="Phone" value={personal?.phone || '-'} />
                <Field label="Country" value={personal?.country || '-'} />
                <Field label="LinkedIn" value={personal?.linkedIn || '-'} />
              </dl>
            </Section>

            <Section title="Review meta">
              <dl>
                <Field label="Current step" value={String(application.currentStep || '-')} />
                <Field label="Last saved" value={formatDate(application.lastSavedAt)} />
                <Field label="Updated" value={formatDate(application.updatedAt)} />
                <Field label="Created" value={formatDate(application.createdAt)} />
                <Field
                  label="Submitted"
                  value={application.submittedAt ? formatDate(application.submittedAt) : '-'}
                />
                <Field label="Feedback" value={application.feedback?.trim() || '-'} />
              </dl>
            </Section>
          </div>

          <Section title="Cover letter">
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-sr-text)]">
              {application.coverLetter?.trim() || '-'}
            </p>
          </Section>

          <Section title="Documents">
            {(application.documents || []).length === 0 ? (
              <p className="text-[14px] text-[var(--color-sr-muted)]">No documents attached.</p>
            ) : (
              <ul className="divide-y divide-[var(--color-sr-border)] border border-[var(--color-sr-border)]">
                {application.documents.map((doc, index) => (
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
                      <p className="mt-0.5 text-[12px] text-[var(--color-sr-muted)]">
                        {[
                          doc.fileType,
                          formatBytes(doc.fileSize),
                          doc.uploadedAt ? formatDate(doc.uploadedAt) : '',
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`${btnGhost} shrink-0`}
                    >
                      Open
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      ) : null}
    </>
  );
}
