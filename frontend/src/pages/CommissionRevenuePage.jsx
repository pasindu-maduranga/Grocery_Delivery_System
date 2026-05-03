import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Truck, CheckCircle, Clock } from 'lucide-react';

const CommissionRevenuePage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalPlatformRevenue: 0,
    totalGroceryCommission: 0,
    totalRiderEarnings: 0,
    totalTrips: 0
  });

  const fetchTrips = async () => {
    try {
      const res = await axios.get('http://localhost:5005/api/delivery-trips');
      setTrips(res.data);
      
      let pRev = 0, gCom = 0, rEarn = 0;
      res.data.forEach(trip => {
        pRev += trip.financials.platformFee;
        gCom += trip.financials.groceryCommissionAmount;
        rEarn += trip.financials.riderEarning;
      });

      setStats({
        totalPlatformRevenue: pRev,
        totalGroceryCommission: gCom,
        totalRiderEarnings: rEarn,
        totalTrips: res.data.length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handlePayPartner = async (tripId) => {
    if (!window.confirm("Simulate Stripe API payout to partner?")) return;
    
    try {
      await axios.post(`http://localhost:5005/api/delivery-trips/${tripId}/pay`);
      alert('Stripe payout successful!');
      fetchTrips(); // refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Payout failed');
    }
  };

  // Mock data for chart representing weekly delivery demand surge
  const chartData = [
    { name: 'Mon', demand: 12, revenue: 840 },
    { name: 'Tue', demand: 19, revenue: 1330 },
    { name: 'Wed', demand: 15, revenue: 1050 },
    { name: 'Thu', demand: 22, revenue: 1540 },
    { name: 'Fri', demand: 30, revenue: 2100 },
    { name: 'Sat', demand: 45, revenue: 3150 },
    { name: 'Sun', demand: 38, revenue: 2660 },
  ];

  return (
    <Layout title="Revenue & Dispatch Analytics" subtitle="Track platform fees, grocery commissions, and partner payouts">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
         <div className="card p-4 flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
            <div className="bg-white/20 p-3 rounded-xl"><DollarSign size={24} /></div>
            <div>
               <div className="text-emerald-50 text-sm font-medium">Grocery Commission (~20%)</div>
               <div className="text-2xl font-bold">LKR {stats.totalGroceryCommission.toFixed(2)}</div>
            </div>
         </div>
         <div className="card p-4 flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl"><DollarSign size={24} /></div>
            <div>
               <div className="text-slate-500 text-sm font-medium">Platform Fee Revenue</div>
               <div className="text-2xl font-bold text-slate-800">LKR {stats.totalPlatformRevenue.toFixed(2)}</div>
            </div>
         </div>
         <div className="card p-4 flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><Truck size={24} /></div>
            <div>
               <div className="text-slate-500 text-sm font-medium">Rider Earnings</div>
               <div className="text-2xl font-bold text-slate-800">LKR {stats.totalRiderEarnings.toFixed(2)}</div>
            </div>
         </div>
         <div className="card p-4 flex items-center gap-4">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-xl"><Clock size={24} /></div>
            <div>
               <div className="text-slate-500 text-sm font-medium">Completed Trips</div>
               <div className="text-2xl font-bold text-slate-800">{stats.totalTrips}</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card p-5">
           <h3 className="font-bold text-slate-800 mb-4">Demand Surge Forecast & Revenue</h3>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" />
                  <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="card p-5 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 flex flex-col justify-center text-center">
           <div className="text-6xl mb-2">⚡</div>
           <h3 className="font-bold text-xl mb-2">Live Demand Surge</h3>
           <p className="text-slate-400 text-sm mb-6">Current active multiplier across Colombo</p>
           <div className="text-5xl font-black text-amber-400 mb-4">1.2x</div>
           <p className="text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg">High partner demand expected between 6:00 PM and 9:00 PM due to weather conditions.</p>
        </div>
      </div>

      <div className="card overflow-hidden text-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-base">Trip Logs & Payouts</h3>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead>
               <tr className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                 <th className="p-4 font-semibold">Details</th>
                 <th className="p-4 font-semibold">Partner</th>
                 <th className="p-4 font-semibold">Metrics</th>
                 <th className="p-4 font-semibold text-right">Fee Breakdown</th>
                 <th className="p-4 font-semibold text-center">Rider Payout</th>
                 <th className="p-4 font-semibold text-center">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {loading ? (<tr><td colSpan="6" className="text-center p-8">Loading...</td></tr>) : trips.length === 0 ? (
                 <tr><td colSpan="6" className="text-center p-8 text-slate-500">No trips recorded yet.</td></tr>
               ) : trips.map(trip => (
                 <tr key={trip._id} className="hover:bg-slate-50 transition-colors">
                   <td className="p-4">
                     <div className="font-semibold text-slate-800">{trip.orderId}</div>
                     <div className="text-xs text-slate-500">{new Date(trip.createdAt).toLocaleString()}</div>
                     <div className="text-xs font-medium text-emerald-600 mt-1">{trip.status}</div>
                   </td>
                   <td className="p-4">
                     <div className="font-medium text-slate-700">{trip.deliveryPartnerId?.name || "Unknown"}</div>
                     <div className="text-xs text-slate-400">{trip.deliveryPartnerId?.vehicle?.type}</div>
                   </td>
                   <td className="p-4">
                     <div className="text-xs text-slate-600"><span className="text-slate-400">Dist:</span> {trip.tripData.distanceKm} km</div>
                     <div className="text-xs text-slate-600"><span className="text-slate-400">Surge:</span> {trip.tripData.demandSurgeMultiplier}x</div>
                   </td>
                   <td className="p-4 text-right text-xs">
                     <div className="text-slate-500"><span className="mr-4">Cust Fee:</span> Rs {trip.financials.customerDeliveryFee}</div>
                     <div className="text-slate-500"><span className="mr-4">G. Comm:</span> - Rs {trip.financials.groceryCommissionAmount}</div>
                     <div className="text-slate-500"><span className="mr-4">Platform:</span> - Rs {trip.financials.platformFee}</div>
                     <div className="font-bold text-slate-800 border-t border-slate-200 mt-1 pt-1"><span className="mr-4">Total:</span> Rs {trip.financials.riderEarning}</div>
                   </td>
                   <td className="p-4 text-center">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${trip.financials.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {trip.financials.paymentStatus}
                     </span>
                   </td>
                   <td className="p-4 text-center">
                     {trip.financials.paymentStatus !== 'Paid' ? (
                        <button onClick={() => handlePayPartner(trip._id)} className="btn btn-primary text-xs py-1.5 px-3 rounded-lg whitespace-nowrap">
                          💳 Pay Stripe
                        </button>
                     ) : (
                        <div className="text-green-500 flex justify-center"><CheckCircle size={20} /></div>
                     )}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>

    </Layout>
  );
};

export default CommissionRevenuePage;
