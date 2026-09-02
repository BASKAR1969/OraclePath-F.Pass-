import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, DollarSign, Briefcase, Users, ChevronDown, Check, ArrowRight, Globe, Building2 } from 'lucide-react';
import { internships, type Internship } from '../data/internships';

const typeFilters = ["All", "Remote", "Hybrid", "On-site"];

export default function Internships() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = internships.filter((intern) => {
    const matchesSearch =
      intern.title.toLowerCase().includes(search.toLowerCase()) ||
      intern.company.toLowerCase().includes(search.toLowerCase()) ||
      intern.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesType = selectedType === 'All' || intern.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Remote': return Globe;
      case 'Hybrid': return Briefcase;
      case 'On-site': return Building2;
      default: return Briefcase;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Internship <span className="gradient-text">Opportunities</span>
          </h1>
          <p className="text-dark-muted text-lg max-w-2xl mx-auto">
            Real-world experience at top companies. Our partner network connects you with
            internships that value Oracle SQL and PL/SQL expertise.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" />
            <input
              type="text"
              placeholder="Search internships, companies, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-card border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {typeFilters.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === type
                    ? 'bg-oracle-red text-white'
                    : 'bg-dark-card border border-dark-border text-dark-muted hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Banner */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {internships.filter(i => i.featured).slice(0, 2).map((intern, index) => (
            <motion.div
              key={intern.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-oracle-red/20 to-orange-500/10 border border-oracle-red/30 rounded-xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-oracle-red/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-md bg-oracle-red/20 text-oracle-red text-xs font-bold">
                    Featured
                  </span>
                  <span className="px-2 py-1 rounded-md bg-dark-bg/50 text-dark-muted text-xs">
                    {intern.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{intern.title}</h3>
                <p className="text-oracle-red font-medium mb-3">{intern.company}</p>
                <p className="text-dark-muted text-sm mb-4 line-clamp-2">{intern.description}</p>
                <div className="flex items-center gap-4 text-sm text-dark-muted mb-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    {intern.stipend}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {intern.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {intern.openings} openings
                  </div>
                </div>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-colors">
                  Apply Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* All Internships List */}
        <div className="space-y-4">
          {filtered.map((intern, index) => {
            const TypeIcon = getTypeIcon(intern.type);
            const isExpanded = expandedId === intern.id;

            return (
              <motion.div
                key={intern.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-oracle-red/20 transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                    {/* Company Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-oracle-red/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-oracle-red">
                        {intern.company.charAt(0)}
                      </span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{intern.title}</h3>
                        {intern.featured && (
                          <span className="px-2 py-0.5 rounded-md bg-oracle-red/10 text-oracle-red text-xs font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-oracle-red font-medium text-sm mb-2">{intern.company}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-dark-muted">
                        <span className="flex items-center gap-1">
                          <TypeIcon className="w-4 h-4" />
                          {intern.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {intern.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {intern.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          {intern.stipend}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm text-dark-muted">{intern.openings} openings</div>
                        <div className="text-xs text-dark-muted">Deadline: {intern.deadline}</div>
                      </div>
                      <Link to={`/internships/${intern.id}`} className="px-5 py-2.5 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-colors">
                        View & Apply
                      </Link>
                    </div>
                  </div>

                  {/* Expandable details */}
                  <div className="mt-4 pt-4 border-t border-dark-border">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : intern.id)}
                      className="flex items-center gap-1 text-sm text-oracle-red hover:text-oracle-light transition-colors"
                    >
                      {isExpanded ? 'Hide' : 'Show'} details
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 grid sm:grid-cols-2 gap-6"
                      >
                        <div>
                          <h4 className="text-white font-semibold mb-2 text-sm">Description</h4>
                          <p className="text-dark-muted text-sm leading-relaxed">{intern.description}</p>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-2 text-sm">Requirements</h4>
                          <div className="space-y-1.5">
                            {intern.requirements.map((req, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-dark-muted">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                {req}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <h4 className="text-white font-semibold mb-2 text-sm">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {intern.skills.map((skill) => (
                              <span key={skill} className="px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-sm text-dark-muted">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-dark-muted text-lg">No internships match your search criteria.</p>
            <button
              onClick={() => { setSearch(''); setSelectedType('All'); }}
              className="mt-4 text-oracle-red hover:text-oracle-light transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
