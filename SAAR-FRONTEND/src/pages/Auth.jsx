import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BookOpen, MapPin, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { useToast } from '../context/ToastContext';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { LoadingButton } from '../components/Loading';
import { ErrorMessage, FieldError } from '../components/ErrorComponents';
import ThemeToggle from '../components/ThemeToggle';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'verify-otp' | 'reset'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [resetEmail, setResetEmail] = useState(''); // Store email for OTP verification
  const [resetToken, setResetToken] = useState(''); // Store reset token after OTP verification
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (location.state?.mode === 'register') setMode('register');
    if (location.state?.mode === 'login') setMode('login');
    
    // Check for reset token in URL
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    if (token && location.pathname === '/auth') {
      setMode('reset');
    }
  }, [location.state?.mode, location.search, location.pathname]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const form = e.currentTarget;
    setLoading(true);
    
    try {
      if (mode === 'login') {
        const Email = form.elements['email']?.value?.trim();
        const Password = form.elements['password']?.value;
        await login(Email, Password);
        navigate(from, { replace: true });
      } else if (mode === 'register') {
        const Name = form.elements['name']?.value?.trim();
        const Email = form.elements['email']?.value?.trim();
        const Password = form.elements['password']?.value;
        const CollegeID = form.elements['collegeId']?.value?.trim();
        
        console.log('Registration data:', { Name, Email, Password: '***', CollegeID });
        
        await register({
          Name,
          Email,
          Password,
          CollegeID: CollegeID || undefined,
        });
        navigate(from, { replace: true });
      } else if (mode === 'forgot') {
        const Email = form.elements['email']?.value?.trim();
        const res = await apiFetch('/api/auth/forgot-password', {
          skipAuth: true,
          method: 'POST',
          body: JSON.stringify({ Email })
        });
        if (res.success) {
          setResetEmail(Email);
          setSuccess('OTP sent to your email. Please check your inbox.');
          setMode('verify-otp');
        } else {
          throw new Error(res.message || 'Failed to send OTP');
        }
      } else if (mode === 'verify-otp') {
        const OTP = form.elements['otp']?.value?.trim();
        const res = await apiFetch('/api/auth/verify-otp', {
          skipAuth: true,
          method: 'POST',
          body: JSON.stringify({ Email: resetEmail, OTP })
        });
        if (res.success) {
          setResetToken(res.resetToken);
          setSuccess('OTP verified! Please set your new password.');
          setMode('reset');
        } else {
          throw new Error(res.message || 'Invalid OTP');
        }
      } else if (mode === 'reset') {
        const Password = form.elements['password']?.value;
        const ConfirmPassword = form.elements['confirmPassword']?.value;
        
        if (Password !== ConfirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        const res = await apiFetch('/api/auth/reset-password', {
          skipAuth: true,
          method: 'POST',
          body: JSON.stringify({ token: resetToken, Password })
        });
        
        if (res.success) {
          setSuccess('Password reset successfully! You can now log in with your new password.');
          setTimeout(() => {
            setMode('login');
            setResetEmail('');
            setResetToken('');
          }, 2000);
        } else {
          throw new Error(res.message || 'Failed to reset password');
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex bg-parchment-50 min-h-[calc(100vh-4rem)]">
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <BookOpen className="h-10 w-10 text-accent-primary" />
            <span className="text-3xl font-bold tracking-tight">SAAR</span>
          </Link>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Join the smartest network of university students.
          </h1>
          <p className="text-xl text-indigo-200 mb-12 max-w-md">
            Unlock AI-powered study tools, exchange books locally, and access top-tier notes from your peers.
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-lg"><MapPin className="h-6 w-6 text-accent-primary" /></div>
              <div>
                <h3 className="font-semibold text-lg">Local Campus Hubs</h3>
                <p className="text-indigo-200">Connect with students at your university.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-lg"><BookOpen className="h-6 w-6 text-accent-primary" /></div>
              <div>
                <h3 className="font-semibold text-lg">Verified Resources</h3>
                <p className="text-indigo-200">High-quality, peer-shared study materials.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left mb-10">
            {(mode === 'forgot' || mode === 'verify-otp') && (
              <button
                onClick={() => { 
                  setMode('login'); 
                  setError(''); 
                  setSuccess(''); 
                  setResetEmail('');
                  setResetToken('');
                }}
                className="flex items-center gap-2 text-accent-primary hover:text-accent-hover mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to login
              </button>
            )}
            
            <h2 className="mt-6 text-3xl font-extrabold text-ink-900">
              {mode === 'login' ? 'Welcome back' : 
               mode === 'register' ? 'Create your account' :
               mode === 'forgot' ? 'Reset your password' :
               mode === 'verify-otp' ? 'Enter verification code' :
               'Set new password'}
            </h2>
            
            <p className="mt-2 text-sm text-ink-800">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                    className="font-medium text-accent-primary hover:text-accent-primary transition-colors"
                  >
                    Sign up for free
                  </button>
                </>
              ) : mode === 'register' ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="font-medium text-accent-primary hover:text-accent-primary transition-colors"
                  >
                    Log in here
                  </button>
                </>
              ) : mode === 'forgot' ? (
                'Enter your email address and we\'ll send you a verification code to reset your password.'
              ) : mode === 'verify-otp' ? (
                `We sent a 6-digit code to ${resetEmail}. Enter it below to continue.`
              ) : (
                'Enter your new password below.'
              )}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ink-800">Full Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-parchment-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label htmlFor="collegeId" className="block text-sm font-medium text-ink-800">College ID <span className="text-ink-800 font-normal">(optional)</span></label>
                <input
                  id="collegeId"
                  name="collegeId"
                  type="text"
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-parchment-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g. CS21B001"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink-800">Email address</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={mode === 'forgot' ? resetEmail : ''}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-parchment-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>
            )}
            
            {mode === 'verify-otp' && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-ink-800">Verification Code</label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    className="appearance-none block w-full px-3 py-3 border border-parchment-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                </div>
                <p className="mt-2 text-sm text-ink-600">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-accent-primary hover:text-accent-hover font-medium"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink-800">Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    minLength={6}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-parchment-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
            
            {mode === 'reset' && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-ink-800">New Password</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className="appearance-none block w-full pl-10 px-3 py-3 border border-parchment-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-800">Confirm New Password</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className="appearance-none block w-full pl-10 px-3 py-3 border border-parchment-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div></div>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                  className="text-sm text-accent-primary hover:text-accent-hover transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-60"
              >
                {loading ? 'Please wait…' : 
                 mode === 'login' ? 'Sign in' :
                 mode === 'register' ? 'Create account' :
                 mode === 'forgot' ? 'Send OTP' :
                 mode === 'verify-otp' ? 'Verify Code' :
                 'Reset password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
