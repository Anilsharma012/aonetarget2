import React, { useState, useEffect } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
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
        
        localStorage.setItem('studentData', JSON.stringify(data.student));
        localStorage.setItem('isStudentAuthenticated', 'true');
        setAuth(true);
        navigate('/profile');
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
