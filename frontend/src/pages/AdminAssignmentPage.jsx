import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import { PageHeader, Card, Spinner, Badge, Table } from '../components/common'
import { deliveryApi, driverApi, assignmentApi } from '../api/deliveryApi'
import { orderApi } from '../api/orderApi'
import { MapPin, Navigation, User, Clock, CheckCircle, XCircle, ChevronRight, AlertCircle, ShoppingBag, Truck, Store } from 'lucide-react'
import Layout from '../components/layout/Layout'
import L from 'leaflet'
import { toast } from 'sonner'
import React from 'react'

// Constants
const STORE_LOCATION = { lat: 6.9195, lng: 79.8812, name: 'RapidCart Store (Borella)' }
const TRANSPORT_RATE_PER_KM = 50 // LKR

// Custom marker icons
const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', 
  iconSize: [35, 35], iconAnchor: [17, 35], popupAnchor: [0, -35]
})
const driverOnlineIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png', 
  iconSize: [35, 35], iconAnchor: [17, 35], popupAnchor: [0, -35]
})
const driverBusyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/128/3126/3126131.png', 
  iconSize: [35, 35], iconAnchor: [17, 35], popupAnchor: [0, -35]
})
const storeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/869/869636.png', 
  iconSize: [45, 45], iconAnchor: [22, 45], popupAnchor: [0, -45]
})

// Auto-centering component
function ChangeView({ center, zoom }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

export default function AdminAssignmentPage() {
  const [orders, setOrders] = useState([])
  const [drivers, setDrivers] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [mapConfig, setMapConfig] = useState({ center: [STORE_LOCATION.lat, STORE_LOCATION.lng], zoom: 13 })

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 15000) 
    return () => clearInterval(timer)
  }, [])

  const fetchData = async () => {
    try {
      const oRes = await orderApi.getAllOrders({ status: 'ready', sort: 'createdAt:1' })
      setOrders(oRes.data.data.filter(o => o.status === 'ready'))
      const dRes = await driverApi.getAvailableDrivers()
      setDrivers(dRes.data || [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOrder = (order) => {
    setSelectedOrder(order)
    if (order.shippingAddress?.latitude && order.shippingAddress?.longitude) {
      setMapConfig({
        center: [order.shippingAddress.latitude, order.shippingAddress.longitude],
        zoom: 14
      })
    }
  }

  const handleAssign = async (driverId) => {
    if (!selectedOrder) return
    setAssigning(true)
    try {
      await assignmentApi.assignOrder(selectedOrder.orderId, driverId)
      toast.success('Assignment request sent to driver!')
      setSelectedOrder(null)
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  const getDistanceNum = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0
    const R = 6371 
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const formatDist = (d) => d === 0 ? 'N/A' : d.toFixed(2) + ' km'

  if (loading) return <Layout title="Delivery Dashboard"><Spinner /></Layout>

  return (
    <Layout title="Logistics Control" subtitle="Dispatch Hub • Borella Main Branch">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        
        {/* Left Col: Order Queue */}
        <div className="xl:col-span-1 flex flex-col gap-4 overflow-hidden">
          <div className="card h-full flex flex-col border-none shadow-xl shadow-slate-200/50">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-[1.5rem]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Order Queue</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">First In, First Out</p>
                </div>
              </div>
              <Badge type="active" label={`${orders.length} Ready`} />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {orders.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Clock className="mx-auto text-slate-300 mb-2" size={40} />
                  <p className="text-sm text-slate-500 font-bold">Queue is empty</p>
                </div>
              ) : (
                orders.map(order => (
                  <div 
                    key={order._id}
                    onClick={() => handleSelectOrder(order)}
                    className={`p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer group
                      ${selectedOrder?._id === order._id 
                        ? 'border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/10 shadow-lg' 
                        : 'border-slate-50 bg-white hover:border-emerald-200 hover:shadow-md'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">ID: {order.orderId.slice(-6)}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(order.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-black text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{order.customerName}</div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mb-3">
                      <MapPin size={14} className="text-slate-300" /> {order.shippingAddress?.street || 'Local Delivery'}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                       <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Amount</span>
                          <span className="text-sm font-black text-slate-800 italic">LKR {order.totalAmount?.toFixed(2)}</span>
                       </div>
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedOrder?._id === order._id ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300'}`}>
                          <ChevronRight size={18} />
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Map & Details */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="card flex-1 relative min-h-[450px] overflow-hidden rounded-[2rem] border-none shadow-2xl shadow-slate-200/50">
            <MapContainer center={mapConfig.center} zoom={mapConfig.zoom} style={{ height: '100%', width: '100%', zIndex: 10 }}>
              <ChangeView center={mapConfig.center} zoom={mapConfig.zoom} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {/* Main Branch - Borella */}
              <Marker position={[STORE_LOCATION.lat, STORE_LOCATION.lng]} icon={storeIcon}>
                <Popup>
                   <div className="p-2">
                      <div className="font-black text-emerald-700 text-sm">{STORE_LOCATION.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Operational Hub</div>
                   </div>
                </Popup>
              </Marker>

              {/* Customer Marker */}
              {selectedOrder?.shippingAddress?.latitude && (
                <Marker position={[selectedOrder.shippingAddress.latitude, selectedOrder.shippingAddress.longitude]} icon={customerIcon}>
                  <Popup>
                    <div className="p-1">
                      <div className="font-bold text-emerald-700">Customer: {selectedOrder.customerName}</div>
                      <div className="text-[10px] font-bold text-slate-500 italic uppercase">Delivery Point</div>
                    </div>
                  </Popup>
                  <Circle 
                    center={[selectedOrder.shippingAddress.latitude, selectedOrder.shippingAddress.longitude]} 
                    radius={1500} 
                    pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }}
                  />
                </Marker>
              )}

              {/* Driver Markers */}
              {drivers.map(driver => (
                driver.currentLocation?.latitude && (
                  <Marker 
                    key={driver._id} 
                    position={[driver.currentLocation.latitude, driver.currentLocation.longitude]}
                    icon={driver.isAvailable ? driverOnlineIcon : driverBusyIcon}
                  >
                    <Popup>
                      <div className="p-1 space-y-2 min-w-[150px]">
                        <div className="font-black text-slate-800">{driver.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{driver.vehicleType} • {driver.licensePlate}</div>
                        
                        <div className="bg-slate-50 p-2 rounded-lg space-y-1">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] text-slate-400 font-bold">To Store</span>
                              <span className="text-xs font-black text-emerald-600">
                                 {formatDist(getDistanceNum(STORE_LOCATION.lat, STORE_LOCATION.lng, driver.currentLocation.latitude, driver.currentLocation.longitude))}
                              </span>
                           </div>
                           {selectedOrder && (
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold">To Drop</span>
                                <span className="text-xs font-black text-blue-600">
                                   {formatDist(getDistanceNum(selectedOrder.shippingAddress.latitude, selectedOrder.shippingAddress.longitude, driver.currentLocation.latitude, driver.currentLocation.longitude))}
                                </span>
                             </div>
                           )}
                        </div>

                        {driver.isAvailable && selectedOrder && (
                          <button 
                            onClick={() => handleAssign(driver._id)}
                            className="w-full bg-emerald-600 text-white text-[10px] font-black py-2 rounded-xl uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                          >
                            Assign Pilot
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
            
            {/* Legend / Overlay */}
            <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-slate-100 flex flex-col gap-3">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">RapidCart Store</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Idle Rider</span>
               </div>
            </div>
          </div>

          {/* Near Driver List Table */}
          <div className="card h-1/3 flex flex-col border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-[2rem]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Nearby Riders</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Ready for Dispatch</p>
                </div>
              </div>
              <Badge type="info" label={`${drivers.length} Active Pilots`} className="bg-blue-50 text-blue-600 border-none" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
               <Table headers={['Pilot Info', 'Distance to Store', 'Delivery Charge', 'Rider Pay', 'Action']} compact>
                 {drivers.map(driver => {
                    const distToStore = getDistanceNum(STORE_LOCATION.lat, STORE_LOCATION.lng, driver.currentLocation?.latitude, driver.currentLocation?.longitude)
                    const distToCust = selectedOrder ? getDistanceNum(selectedOrder.shippingAddress?.latitude, selectedOrder.shippingAddress?.longitude, STORE_LOCATION.lat, STORE_LOCATION.lng) : 0
                    
                    const totalTripDist = distToStore + distToCust
                    const transportCharge = totalTripDist * TRANSPORT_RATE_PER_KM
                    const riderPay = transportCharge * 0.8 // 80% to rider
                    
                    return (
                      <tr key={driver._id} className="hover:bg-slate-50/50 group transition-colors">
                        <td className="table-cell py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all">
                              {driver.name[0]}
                            </div>
                            <div>
                               <div className="text-xs font-black text-slate-800">{driver.name}</div>
                               <div className="text-[10px] text-slate-400 font-bold uppercase italic">{driver.vehicleType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell py-4 text-xs font-black text-slate-600 italic">
                           {formatDist(distToStore)}
                        </td>
                        <td className="table-cell py-4">
                           <div className="text-xs font-black text-slate-800">LKR {transportCharge.toFixed(2)}</div>
                           <div className="text-[10px] text-slate-400 font-bold uppercase">Est. Cost</div>
                        </td>
                        <td className="table-cell py-4">
                           <div className="text-xs font-black text-emerald-600 italic">LKR {riderPay.toFixed(2)}</div>
                           <div className="text-[10px] text-slate-400 font-bold uppercase">Comission</div>
                        </td>
                        <td className="table-cell py-4 text-right">
                          <button 
                             disabled={!driver.isAvailable || !selectedOrder || assigning}
                             onClick={() => handleAssign(driver._id)}
                             className="bg-[#0d1f12] text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-20 transition-all active:scale-95 shadow-lg shadow-emerald-950/20"
                          >
                            {assigning && selectedOrder?._id === order?._id ? <Spinner size="xs" /> : 'Dispatch'}
                          </button>
                        </td>
                      </tr>
                    )
                 })}
                 {drivers.length === 0 && (
                   <tr>
                     <td colSpan="5" className="p-12 text-center bg-slate-50/30 italic text-slate-400 text-xs font-bold uppercase">No Pilots Tracking</td>
                   </tr>
                 )}
               </Table>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .leaflet-container { border-radius: 2rem; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.05); border: 4px solid white; }
      `}</style>
    </Layout>
  )
}