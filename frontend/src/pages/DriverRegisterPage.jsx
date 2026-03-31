import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverApi } from '../api/deliveryApi';
import { Truck, MapPin, ShieldCheck, Mail, Phone, Car, BadgeCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Spinner } from '../components/common';
import { toast } from 'sonner';

const VEHICLE_TYPES = ['Car', 'Motorcycle', 'Van', 'Scooter'];

export default function DriverRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userId: '', name: '', email: '', phone: '',
    vehicleType: 'Car', licensePlate: '', maxCarryWeightKg: 20,
  });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await driverApi.register(form);
      const driver = res.driver || res;
      localStorage.setItem('fc_driver_id', driver._id);
      toast.success('Registration successful! Welcome to the fleet.');
      setTimeout(() => navigate('/driver/dashboard'), 1500);
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left side - Visual & Marketing */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0d1f12] p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-[80px] -ml-32 -mb-32" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Truck size={20} className="text-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">FreshCart <span className="text-emerald-400">Logistics</span></span>
          </div>
          
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Deliver Happiness,<br/>
            Earn on Your <span className="text-emerald-400">Terms.</span>
          </h1>
          <p className="text-emerald-100/60 text-lg max-w-md leading-relaxed">
            Join the region's fastest growing grocery network. Get paid weekly, choose your hours, and help families get fresh food.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 group">
             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                <ShieldCheck className="text-emerald-400" size={24} />
             </div>
             <div>
                <div className="text-white font-bold text-sm">Flexible Insurance</div>
                <div className="text-emerald-100/40 text-xs">Full coverage during active shifts</div>
             </div>
          </div>
          <div className="flex items-center gap-4 group">
             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                <BadgeCheck className="text-emerald-400" size={24} />
             </div>
             <div>
                <div className="text-white font-bold text-sm">Instant Payouts</div>
                <div className="text-emerald-100/40 text-xs">Withdraw earnings after every trip</div>
             </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-slate-50/30">
        <div className="w-full max-w-xl">
           <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-800 mb-2">Partner Registration</h2>
              <p className="text-slate-500 text-sm">Tell us about yourself and your vehicle</p>
           </div>

           <form onSubmit={submit} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                 
                 <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Full Identity Name</label>
                    <div className="relative">
                       <input 
                         name="name" required value={form.name} onChange={handle}
                         className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                         placeholder="John Doe"
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Email Address</label>
                    <input 
                      type="email" name="email" required value={form.email} onChange={handle}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="john@example.com"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Mobile Number</label>
                    <input 
                      type="tel" name="phone" required value={form.phone} onChange={handle}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="+94 7X XXX XXXX"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Unified User ID</label>
                    <input 
                      name="userId" required value={form.userId} onChange={handle}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                      placeholder="USER-XXXX"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Vehicle Category</label>
                    <select 
                      name="vehicleType" value={form.vehicleType} onChange={handle}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                    >
                      {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">License Plate</label>
                    <input 
                      name="licensePlate" value={form.licensePlate} onChange={handle}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 transition-all uppercase"
                      placeholder="WP-BCE-1234"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Capacity (KG)</label>
                    <input 
                      type="number" name="maxCarryWeightKg" value={form.maxCarryWeightKg} onChange={handle}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                 </div>

              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
                 <button 
                   type="submit" disabled={loading}
                   className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                   {loading ? <Spinner size="sm" /> : <>Start Delivering Now <ArrowRight size={18} /></>}
                 </button>
                 <p className="text-[10px] text-center text-slate-400 px-8">
                    By clicking "Start Delivering Now", you agree to our Fleet Partnership Terms and Privacy Policy.
                 </p>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}