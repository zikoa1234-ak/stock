import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { resetPassword } from '@/services/auth';
import { Boxes, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await resetPassword(data.email);
      setSent(true);
    } catch (err: any) {
      setError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-700 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
              <Boxes className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Reset Password</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              {sent ? 'Check your email for reset instructions' : 'Enter your email to receive reset instructions'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 mb-6">
              {error}
            </div>
          )}

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-surface-600 dark:text-surface-400 mb-6">
                We've sent password reset instructions to your email.
              </p>
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="block w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 px-3 py-2.5 text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Send Reset Instructions
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}