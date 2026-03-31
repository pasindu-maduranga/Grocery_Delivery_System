// src/pages/DriverDashboardPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { driverApi } from '../api/deliveryApi';
import { useSocket } from '../context/SocketContext';
import OrderCard from '../components/OrderCard';
import AssignmentToast from '../components/AssignmentToast';
import { MapPin, Navigation, Crosshair, Map as MapIcon, Shield, Radio, Layers, Zap, Clock, Activity, Target } from 'lucide-react';
import { toast } from 'sonner';

// Marker Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function DriverDashboardPage({ driverId: propDriverId }) {
  const navigate = useNavigate();
  const driverId = propDriverId || localStorage.getItem('fc_driver_id');
  
  const [driver, setDriver]               = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [toggling, setToggling]           = useState(false);
  const [isOnline, setIsOnline]           = useState(false);
  const [tab, setTab]                     = useState('pending');
  const [location, setLocation]           = useState({ lat: 6.9271, lng: 79.8612 });
  const [updatingLoc, setUpdatingLoc]     = useState(false);
  const [autoTracking, setAutoTracking]   = useState(false);
  const trackingIntervalRef               = useRef(null);
  
  const { connected, newAssignment, clearAssignment, goOnline, goOffline } = useSocket();

  const fetchAll = useCallback(async () => {
    if (!driverId) { setLoading(false); return; }
    try {
      const [driverRes, pending, current] = await Promise.all([
        driverApi.getById(driverId),
        driverApi.getPendingAssignments(driverId),
        driverApi.getCurrentOrders(driverId),
      ]);
      const d = driverRes.driver || driverRes;
      setDriver(d);
      setIsOnline(d?.isAvailable || false);
      setPendingOrders(Array.isArray(pending) ? pending : []);
      setCurrentOrders(Array.isArray(current) ? current : []);
      
      if (d?.currentLocation?.latitude) {
        setLocation({ lat: d.currentLocation.latitude, lng: d.currentLocation.longitude });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (newAssignment) { fetchAll(); }
  }, [newAssignment, fetchAll]);

  // Handle auto-tracking
  useEffect(() => {
    if (autoTracking && isOnline) {
      trackingIntervalRef.current = setInterval(updateLiveLocation, 30000); // 30s
    } else {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    }
    return () => { if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current); };
  }, [autoTracking, isOnline]);

  const updateLiveLocation = () => {
    if (!driverId) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          try {
            await driverApi.updateLocation(driverId, latitude, longitude);
          } catch (err) {
             console.error("Auto-sync failed", err);
          }
        },
        null,
        { enableHighAccuracy: true }
      );
    }
  };

  const handleManualLocationUpdate = async (newPos) => {
    if (!driverId) return;
    setUpdatingLoc(true);
    setLocation(newPos);
    try {
      await driverApi.updateLocation(driverId, newPos.lat, newPos.lng);
      toast.success('Live position updated!');
      setDriver(prev => ({ 
        ...prev, 
        currentLocation: { latitude: newPos.lat, longitude: newPos.lng } 
      }));
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setUpdatingLoc(false);
    }
  };

  const toggleAvailability = async () => {
    if (!driverId || !driver || toggling) return;
    setToggling(true);
    const next = !isOnline;
    try {
      await driverApi.updateAvailability(driverId, next);
      if (next) {
        goOnline(driverId, { latitude: location.lat, longitude: location.lng });
      } else {
        goOffline(driverId);
        setAutoTracking(false);
      }
      setIsOnline(next);
      setDriver(d => ({ ...d, isAvailable: next }));
    } catch (err) {
      console.error(err);
      toast.error("Cloud toggle failed");
    } finally {
      setToggling(false);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        handleManualLocationUpdate(e.latlng);
      },
    });
    return null;
  };

  const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => { map.setView([center.lat, center.lng], 15); }, [center, map]);
    return null;
  };

  if (loading) return <Loading />;
  if (!driverId) return <NoDriver navigate={navigate} />;

  const shown    = tab === 'pending' ? pendingOrders : currentOrders;
  const initials = driver?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <div className="min-h-screen bg-[#fcfdfd] font-sans pb-12">
      <style>{`
        @keyframes scan { from { transform: translateY(-50%); opacity: 0; } to { transform: translateY(50%); opacity: 0.5; } }
        .map-scan-line { position: absolute; inset: 0; background: linear-gradient(180deg, transparent, #10b981, transparent); height: 2px; animation: scan 2s linear infinite; pointer-events: none; z-index: 1000; }
        .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.5); }
      `}</style>
      
      {newAssignment && (
        <AssignmentToast
          assignment={newAssignment}
          onAccept={() => { driverApi.acceptOrder(driverId, newAssignment.orderId); clearAssignment(); fetchAll(); }}
          onReject={() => { driverApi.rejectOrder(driverId, newAssignment.orderId, 'Busy'); clearAssignment(); }}
          onDismiss={clearAssignment}
        />
      )}

      {/* ── HEADER ── */}
      <nav className="bg-[#0d1f12] px-6 py-4 flex items-center justify-between shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] sticky top-0 z-[1000]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Zap size={20} />
          </div>
          <div>
            <h1 className="text-white font-black text-lg tracking-tight">RapidCart</h1>
            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Pilot Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
             <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
             </div>
             <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{connected ? 'Relay Active' : 'Offline Mode'}</span>
          </div>
          
          <button onClick={() => navigate('/driver/profile')} className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20">
             {initials}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Operational Status */}
        <div className="xl:col-span-4 space-y-6">
           
           {/* Pilot Profile Card */}
           <div className={`p-8 rounded-[2.5rem] transition-all duration-700 relative overflow-hidden shadow-2xl ${isOnline ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-slate-900 shadow-slate-950/40'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="flex items-center gap-5 mb-8">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white font-black text-2xl">
                    {initials}
                 </div>
                 <div>
                    <h2 className="text-white font-black text-xl leading-tight">{driver?.name}</h2>
                    <p className="text-emerald-100/50 text-[10px] uppercase font-bold tracking-widest mt-1">
                       {driver?.vehicleType} · {driver?.licensePlate || 'Fleet XP'}
                    </p>
                 </div>
              </div>

              <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl mb-8 border border-white/5">
                 <div>
                    <p className="text-[9px] font-black text-white/30 uppercase mb-1">Status</p>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                       <span className="text-sm font-black text-white italic">{isOnline ? 'Active Fleet' : 'Offline'}</span>
                    </div>
                 </div>
                 <button 
                   onClick={toggleAvailability}
                   disabled={toggling}
                   className={`h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${isOnline ? 'bg-white text-emerald-950' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}
                 >
                   {toggling ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isOnline ? 'Go Offline' : 'Go Live'}
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-[10px] font-black text-white/20 uppercase mb-1">Rating</div>
                    <div className="text-white font-black text-lg">{driver?.rating?.average?.toFixed(1) || '—'} <span className="text-emerald-400">★</span></div>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-[10px] font-black text-white/20 uppercase mb-1">XP Points</div>
                    <div className="text-white font-black text-lg">{(driver?.completedOrders?.length || 0) * 10}</div>
                 </div>
              </div>
           </div>

           {/* LOCATION MANAGEMENT */}
           <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50">
              <div className="flex items-center justify-between mb-6 px-2">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                       <Navigation size={16} />
                    </div>
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Live Tether</h3>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Auto</span>
                    <button 
                      onClick={() => setAutoTracking(!autoTracking)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${autoTracking ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoTracking ? 'left-6' : 'left-1'}`} />
                    </button>
                 </div>
              </div>

              <div className="h-60 rounded-[2rem] overflow-hidden border-4 border-white shadow-inner relative">
                 {isOnline && <div className="map-scan-line" />}
                 <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[location.lat, location.lng]} />
                    <RecenterMap center={location} />
                    <MapEvents />
                 </MapContainer>
                 
                 <button 
                   onClick={updateLiveLocation}
                   className="absolute bottom-4 right-4 z-[999] bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-slate-100 text-blue-600 hover:text-blue-700 transition-colors"
                 >
                    <Crosshair size={18} />
                 </button>
              </div>

              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Current Coordinates</p>
                    <p className="text-[10px] font-bold font-mono text-slate-600 italic">
                       {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                 </div>
                 <Badge type="info" label={updatingLoc ? "Syncing..." : "Manual Ready"} />
              </div>
           </div>

        </div>

        {/* RIGHT COLUMN: Queue Management */}
        <div className="xl:col-span-8 flex flex-col gap-6">
           
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setTab('pending')}
                className={`flex-1 py-4 px-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${tab === 'pending' ? 'bg-[#0d1f12] text-white shadow-xl shadow-emerald-950/20' : 'bg-white text-slate-400 border border-slate-100'}`}
              >
                 <Zap size={16} /> Pending ({pendingOrders.length})
              </button>
              <button 
                onClick={() => setTab('current')}
                className={`flex-1 py-4 px-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${tab === 'current' ? 'bg-[#0d1f12] text-white shadow-xl shadow-emerald-950/20' : 'bg-white text-slate-400 border border-slate-100'}`}
              >
                 <Activity size={16} /> In Transit ({currentOrders.length})
              </button>
           </div>

           <div className="flex-1 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar pr-2">
              {shown.length === 0 ? (
                <div className="bg-white rounded-[3rem] py-24 flex flex-col items-center justify-center shadow-lg shadow-slate-200/50 border border-slate-50 border-dashed border-2">
                   <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${tab === 'pending' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {tab === 'pending' ? <Clock size={40} /> : <Target size={40} />}
                   </div>
                   <h3 className="text-xl font-black text-slate-800 italic uppercase">Queue Clear</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase mt-2 tracking-widest">{isOnline ? 'Standby for new assignments' : 'Go online to receive jobs'}</p>
                </div>
              ) : (
                shown.map((order, i) => (
                  <div key={order.orderId || order._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <OrderCard
                      order={order}
                      type={tab}
                      onAccept={() => { driverApi.acceptOrder(driverId, order.orderId || order._id); fetchAll(); }}
                      onReject={() => { driverApi.rejectOrder(driverId, order.orderId || order._id, 'Busy'); fetchAll(); }}
                      onComplete={() => { driverApi.completeDelivery(driverId, order.orderId || order._id); fetchAll(); }}
                    />
                  </div>
                ))
              )}
           </div>

        </div>

      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="h-screen bg-[#0d1f12] flex flex-col items-center justify-center gap-6">
       <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
       <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs">Calibrating Ops...</p>
    </div>
  );
}

function NoDriver({ navigate }) {
  return (
    <div className="h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-12 text-center">
       <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-slate-200">
          <Shield size={48} className="text-emerald-500" />
       </div>
       <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter mb-4">No Driver ID Found</h2>
       <p className="text-slate-500 font-medium max-w-sm mx-auto mb-12">Please ensure you are registered as a driver and logged in with the correct account.</p>
       <button onClick={() => navigate('/driver/register')} className="bg-[#0d1f12] text-white font-black px-12 py-5 rounded-[2rem] uppercase tracking-widest text-xs shadow-2xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all">
          Register Deployment →
       </button>
    </div>
  );
}

function Badge({ type, label, className }) {
   const styles = {
      info: 'bg-blue-50 text-blue-600',
      active: 'bg-emerald-50 text-emerald-600',
      inactive: 'bg-slate-50 text-slate-600'
   };
   return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[type] || styles.inactive} ${className}`}>
         {label}
      </span>
   );
}
