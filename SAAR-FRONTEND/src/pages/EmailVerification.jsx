import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useToast } from '../context/ToastContext';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
    }
  }, [token]);

  async function verifyEmail(verificationToken) {
    try {
      setStatus('verifying');
      const res = await apiFetch('/api/auth/verify-email', {
        skipAuth: true,
        method: 'POST',
        body: JSON.stringify({ token: verificationToken })
      });

      if (res.success) {
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
        toast('Email verified successfully! Welcome to SAAR!', 'success');
        
        setTimeout(() => {
          navigate('/auth', { state: { mode: 'login' } });
        }, 3000);
      } else {
        throw new Error(res.message || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Verification failed. Please try again.');
    }
  }

  async function resendVerification() {
    if (!email) {
      toast('Please enter your email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/resend-verification', {
        skipAuth: true,
        method: 'POST',
        body: JSON.stringify({ Email: email })
      });

      if (res.success) {
        toast('Verification email sent! Please check your inbox.', 'success');
        setEmail('');
      } else {
        throw new Error(res.message || 'Failed to send verification email');
      }
    } catch (error) {
      toast(error.message || 'Failed to send verification email', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-parchment-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-accent-primary mb-8">
            <Mail className="h-8 w-8" />
            SAAR
          </Link>
        </div>

        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'verifying' && (
              <div className="space-y-4">
                <div className="animate-spin mx-auto h-12 w-12 text-accent-primary">
                  <RefreshCw className="h-12 w-12" />
                </div>
                <h2 className="text-xl font-bold text-ink-900">Verifying your email...</h2>
                <p className="text-ink-600">Please wait while we verify your email address.</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="text-xl font-bold text-ink-900">Email Verified!</h2>
                <p className="text-ink-600">{message}</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    🎉 Welcome to SAAR! You'll be redirected to login in a few seconds...
                  </p>
                </div>
                <Link 
                  to="/auth" 
                  state={{ mode: 'login' }}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover transition-colors"
                >
                  Continue to Login
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6">
                <XCircle className="mx-auto h-16 w-16 text-red-500" />
                <h2 className="text-xl font-bold text-ink-900">Verification Failed</h2>
                <p className="text-ink-600">{message}</p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm mb-4">
                    Don't worry! You can request a new verification email below.
                  </p>
                  
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-parchment-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-primary focus:border-accent-primary text-sm"
                    />
                    <button
                      onClick={resendVerification}
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary disabled:opacity-50 transition-colors"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      {loading ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                </div>

                <Link 
                  to="/auth" 
                  className="inline-flex items-center gap-2 text-accent-primary hover:text-accent-hover transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}