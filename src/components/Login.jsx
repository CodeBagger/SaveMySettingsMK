import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError('Supabase is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Check if email confirmation is required
          if (data.user.email_confirmed_at || data.session) {
            // User is already confirmed or auto-confirmed, sign them in
            onLoginSuccess();
          } else {
            // Email confirmation required
            setMessage('Account created! Please check your email and click the confirmation link to verify your account. After verification, you can sign in.');
            setIsSignUp(false);
            setEmail(''); // Clear email so user can enter it again for sign in
            setPassword(''); // Clear password
          }
        } else {
          setMessage('Account creation initiated. Please check your email for confirmation instructions.');
          setIsSignUp(false);
        }
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // Provide more specific error messages based on error code/message
          const errorMsg = signInError.message || '';
          const errorCode = signInError.status || '';
          
          console.error('Sign in error:', signInError); // Debug logging
          
          if (errorMsg.includes('Invalid login credentials') || errorCode === 400) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else if (errorMsg.includes('Email not confirmed') || errorMsg.includes('email_not_confirmed')) {
            throw new Error('Please check your email and click the confirmation link to verify your account before signing in.');
          } else if (errorMsg.includes('User not found')) {
            throw new Error('No account found with this email. Please sign up first.');
          } else {
            // Show the actual error message for debugging
            throw new Error(`Sign in failed: ${errorMsg || 'Unknown error'}`);
          }
        }

        if (data.session) {
          onLoginSuccess();
        } else {
          throw new Error('Sign in failed. No session was created. Please try again.');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError('Supabase is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    if (!email) {
      setError('Please enter your email address first.');
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setMessage('Password reset email sent! Please check your inbox and follow the instructions.');
      setShowPasswordReset(false);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Save My Settings
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {isSignUp ? 'Create a new account' : 'Sign in to your account'}
        </p>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            <p>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {isSignUp && (
              <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
            )}
            {!isSignUp && !showPasswordReset && (
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="mt-1 text-xs text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            )}
          </div>

          {showPasswordReset ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter your email address and we'll send you a password reset link.
              </p>
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={loading || !email}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordReset(false);
                  setError(null);
                  setMessage(null);
                }}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

