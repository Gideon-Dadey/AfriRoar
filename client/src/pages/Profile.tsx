import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Save, Camera } from 'lucide-react';

const EDUCATION_LEVELS = ['', 'high-school', 'bachelors', 'masters', 'phd', 'postdoc'];
const COUNTRIES = ['Nigeria', 'Ghana', 'India', 'Kenya', 'Bangladesh', 'Pakistan', 'Colombia', 'Brazil', 'Philippines', 'Egypt', 'Ethiopia', 'South Africa', 'Tanzania', 'Vietnam', 'Indonesia', 'Nepal', 'Sri Lanka', 'Mexico', 'Peru', 'Morocco'];

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    country: user?.profile?.country || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || '',
    educationLevel: user?.profile?.educationLevel || '',
    fieldOfStudy: user?.profile?.fieldOfStudy || '',
    institution: user?.profile?.institution || '',
    gpa: user?.profile?.gpa?.toString() || '',
    interests: user?.profile?.interests?.join(', ') || '',
    languages: user?.profile?.languages?.join(', ') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.patch('/auth/profile', {
        name: form.name,
        profile: {
          country: form.country,
          phone: form.phone,
          bio: form.bio,
          educationLevel: form.educationLevel,
          fieldOfStudy: form.fieldOfStudy,
          institution: form.institution,
          gpa: form.gpa ? parseFloat(form.gpa) : undefined,
          interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
          languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        },
      });
      updateUser(data.data.user);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ profile: { ...user!.profile, avatar: data.data.avatar } });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      {/* Avatar */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center overflow-hidden">
              {user.profile?.avatar ? (
                <img src={user.profile.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{user.name.charAt(0)}</span>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="w-5 h-5 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge badge-primary text-xs">{user.role}</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Profile: {user.profileCompletionScore}% complete
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="glass-card p-6 space-y-5 mb-6">
          <h2 className="text-lg font-semibold">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" id="profile-name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Country</label>
              <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" id="profile-country">
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" id="profile-phone" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="input resize-none" maxLength={500} placeholder="Tell us about yourself..." id="profile-bio" />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{form.bio.length}/500</p>
          </div>
        </div>

        <div className="glass-card p-6 space-y-5 mb-6">
          <h2 className="text-lg font-semibold">Academic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Education Level</label>
              <select value={form.educationLevel} onChange={(e) => setForm({ ...form, educationLevel: e.target.value })} className="input" id="profile-education">
                <option value="">Select level</option>
                <option value="high-school">High School</option>
                <option value="bachelors">Bachelor's</option>
                <option value="masters">Master's</option>
                <option value="phd">PhD</option>
                <option value="postdoc">Postdoc</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Field of Study</label>
              <input type="text" value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} className="input" placeholder="e.g. Computer Science" id="profile-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Institution</label>
              <input type="text" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="input" placeholder="Your university or school" id="profile-institution" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">GPA (0-4.0)</label>
              <input type="number" step="0.1" min="0" max="4" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} className="input" id="profile-gpa" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Interests (comma-separated)</label>
            <input type="text" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className="input" placeholder="e.g. technology, engineering, sustainability" id="profile-interests" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Languages (comma-separated)</label>
            <input type="text" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="input" placeholder="e.g. English, French, Spanish" id="profile-languages" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}
