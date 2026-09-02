import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, Tag, ArrowRight, Filter, FileText, GraduationCap, Zap, TrendingUp, Code2 } from 'lucide-react';
import { resources, resourceCategories, type Resource } from '../data/resources';

export default function Resources() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  const filtered = resources.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.excerpt.toLowerCase().includes(search.toLowerCase()) || r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featured = resources.filter(r => r.featured);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Oracle <span className="gradient-text">Resources</span>
          </h1>
          <p className="text-dark-muted text-lg max-w-2xl mx-auto">
            Expert articles, tutorials, and insights from OraclePath instructors. Deep dives into SQL, PL/SQL, and Oracle database technologies.
          </p>
        </motion.div>

        {/* Featured articles */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {featured.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-oracle-red/20 to-orange-500/10 border border-oracle-red/30 rounded-xl p-6 relative overflow-hidden cursor-pointer hover:border-oracle-red/50 transition-all"
              onClick={() => setExpandedResource(expandedResource === article.id ? null : article.id)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-oracle-red/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <span className="px-2 py-1 rounded-md bg-oracle-red/20 text-oracle-red text-xs font-bold uppercase">Featured</span>
                <h3 className="text-xl font-bold text-white mt-3 mb-2">{article.title}</h3>
                <p className="text-dark-muted text-sm mb-4">{article.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-dark-muted">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{article.category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{article.readTime}</span>
                  <span className="text-oracle-red">{article.author}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" />
            <input
              type="text"
              placeholder="Search articles, tags, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-card border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', ...resourceCategories].map((cat) => (
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
        </div>

        {/* Articles grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-oracle-red/30 glow-card transition-all cursor-pointer"
              onClick={() => setExpandedResource(expandedResource === article.id ? null : article.id)}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded-md bg-dark-surface border border-dark-border text-xs text-dark-muted">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-dark-muted">
                  <Clock className="w-3 h-3" />{article.readTime}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 hover:text-oracle-red transition-colors">{article.title}</h3>
              <p className="text-dark-muted text-sm mb-4 line-clamp-2">{article.excerpt}</p>

              {expandedResource === article.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
                  <p className="text-dark-muted text-sm leading-relaxed">{article.content}</p>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-dark-surface text-xs text-dark-muted">
                      <Tag className="w-3 h-3 inline mr-1" />{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-dark-muted">{article.author}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-dark-muted mx-auto mb-4" />
            <p className="text-dark-muted text-lg">No articles match your criteria.</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="mt-4 text-oracle-red hover:text-oracle-light transition-colors">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
