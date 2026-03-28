import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BookOpen, MapPin, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (location.state?.mode === 'register') setIsLogin(false);
    if (location.state?.mode === 'login') setIsLogin(true);
  }, [location.state?.mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    // Use currentTarget so we always read the <form>, not the submit button (e.target).
    const form = e.currentTarget;
    const Email = form.elements['email']?.value?.trim();
    const Password = form.elements['password']?.value;
    setLoading(true);
    try {
      if (isLogin) {
        await login(Email, Password);
      } else {
        const Name = form.elements['name']?.value?.trim();
        const CollegeID = form.elements['collegeId']?.value?.trim();
        await register({
          Name,
          Email,
          Password,
          CollegeID: CollegeID || undefined,
        });
      }
      navigate(from, { replace: true });
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
            <h2 className="mt-6 text-3xl font-extrabold text-ink-900">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-ink-800">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="font-medium text-accent-primary hover:text-accent-primary transition-colors"
              >
                {isLogin ? 'Sign up for free' : 'Log in here'}
              </button>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
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
                    required={!isLogin}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-parchment-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
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
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-parchment-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

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
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-parchment-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-60"
              >
                {loading ? 'Please wait…' : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
