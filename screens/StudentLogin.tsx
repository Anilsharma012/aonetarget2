import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface StudentLoginProps {
  setAuth: (auth: boolean) => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ setAuth }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    class: '11th',
    target: '',
    referralCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [otpStep, setOtpStep] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpPhone, setOtpPhone] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fallbackCategories = [
    { id: 'neet', title: 'NEET', isActive: true },
    { id: 'iit-jee', title: 'IIT-JEE', isActive: true },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          const active = (Array.isArray(data) ? data : []).filter((c: any) => c.isActive);
          if (active.length > 0) {
            setCategories(active);
            if (!formData.target) {
              setFormData(prev => ({ ...prev, target: active[0].title }));
            }
          } else {
            setCategories(fallbackCategories);
            setFormData(prev => ({ ...prev, target: 'NEET' }));
          }
        } else {
          setCategories(fallbackCategories);
          setFormData(prev => ({ ...prev, target: 'NEET' }));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories(fallbackCategories);
        setFormData(prev => ({ ...prev, target: 'NEET' }));
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpValues];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtpValues(newOtp);
      const nextIdx = Math.min(index + digits.length, 5);
      otpRefs.current[nextIdx]?.focus();
      return;
    }

    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await fetch('/api/students/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phone: formData.phone, 
            password: formData.password 
          })
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }
        
        if (data.otpSent) {
          setOtpPhone(formData.phone);
          setOtpStep(true);
          setOtpValues(['', '', '', '', '', '']);
          setOtpTimer(300);
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } else {
          localStorage.setItem('studentData', JSON.stringify(data.student));
          localStorage.setItem('isStudentAuthenticated', 'true');
          setAuth(true);
          navigate('/profile');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        const response = await fetch('/api/students/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            class: formData.class,
            target: formData.target
          })
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        if (formData.referralCode.trim()) {
          try {
            await fetch('/api/referrals/apply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referralCode: formData.referralCode.trim().toUpperCase(),
                newStudentId: data.student.id
              })
            });
          } catch (refErr) {
            console.error('Referral apply failed:', refErr);
          }
        }
        
        localStorage.setItem('studentData', JSON.stringify(data.student));
        localStorage.setItem('isStudentAuthenticated', 'true');
        setAuth(true);
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/students/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone, otp })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      localStorage.setItem('studentData', JSON.stringify(data.student));
      localStorage.setItem('isStudentAuthenticated', 'true');
      setAuth(true);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setError('');

    try {
      const response = await fetch('/api/students/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setOtpValues(['', '', '', '', '', '']);
      setOtpTimer(300);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (otpStep) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brandBlue to-[#1A237E] flex flex-col">
        <header className="pt-8 pb-6 px-4 text-center">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-4">
            <span className="text-3xl font-black text-brandBlue">AT</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Verify OTP</h1>
          <p className="text-blue-200 text-sm mt-1">
            OTP sent to {otpPhone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2')}
          </p>
        </header>

        <main className="flex-1 bg-white rounded-t-[2rem] px-6 pt-8 pb-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-3xl text-green-600">sms</span>
            </div>
            <p className="text-gray-600 text-sm">Enter the 6-digit OTP sent to your phone</p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {otpValues.map((val, i) => (
              <input
                key={i}
                ref={el => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={val}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brandBlue transition-colors"
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleVerifyOtp}
            disabled={verifying || otpValues.join('').length !== 6}
            className="w-full bg-brandBlue text-white py-4 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
          >
            {verifying ? (
              <span className="material-symbols-rounded animate-spin">progress_activity</span>
            ) : (
              <>
                Verify OTP
                <span className="material-symbols-rounded">verified</span>
              </>
            )}
          </button>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              {otpTimer > 0 ? (
                <>OTP expires in <span className="font-bold text-brandBlue">{formatTimer(otpTimer)}</span></>
              ) : (
                <span className="text-red-500 font-medium">OTP expired</span>
              )}
            </p>
            <button
              onClick={handleResendOtp}
              disabled={otpTimer > 0}
              className={`text-sm font-bold ${otpTimer > 0 ? 'text-gray-300' : 'text-brandBlue'}`}
            >
              Resend OTP
            </button>
            <br />
            <button
              onClick={() => { setOtpStep(false); setError(''); setOtpValues(['', '', '', '', '', '']); }}
              className="text-sm text-gray-500 underline"
            >
              Back to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brandBlue to-[#1A237E] flex flex-col">
      <header className="pt-8 pb-6 px-4 text-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-4">
          <span className="text-3xl font-black text-brandBlue">AT</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Aone Target</h1>
        <p className="text-blue-200 text-sm mt-1">NEET & IIT-JEE Preparation</p>
      </header>

      <main className="flex-1 bg-white rounded-t-[2rem] px-6 pt-8 pb-6">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              isLogin ? 'bg-white text-brandBlue shadow-sm' : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              !isLogin ? 'bg-white text-brandBlue shadow-sm' : 'text-gray-500'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brandBlue"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brandBlue"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brandBlue"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brandBlue"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brandBlue"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                    Class
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brandBlue"
                  >
                    <option value="9th">9th</option>
                    <option value="10th">10th</option>
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                    <option value="Dropper">Dropper</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                    Target Exam
                  </label>
                  <select
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brandBlue"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id || cat.id} value={cat.title}>{cat.title}</option>
                    ))}
                    {categories.length > 1 && <option value="Multiple">Multiple</option>}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="Enter referral code (e.g. AONE-XXXXX)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brandBlue"
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brandBlue text-white py-4 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="material-symbols-rounded animate-spin">progress_activity</span>
            ) : (
              <>
                {isLogin ? 'Login' : 'Create Account'}
                <span className="material-symbols-rounded">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {isLogin && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <button onClick={() => setIsLogin(false)} className="text-brandBlue font-bold">
              Sign Up
            </button>
          </p>
        )}
      </main>
    </div>
  );
};

export default StudentLogin;
