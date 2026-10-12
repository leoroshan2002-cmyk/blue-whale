import React, { useEffect, useMemo, useState } from 'react';
import { Search, Printer, ChevronRight, MapPin, CreditCard, ChevronLeft, CheckCircle, Trash2 } from 'lucide-react';
import { resolveBackendImageUrl } from '../../services/api';

export const OrdersView = ({
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  currencySymbol
}) => {
  // STATE
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState({ status: 'Pending', courier: '', estimatedDelivery: '' });

  useEffect(() => {
    if (!selectedOrder) {
      setFormState({ status: 'Pending', courier: '', estimatedDelivery: '' });
      return;
    }

    setFormState({
      status: selectedOrder.status || 'Pending',
      courier: selectedOrder.courier || 'Not Assigned',
      estimatedDelivery: selectedOrder.estimatedDelivery ? new Date(selectedOrder.estimatedDelivery).toISOString().split('T')[0] : '',
    });
  }, [selectedOrder]);

  // SEARCH AND FILTER
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      const orderId = String(o.id || o.orderId || '').toLowerCase();
      const customerName = String(o.customerName || '').toLowerCase();
      const customerEmail = String(o.customerEmail || '').toLowerCase();
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch = orderId.includes(searchValue) ||
                            customerName.includes(searchValue) ||
                            customerEmail.includes(searchValue);
      const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // STATUS COLOR BADGES FOR CLASSIC BRAND LOOKS
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
      case 'Packed':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold';
      case 'Failed':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold';
      default:
        return 'bg-slate-500/10 text-slate-400';
    }
  };

  // ORDER EVENT STEPS FOR DIGITAL TIMELINE TRACKERS
  const orderSteps = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const handleSaveOrderUpdates = async (event) => {
    event.preventDefault();
    if (!selectedOrder) return;

    setIsSaving(true);
    try {
      const updatedOrder = await onUpdateOrderStatus?.(selectedOrder.id || selectedOrder.orderId, {
        status: formState.status,
        courier: formState.courier,
        estimatedDelivery: formState.estimatedDelivery || null,
      });

      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // PRINTING HANDLER
  const printInvoice = () => {
    const printContent = document.getElementById('printable-invoice-block');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    // Refresh to restore standard React nodes
    window.location.reload();
  };

  const resolveImageUrl = (image) => {
    if (!image || typeof image !== 'string') return '';

    return resolveBackendImageUrl(image);
  };

  return (
    <div className="space-y-6" id="orders-tab-panel">
      <div className="py-2.5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Orders</h2>
        <p className="text-xs text-slate-500 mt-1">Review the latest orders placed by customers.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders by ID, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:text-white"
          />
        </div>

        <div className="flex gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {selectedOrder ? (
        <div className="space-y-6 text-left animate-fade-in" id="order-detail-page">
          <div className="flex justify-between items-center pb-2">
            <button
              onClick={() => setSelectedOrder(null)}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 rounded-lg hover:bg-slate-50 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to List
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete order ${selectedOrder.id || selectedOrder.orderId}?`)) {
                  onDeleteOrder?.(selectedOrder.id || selectedOrder.orderId);
                  setSelectedOrder(null);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 font-bold"
            >
              <Trash2 className="w-4 h-4" />
              Delete Order
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Customer Details</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(selectedOrder.status || 'Pending')}`}>
                  {(selectedOrder.status || 'Pending').toUpperCase()}
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Name</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedOrder.customerName || 'Customer'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Email</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedOrder.customerEmail || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Phone</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedOrder.customerPhone || selectedOrder.customer?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Address</p>
                  <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {selectedOrder.customerAddressText || selectedOrder.customer?.address || [selectedOrder.shippingAddress?.street, selectedOrder.shippingAddress?.city, selectedOrder.shippingAddress?.state, selectedOrder.shippingAddress?.zip, selectedOrder.shippingAddress?.country].filter(Boolean).join(', ') || 'Address not available'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Order ID</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.id || selectedOrder.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'Live order'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.paymentMethod || 'Online Payment'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.paymentStatus || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.transactionId || selectedOrder.razorpayPaymentId || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Razorpay Order ID</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.razorpayOrderId || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Razorpay Payment ID</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.razorpayPaymentId || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{currencySymbol}{Number(selectedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Order Management</h3>
            <form onSubmit={handleSaveOrderUpdates} className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Status</span>
                <select
                  value={formState.status}
                  onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Courier</span>
                <input
                  type="text"
                  value={formState.courier}
                  onChange={(event) => setFormState((prev) => ({ ...prev, courier: event.target.value }))}
                  placeholder="Delhivery, Blue Dart, DTDC..."
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Estimated Delivery</span>
                <input
                  type="date"
                  value={formState.estimatedDelivery}
                  onChange={(event) => setFormState((prev) => ({ ...prev, estimatedDelivery: event.target.value }))}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </label>

              <div className="md:col-span-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-xs text-slate-500">Status changes are saved into the tracking history automatically.</p>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Tracking History</h3>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Live timeline</span>
            </div>
            {Array.isArray(selectedOrder.trackingHistory) && selectedOrder.trackingHistory.length > 0 ? (
              <div className="space-y-3">
                {selectedOrder.trackingHistory.map((entry, index) => (
                  <div key={`${entry.status}-${index}`} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{entry.status}</span>
                      <span className="text-[11px] text-slate-400">{entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : 'Just now'}</span>
                    </div>
                    {entry.note ? <p className="mt-2 text-xs text-slate-500">{entry.note}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No tracking history yet. Status changes will appear here.</p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Items Ordered</h3>
            <div className="divide-y divide-slate-150">
              {(selectedOrder.items || []).map((it, idx) => {
                const itemImage = resolveImageUrl(it.image || it.images?.[0] || it.productImage || it.imageUrl);
                return (
                  <div key={idx} className="flex justify-between items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {itemImage ? (
                        <img src={itemImage} alt={it.name} className="w-14 h-14 rounded-lg object-cover border border-slate-200" onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }} />
                      ) : (
                        <div className="w-14 h-14 rounded-lg border border-dashed border-slate-200 bg-slate-50" />
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{it.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">Qty: {it.quantity}</p>
                        {(it.color || it.selectedColor) && (
                          <p className="text-xs text-slate-500 mt-1">Color: {it.color || it.selectedColor}</p>
                        )}
                        {(it.size || it.selectedSize) && (
                          <p className="text-xs text-slate-500">Size: {it.size || it.selectedSize}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{currencySymbol}{Number(it.price || 0).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="py-4 px-4">Order Code</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-3">Date</th>
                  <th className="py-4 px-3">Items</th>
                  <th className="py-4 px-3">Total</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No active orders matched the requested status.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o, index) => (
                    <tr
                      key={`${o.id || 'order'}-${index}`}
                      onClick={() => setSelectedOrder(o)}
                      className="cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-all"
                    >
                      <td className="py-4 px-4 font-mono font-black text-slate-900 dark:text-white">{o.id || o.orderId}</td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          {o.customerAvatar ? (
                            <img src={o.customerAvatar} className="w-8 h-8 rounded-full object-cover shadow-inner" alt="" />
                          ) : (
                            <div aria-label="No profile image" className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-inner" />
                          )}
                          <div>
                            <span className="font-bold text-slate-950 dark:text-white block leading-none">{o.customerName}</span>
                            <span className="text-[10px] text-slate-400 mt-1 block max-w-[150px] truncate leading-none">{o.customerEmail}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-3 text-slate-400 font-medium">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Live order'}
                      </td>

                      <td className="py-4 px-3 font-semibold text-slate-500 dark:text-slate-400 max-w-[260px]">
                        <div className="flex flex-col gap-2">
                          {o.items.slice(0, 2).map((item, index) => {
                            const itemImage = resolveImageUrl(item.image || item.images?.[0] || item.productImage || item.imageUrl);
                            return (
                              <div key={`${o.id || 'order'}-item-${index}`} className="flex items-center gap-2">
                                {itemImage ? (
                                  <img src={itemImage} alt={item.name} className="w-8 h-8 rounded-md object-cover border border-slate-200" onError={(event) => {
                                    event.currentTarget.style.display = 'none';
                                  }} />
                                ) : null}
                                <span className="truncate">
                                  {item.name} × {item.quantity}
                                </span>
                              </div>
                            );
                          })}
                          {o.items.length > 2 && (
                            <span className="text-[10px] text-slate-400">+{o.items.length - 2} more</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-3 font-black text-slate-900 dark:text-white">
                        {currencySymbol}{Number(o.total || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(o.status)}`}>
                          {o.status || 'Pending'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="p-1 px-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs inline-flex items-center gap-1"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedOrder(o);
                            }}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            type="button"
                            className="p-1 px-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded text-xs inline-flex items-center gap-1"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (window.confirm(`Delete order ${o.id || o.orderId}?`)) {
                                onDeleteOrder?.(o.id || o.orderId);
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
