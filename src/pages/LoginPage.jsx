import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, Sparkles, GraduationCap, Shield, ArrowRight, Eye, EyeOff, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'maintenance'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithEmailPassword, registerStudent, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!isConfigured) {
      setError("Firebase is not configured. Please add your Firebase credentials to the .env file and restart the server.");
      return;
    }

    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setIsLoading(true);
    try {
      await loginWithEmailPassword(email.trim(), password);
      // Navigation handled by auth state in App.jsx
      if (activeTab === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/maintenance/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!isConfigured) {
      setError("Firebase is not configured. Please add your Firebase credentials to the .env file.");
      return;
    }

    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters long."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setIsLoading(true);
    try {
      await registerStudent(email.trim(), password, name.trim());
      navigate('/student/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setAuthMode('login');
    resetForm();
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl mb-4">
            <Wrench className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">FIXIT</h1>
            <span className="bg-violet-500/30 text-violet-300 text-xs font-bold px-2 py-0.5 rounded border border-violet-400/30">
              AI
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">AI-Powered Campus Maintenance Reporting & Resolution</p>
          <p className="text-[11px] text-violet-400 font-mono mt-0.5">"Report. Understand. Resolve."</p>
        </div>
      </div>

      {/* Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">

          {/* Firebase Not Configured Warning */}
          {!isConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-amber-900/40 border border-amber-600/60 text-amber-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-bold text-amber-300">Firebase not configured.</span>
                {" "}Copy <code className="text-amber-200 font-mono">.env.example</code> to <code className="text-amber-200 font-mono">.env</code> and add your Firebase credentials.
              </div>
            </div>
          )}

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1.5 rounded-2xl mb-6 border border-slate-700/50">
            <button
              onClick={() => switchTab('student')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>

            <button
              onClick={() => switchTab('maintenance')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'maintenance'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Maintenance Staff</span>
            </button>
          </div>

          {/* Auth Mode Toggle (students only) */}
          {activeTab === 'student' && (
            <div className="flex items-center gap-1 bg-slate-900/40 p-1 rounded-xl mb-5 border border-slate-700/40">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'login' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'register' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form (Students Only) */}
          {activeTab === 'student' && authMode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Campus Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@campus.edu"
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !isConfigured}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Student Account
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-500">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-violet-400 hover:text-violet-300 font-semibold">
                  Sign in
                </button>
              </p>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Campus Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'student' ? 'student@campus.edu' : 'staff@campus.edu'}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isConfigured}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === 'student'
                    ? 'bg-indigo-600 hover:bg-indigo-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Sign In to {activeTab === 'student' ? 'Student' : 'Staff'} Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {activeTab === 'student' && (
                <p className="text-center text-[11px] text-slate-500">
                  New student?{' '}
                  <button type="button" onClick={() => switchMode('register')} className="text-violet-400 hover:text-violet-300 font-semibold">
                    Create an account
                  </button>
                </p>
              )}

              {activeTab === 'maintenance' && (
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Maintenance staff accounts are created by your system administrator.
                </p>
              )}
            </form>
          )}

          {/* Info Footer */}
          <div className="mt-6 pt-4 border-t border-slate-700/60">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <Sparkles className="w-3 h-3 text-violet-500" />
              <span>AI-powered maintenance routing & tracking</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
