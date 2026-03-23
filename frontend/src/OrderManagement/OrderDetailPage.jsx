import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import Layout from '../components/layout/Layout';
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock, CheckCircle2 } from 'lucide-react';

const STATUS_OPTIONS = [
  'pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled',
];

const STATUS_COLORS = {
  pending:          'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed:        'bg-blue-100 text-blue-700 border-blue-200',
  processing:       'bg-indigo-100 text-indigo-700 border-indigo-200',
  ready:            'bg-purple-100 text-purple-700 border-purple-200',
  out_for_delivery: 'bg-orange-100 text-orange-700 border-orange-200',
  delivered:        'bg-green-100 text-green-700 border-green-200',
  cancelled:        'bg-red-100 text-red-700 border-red-200',
};

const TIMELINE_STEPS = ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await orderApi.getOrderById(id);
        setOrder(res.data.data);
        setNewStatus(res.data.data.status);
      } catch (err) {
        setError('Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleUpdateStatus = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await orderApi.updateStatus(id, newStatus, adminNotes);
      setOrder(res.data.data);
      setAdminNotes('');
      setSuccess('Order status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Order Details">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout title="Order Details">
        <div className="card p-8 text-center text-slate-500">{error || 'Order not found'}</div>
      </Layout>
    );
  }

  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);

  return (
    <Layout
      title={`Order #${order.orderId?.slice(-8).toUpperCase()}`}
      subtitle={`Placed on ${new Date(order.createdAt).toLocaleString()}`}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Orders
      </button>

      {/* Status timeline */}
      {order.status !== 'cancelled' && (
        <div className="card p-5 mb-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary-600" /> Order Progress
          </h3>
          <div className="flex items-center gap-0 overflow-x-auto pb-1">
            {TIMELINE_STEPS.map((step, idx) => {
              const done    = idx <= currentStepIndex;
              const current = idx === currentStepIndex;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                      ${done ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-400'}
                      ${current ? 'ring-4 ring-primary-100' : ''}`}>
                      {done ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[10px] mt-1 text-center leading-tight capitalize font-medium
                      ${done ? 'text-primary-600' : 'text-slate-400'}`}>
                      {step.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 min-w-[20px] transition-colors ${idx < currentStepIndex ? 'bg-primary-400' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — order info */}
        <div className="lg:col-span-2 space-y-5">

          {/* Items */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Package size={16} className="text-primary-600" /> Order Items
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-sm">🛒</div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">{item.name}</div>
                      <div className="text-xs text-slate-400">Qty: {item.qty}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-slate-800">${(item.price * item.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-600">Total</span>
              <span className="text-lg font-bold text-primary-600">${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer info */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <User size={16} className="text-primary-600" /> Customer Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Name"   value={order.customerName} />
              <InfoRow label="Email"  value={order.customerEmail} />
              <InfoRow label="Phone"  value={order.customerPhone || '—'} />
              <InfoRow label="Customer ID" value={order.customerId?.slice(-8)} />
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-primary-600" /> Shipping Address
              </h3>
              <p className="text-sm text-slate-600">
                {[order.shippingAddress.street, order.shippingAddress.city,
                  order.shippingAddress.state, order.shippingAddress.zip,
                  order.shippingAddress.country].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          {/* Status history */}
          {order.statusHistory?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-primary-600" /> Status History
              </h3>
              <div className="space-y-3">
                {[...order.statusHistory].reverse().map((h, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold capitalize text-slate-700">{h.status?.replace(/_/g, ' ')}</span>
                      <span className="text-slate-400 mx-2">·</span>
                      <span className="text-slate-400 text-xs">{new Date(h.changedAt).toLocaleString()}</span>
                      {h.changedBy && <span className="text-slate-400 text-xs"> · by {h.changedBy}</span>}
                      {h.note && <p className="text-xs text-slate-500 mt-0.5">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — actions + payment */}
        <div className="space-y-5">
          {/* Payment */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-primary-600" /> Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-medium text-slate-700 capitalize">{order.paymentMethod || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                  ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                    order.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-800">${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Update Order Status</h3>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Current Status
              </label>
              <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold capitalize border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {order.status?.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-primary-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Admin Notes (optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Add a note about this status change…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-primary-400 resize-none"
              />
            </div>

            {error   && <p className="text-red-500 text-xs mb-3">{error}</p>}
            {success && <p className="text-emerald-600 text-xs mb-3">{success}</p>}

            <button
              onClick={handleUpdateStatus}
              disabled={saving || newStatus === order.status}
              className="w-full btn btn-primary py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Updating…' : 'Update Status'}
            </button>
          </div>

          {/* Notes */}
          {(order.notes || order.adminNotes) && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-700 mb-3">Notes</h3>
              {order.notes && (
                <div className="mb-2 text-sm">
                  <span className="text-slate-400 text-xs font-semibold uppercase">Customer note</span>
                  <p className="text-slate-600 mt-0.5">{order.notes}</p>
                </div>
              )}
              {order.adminNotes && (
                <div className="text-sm">
                  <span className="text-slate-400 text-xs font-semibold uppercase">Admin note</span>
                  <p className="text-slate-600 mt-0.5">{order.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</div>
      <div className="text-slate-700 font-medium mt-0.5">{value || '—'}</div>
    </div>
  );
}
