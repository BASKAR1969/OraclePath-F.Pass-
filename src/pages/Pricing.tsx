import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Check, ArrowRight, Sparkles, Zap, Shield, Building2, CreditCard, RefreshCw, HelpCircle
} from 'lucide-react';
import { pricingPlans, pricingFaq } from '../data/pricing';

export default function Pricing() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-oracle-red/10 border border-oracle-red/20 text-oracle-red text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" /> Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Invest in Your Oracle <span className="gradient-text">Future</span>
          </h1>
          <p className="text-dark-muted text-lg max-w-2xl mx-auto">
            Choose the plan that fits your learning goals. All plans include lifetime access, community support, and Oracle sandbox access. An Ervion Technologies company.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-xl p-6 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-oracle-red/20 to-dark-card border border-oracle-red/40'
                  : 'bg-dark-card border border-dark-border hover:border-oracle-red/30 transition-all'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-oracle-red text-white text-xs font-bold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-dark-muted text-sm">{plan.subtitle}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-dark-muted">{plan.period}</span>
                </div>
                <p className="text-dark-muted text-sm mt-2">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-muted text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to={plan.id === 'enterprise' ? '/contact' : '/register'}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-oracle-red text-white hover:bg-oracle-dark'
                    : 'border border-dark-border text-white hover:bg-white/5'
                }`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Pricing FAQ</h2>
          <div className="space-y-4">
            {pricingFaq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-dark-card border border-dark-border rounded-xl p-5"
              >
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-oracle-red" />
                  {item.question}
                </h3>
                <p className="text-dark-muted text-sm">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Shield, label: 'PCI Compliant', desc: 'Secure payments' },
            { icon: RefreshCw, label: '14-Day Refund', desc: 'No questions asked' },
            { icon: Building2, label: 'Enterprise Ready', desc: 'Custom contracts' },
            { icon: CreditCard, label: 'All Cards', desc: 'PayPal included' },
          ].map((badge) => (
            <div key={badge.label} className="bg-dark-card border border-dark-border rounded-xl p-5">
              <badge.icon className="w-8 h-8 text-oracle-red mx-auto mb-3" />
              <p className="text-white font-medium">{badge.label}</p>
              <p className="text-dark-muted text-sm">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
