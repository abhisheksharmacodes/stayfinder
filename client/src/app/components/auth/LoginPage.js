'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Snackbar from '../../components/Snackbar';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ isVisible: false, message: '', type: 'error' });
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSnackbar({ isVisible: false, message: '', type: 'error' });

    // Simple client-side validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      setSnackbar({ isVisible: true, message: 'Please enter both email and password.', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://glen-21u1.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to home page
      router.push('/');
    } catch (error) {
      setError(error.message || 'An error occurred during login');
      setSnackbar({ isVisible: true, message: error.message || 'An error occurred during login', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isVisible={snackbar.isVisible}
        onClose={() => setSnackbar({ ...snackbar, isVisible: false })}
        duration={4000}
      />
      <div className="w-full max-w-md px-6 sm:px-8 py-6 sm:py-8 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-6">Login to StayFinder</h3>
        <form onSubmit={handleLogin}>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit"
              className={`w-full px-4 sm:px-6 py-2 sm:py-3 text-white bg-red-400 rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors text-sm sm:text-base font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <p className="text-center text-sm sm:text-base">
              Don&apos;t have an account? <a href="/register" className="text-red-400 hover:underline font-medium">Register here</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage; 