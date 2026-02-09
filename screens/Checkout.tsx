import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  thumbnail?: string;
  price?: number;
  mrp?: number;
  category?: string;
  instructor?: string;
}

const Checkout: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const getStudentData = () => {
    try {
      const data = localStorage.getItem('studentData');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  };

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        }
      } catch (error) {
        console.error('Failed to load course:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id]);

  const handlePurchase = async () => {
    const student = getStudentData();
    if (!student) {
      alert('Please login first');
      navigate('/student-login');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          courseId: course?.id || id,
          amount: course?.price || 0,
          paymentMethod: 'online',
          referralCode: referralCode || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowPayment(false);
        navigate('/purchase-success', { state: { course, purchase: data.purchase } });
      } else {
        alert(data.error || 'Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A237E]"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="material-symbols-rounded text-5xl text-gray-300">error</span>
          <p className="text-gray-500 mt-3">Course not found</p>
          <button onClick={() => navigate(-1)} className="mt-3 text-[#303F9F] font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  const courseName = course.name || course.title || 'Course';
  const coursePrice = course.price || 0;
  const courseMrp = course.mrp || coursePrice;
  const discount = courseMrp > coursePrice ? courseMrp - coursePrice : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <header className="bg-[#1A237E] text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <h1 className="text-base font-bold flex-1 text-center">Order Summary</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Course Details</p>
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-[#303F9F] to-[#1A237E] flex items-center justify-center">
              {(course.imageUrl || course.thumbnail) ? (
                <img src={course.imageUrl || course.thumbnail} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <span className="text-white text-2xl font-bold opacity-60">{courseName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm leading-tight text-gray-800">{courseName}</h3>
              {course.instructor && <p className="text-xs text-gray-400 mt-1">{course.instructor}</p>}
              <div className="flex items-center text-[10px] text-gray-400 gap-3 mt-2">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-rounded text-xs">schedule</span> Lifetime Access
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-rounded text-xs">language</span> Hinglish
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
            <span className="material-symbols-rounded text-[#D32F2F]">local_offer</span>
            Referral Code
          </h2>
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#303F9F]/10 font-bold" 
              placeholder="Enter referral code (optional)" 
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold mb-4">Payment Summary</h2>
          <div className="space-y-3 text-sm">
            {courseMrp > coursePrice && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Course Price (MRP)</span>
                  <span className="text-gray-500">₹{courseMrp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-green-600 font-bold">- ₹{discount}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Taxes (GST)</span>
              <span className="text-gray-500">Included</span>
            </div>
            <div className="h-px bg-gray-100 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">Total Amount</span>
              <span className="font-black text-xl text-[#1A237E]">
                {coursePrice > 0 ? `₹${coursePrice}` : 'FREE'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-center text-gray-400 px-4">
          By confirming, you agree to our Terms of Service and Refund Policy.
        </p>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-xl z-40">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] text-gray-400">Total Payable</span>
              <p className="text-2xl font-black text-[#1A237E]">
                {coursePrice > 0 ? `₹${coursePrice}` : 'FREE'}
              </p>
            </div>
          </div>
          {coursePrice > 0 ? (
            <button 
              onClick={() => setShowPayment(true)} 
              className="w-full bg-[#1A237E] text-white font-bold py-3.5 rounded-xl text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Proceed to Pay <span className="material-symbols-rounded">arrow_forward</span>
            </button>
          ) : (
            <button 
              onClick={handlePurchase}
              disabled={processing}
              className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              {processing ? 'Enrolling...' : 'Enroll for Free'}
              <span className="material-symbols-rounded">check_circle</span>
            </button>
          )}
        </div>
      </div>

      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPayment(false)}></div>
          <div className="relative bg-white w-full rounded-2xl overflow-hidden shadow-2xl max-w-[340px]">
            <div className="bg-[#303F9F] px-5 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-rounded text-lg">payment</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold">Payment</h3>
                  <p className="text-[8px] opacity-70">Secure Payment</p>
                </div>
              </div>
              <button onClick={() => setShowPayment(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="bg-blue-50 p-4 flex justify-between items-center border-b border-blue-100">
              <span className="text-xs text-gray-500">Payable Amount</span>
              <span className="text-xl font-black text-[#303F9F]">₹{coursePrice}</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="border-2 border-[#303F9F] bg-blue-50/50 p-3 rounded-xl flex items-center gap-3 relative">
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">FAST</span>
                <span className="material-symbols-rounded text-[#303F9F]">smartphone</span>
                <div className="flex-1">
                  <p className="text-xs font-bold">UPI (GPay / PhonePe)</p>
                  <p className="text-[10px] text-gray-500">Fast & Secure</p>
                </div>
                <div className="h-5 w-5 rounded-full border-2 border-[#303F9F] flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#303F9F]"></div>
                </div>
              </div>
              <div className="border border-gray-200 p-3 rounded-xl flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-rounded text-gray-400">credit_card</span>
                  <span className="text-xs font-bold text-gray-500">Card Payment</span>
                </div>
                <span className="material-symbols-rounded text-xs text-gray-400">chevron_right</span>
              </div>
              <button 
                onClick={handlePurchase} 
                disabled={processing}
                className="w-full bg-[#1A237E] text-white font-bold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
              >
                {processing ? (
                  <>
                    <span className="animate-spin material-symbols-rounded text-lg">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{coursePrice}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
