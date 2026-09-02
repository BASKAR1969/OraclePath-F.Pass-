import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, Database, Check, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-16 px-4">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md text-center"
        >
          <div className="bg-dark-card border border-dark-border rounded-xl p-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
            <p className="text-dark-muted text-sm mb-6">
              Your OraclePath account has been created successfully. Welcome to the community of Oracle SQL and PL/SQL experts.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Sign In Now
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-16 px-4">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-oracle-red/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-oracle-red/10 flex items-center justify-center mx-auto mb-4 border border-oracle-red/20">
            <Database className="w-7 h-7 text-oracle-red" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-dark-muted text-sm">Join OraclePath and start your Oracle journey</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" required className="w-4 h-4 rounded border-dark-border bg-dark-surface text-oracle-red focus:ring-oracle-red/50 mt-0.5" />
              <p className="text-sm text-dark-muted">
                I agree to the{' '}
                <a href="#" className="text-oracle-red hover:text-oracle-light transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-oracle-red hover:text-oracle-light transition-colors">Privacy Policy</a>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-border">
            <p className="text-center text-sm text-dark-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-oracle-red hover:text-oracle-light font-medium transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

