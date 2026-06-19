import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, User, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, addNotification, theme, apiUrl } = useApp();
  
  // States: 'login' | 'register' | 'forgot' | 'verify'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
        login(response.data.access_token, response.data.user);
        onSuccess();
      } 
      else if (mode === 'register') {
        if (password !== confirmPassword) {
          addNotification("Input Error", "Passwords do not match", "warning");
          setLoading(false);
          return;
        }
        const response = await axios.post(`${apiUrl}/api/auth/register`, { fullname, email, password });
        // Automatically place them into email verification mode
        addNotification("Verification Sent", "A confirmation code has been dispatched to your email (simulated).", "success");
        setMode('verify');
        // Let's store temporary token in local state so when they verify they can be logged in
        localStorage.setItem('fpps_temp_token', response.data.access_token);
        localStorage.setItem('fpps_temp_user', JSON.stringify(response.data.user));
      } 
      else if (mode === 'forgot') {
        // Simulated forgot password
        addNotification("Recovery Link Dispatched", "If this email is registered, password recovery protocols have been sent.", "success");
        setMode('login');
      } 
      else if (mode === 'verify') {
        // Simulated verification code check
        if (verificationCode.trim().length !== 6) {
          addNotification("Invalid Format", "Please provide the 6-digit passcode.", "warning");
          setLoading(false);
          return;
        }
        
        const tempToken = localStorage.getItem('fpps_temp_token');
        const tempUserJson = localStorage.getItem('fpps_temp_user');
        
        if (tempToken && tempUserJson) {
          login(tempToken, JSON.parse(tempUserJson));
          localStorage.removeItem('fpps_temp_token');
          localStorage.removeItem('fpps_temp_user');
          onSuccess();
        } else {
          addNotification("Verification Success", "Account activated. Please sign in.", "success");
          setMode('login');
        }
      }
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || "An operational failure occurred. Please retry.";
      addNotification("Authentication Failure", errDetail, "alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-aviation-sky/10 rounded-full filter blur-3xl pointer-events-none animate-pulse-slow"></div>
      
      <div className={`
        relative w-full max-w-md p-8 rounded-3xl shadow-2xl border backdrop-blur-md transition-all
        ${theme === 'dark' 
          ? 'bg-aviation-navy/80 border-aviation-royal/20 text-white' 
          : 'bg-white/80 border-gray-200 text-gray-800'}
      `}>
        {/* Logo Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-aviation-sky to-aviation-cyan flex items-center justify-center text-aviation-navy font-black text-2xl shadow-[0_0_20px_rgba(0,180,216,0.5)]">
            F
          </div>
          <h2 className="text-xl font-extrabold mt-3">
            {mode === 'login' && "Sign In Session"}
            {mode === 'register' && "Create Account"}
            {mode === 'forgot' && "Access Recovery"}
            {mode === 'verify' && "Email Verification"}
          </h2>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-mono">
            {mode === 'login' && "Enter flight credentials"}
            {mode === 'register' && "Deploy analytics profile"}
            {mode === 'forgot' && "Reset security vectors"}
            {mode === 'verify' && "Telemetry code required"}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="John Doe"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl text-xs outline-none border transition-colors
                    ${theme === 'dark' 
                      ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                      : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                  `}
                  required
                />
              </div>
            </div>
          )}

          {mode !== 'verify' && (
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.com"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl text-xs outline-none border transition-colors
                    ${theme === 'dark' 
                      ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                      : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                  `}
                  required
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`
                    w-full pl-10 pr-10 py-3 rounded-xl text-xs outline-none border transition-colors
                    ${theme === 'dark' 
                      ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                      : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                  `}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl text-xs outline-none border transition-colors
                    ${theme === 'dark' 
                      ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                      : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                  `}
                  required
                />
              </div>
            </div>
          )}

          {mode === 'verify' && (
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Enter 6-Digit Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl text-center text-sm font-mono tracking-widest outline-none border transition-colors
                    ${theme === 'dark' 
                      ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                      : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                  `}
                  required
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                We sent a validation sequence. Enter any 6 digits to bypass in local simulation.
              </p>
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-[10px] text-aviation-sky hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-aviation-sky to-aviation-cyan text-aviation-navy font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-aviation-navy border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                {mode === 'login' && "Establish Session"}
                {mode === 'register' && "Initialize Account"}
                {mode === 'forgot' && "Confirm Recovery"}
                {mode === 'verify' && "Verify & Activate"}
              </>
            )}
          </button>
        </form>

        {/* Footer Switching modes */}
        <div className="mt-6 text-center text-xs text-gray-400 border-t border-aviation-royal/10 pt-4">
          {mode === 'login' ? (
            <p>
              New analyst?{" "}
              <button onClick={() => setMode('register')} className="text-aviation-sky hover:underline font-semibold">
                Register Hub Profile
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button onClick={() => setMode('login')} className="text-aviation-sky hover:underline font-semibold">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
