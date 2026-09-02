export interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  popular?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    subtitle: 'For individual learners',
    price: 49,
    period: 'per month',
    description: 'Perfect for beginners exploring Oracle SQL and PL/SQL fundamentals.',
    features: [
      'Access to 2 beginner courses',
      'Community forum access',
      'Basic SQL sandbox',
      'Email support',
      'Downloadable course materials',
      '14-day refund guarantee',
    ],
    cta: 'Start Learning',
  },
  {
    id: 'pro',
    name: 'Professional',
    subtitle: 'For serious developers',
    price: 99,
    period: 'per month',
    description: 'Full access to all courses, labs, and internship pathway eligibility.',
    features: [
      'Access to ALL courses',
      'Unlimited hands-on labs',
      'Live virtual sessions',
      'Internship pathway access',
      'Priority support',
      'Certificate of completion',
      'Career coaching sessions',
      '1-on-1 code reviews',
    ],
    highlighted: true,
    popular: true,
    cta: 'Get Full Access',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'For teams & organizations',
    price: 249,
    period: 'per user / month',
    description: 'Custom training for teams with dedicated support and analytics.',
    features: [
      'Everything in Professional',
      'Team progress dashboard',
      'Custom curriculum design',
      'Private instructor-led cohorts',
      'SSO and SAML integration',
      'API access for LMS integration',
      'Dedicated success manager',
      'Custom reporting & analytics',
      'SLA-backed support',
    ],
    cta: 'Contact Sales',
  },
];

export const pricingFaq = [
  {
    question: 'Can I switch plans?',
    answer: 'Yes, you can upgrade or downgrade at any time. Prorated adjustments are applied automatically.',
  },
  {
    question: 'Is there an annual discount?',
    answer: 'Yes, annual billing saves you 20% compared to monthly. Select annual billing at checkout.',
  },
  {
    question: 'What happens if I cancel?',
    answer: 'You retain access until the end of your billing period. After that, you keep lifetime access to any certificates earned.',
  },
];
