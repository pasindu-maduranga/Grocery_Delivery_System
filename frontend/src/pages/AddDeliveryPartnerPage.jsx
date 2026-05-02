import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { MapPin, User, Mail, Phone, CreditCard, Truck, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AddDeliveryPartnerPage = () => {
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', phone: '', nic: '',
    vehicle: 'Bicycle', licensePhotoUrl: '',
    latitude: 6.9271, longitude: 79.8612,
    province: '', district: '', city: '', address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchLocationDetails = async (lat, lon) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (res.data && res.data.address) {
        const address = res.data.address;
        const state = address.state || 'Western Province';
        const county = address.county || address.state_district || 'Colombo';
        const city = address.city || address.town || address.village || 'Colombo';
        
        setFormData(prev => ({
          ...prev,
          province: state,
          district: county,
          city: city,
          latitude: lat,
          longitude: lon
        }));
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  useEffect(() => {
    fetchLocationDetails(formData.latitude, formData.longitude);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        fetchLocationDetails(e.latlng.lat, e.latlng.lng);
      },
    });

    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]} />
    ) : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    if (formData.vehicle === 'Bicycle' && !formData.district.includes('Colombo')) {
      setMessage({ type: 'error', text: 'Bicycle is only allowed within Colombo district.' });
      setLoading(false);
      return;
    }

    try {
      const DELIVERY_URL = import.meta.env.VITE_DELIVERY_SERVICE_URL || 'http://localhost:5005/api';
      const res = await axios.post(`${DELIVERY_URL}/delivery-partners/register`, {
        name: formData.name, username: formData.username, email: formData.email, phone: formData.phone, nic: formData.nic,
        location: {
          province: formData.province, district: formData.district, city: formData.city,
          address: formData.address, latitude: formData.latitude, longitude: formData.longitude
        },
        vehicle: { type: formData.vehicle, licensePhotoUrl: formData.licensePhotoUrl || 'dummy_url' }
      });
      setMessage({ type: 'success', text: res.data.message });
      // Reset logic
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Delivery Partner" subtitle="Register a new delivery partner">
      <div className="card p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="pl-10 w-full rounded-lg border border-slate-200 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input required type="text" name="username" value={formData.username} onChange={handleChange} placeholder="e.g. jdoe_driver" className="pl-10 w-full rounded-lg border border-slate-200 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="pl-10 w-full rounded-lg border border-slate-200 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="pl-10 w-full rounded-lg border border-slate-200 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NIC Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input required type="text" name="nic" value={formData.nic} onChange={handleChange} className="pl-10 w-full rounded-lg border border-slate-200 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select name="vehicle" value={formData.vehicle} onChange={handleChange} className="pl-10 w-full rounded-lg border border-slate-200 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                  <option value="Bicycle">Bicycle (Colombo Only)</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Van">Van</option>
                  <option value="Lorry">Lorry</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Driver License URL</label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" name="licensePhotoUrl" value={formData.licensePhotoUrl} onChange={handleChange} className="pl-10 w-full rounded-lg border border-slate-200 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-slate-200 h-80 relative z-0">
            <MapContainer center={[formData.latitude, formData.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
            </MapContainer>
            <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 px-3 py-1 rounded shadow-sm text-xs font-mono">
               Lat: {formData.latitude.toFixed(4)}, Lon: {formData.longitude.toFixed(4)}
            </div>
            <div className="absolute top-2 right-2 z-[1000] bg-primary-500 text-white px-3 py-1 rounded shadow-md text-xs font-semibold">
               Click anywhere on map to set driver base location
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Province</label>
               <div className="font-medium">{formData.province || '-'}</div>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">District</label>
               <div className="font-medium">{formData.district || '-'}</div>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">City</label>
               <div className="font-medium">{formData.city || '-'}</div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg font-medium text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-lg font-semibold flex justify-center items-center">
            {loading ? 'Processing...' : 'Register Partner (Pending Approval)'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddDeliveryPartnerPage;
