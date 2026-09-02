import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authService.resetPasswordForEmail(email);

    setLoading(false);
    if (result.error) {
      setError(result.error.message || 'Failed to send reset email. Please try again.');
    } else {
      setSuccess(true);
    }
  };

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
            <Lock className="w-7 h-7 text-oracle-red" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-dark-muted text-sm">Enter your email and we'll send you a reset link</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-dark-muted text-sm mb-6">
                We've sent a password reset link to <strong className="text-white">{email}</strong>. 
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <p className="text-dark-muted text-xs mb-6">
                Did not receive it? Check your spam folder or{' '}
                <button onClick={() => setSuccess(false)} className="text-oracle-red hover:text-oracle-light transition-colors">
                  try again
                </button>.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors w-full"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </motion.div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-dark-border">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-dark-muted hover:text-oracle-red transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Remember your password? Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
