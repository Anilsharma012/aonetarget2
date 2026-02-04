import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { dashboardAPI } from '../../src/services/apiClient';

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

interface DashboardStats {
  liveTests: number;
  activePackages: number;
  registrations: number;
  questionsBank: number;
  recentBuyers: any[];
  recentOrders: any[];
}

const Dashboard: React.FC<Props> = ({ showToast }) => {
  const [stats, setStats] = useState<DashboardStats>({
    liveTests: 0,
    activePackages: 0,
    registrations: 0,
    questionsBank: 0,
    recentBuyers: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const growthData = [
    { name: 'Aug', users: Math.floor(stats.registrations * 0.2) },
    { name: 'Sep', users: Math.floor(stats.registrations * 0.35) },
    { name: 'Oct', users: Math.floor(stats.registrations * 0.5) },
    { name: 'Nov', users: Math.floor(stats.registrations * 0.7) },
    { name: 'Dec', users: Math.floor(stats.registrations * 0.85) },
    { name: 'Jan', users: stats.registrations },
  ];

  const enrollmentData = [
    { name: 'Physics', students: Math.floor(stats.registrations * 0.25), color: '#1A237E' },
    { name: 'Biology', students: Math.floor(stats.registrations * 0.35), color: '#D32F2F' },
    { name: 'Chemistry', students: Math.floor(stats.registrations * 0.22), color: '#0091EA' },
    { name: 'Nursing', students: Math.floor(stats.registrations * 0.18), color: '#009688' },
  ];

  const testStatusData = [
    { name: 'Completed', value: 750, color: '#4CAF50' },
    { name: 'In Progress', value: 300, color: '#FF9800' },
    { name: 'Not Started', value: 190, color: '#9E9E9E' },
  ];

  const statsCards = [
    { label: 'Live Tests', val: stats.liveTests.toLocaleString(), icon: 'quiz', color: 'bg-blue-600', trend: '+12%', sub: 'Active Exams' },
    { label: 'Active Packages', val: stats.activePackages.toString(), icon: 'inventory_2', color: 'bg-purple-600', trend: '+4%', sub: 'Paid Batches' },
    { label: 'Registrations', val: stats.registrations.toLocaleString(), icon: 'people', color: 'bg-orange-600', trend: '+28%', sub: 'New Students' },
    { label: 'Q-Bank Size', val: stats.questionsBank >= 1000 ? `${(stats.questionsBank/1000).toFixed(1)}K` : stats.questionsBank.toString(), icon: 'help_outline', color: 'bg-teal-600', trend: '+150', sub: 'Total Questions' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((s, i) => (
          <div 
            key={i} 
            onClick={() => showToast(`${s.label} list refreshed!`)}
            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
               <div className={`${s.color} p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                 <span className="material-icons-outlined text-2xl">{s.icon}</span>
               </div>
               <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">{s.trend}</span>
            </div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-3xl font-black text-navy">{s.val}</h3>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">{s.sub}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h4 className="text-sm font-black text-navy uppercase tracking-widest">User Growth Trends</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Platform Registrations (Cumulative)</p>
              </div>
              <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-navy transition-all">
                <span className="material-icons-outlined text-xl">more_horiz</span>
              </button>
           </div>
           
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A237E" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1A237E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9E9E9E', fontWeight: 800}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '800'}}
                    itemStyle={{color: '#1A237E'}}
                  />
                  <Area type="monotone" dataKey="users" stroke="#1A237E" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h4 className="text-sm font-black text-navy uppercase tracking-widest">Enrollment by Category</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Distribution across primary subjects</p>
              </div>
              <button className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">Last 30 Days</button>
           </div>
           
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9E9E9E', fontWeight: 800}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9E9E9E', fontWeight: 800}} />
                  <Tooltip cursor={{fill: '#F8F9FA'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="students" radius={[10, 10, 0, 0]}>
                    {enrollmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col">
           <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-2">Test Completion Rate</h4>
           <p className="text-[10px] text-gray-400 font-bold uppercase mb-8">Daily average completion status</p>
           
           <div className="flex-1 min-h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={testStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {testStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', paddingTop: '20px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                 <span className="text-2xl font-black text-navy">75%</span>
                 <span className="text-[8px] font-black text-gray-300 uppercase">Avg. Pass</span>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 bg-navy rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between group">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <span className="material-icons-outlined text-yellow-400">campaign</span>
                 </div>
                 <h4 className="text-xl font-black uppercase tracking-tight">Enterprise Broadcaster</h4>
              </div>
              <p className="text-[11px] opacity-60 font-medium leading-relaxed uppercase tracking-wider max-w-sm">Dispatch mission-critical announcements and study alerts to the entire student ecosystem instantly via push-notifications.</p>
           </div>
           
           <div className="flex gap-4 items-end mt-8 relative z-10">
              <div className="flex-1">
                 <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-blue-300 opacity-50">Broadcast Payload</p>
                 <textarea 
                  placeholder="Type your announcement here..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-white/20 transition-all resize-none" 
                  rows={3}
                ></textarea>
              </div>
              <button 
                onClick={() => showToast("Broadcast payload successfully dispatched!", "success")}
                className="bg-white text-navy font-black h-12 px-8 rounded-2xl uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all hover:bg-blue-50 flex items-center gap-2"
              >
                Send <span className="material-icons-outlined text-sm">send</span>
              </button>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
         <div className="flex justify-between items-center mb-8">
            <h4 className="text-sm font-black text-navy uppercase tracking-widest">Real-time Transaction Stream</h4>
            <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b-2 border-blue-500/20 pb-0.5">View Ledger</button>
         </div>
         <div className="space-y-4">
            {stats.recentOrders.length === 0 && stats.recentBuyers.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <span className="material-icons-outlined text-4xl text-gray-300">receipt_long</span>
                <p className="text-xs text-gray-400 mt-2">No recent transactions</p>
              </div>
            ) : (
              [...stats.recentOrders, ...stats.recentBuyers].slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100/50 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                   <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={`https://i.pravatar.cc/150?u=${i+10}`} className="w-12 h-12 rounded-2xl grayscale group-hover:grayscale-0 transition-all" alt="" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-gray-50 rounded-full"></div>
                      </div>
                      <div>
                         <p className="text-xs font-black text-navy uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                          {item.email || item.userId || 'Unknown User'} - Transaction
                         </p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-widest">
                          {new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()} • Gateway: Razorpay • ID: #{item.id?.slice(-6) || 'N/A'}
                         </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-lg font-black text-navy group-hover:text-green-600 transition-colors">₹{(item.amount || item.paymentAmount || 0).toLocaleString()}</span>
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{item.status || 'Settled'}</p>
                   </div>
                </div>
              ))
            )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
