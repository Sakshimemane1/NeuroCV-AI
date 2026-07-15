import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, User as UserIcon, Terminal, Briefcase, Zap } from 'lucide-react';
import { AuthResponse } from '../types';

interface AuthViewProps {
  onAuthSuccess: (data: AuthResponse) => void;
}

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Senior Backend Engineer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@neurocv.ai',
          password: 'password123'
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Demo login failed');
      }
      onAuthSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { email, password, name, title };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onAuthSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-brand-bg font-sans text-brand-text">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center shadow-sm shrink-0">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-2xl font-bold tracking-tight">NeuroCV AI</span>
          <span className="text-xs px-2 py-0.5 font-semibold bg-slate-100 text-slate-700 rounded-full border border-brand-border">
            Enterprise
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold text-slate-900 tracking-tight px-4">
          {isLogin ? 'Sign in to Career Intelligence' : 'Create an Enterprise Account'}
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500">
          Or{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-slate-900 hover:underline transition duration-150"
            id="toggle-auth-mode-btn"
          >
            {isLogin ? 'register a new account' : 'sign in to an existing account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 border border-brand-border rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-brand-pink-bg border border-brand-pink-border text-brand-pink-text p-3.5 rounded-lg text-xs flex items-start space-x-2.5" id="auth-error-banner">
                <Shield className="h-4.5 w-4.5 text-brand-pink-text shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative rounded-md shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 border border-brand-border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-800 focus:ring-0 text-xs transition-colors"
                      placeholder="Alex Mercer"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Role / Title
                  </label>
                  <div className="relative rounded-md shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 border border-brand-border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-800 focus:ring-0 text-xs transition-colors"
                      placeholder="Senior Backend Engineer"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-brand-border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-800 focus:ring-0 text-xs transition-colors"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-brand-border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-800 focus:ring-0 text-xs transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition duration-150 disabled:opacity-55 cursor-pointer shadow-sm"
                id="auth-submit-btn"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                <span className="px-2 bg-white text-slate-400">Quick Access</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-brand-border rounded-lg text-xs font-semibold text-slate-700 bg-[#FBFBF9] hover:bg-slate-50 transition duration-150 cursor-pointer"
                id="demo-login-btn"
              >
                <Terminal className="h-4 w-4 mr-2 text-slate-500" />
                Log In with Enterprise Demo Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
