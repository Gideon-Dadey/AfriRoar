import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, getLevelLabel } from '@/lib/utils';
import type { ApiResponse, Application, Scholarship, User } from '@/types';
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatusBadge,
  btnGhost,
  tdClass,
  thClass,
  AdminTable,
} from './adminUi';

type DetailPayload = {
  application: Application;
  previousApplications: Application[];
};

function asUser(value: Application['userId']): User | null {
  return value && typeof value === 'object' ? (value as User) : null;
}

function asScholarship(value: Application['scholarshipId']): Scholarship | null {
  return value && typeof value === 'object' ? (value as Scholarship) : null;
}

function stepData(app: Application, stepNumber: number): Record<string, unknown> {
  return (app.steps?.find((s) => s.stepNumber === stepNumber)?.data || {}) as Record<
    string,
    unknown
  >;
}

function text(value: unknown): string {
  if (value == null || value === '') return '-';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(String).filter(Boolean).join(', ') || '-';
  return String(value);
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
      <dd className="break-words text-[13px] text-[var(--color-sr-text)] sm:max-w-[65%] sm:text-right">{value}</dd>
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

export default function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'applications', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<DetailPayload>>(`/admin/applications/${id}`);
      return res.data!;
    },
  });

  const application = data?.application;
  const student = application ? asUser(application.userId) : null;
  const scholarship = application ? asScholarship(application.scholarshipId) : null;
  const step1 = application ? stepData(application, 1) : {};
  const legacyPersonalOnStep1 = Boolean(step1.fullName || step1.phone);
  const programme = legacyPersonalOnStep1 ? {} : step1;
  const personal = legacyPersonalOnStep1
    ? step1
    : application
      ? stepData(application, 2)
      : {};
  const academic = application
    ? stepData(application, legacyPersonalOnStep1 ? 2 : 3)
    : {};
  const statements = application
    ? stepData(application, legacyPersonalOnStep1 ? 3 : 4)
    : {};
  const profile = student?.profile;

  const personalStatement =
    (application?.personalStatement || '').trim() ||
    String(statements.personalStatement || '').trim();
  const motivation =
    (application?.motivation || '').trim() || String(statements.motivation || '').trim();

  return (
    <>
      <Helmet>
        <title>Admin · Application | AfriRoar</title>
      </Helmet>

      <PageHeader
        title="Application detail"
        description="Full student submission, documents, and previous applications."
        actions={
          <Link to="/dashboard/admin/applications" className={btnGhost}>
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
                  Scholarship
                </p>
                <h2 className="mt-1 text-[1.15rem] font-bold text-[var(--color-sr-navy-deeper)]">
                  {scholarship?.title || 'Scholarship'}
                </h2>
                <p className="mt-1 text-[13px] text-[var(--color-sr-muted)]">
                  {[
                    scholarship?.country,
                    scholarship?.level ? getLevelLabel(scholarship.level) : null,
                    scholarship?.field,
                    scholarship?.deadline ? `Deadline ${formatDate(scholarship.deadline)}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={application.status} />
                <span className="text-[12px] text-[var(--color-sr-muted)]">
                  Submitted {application.submittedAt ? formatDate(application.submittedAt) : '—'}
                </span>
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Programme of study (applying for)">
              <dl>
                <Field
                  label="Degree level"
                  value={
                    getLevelLabel(text(programme.intendedLevel)) ||
                    text(programme.intendedLevel)
                  }
                />
                <Field label="Field of study" value={text(programme.intendedField)} />
                <Field label="Specialization" value={text(programme.specialization)} />
              </dl>
            </Section>

            <Section title="Student account">
              <dl>
                <Field label="Name" value={student?.name || text(personal.fullName)} />
                <Field label="Email" value={student?.email || '-'} />
                <Field label="Joined" value={student?.createdAt ? formatDate(student.createdAt) : '-'} />
                <Field label="Country (profile)" value={profile?.country || '-'} />
                <Field
                  label="Education (profile)"
                  value={
                    [getLevelLabel(profile?.educationLevel || ''), profile?.fieldOfStudy]
                      .filter(Boolean)
                      .join(' · ') || '-'
                  }
                />
                <Field label="Institution (profile)" value={profile?.institution || '-'} />
              </dl>
            </Section>

            <Section title="Submitted personal details">
              <dl>
                <Field label="Full name" value={text(personal.fullName) || student?.name || '-'} />
                <Field label="Nationality" value={text(personal.nationality)} />
                <Field label="Residence" value={text(personal.country)} />
                <Field label="Phone" value={text(personal.phone)} />
                <Field label="Date of birth" value={text(personal.dateOfBirth)} />
                <Field label="Address" value={text(personal.address)} />
              </dl>
            </Section>

            <Section title="Submitted academic background">
              <dl>
                <Field
                  label="Level completed"
                  value={getLevelLabel(text(academic.educationLevel)) || text(academic.educationLevel)}
                />
                <Field label="Major / subject studied" value={text(academic.fieldOfStudy)} />
                <Field label="Institution" value={text(academic.institution)} />
                <Field label="GPA" value={text(academic.gpa)} />
                <Field label="Graduation year" value={text(academic.graduationYear)} />
                <Field label="Languages" value={text(academic.languages)} />
              </dl>
            </Section>

            <Section title="Review meta">
              <dl>
                <Field label="Current step" value={String(application.currentStep || '-')} />
                <Field label="Last saved" value={formatDate(application.lastSavedAt)} />
                <Field label="Updated" value={formatDate(application.updatedAt)} />
                <Field label="Created" value={formatDate(application.createdAt)} />
                <Field label="Feedback" value={application.feedback?.trim() || '-'} />
              </dl>
            </Section>
          </div>

          <Section title="Personal statement">
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-sr-text)]">
              {personalStatement || '-'}
            </p>
          </Section>

          <Section title="Motivation">
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-sr-text)]">
              {motivation || '-'}
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
                        {[doc.fileType, formatBytes(doc.fileSize), doc.uploadedAt ? formatDate(doc.uploadedAt) : '']
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

          <Section title="Previous applications from this student">
            {(data?.previousApplications || []).length === 0 ? (
              <p className="text-[14px] text-[var(--color-sr-muted)]">
                No other applications on record for this student.
              </p>
            ) : (
              <AdminTable>
                <thead>
                  <tr>
                    <th className={thClass()}>Scholarship</th>
                    <th className={thClass()}>Status</th>
                    <th className={thClass()}>Submitted</th>
                    <th className={thClass()}>Updated</th>
                    <th className={thClass()}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.previousApplications.map((app) => {
                    const s = asScholarship(app.scholarshipId);
                    return (
                      <tr key={app._id}>
                        <td className={tdClass()}>
                          <span className="font-medium">{s?.title || 'Scholarship'}</span>
                        </td>
                        <td className={tdClass()}>
                          <StatusBadge status={app.status} />
                        </td>
                        <td className={tdClass()}>
                          {app.submittedAt ? formatDate(app.submittedAt) : '-'}
                        </td>
                        <td className={tdClass()}>{formatDate(app.updatedAt)}</td>
                        <td className={tdClass()}>
                          <Link
                            to={`/dashboard/admin/applications/${app._id}`}
                            className="text-[13px] font-semibold text-[var(--color-sr-link)] hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </AdminTable>
            )}
          </Section>
        </div>
      ) : null}
    </>
  );
}
