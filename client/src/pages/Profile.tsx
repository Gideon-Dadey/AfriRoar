import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const EDUCATION_OPTIONS = [
  { value: '', label: 'Select level' },
  { value: 'high-school', label: 'High School' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'postdoc', label: 'Postdoc' },
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
  'Pakistan', 'Peru', 'Philippines', 'Sri Lanka', 'Vietnam',
] as const;

type ProfileForm = {
  name: string;
  country: string;
  phone: string;
  bio: string;
  educationLevel: string;
  fieldOfStudy: string;
  institution: string;
  gpa: string;
  interests: string;
  languages: string;
};

const emptyForm = (): ProfileForm => ({
  name: '',
  country: '',
  phone: '',
  bio: '',
  educationLevel: '',
  fieldOfStudy: '',
  institution: '',
  gpa: '',
  interests: '',
  languages: '',
});

function formFromUser(user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']>): ProfileForm {
  return {
    name: user.name || '',
    country: user.profile?.country || '',
    phone: user.profile?.phone || '',
    bio: user.profile?.bio || '',
    educationLevel: user.profile?.educationLevel || '',
    fieldOfStudy: user.profile?.fieldOfStudy || '',
    institution: user.profile?.institution || '',
    gpa: user.profile?.gpa != null ? String(user.profile.gpa) : '',
    interests: (user.profile?.interests || []).join(', '),
    languages: (user.profile?.languages || []).join(', '),
  };
}

function Field({
  id,
  label,
  hint,
  children,
  className = '',
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
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

const inputClass =
  'w-full border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[15px] text-[var(--color-sr-text)] outline-none transition-colors placeholder:text-[var(--color-sr-muted)]/70 focus:border-[var(--color-sr-navy)]';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [baseline, setBaseline] = useState<ProfileForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const next = formFromUser(user);
    setForm(next);
    setBaseline(next);
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(baseline), [form, baseline]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const setField = useCallback(<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const checklist = useMemo(() => {
    if (!user) return [];
    return [
      { key: 'name', label: 'Full name', done: Boolean(form.name.trim()) },
      { key: 'country', label: 'Country', done: Boolean(form.country) },
      { key: 'education', label: 'Education level', done: Boolean(form.educationLevel) },
      { key: 'field', label: 'Field of study', done: Boolean(form.fieldOfStudy.trim()) },
      { key: 'institution', label: 'Institution', done: Boolean(form.institution.trim()) },
      { key: 'bio', label: 'Short bio', done: form.bio.trim().length >= 40 },
      { key: 'avatar', label: 'Profile photo', done: Boolean(user.profile?.avatar) },
      { key: 'languages', label: 'Languages', done: Boolean(form.languages.trim()) },
    ];
  }, [form, user]);

  const doneCount = checklist.filter((c) => c.done).length;
  const completion = Math.round((doneCount / checklist.length) * 100);
  const missing = checklist.filter((c) => !c.done);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty || saving) return;

    const name = form.name.trim();
    if (name.length < 2) {
      toast.error('Please enter your full name.');
      return;
    }

    const gpaNum = form.gpa.trim() ? Number(form.gpa) : undefined;
    if (gpaNum != null && (Number.isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4)) {
      toast.error('GPA must be between 0 and 4.0.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.patch('/auth/profile', {
        name,
        profile: {
          country: form.country,
          phone: form.phone.trim(),
          bio: form.bio.trim(),
          educationLevel: form.educationLevel,
          fieldOfStudy: form.fieldOfStudy.trim(),
          institution: form.institution.trim(),
          gpa: gpaNum,
          interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
          languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
        },
      });
      updateUser(data.data.user);
      const saved = formFromUser(data.data.user);
      setForm(saved);
      setBaseline(saved);
      toast.success('Profile saved.');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not save profile.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.');
      return;
    }

    const body = new FormData();
    body.append('avatar', file);
    setUploading(true);
    try {
      const { data } = await api.post('/auth/avatar', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ profile: { ...user.profile, avatar: data.data.avatar } });
      toast.success('Photo updated.');
    } catch {
      toast.error('Could not upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const discard = () => setForm(baseline);

  if (!user) return null;

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');

  return (
    <>
      <Helmet>
        <title>Profile | AfriRoar</title>
      </Helmet>

      <div className="min-h-[70vh] bg-[var(--color-sr-bg)] pb-28">
        <div className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container py-8 md:py-10">
            <Link
              to="/dashboard"
              className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-sr-muted)] transition-colors hover:text-[var(--color-sr-navy)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden bg-[var(--color-sr-navy)] text-white md:h-24 md:w-24">
                    {user.profile?.avatar ? (
                      <img
                        src={user.profile.avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold tracking-wide">{initials || '?'}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center border border-[var(--color-sr-border)] bg-white text-[var(--color-sr-navy)] shadow-sm transition hover:border-[var(--color-sr-navy)] hover:bg-[var(--color-sr-navy)] hover:text-white disabled:opacity-60"
                    aria-label="Upload profile photo"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                <div className="min-w-0 pt-1">
                  <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-sr-muted)]">
                    Student profile
                  </p>
                  <h1 className="truncate text-[1.75rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[2rem]">
                    {user.name}
                  </h1>
                  <p className="mt-1 flex items-center gap-2 text-[15px] text-[var(--color-sr-muted)]">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{user.email}</span>
                    {user.isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="w-full max-w-sm lg:pb-1">
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
                      Match readiness
                    </p>
                    <p className="text-[15px] text-[var(--color-sr-text)]">
                      {completion >= 100
                        ? 'Profile is ready for stronger matches'
                        : `${missing.length} detail${missing.length === 1 ? '' : 's'} still help matching`}
                    </p>
                  </div>
                  <p className="text-[1.5rem] font-bold tabular-nums text-[var(--color-sr-navy)]">{completion}%</p>
                </div>
                <div className="h-1.5 overflow-hidden bg-[var(--color-sr-border)]">
                  <div
                    className="h-full bg-[var(--color-sr-yellow)] transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sr-container mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
            <section className="border border-[var(--color-sr-border)] bg-white p-6 md:p-8">
              <header className="mb-6 border-b border-[var(--color-sr-border)] pb-4">
                <h2 className="text-[18px] font-bold text-[var(--color-sr-navy-deeper)]">Personal</h2>
                <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                  How you appear on applications and scholarship matches.
                </p>
              </header>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="profile-name" label="Full name" className="sm:col-span-2">
                  <input
                    id="profile-name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    className={inputClass}
                    required
                  />
                </Field>

                <Field id="profile-country" label="Country of residence">
                  <select
                    id="profile-country"
                    value={form.country}
                    onChange={(e) => setField('country', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id="profile-phone" label="Phone" hint="Optional. Used only for application follow-up.">
                  <input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    className={inputClass}
                    placeholder="+233 ..."
                  />
                </Field>

                <Field
                  id="profile-bio"
                  label="Bio"
                  hint="A short paragraph committees can skim, goals, focus, and why funding matters."
                  className="sm:col-span-2"
                >
                  <textarea
                    id="profile-bio"
                    value={form.bio}
                    onChange={(e) => setField('bio', e.target.value.slice(0, 500))}
                    rows={4}
                    maxLength={500}
                    className={`${inputClass} resize-y`}
                    placeholder="I am a final-year computer science student focused on climate tech applications…"
                  />
                  <p className="mt-1.5 text-right text-[12px] tabular-nums text-[var(--color-sr-muted)]">
                    {form.bio.length}/500
                  </p>
                </Field>
              </div>
            </section>

            <section className="border border-[var(--color-sr-border)] bg-white p-6 md:p-8">
              <header className="mb-6 border-b border-[var(--color-sr-border)] pb-4">
                <h2 className="text-[18px] font-bold text-[var(--color-sr-navy-deeper)]">Academic</h2>
                <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                  Drives eligibility filters for scholarships and internships.
                </p>
              </header>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="profile-education" label="Education level">
                  <select
                    id="profile-education"
                    value={form.educationLevel}
                    onChange={(e) => setField('educationLevel', e.target.value)}
                    className={inputClass}
                  >
                    {EDUCATION_OPTIONS.map((opt) => (
                      <option key={opt.value || 'empty'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id="profile-field" label="Field of study">
                  <input
                    id="profile-field"
                    type="text"
                    value={form.fieldOfStudy}
                    onChange={(e) => setField('fieldOfStudy', e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Public Health"
                  />
                </Field>

                <Field id="profile-institution" label="Institution">
                  <input
                    id="profile-institution"
                    type="text"
                    value={form.institution}
                    onChange={(e) => setField('institution', e.target.value)}
                    className={inputClass}
                    placeholder="Current or most recent school"
                  />
                </Field>

                <Field id="profile-gpa" label="GPA" hint="Optional. Use a 4.0 scale when possible.">
                  <input
                    id="profile-gpa"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    max="4"
                    value={form.gpa}
                    onChange={(e) => setField('gpa', e.target.value)}
                    className={inputClass}
                    placeholder="3.60"
                  />
                </Field>
              </div>
            </section>

            <section className="border border-[var(--color-sr-border)] bg-white p-6 md:p-8">
              <header className="mb-6 border-b border-[var(--color-sr-border)] pb-4">
                <h2 className="text-[18px] font-bold text-[var(--color-sr-navy-deeper)]">Preferences</h2>
                <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                  Helps AfriRoar surface relevant opportunities, not shown publicly.
                </p>
              </header>

              <div className="grid gap-5">
                <Field
                  id="profile-interests"
                  label="Interests"
                  hint="Comma-separated. Example: renewable energy, policy, data science"
                >
                  <input
                    id="profile-interests"
                    type="text"
                    value={form.interests}
                    onChange={(e) => setField('interests', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field
                  id="profile-languages"
                  label="Languages"
                  hint="Comma-separated. Example: English, French, Twi"
                >
                  <input
                    id="profile-languages"
                    type="text"
                    value={form.languages}
                    onChange={(e) => setField('languages', e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>
          </form>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[var(--color-sr-border)] bg-white p-5">
              <h2 className="text-[15px] font-bold text-[var(--color-sr-navy-deeper)]">Completion checklist</h2>
              <p className="mt-1 text-[13px] leading-snug text-[var(--color-sr-muted)]">
                Fill these to improve scholarship matching.
              </p>
              <ul className="mt-4 space-y-2.5">
                {checklist.map((item) => (
                  <li key={item.key} className="flex items-start gap-2.5 text-[13px]">
                    <span
                      className={[
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center',
                        item.done
                          ? 'bg-[var(--color-sr-navy)] text-white'
                          : 'border border-[var(--color-sr-border)] bg-white',
                      ].join(' ')}
                    >
                      {item.done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span className={item.done ? 'text-[var(--color-sr-muted)] line-through' : 'text-[var(--color-sr-text)]'}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-[var(--color-sr-border)] bg-[var(--color-sr-navy)] p-5 text-white">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-yellow)]">
                Tip
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/85">
                Accurate education level and country unlock the most relevant deadlines. Update them before each application cycle.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <div
        className={[
          'fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur-sm transition-transform duration-300',
          dirty ? 'translate-y-0 border-[var(--color-sr-border)]' : 'translate-y-full border-transparent',
        ].join(' ')}
        aria-hidden={!dirty}
      >
        <div className="sr-container flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="text-[14px] text-[var(--color-sr-muted)]">You have unsaved changes.</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={discard}
              disabled={saving}
              className="border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] transition hover:border-[var(--color-sr-navy)] disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 bg-[var(--color-sr-yellow)] px-5 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[#e0b400] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
