import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaSearch, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaReceipt, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaCopy, 
  FaCheck, 
  FaTimes, 
  FaBoxOpen, 
  FaShippingFast 
} from 'react-icons/fa';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [editedOrder, setEditedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('รอดำเนินการ');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAccept, setLoadingAccept] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [statusCount, setStatusCount] = useState({});
  const [copiedTracking, setCopiedTracking] = useState(null);

  const token = localStorage.getItem('token');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://ecom-api2-df4u.onrender.com/auth/getorderadmin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedOrders = response.data.sort((a, b) => new Date(b.order.date) - new Date(a.order.date));
      setOrders(sortedOrders);
      countOrderStatus(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const countOrderStatus = (allOrders) => {
    const count = allOrders.reduce((acc, o) => {
      const status = o.order.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    setStatusCount(count);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }) + ' • ' + date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleOpenDetails = (address) => setSelectedOrder(address);
  const handleCloseDetails = () => setSelectedOrder(null);
  const handleOpenSlip = (slip) => setSelectedSlip(slip);
  const handleCloseSlip = () => setSelectedSlip(null);

  const handleStatusChange = async (orderId, newStatus) => {
    setLoadingAccept(orderId);
    try {
      const response = await axios.put(
        `https://ecom-api2-df4u.onrender.com/auth/updateorderstatus`,
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setOrders(prevOrders => {
          const updated = prevOrders.map(order =>
            order.orderId === orderId ? { ...order, order: { ...order.order, status: newStatus } } : order
          );
          countOrderStatus(updated);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setLoadingAccept(null);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    await handleStatusChange(orderId, 'กำลังเตรียมจัดส่ง');
  };

  const handleShippingUpdate = (orderId, currentCompany = '', currentTracking = '') => {
    setEditedOrder({
      orderId,
      shippingCompany: currentCompany || 'Kerry Express',
      trackingNumber: currentTracking || ''
    });
  };

  const confirmShippingUpdate = async () => {
    if (!editedOrder || !editedOrder.shippingCompany || !editedOrder.trackingNumber) {
      alert('กรุณากรอกบริษัทขนส่งและเลขพัสดุ');
      return;
    }

    setLoadingShipping(true);
    try {
      const response = await axios.put(
        `https://ecom-api2-df4u.onrender.com/auth/updateshipping`,
        {
          orderId: editedOrder.orderId,
          shippingCompany: editedOrder.shippingCompany,
          trackingNumber: editedOrder.trackingNumber,
          status: 'กำลังจัดส่ง'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setOrders(prevOrders => {
          const updated = prevOrders.map(order =>
            order.orderId === editedOrder.orderId
              ? {
                ...order,
                order: {
                  ...order.order,
                  shippingCompany: editedOrder.shippingCompany,
                  trackingNumber: editedOrder.trackingNumber,
                  status: 'กำลังจัดส่ง'
                }
              }
              : order
          );
          countOrderStatus(updated);
          return updated;
        });
        setEditedOrder(null);
      }
    } catch (error) {
      console.error('Error updating shipping information:', error);
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason('สินค้าหมดชั่วคราว');
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setCancelModalOpen(false);
    setCancelReason('');
    setOrderToCancel(null);
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('กรุณาระบุเหตุผลการยกเลิก');
      return;
    }

    setLoadingCancel(true);
    try {
      await axios.put(
        'https://ecom-api2-df4u.onrender.com/auth/cancel',
        {
          orderId: orderToCancel.orderId,
          status: 'ยกเลิกโดยทางร้าน',
          cancel: cancelReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(prevOrders => {
        const updated = prevOrders.map(o =>
          o.orderId === orderToCancel.orderId
            ? { ...o, order: { ...o.order, status: 'ยกเลิกโดยทางร้าน', cancel: cancelReason } }
            : o
        );
        countOrderStatus(updated);
        return updated;
      });
      handleCloseCancelModal();
    } catch (error) {
      console.error('Error canceling order:', error);
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleCopyTracking = (tracking) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTracking(tracking);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  // Filter orders by active tab AND search term
  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'ทั้งหมด' || order.order.status === activeTab;
    if (!matchesTab) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();

    const orderIdMatch = String(order.orderId).includes(term);
    const nameMatch = `${order.address?.name || ''} ${order.address?.lastname || ''}`.toLowerCase().includes(term);
    const phoneMatch = String(order.address?.phone || '').includes(term);
    const trackingMatch = String(order.order.trackingNumber || '').toLowerCase().includes(term);
    const productMatch = order.order.ordercart?.some(c => c.product?.ItemName?.toLowerCase().includes(term));

    return orderIdMatch || nameMatch || phoneMatch || trackingMatch || productMatch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'จัดส่งสำเร็จ':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {status}
          </span>
        );
      case 'กำลังจัดส่ง':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            {status}
          </span>
        );
      case 'กำลังเตรียมจัดส่ง':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-[#0071e3] border border-blue-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></span>
            {status}
          </span>
        );
      case 'รอดำเนินการ':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-[#ff3b30] border border-red-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]"></span>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 fade-in-page max-w-6xl">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            รายการสั่งซื้อทั้งหมด
          </h1>
          <p className="text-sm text-[#86868b] mt-1">
            ติดตาม ตรวจสอบ และอัปเดตสถานะการจัดส่งสินค้าให้ลูกค้า
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-[#f5f5f7] border border-black/[0.08] text-xs font-medium text-[#1d1d1f] rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition-all flex items-center gap-2"
        >
          <span className={loading ? 'animate-spin' : ''}>↻</span>
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Search Bar and Segmented Filter Bar */}
      <div className="space-y-4">
        {/* Apple Pill Search */}
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] text-xs pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหา Order ID, ชื่อลูกค้า, เบอร์โทร, หรือเลขพัสดุ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:border-[#0071e3] focus:outline-none rounded-full pl-10 pr-10 py-2.5 text-sm text-[#1d1d1f] placeholder-[#86868b] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] text-xs w-5 h-5 rounded-full bg-black/5 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>

        {/* Apple-style Segmented Control Tabs */}
        <div className="overflow-x-auto pb-1">
          <div className="bg-[#e8e8ed]/80 backdrop-blur-sm p-1 rounded-full inline-flex gap-1 border border-black/[0.04]">
            {['ทั้งหมด', 'รอดำเนินการ', 'กำลังเตรียมจัดส่ง', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ', 'ยกเลิกโดยทางร้าน', 'ยกเลิกแล้ว'].map(status => {
              const count = status === 'ทั้งหมด' ? orders.length : (statusCount[status] || 0);
              const active = activeTab === status;
              return (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-white text-[#1d1d1f] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                      : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  <span>{status}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-[#0071e3] text-white' : 'bg-black/10 text-[#1d1d1f]'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-black/[0.06]">
          <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-[#86868b]">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-black/[0.06] shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto text-[#86868b]">
            <FaBoxOpen className="text-2xl" />
          </div>
          <h3 className="text-base font-semibold text-[#1d1d1f]">ไม่พบคำสั่งซื้อ</h3>
          <p className="text-xs text-[#86868b] max-w-sm mx-auto">
            {searchTerm 
              ? `ไม่พบผลลัพธ์ที่ตรงกับ "${searchTerm}" ในสถานะ "${activeTab}"`
              : `ขณะนี้ไม่มีรายการคำสั่งซื้อในสถานะ "${activeTab}"`
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 px-4 py-1.5 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium text-[#0071e3] rounded-full transition-colors"
            >
              ล้างการค้นหา
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const totalOrderPrice = order.order.ordercart.reduce(
              (sum, cartItem) => sum + cartItem.price, 0
            );

            return (
              <div
                key={order.orderId}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 space-y-5"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.04]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-base text-[#1d1d1f]">
                      Order #{order.orderId}
                    </span>
                    {getStatusBadge(order.order.status)}
                    <span className="px-3 py-1 bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium rounded-full">
                      ชำระ: {order.pay}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {order.slip && (
                      <button
                        onClick={() => handleOpenSlip(order.slip)}
                        className="px-3.5 py-1.5 bg-[#f5f5f7] hover:bg-blue-50 text-xs font-medium text-[#0071e3] rounded-full transition-colors flex items-center gap-1.5"
                      >
                        <FaReceipt className="text-[11px]" />
                        <span>สลิปโอนเงิน</span>
                      </button>
                    )}
                    {order.address && (
                      <button
                        onClick={() => handleOpenDetails(order.address)}
                        className="px-3.5 py-1.5 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium text-[#1d1d1f] rounded-full transition-colors flex items-center gap-1.5"
                      >
                        <FaMapMarkerAlt className="text-[11px] text-[#86868b]" />
                        <span>ที่อยู่จัดส่ง</span>
                      </button>
                    )}
                    <span className="text-xs text-[#86868b] ml-1">
                      {formatDate(order.order.date)}
                    </span>
                  </div>
                </div>

                {/* Recipient & Shipping Tracking Row */}
                {order.address && (
                  <div className="bg-[#fbfbfd] rounded-2xl p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-black/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-semibold text-xs flex-shrink-0">
                        {order.address.name ? order.address.name.charAt(0) : 'U'}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-[#1d1d1f]">
                          {order.address.name} {order.address.lastname}
                        </span>
                        <a
                          href={`tel:${order.address.phone}`}
                          className="text-[#86868b] hover:text-[#0071e3] ml-2 transition-colors"
                        >
                          ({order.address.phone})
                        </a>
                      </div>
                    </div>

                    {order.order.shippingCompany && (
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="px-2.5 py-0.5 bg-white border border-black/[0.06] rounded-full text-[#1d1d1f] font-medium flex items-center gap-1.5">
                          <FaTruck className="text-[#0071e3] text-[10px]" />
                          <span>{order.order.shippingCompany}</span>
                        </span>
                        <button
                          onClick={() => handleCopyTracking(order.order.trackingNumber)}
                          className="px-2.5 py-0.5 bg-white border border-black/[0.06] hover:border-[#0071e3] rounded-full text-[#0071e3] font-mono font-medium flex items-center gap-1.5 transition-colors"
                          title="คลิกเพื่อคัดลอกเลขพัสดุ"
                        >
                          <span>{order.order.trackingNumber}</span>
                          {copiedTracking === order.order.trackingNumber ? (
                            <FaCheck className="text-[10px] text-[#34c759]" />
                          ) : (
                            <FaCopy className="text-[10px] text-[#86868b]" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Cancel Reason Alert (If cancelled) */}
                {order.order.status.includes('ยกเลิก') && order.order.cancel && (
                  <div className="bg-red-50/70 border border-red-100 rounded-2xl p-3.5 text-xs text-[#ff3b30] flex items-start gap-2">
                    <FaTimesCircle className="mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>เหตุผลการยกเลิก:</strong> {order.order.cancel}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="divide-y divide-black/[0.04]">
                  {order.order.ordercart.map((cartItem) => (
                    <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0" key={cartItem.id}>
                      <div className="w-14 h-14 bg-white rounded-2xl p-1.5 flex items-center justify-center flex-shrink-0 border border-black/[0.06]">
                        <img
                          src={cartItem.product.file}
                          alt={cartItem.product.ItemName}
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#1d1d1f] truncate">
                          {cartItem.product.ItemName}
                        </h4>
                        <p className="text-xs text-[#86868b] mt-0.5">
                          จำนวน: <strong className="text-[#1d1d1f]">{cartItem.total}</strong> ชิ้น • ชิ้นละ ฿{(cartItem.price / cartItem.total).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-[#1d1d1f]">
                        ฿{cartItem.price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-black/[0.04]">
                  <div>
                    <span className="text-xs text-[#86868b] mr-2">ราคารวมทั้งสิ้น:</span>
                    <span className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                      ฿{totalOrderPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {order.order.status === 'รอดำเนินการ' && (
                      <>
                        <button
                          onClick={() => handleAcceptOrder(order.orderId)}
                          disabled={loadingAccept === order.orderId}
                          className="px-5 py-2.5 bg-[#34c759] hover:bg-[#30b350] active:scale-[0.98] text-white text-xs font-medium rounded-full shadow-[0_2px_8px_rgba(52,199,89,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-75"
                        >
                          <FaCheck className="text-[10px]" />
                          <span>{loadingAccept === order.orderId ? 'กำลังรับ...' : 'รับคำสั่งซื้อ'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenCancelModal(order)}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-[#ff3b30] text-xs font-medium rounded-full transition-colors flex items-center gap-1.5"
                        >
                          <FaTimes className="text-[10px]" />
                          <span>ยกเลิกคำสั่งซื้อ</span>
                        </button>
                      </>
                    )}

                    {order.order.status === 'กำลังเตรียมจัดส่ง' && (
                      <button
                        onClick={() => handleShippingUpdate(order.orderId, order.order.shippingCompany, order.order.trackingNumber)}
                        className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-xs font-medium rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.3)] transition-all flex items-center gap-1.5"
                      >
                        <FaTruck className="text-[11px]" />
                        <span>อัปเดตข้อมูลการจัดส่ง</span>
                      </button>
                    )}

                    {order.order.status === 'กำลังจัดส่ง' && (
                      <button
                        onClick={() => handleShippingUpdate(order.orderId, order.order.shippingCompany, order.order.trackingNumber)}
                        className="px-4 py-2 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium text-[#1d1d1f] rounded-full transition-colors flex items-center gap-1.5"
                      >
                        <span>แก้ไขเลขพัสดุ</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shipping Update Modal */}
      {editedOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setEditedOrder(null)}
        >
          <div 
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-black/[0.06] max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1d1d1f]">
                ข้อมูลการจัดส่ง (Order #{editedOrder.orderId})
              </h3>
              <button
                onClick={() => setEditedOrder(null)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                เลือกบริษัทจัดส่ง
              </label>
              <select
                value={editedOrder.shippingCompany}
                onChange={(e) => setEditedOrder({ ...editedOrder, shippingCompany: e.target.value })}
                className="w-full bg-[#f5f5f7] border-0 rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] mb-2"
              >
                <option value="Kerry Express">Kerry Express</option>
                <option value="Flash Express">Flash Express</option>
                <option value="J&T Express">J&T Express</option>
                <option value="ไปรษณีย์ไทย (EMS)">ไปรษณีย์ไทย (EMS)</option>
                <option value="Shopee Xpress">Shopee Xpress</option>
                <option value="Ninja Van">Ninja Van</option>
                <option value="DHL eCommerce">DHL eCommerce</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>

              {editedOrder.shippingCompany === 'อื่นๆ' && (
                <input
                  type="text"
                  placeholder="ระบุชื่อบริษัทขนส่ง..."
                  onChange={(e) => setEditedOrder({ ...editedOrder, shippingCompany: e.target.value })}
                  className="w-full bg-[#f5f5f7] border-0 rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                หมายเลขติดตามพัสดุ (Tracking Number)
              </label>
              <input
                type="text"
                placeholder="เช่น TH1234567890"
                value={editedOrder.trackingNumber}
                onChange={(e) => setEditedOrder({ ...editedOrder, trackingNumber: e.target.value })}
                className="w-full bg-[#f5f5f7] border-0 rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setEditedOrder(null)}
                className="px-4 py-2 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium rounded-full transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmShippingUpdate}
                disabled={loadingShipping}
                className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium rounded-full shadow-sm transition-all flex items-center gap-1.5"
              >
                <FaTruck className="text-[10px]" />
                <span>{loadingShipping ? 'กำลังบันทึก...' : 'ยืนยันและเริ่มจัดส่ง'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Details Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={handleCloseDetails}
        >
          <div
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-black/[0.06] max-w-lg w-full space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#1d1d1f]">รายละเอียดที่อยู่จัดส่ง</h2>
              <button
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
                onClick={handleCloseDetails}
              >
                ×
              </button>
            </div>

            <div className="bg-[#f5f5f7] rounded-2xl p-5 space-y-2.5 text-sm text-[#1d1d1f]">
              <div className="flex items-center gap-2 pb-2 border-b border-black/[0.05]">
                <FaPhoneAlt className="text-xs text-[#0071e3]" />
                <span>ผู้รับ: <strong>{selectedOrder.name} {selectedOrder.lastname}</strong></span>
                <span className="text-[#86868b]">({selectedOrder.phone})</span>
              </div>
              <p><strong>ที่อยู่:</strong> บ้านเลขที่ {selectedOrder.housenumber} {selectedOrder.village ? `หมู่ ${selectedOrder.village}` : ''}</p>
              <p><strong>ตำบล/แขวง:</strong> {selectedOrder.tambon}</p>
              <p><strong>อำเภอ/เขต:</strong> {selectedOrder.district}</p>
              <p><strong>จังหวัด:</strong> {selectedOrder.province}</p>
              <p><strong>รหัสไปรษณีย์:</strong> {selectedOrder.zipcode}</p>
              {selectedOrder.other && (
                <p className="pt-2 border-t border-black/[0.05] text-xs text-[#86868b]">
                  <strong>หมายเหตุเพิ่มเติม:</strong> {selectedOrder.other}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  const fullAddress = `${selectedOrder.name} ${selectedOrder.lastname} (${selectedOrder.phone}) บ้านเลขที่ ${selectedOrder.housenumber} ${selectedOrder.village ? `หมู่ ${selectedOrder.village}` : ''} ต.${selectedOrder.tambon} อ.${selectedOrder.district} จ.${selectedOrder.province} ${selectedOrder.zipcode}`;
                  navigator.clipboard.writeText(fullAddress);
                  alert('คัดลอกที่อยู่เรียบร้อยแล้ว');
                }}
                className="px-4 py-2 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium text-[#1d1d1f] rounded-full transition-colors flex items-center gap-1.5"
              >
                <FaCopy className="text-[10px]" />
                <span>คัดลอกที่อยู่ทั้งหมด</span>
              </button>
              <button
                onClick={handleCloseDetails}
                className="px-5 py-2 bg-[#0071e3] text-white text-xs font-medium rounded-full"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Slip Modal */}
      {selectedSlip && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={handleCloseSlip}
        >
          <div
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-black/[0.06] max-w-md w-full space-y-4 relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-left">
              <h2 className="text-lg font-semibold text-[#1d1d1f]">หลักฐานการโอนเงิน (Slip)</h2>
              <button
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
                onClick={handleCloseSlip}
              >
                ×
              </button>
            </div>

            <div className="bg-[#f5f5f7] rounded-2xl p-2 max-h-[60vh] overflow-hidden flex items-center justify-center">
              <img
                src={selectedSlip}
                alt="Slip"
                className="max-h-[55vh] max-w-full object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-between items-center pt-1">
              <a
                href={selectedSlip}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#0071e3] hover:underline"
              >
                เปิดดูภาพขนาดเต็ม ↗
              </a>
              <button
                onClick={handleCloseSlip}
                className="px-5 py-2 bg-[#0071e3] text-white text-xs font-medium rounded-full"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={handleCloseCancelModal}
        >
          <div
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-black/[0.06] max-w-md w-full space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1d1d1f]">ยกเลิกคำสั่งซื้อ #{orderToCancel?.orderId}</h2>
              <button
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
                onClick={handleCloseCancelModal}
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#1d1d1f]">เลือกสาเหตุการยกเลิก</label>
              <div className="space-y-1.5">
                {[
                  'สินค้าหมดชั่วคราว',
                  'ยอดชำระเงินไม่ถูกต้อง / สลิปไม่ผ่าน',
                  'ลูกค้าติดต่อขอยกเลิกคำสั่งซื้อ',
                  'ไม่สามารถจัดส่งไปยังปลายทางได้',
                  'อื่นๆ'
                ].map(reason => (
                  <label key={reason} className="flex items-center gap-2 text-xs text-[#1d1d1f] p-2 rounded-xl hover:bg-[#f5f5f7] cursor-pointer">
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={reason}
                      checked={cancelReason === reason || (reason === 'อื่นๆ' && !['สินค้าหมดชั่วคราว', 'ยอดชำระเงินไม่ถูกต้อง / สลิปไม่ผ่าน', 'ลูกค้าติดต่อขอยกเลิกคำสั่งซื้อ', 'ไม่สามารถจัดส่งไปยังปลายทางได้'].includes(cancelReason))}
                      onChange={() => setCancelReason(reason === 'อื่นๆ' ? '' : reason)}
                      className="text-[#0071e3] focus:ring-[#0071e3]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-[#f5f5f7] border-0 rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-[#ff3b30] focus:outline-none"
              rows={3}
              placeholder="ระบุรายละเอียดเพิ่มเติมสำหรับการยกเลิก..."
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCloseCancelModal}
                className="px-4 py-2 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium rounded-full transition-colors"
              >
                ปิด
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={loadingCancel}
                className="px-5 py-2 bg-[#ff3b30] hover:bg-red-600 text-white text-xs font-medium rounded-full shadow-sm transition-all flex items-center gap-1.5"
              >
                <FaTimes className="text-[10px]" />
                <span>{loadingCancel ? 'กำลังยกเลิก...' : 'ยืนยันการยกเลิก'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;