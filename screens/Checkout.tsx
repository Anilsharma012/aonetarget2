
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COURSES } from '../constants';

const Checkout: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = COURSES.find(c => c.id === id) || COURSES[0];
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="bg-[#F3F4F6] min-h-screen pb-32 animate-fade-in relative">
      <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-white/10">
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center">Order Summary</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Course Summary */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
           <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Course Details</h2>
           <div className="flex gap-4">
             <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-50">
               <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-sm leading-tight mb-1">{course.title}</h3>
               <p className="text-xs text-gray-400 mb-2">{course.category}</p>
               <div className="flex items-center text-[10px] text-gray-400 gap-3">
                 <span className="flex items-center"><span className="material-icons-outlined text-xs mr-1">schedule</span> 12 Months</span>
                 <span className="flex items-center"><span className="material-icons-outlined text-xs mr-1">language</span> Hinglish</span>
               </div>
             </div>
           </div>
        </div>

        {/* Coupon Section */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold flex items-center mb-3">
            <span className="material-icons-outlined text-brandRed mr-2">local_offer</span>
            Apply Coupon
          </h2>
          <div className="flex gap-2">
            <input className="flex-1 bg-gray-50 border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-primary" placeholder="Enter coupon code" />
            <button className="text-primary font-bold text-sm px-4">Apply</button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
            {['AONE2026', 'EARLYBIRD'].map(c => (
              <button key={c} className="text-[10px] border border-dashed border-gray-300 rounded-md px-3 py-1.5 text-gray-400 hover:border-primary hover:text-primary transition">{c}</button>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-base font-bold mb-4">Payment Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Course Price (MRP)</span>
              <span>₹{course.mrp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Discount ({course.discount})</span>
              <span className="text-green-600">- ₹{course.mrp - course.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Taxes (GST 18%)</span>
              <span>Included</span>
            </div>
            <div className="h-px bg-gray-100 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="font-bold">Total Amount</span>
              <span className="font-black text-xl text-primary">₹{course.price}</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-center text-gray-400 px-4 pb-8">
          By confirming the order, you agree to our <span className="text-primary">Terms of Service</span> and <span className="text-primary">Refund Policy</span>.
        </p>
      </main>

      {/* Confirmation Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-xl z-40">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400">Total Payable</span>
              <span className="text-2xl font-black text-navy">₹{course.price}</span>
            </div>
            <button className="text-primary text-xs font-bold">View Details</button>
          </div>
          <button onClick={() => setShowPayment(true)} className="w-full bg-navy text-white font-bold py-3.5 rounded-xl text-base shadow-lg flex items-center justify-center gap-2">
            Confirm Order <span className="material-icons-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Payment Modal Mock */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPayment(false)}></div>
          <div className="relative bg-white dark:bg-gray-900 w-full rounded-2xl overflow-hidden shadow-2xl animate-fade-in max-w-[340px]">
            <div className="bg-brandBlue px-5 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold italic">R</div>
                 <div>
                   <h3 className="text-sm font-bold">Razorpay</h3>
                   <p className="text-[8px] opacity-70">Trusted Business</p>
                 </div>
              </div>
              <span className="text-[8px] uppercase tracking-widest bg-white/10 px-2 py-1 rounded">Test Mode</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 flex justify-between items-center border-b border-blue-100 dark:border-gray-800">
               <span className="text-xs text-gray-500">Payable Amount</span>
               <span className="text-xl font-black text-brandBlue">₹{course.price}</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="border border-blue-500 bg-blue-50/50 p-3 rounded-lg flex items-center gap-3 relative">
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] px-2 py-0.5 rounded-full">FAST</span>
                <span className="material-icons-outlined text-blue-600">smartphone</span>
                <div className="flex-1">
                  <p className="text-xs font-bold">UPI (GPay/PhonePe)</p>
                  <p className="text-[10px] text-gray-500">Fast & Secure</p>
                </div>
                <div className="h-5 w-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <div className="border border-gray-200 p-3 rounded-lg flex items-center justify-between opacity-70">
                <div className="flex items-center gap-3">
                  <span className="material-icons-outlined text-gray-400">credit_card</span>
                  <span className="text-xs font-bold">Card</span>
                </div>
                <span className="material-icons-outlined text-xs">chevron_right</span>
              </div>
              <button onClick={() => navigate('/success')} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg mt-2">
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
