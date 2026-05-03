import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Clock, CreditCard, ChevronRight, Check } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

// Fix Leaflet blank marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const partnerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const AdminAssignmentPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  // Mock Active Order for demonstration purposes (Should fetch from Order API)
  const [activeOrder, setActiveOrder] = useState({
    id: 'ORD-8923-231',
    customerName: 'Sam Perera',
    deliveryAddress: '15/2 Malabe Road, Colombo',
    latitude: 6.905, 
    longitude: 79.88,
    deliveryFee: 350
  });

  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchNearbyPartners = async () => {
    try {
      // In real scenario, pass lat/lon. Here we fetch all.
      const res = await axios.get('http://localhost:5005/api/delivery-partners');
      // Filter online partners manually or assume backend does it
      const onlinePartners = res.data.filter(p => true); // Mocking all online for preview
      setPartners(onlinePartners);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyPartners();
  }, []);

  const handleAssign = async (partner) => {
    setAssigning(partner._id);
    setMessage(null);
    try {
      const payload = {
        orderId: activeOrder.id,
        deliveryPartnerId: partner._id,
        customerDetails: {
          name: activeOrder.customerName,
          deliveryAddress: activeOrder.deliveryAddress,
          latitude: activeOrder.latitude,
          longitude: activeOrder.longitude
        },
        financials: {
          customerDeliveryFee: 350,
          groceryCommissionAmount: 70,
          platformFee: 30,
          riderEarning: 250
        }
      };
      
      await axios.post('http://localhost:5005/api/delivery-trips/assign', payload);
      
      // Notify via socket in standard app.
      if (socket) {
         socket.emit('admin_assigned_order', { partnerId: partner._id, order: payload });
      }

      setMessage({ type: 'success', text: `Order assigned successfully to ${partner.name}! They have been notified.` });
    } catch (err) {
       console.error(err);
       setMessage({ type: 'error', text: 'Assignment failed.' });
    } finally {
      setAssigning(null);
    }
  };

  return (
    <Layout title="Live Delivery Map" subtitle="Assign orders to nearby available partners">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
        
        {/* Map Section */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
          <MapContainer center={[activeOrder.latitude, activeOrder.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Customer Marker */}
            <Marker position={[activeOrder.latitude, activeOrder.longitude]} icon={customerIcon}>
               <Popup>
                 <div className="font-bold">Customer: {activeOrder.customerName}</div>
                 <div className="text-sm">{activeOrder.deliveryAddress}</div>
               </Popup>
            </Marker>
            
            {/* 3km Radius Circle */}
            <Circle 
               center={[activeOrder.latitude, activeOrder.longitude]} 
               radius={3000} 
               pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
            />

            {/* Partner Markers */}
            {partners.map(partner => (
               <Marker 
                  key={partner._id} 
                  position={[partner.location?.latitude || activeOrder.latitude + 0.01, partner.location?.longitude || activeOrder.longitude + 0.01]} // mock near location
                  icon={partnerIcon}
               >
                 <Popup>
                    <div className="font-bold">{partner.name}</div>
                    <div className="text-sm">{partner.vehicle?.type}</div>
                 </Popup>
               </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Section */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
           <div className="card p-5 border-l-4 border-l-primary-500">
             <h3 className="font-bold text-lg mb-2 text-slate-800">Pending Order Assignment</h3>
             <div className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-2 font-mono"><span className="font-bold text-slate-400">ID:</span> {activeOrder.id}</div>
                <div className="flex items-center gap-2 mb-2"><MapPin size={14}/> {activeOrder.deliveryAddress}</div>
                <div className="flex items-center gap-2 mb-1"><CreditCard size={14}/> Delivery Fee: LKR {activeOrder.deliveryFee}</div>
             </div>
             
             {message && (
               <div className={`p-3 text-sm rounded-lg mb-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                 {message.text}
               </div>
             )}
           </div>

           <div className="font-bold text-slate-700 mt-2">Available Partners Nearby (3km Drop-zone)</div>
           
           {loading ? (
             <div className="text-center py-5 text-slate-400">Searching radar...</div>
           ) : partners.length === 0 ? (
             <div className="text-center py-5 text-slate-400 border border-dashed rounded-lg">No partners available right now</div>
           ) : (
             partners.map(partner => (
               <div key={partner._id} className="card p-4 hover:shadow-md transition-shadow group flex items-center justify-between border border-transparent hover:border-primary-100 cursor-pointer text-left">
                  <div>
                    <div className="font-bold text-slate-800">{partner.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={12}/> ~ 5 mins away</div>
                    <div className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full inline-block mt-2">
                       {partner.vehicle?.type}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAssign(partner)}
                    disabled={assigning === partner._id}
                    className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-primary-500 group-hover:text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
                  >
                    {assigning === partner._id ? <span className="animate-spin text-sm">...</span> : <ChevronRight size={18} />}
                  </button>
               </div>
             ))
           )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminAssignmentPage;