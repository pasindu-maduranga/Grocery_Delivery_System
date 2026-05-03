import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { driverApi } from '../api/deliveryApi'
import Layout from '../components/layout/Layout'
import { Card, Spinner, FormField } from '../components/common'
import { Settings, MapPin, Truck, Save, Shield, Map as MapIcon, Compass } from 'lucide-react'
import { toast } from 'sonner'
import L from 'leaflet'
import React from 'react'

const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
  iconSize: [35, 35], iconAnchor: [17, 35], popupAnchor: [0, -35]
})

function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng)
    },
  })
  return null
}

export default function DriverSettingsPage() {
  const driverId = localStorage.getItem('fc_driver_id')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'Motorcycle',
    licensePlate: '',
    defaultLocation: { lat: 6.9271, lng: 79.8612 }
  })

  useEffect(() => {
    if (driverId) fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await driverApi.getProfile(driverId)
      const d = res.driver || res.data
      setProfile({
        ...d,
        defaultLocation: d.currentLocation || { lat: 6.9271, lng: 79.8612 }
      })
    } catch (err) {
      toast.error('Failed to load profile settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await driverApi.updateProfile(driverId, {
        phone: profile.phone,
        vehicleType: profile.vehicleType,
        licensePlate: profile.licensePlate,
        currentLocation: {
          latitude: profile.defaultLocation.lat || profile.defaultLocation.latitude,
          longitude: profile.defaultLocation.lng || profile.defaultLocation.longitude
        }
      })
      toast.success('Fleet settings updated successfully!')
    } catch (err) {
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout title="Fleet Settings"><Spinner /></Layout>

  return (
    <Layout title="Operational Settings" subtitle="Configure your vehicle and persistent deployment point">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Form */}
        <div className="space-y-6">
           <Card className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Settings size={22} />
                </div>
                <div>
                   <h3 className="font-black text-slate-800 text-lg uppercase italic tracking-tight">Mission Profile</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Update your vehicle and contact details</p>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <FormField label="Full Name" value={profile.name} disabled />
                    <FormField label="Email" value={profile.email} disabled />
                 </div>
                 <FormField 
                    label="Emergency Contact / Phone" 
                    value={profile.phone} 
                    onChange={(v) => setProfile({...profile, phone: v})} 
                 />
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vehicle Class</label>
                       <select 
                          value={profile.vehicleType}
                          onChange={(e) => setProfile({...profile, vehicleType: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                       >
                          <option value="Motorcycle">Intercepter (Motorcycle)</option>
                          <option value="Scooter">Swift (Scooter)</option>
                          <option value="Car">Heavy (Car)</option>
                          <option value="Van">Cargo (Van)</option>
                       </select>
                    </div>
                    <FormField 
                       label="License Plate" 
                       value={profile.licensePlate} 
                       onChange={(v) => setProfile({...profile, licensePlate: v})} 
                    />
                 </div>
              </div>

              <div className="mt-12 flex justify-end">
                 <button 
                   onClick={handleSave}
                   disabled={saving}
                   className="flex items-center gap-3 bg-[#0d1f12] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-950/20 hover:bg-emerald-900 transition-all active:scale-95 disabled:opacity-50"
                 >
                   {saving ? <Spinner size="xs" /> : <Save size={18} />}
                   Save Profile
                 </button>
              </div>
           </Card>

           <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                 <Shield size={24} />
              </div>
              <p className="text-xs text-blue-700 leading-relaxed font-bold italic">
                 "Your license details are encrypted and only used for mission verification. Keep them updated to ensure deployment eligibility."
              </p>
           </div>
        </div>

        {/* Right: Map for Default Location */}
        <div className="space-y-6">
           <Card className="p-0 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden relative h-[600px]">
              <div className="absolute top-8 left-8 right-8 z-[1000] flex items-center gap-3">
                 <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl flex-1 border border-white flex items-center gap-3">
                    <MapIcon size={20} className="text-emerald-500" />
                    <div>
                       <div className="text-[10px] font-black text-slate-400 uppercase">Deployment Hub</div>
                       <div className="text-xs font-black text-slate-800">
                          {profile.defaultLocation.lat?.toFixed(5) || profile.defaultLocation.latitude?.toFixed(5)}, {profile.defaultLocation.lng?.toFixed(5) || profile.defaultLocation.longitude?.toFixed(5)}
                       </div>
                    </div>
                 </div>
                 <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-center">
                    <Compass size={24} className="animate-pulse" />
                 </div>
              </div>

              <MapContainer 
                 center={[profile.defaultLocation.lat || profile.defaultLocation.latitude || 6.9271, profile.defaultLocation.lng || profile.defaultLocation.longitude || 79.8612]} 
                 zoom={13} 
                 style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker 
                  position={[profile.defaultLocation.lat || profile.defaultLocation.latitude || 6.9271, profile.defaultLocation.lng || profile.defaultLocation.longitude || 79.8612]} 
                  icon={driverIcon} 
                />
                <LocationPicker onLocationSelect={(latlng) => setProfile({...profile, defaultLocation: latlng})} />
              </MapContainer>

              <div className="absolute bottom-8 left-8 right-8 z-[1000]">
                 <div className="bg-slate-900/80 backdrop-blur p-4 rounded-2xl text-white text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest">
                       Click on the map to set your <span className="text-emerald-400">Primary Deployment Point</span>
                    </p>
                 </div>
              </div>
           </Card>
        </div>

      </div>
    </Layout>
  )
}
