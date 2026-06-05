import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { signIn } from '@/services/auth';
import { Boxes, Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const credential = await signIn(data.email, data.password);
      if (credential.user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Invalid password',
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been deactivated',
        'auth/too-many-requests': 'Too many attempts. Try again later',
      };
      setError(errorMessages[err.code] || 'Failed to sign in. Please try again.');
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
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
              <Boxes className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">StockFlow</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">Sign in to your account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 mb-6"
            >
              {error}
            </motion.div>
          )}

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

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="block w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 px-3 py-2.5 pr-10 text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-600 dark:text-surface-400">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}