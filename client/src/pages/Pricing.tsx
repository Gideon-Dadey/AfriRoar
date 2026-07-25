import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, Zap, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      'Browse all approved scholarships',
      'Save up to 10 scholarships',
      '5 applications per month',
      'Basic search & filters',
      'Application tracking',
      'Email notifications',
    ],
    cta: 'Get Started Free',
    ctaLink: '/register',
    popular: false,
    icon: Zap,
  },
  {
    name: 'Premium Monthly',
    price: '$9.99',
    period: '/month',
    description: 'Unlock the full potential',
    features: [
      'Everything in Free',
      'Unlimited applications',
      'Advanced filters & search',
      'Early access to new scholarships',
      'AI-powered recommendations',
      'Priority support',
      'Application analytics',
      'Document templates',
    ],
    cta: 'Upgrade to Premium',
    ctaLink: '/register',
    popular: true,
    icon: Crown,
    planId: 'premium_monthly',
  },
  {
    name: 'Premium Yearly',
    price: '$79.99',
    period: '/year',
    description: 'Best value – Save 33%',
    features: [
      'Everything in Premium Monthly',
      '2 months free',
      'Exclusive scholarship alerts',
      'Personalized coaching tips',
      'Application review insights',
      'Priority matching algorithm',
    ],
    cta: 'Get Annual Plan',
    ctaLink: '/register',
    popular: false,
    icon: Sparkles,
    planId: 'premium_yearly',
    savings: 'Save $39.89/year',
  },
];

export default function Pricing() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-6">
          <Sparkles className="w-4 h-4 text-[var(--color-primary-light)]" />
          <span className="text-[var(--color-text-secondary)]">Simple, transparent pricing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Choose Your <span className="gradient-text">Plan</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg">
          Start free and upgrade when you need more. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`glass-card p-6 relative flex flex-col ${
              plan.popular ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-bg text-xs font-bold text-white">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <plan.icon className="w-5 h-5 text-[var(--color-primary-light)]" />
                <span className="text-sm font-semibold text-[var(--color-text-secondary)]">{plan.name}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-[var(--color-text-muted)]">{plan.period}</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-2">{plan.description}</p>
              {plan.savings && (
                <span className="inline-block mt-2 text-xs font-semibold text-[var(--color-success)] badge badge-success">{plan.savings}</span>
              )}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-[var(--color-success)] mt-0.5 shrink-0" />
                  <span className="text-[var(--color-text-secondary)]">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to={plan.ctaLink}
              className={`w-full text-center py-3 rounded-xl font-semibold transition-all ${
                plan.popular ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {plan.cta}
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-20">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.' },
            { q: 'Is there a free trial?', a: 'The Free plan gives you access to core features at no cost. Upgrade to Premium only when you need advanced features.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards through our secure Stripe payment processing.' },
            { q: 'Can I switch plans?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.' },
          ].map((faq) => (
            <div key={faq.q} className="glass-card p-5">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
