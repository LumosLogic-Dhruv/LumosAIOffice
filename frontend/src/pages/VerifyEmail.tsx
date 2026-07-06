import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';

type State = 'loading' | 'success' | 'error';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('No verification token found. Please use the link from your email.');
      return;
    }
    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setState('success');
        setMessage(res.data.message || 'Email verified successfully!');
      })
      .catch((err) => {
        setState('error');
        setMessage(
          err.response?.data?.detail ||
          'Verification failed. The link may have expired.'
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center space-y-6">
        {state === 'loading' && (
          <>
            <Loader2 size={48} className="animate-spin mx-auto" style={{ color: '#714B67' }} />
            <h2 className="text-xl font-black text-gray-900">Verifying your email...</h2>
            <p className="text-gray-400 text-sm">Please wait a moment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle size={48} className="mx-auto" style={{ color: '#22c55e' }} />
            <h2 className="text-xl font-black text-gray-900">Email Verified!</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
            <Link
              to="/login"
              style={{ backgroundColor: '#714B67' }}
              className="inline-block w-full text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-md"
            >
              Sign In to DocuFlow AI
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle size={48} className="mx-auto text-red-500" />
            <h2 className="text-xl font-black text-gray-900">Verification Failed</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
            <div className="space-y-3">
              <Link
                to="/login"
                style={{ backgroundColor: '#714B67' }}
                className="inline-block w-full text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-md"
              >
                Back to Sign In
              </Link>
              <p className="text-gray-400 text-xs">
                Need a new link? Sign in and click "Resend verification email".
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
