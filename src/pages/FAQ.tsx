import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, HelpCircle, ChevronDown, MessageCircle, ArrowRight } from 'lucide-react';
import { faqItems, faqCategories } from '../data/faq';

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = faqItems.filter((item) => {
    const matchesSearch = item.question.toLowerCase().includes(search.toLowerCase()) || item.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-dark-muted text-lg max-w-2xl mx-auto">
            Everything you need to know about OraclePath, our courses, internships, and the Oracle SQL & PL/SQL learning experience.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-dark-card border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors text-lg"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-10 justify-center">
          {['All', ...faqCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-oracle-red text-white'
                  : 'bg-dark-card border border-dark-border text-dark-muted hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-oracle-red/20 transition-all"
            >
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-oracle-red flex-shrink-0" />
                  <span className="text-white font-medium">{item.question}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-dark-muted transition-transform ${openId === item.id ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-5"
                  >
                    <div className="pl-8 border-l-2 border-oracle-red/30">
                      <p className="text-dark-muted leading-relaxed">{item.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <HelpCircle className="w-16 h-16 text-dark-muted mx-auto mb-4" />
            <p className="text-dark-muted text-lg">No questions match your search.</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="mt-4 text-oracle-red hover:text-oracle-light transition-colors">Clear search</button>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 text-center bg-dark-card border border-dark-border rounded-xl p-8">
          <MessageCircle className="w-12 h-12 text-oracle-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Still have questions?</h2>
          <p className="text-dark-muted mb-6">Our team is here to help. Get in touch and we'll respond within 2 hours.</p>
          <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors">
            Contact Support <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
