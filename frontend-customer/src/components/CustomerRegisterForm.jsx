import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, MapPin, ShoppingCart, Crosshair, Map as MapIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CustomerRegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [location, setLocation] = useState({ lat: 6.9271, lng: 79.8612 }); // Colombo defaults
  const [loading, setLoading] = useState(false);
  const [fetchingLoc, setFetchingLoc] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt auto-location on mount
    fetchCurrentLocation();
  }, []);

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (res.data && res.data.display_name) {
        setFormData(prev => ({ ...prev, address: res.data.display_name }));
      }
    } catch (err) {
      console.warn("Failed to fetch address details", err);
    }
  };

  const fetchCurrentLocation = () => {
    setFetchingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(newLoc);
          setFetchingLoc(false);
          fetchAddressFromCoords(newLoc.lat, newLoc.lng);
        },
        (err) => {
          setFetchingLoc(false);
          console.warn("Auto-location failed. Manual selection available.");
        }
      );
    } else {
      setFetchingLoc(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phoneNo || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all mandatory fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL_USER_MANAGEMENT_SERVICE}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          phoneNo: formData.phoneNo,
          password: formData.password,
          address: formData.address,
          location: {
            latitude: location.lat,
            longitude: location.lng,
            address: formData.address || 'User set location'
          },
          role: "customer",
        },
      );
      toast.success(res.data.message || "Account created successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setLocation(e.latlng);
        fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
      },
    });
    return <Marker position={location} />;
  };

  const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
      map.setView([lat, lng], 14);
    }, [lat, lng, map]);
    return null;
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all duration-200";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12 font-sans relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full blur-[100px] -ml-40 -mb-40 opacity-50" />
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden relative z-10 border border-slate-50">
        
        {/* Form Panel */}
        <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">RapidCart</h1>
              <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest">Fresh Grocery Network</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder="e.g. John Wick" className={inputClass} />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@wick.com" className={inputClass} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Phone Number</label>
                <div className="relative">
                  <Phone className={iconClass} />
                  <input name="phoneNo" type="tel" value={formData.phoneNo} onChange={handleChange} placeholder="+94 77 XXX" className={inputClass} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Street Address</label>
                <div className="relative">
                  <MapPin className={iconClass} />
                  <input name="address" type="text" value={formData.address} onChange={handleChange} placeholder="Main St, Borella" className={inputClass} />
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
               <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                     <MapIcon size={16} className="text-emerald-500" />
                     <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Delivery Point</span>
                  </div>
                  <button type="button" onClick={fetchCurrentLocation} className="text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 uppercase tracking-tight">
                     {fetchingLoc ? 'Locating...' : 'Auto-Locate'} <Crosshair size={10} />
                  </button>
               </div>
               
               <div className="h-40 rounded-3xl overflow-hidden border-2 border-white shadow-inner relative group">
                  <MapContainer center={[location.lat, location.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                     <RecenterMap lat={location.lat} lng={location.lng} />
                     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                     <LocationMarker />
                  </MapContainer>
                  <div className="absolute bottom-2 right-2 z-[999] bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-[8px] font-bold text-slate-500 shadow-sm">
                     Click to move pin
                  </div>
               </div>
               <p className="mt-3 text-[10px] text-slate-400 italic font-medium px-2 leading-relaxed">
                  * Placing the pin accurately helps us estimate transport charges and speed up your delivery.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Secure Password</label>
                  <div className="relative">
                    <Lock className={iconClass} />
                    <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputClass} />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Confirm Access</label>
                  <div className="relative">
                    <Lock className={iconClass} />
                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputClass} />
                  </div>
               </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#0d1f12] text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-950/20 hover:bg-emerald-900 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs">
              {loading ? "Initializing..." : "Register Account"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between px-2">
             <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">Sign in instead</Link>
             <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">RapidCart © 2026</span>
          </div>
        </div>

        {/* Visual Panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0d1f12] to-emerald-950 relative">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-10 grayscale mix-blend-overlay" />
           
           <div className="relative z-10">
              <div className="text-emerald-400 font-black text-[120px] leading-none opacity-10 select-none">FRESH</div>
              <h2 className="text-4xl font-black text-white leading-tight -mt-16">
                 Your Groceries,<br/>
                 In <span className="text-emerald-400 italic">Record Time.</span>
              </h2>
           </div>

           <div className="relative z-10 space-y-6">
              {[
                { title: 'Track Live', sub: 'Follow your rider in real-time on our elite delivery map.' },
                { title: 'Borella Hub', sub: 'Fast dispatch from our main main operating center.' },
                { title: 'Low Fees', sub: 'Precise location-based charges save you money.' }
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                   <div className="w-px h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
                   <div>
                      <div className="text-white font-black text-sm uppercase tracking-widest mb-1">{item.title}</div>
                      <div className="text-emerald-100/40 text-xs leading-relaxed max-w-xs">{item.sub}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .leaflet-container { border-radius: 1.5rem; }
      `}</style>
    </div>
  );
};

export default CustomerRegisterForm;
