'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      console.log('Starting sign-in (admin/login):', email);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login request timed out. Please check your connection or reload the page.')), 8000)
      );

      const signInPromise = signIn('credentials', {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
        role: 'admin',
        callbackUrl: `/${locale}/admin/dashboard`
      });

      const result = await Promise.race([signInPromise, timeoutPromise]);
      console.log('Sign-in result (admin/login):', result?.ok ? 'Success' : 'Failure');

      if (result?.error || !result?.ok) {
        setError('Invalid credentials');
        setLoading(false);
      } else {
        router.push(`/${locale}/admin/dashboard`);
        // Safety reset
        setTimeout(() => setLoading(false), 5000);
      }
    } catch (err) {
      console.error('Login Exception (admin/login):', err);
      // Determine if error is literal timeout message or default string
      const errMsg = err.message || 'An error occurred. Please try again.';
      setError(errMsg.includes('timed out') ? errMsg : 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}