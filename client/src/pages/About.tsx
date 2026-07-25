import { GraduationCap, Globe, Shield, Users, Heart, Target, Award, Lightbulb } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          About <span className="gradient-text">AfriRoar</span>
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
          We believe every international student deserves access to quality education.
          AfriRoar connects students with life-changing scholarship opportunities worldwide,
          making the search and application process seamless and accessible.
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="glass-card p-8">
          <Target className="w-10 h-10 text-[var(--color-primary-light)] mb-4" />
          <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            To democratize access to international education by creating the most comprehensive,
            user-friendly scholarship platform. We aim to remove barriers and empower students
            from every background to pursue their academic dreams.
          </p>
        </div>
        <div className="glass-card p-8">
          <Lightbulb className="w-10 h-10 text-[var(--color-accent)] mb-4" />
          <h2 className="text-2xl font-bold mb-3">Our Vision</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            A world where financial constraints never prevent a talented student from accessing
            quality education. We envision a future where every deserving student can find and
            secure funding for their education journey.
          </p>
        </div>
      </div>

      {/* Values */}
      <h2 className="text-3xl font-bold text-center mb-10">Our Values</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { icon: Shield, title: 'Trust', desc: 'Every listing is verified. We maintain the highest standards of accuracy and transparency.' },
          { icon: Globe, title: 'Accessibility', desc: 'Free to use for all students. Premium features for those who want more.' },
          { icon: Heart, title: 'Empathy', desc: 'Built by international students, for international students. We understand the journey.' },
          { icon: Users, title: 'Community', desc: 'A growing network of scholars, providers, and institutions working together.' },
        ].map((value) => (
          <div key={value.title} className="glass-card p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl gradient-bg flex items-center justify-center mb-4">
              <value.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{value.title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{value.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="glass-card p-10 text-center">
        <h2 className="text-2xl font-bold mb-8">Impact in Numbers</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: '50,000+', label: 'Students Helped' },
            { value: '10,000+', label: 'Scholarships Listed' },
            { value: '120+', label: 'Countries Covered' },
            { value: '$25M+', label: 'Funding Connected' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
