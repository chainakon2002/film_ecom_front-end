import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  FaReceipt, 
  FaClock, 
  FaTruck, 
  FaCheckCircle, 
  FaBoxOpen, 
  FaHome, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaTimes, 
  FaCopy, 
  FaCheck, 
  FaExternalLinkAlt, 
  FaSearch, 
  FaInfoCircle,
  FaShieldAlt,
  FaShoppingBag
} from 'react-icons/fa';
import './Productpict.css';

const Productpict = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('รอดำเนินการ');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTracking, setCopiedTracking] = useState(null);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [statusModalOrder, setStatusModalOrder] = useState(null);

  const statusList = [
    'รอดำเนินการ',
    'กำลังเตรียมจัดส่ง',
    'กำลังจัดส่ง',
    'จัดส่งสำเร็จ',
    'ยกเลิกแล้ว',
    'ยกเลิกโดยทางร้าน'
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get('https://ecom-api2-df4u.onrender.com/payment/paymentuser', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderData = Array.isArray(response.data) ? response.data : [];
      const sorted = orderData.sort((a, b) => new Date(b.order?.date || 0) - new Date(a.order?.date || 0));
      setOrders(sorted);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = {
      'รอดำเนินการ': 0,
      'กำลังเตรียมจัดส่ง': 0,
      'กำลังจัดส่ง': 0,
      'จัดส่งสำเร็จ': 0,
      'ยกเลิกแล้ว': 0,
      'ยกเลิกโดยทางร้าน': 0,
    };
    orders.forEach((o) => {
      const st = o.order?.status;
      if (counts[st] !== undefined) {
        counts[st] += 1;
      }
    });
    return counts;
  }, [orders]);

  // Mark as delivered
  const handleMarkAsDelivered = async (order) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        'https://ecom-api2-df4u.onrender.com/auth/updateorderstatus',
        {
          orderId: order.orderId,
          status: 'จัดส่งสำเร็จ'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === order.orderId
            ? { ...o, order: { ...o.order, status: 'จัดส่งสำเร็จ' } }
            : o
        )
      );
      setActiveTab('จัดส่งสำเร็จ');
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    setLoadingCancel(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        'https://ecom-api2-df4u.onrender.com/auth/cancel',
        {
          orderId: orderToCancel.orderId,
          status: 'ยกเลิกแล้ว',
          cancel: cancelReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderToCancel.orderId
            ? { ...o, order: { ...o.order, status: 'ยกเลิกแล้ว', cancel: cancelReason } }
            : o
        )
      );
      handleCloseCancelModal();
      setActiveTab('ยกเลิกแล้ว');
    } catch (err) {
      console.error('Error canceling order:', err);
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason('เปลี่ยนใจ / สั่งซื้อผิดรายการ');
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setCancelModalOpen(false);
    setCancelReason('');
    setOrderToCancel(null);
  };

  const handleCopyTracking = (tracking) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTracking(tracking);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status Badge Colors & Icons
  const getStatusBadge = (status) => {
    switch (status) {
      case 'รอดำเนินการ':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500 animate-pulse',
          label: 'รอดำเนินการ'
        };
      case 'กำลังเตรียมจัดส่ง':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500 animate-pulse',
          label: 'กำลังเตรียมจัดส่ง'
        };
      case 'กำลังจัดส่ง':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500 animate-pulse',
          label: 'อยู่ระหว่างจัดส่ง'
        };
      case 'จัดส่งสำเร็จ':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
          label: 'จัดส่งสำเร็จแล้ว'
        };
      case 'ยกเลิกแล้ว':
      case 'ยกเลิกโดยทางร้าน':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dot: 'bg-rose-500',
          label: status
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          dot: 'bg-gray-500',
          label: status
        };
    }
  };

  // Stepper helper
  const stepList = [
    { title: 'รับคำสั่งซื้อ', icon: <FaReceipt className="text-xs" /> },
    { title: 'เตรียมจัดส่ง', icon: <FaBoxOpen className="text-xs" /> },
    { title: 'กำลังจัดส่ง', icon: <FaTruck className="text-xs" /> },
    { title: 'จัดส่งสำเร็จ', icon: <FaHome className="text-xs" /> },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'รอดำเนินการ':
        return 0;
      case 'กำลังเตรียมจัดส่ง':
        return 1;
      case 'กำลังจัดส่ง':
        return 2;
      case 'จัดส่งสำเร็จ':
        return 3;
      default:
        return 0;
    }
  };

  const getStepStatus = (currentStatus, stepIndex) => {
    const steps = ['รอดำเนินการ', 'กำลังเตรียมจัดส่ง', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ'];
    const currentIndex = steps.indexOf(currentStatus);

    if (currentStatus === 'ยกเลิกแล้ว' || currentStatus === 'ยกเลิกโดยทางร้าน') {
      return 'cancelled';
    }
    if (currentIndex >= stepIndex) return 'completed';
    return 'upcoming';
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchTab = order.order?.status === activeTab;
      if (!matchTab) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const orderIdMatch = String(order.orderId).toLowerCase().includes(query);
      const recipientMatch = `${order.address?.name || ''} ${order.address?.lastname || ''}`.toLowerCase().includes(query);
      const trackingMatch = String(order.order?.trackingNumber || '').toLowerCase().includes(query);
      const itemMatch = order.order?.ordercart?.some((c) =>
        c.product?.ItemName?.toLowerCase().includes(query)
      );

      return orderIdMatch || recipientMatch || trackingMatch || itemMatch;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 fade-in-apple">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              รายการคำสั่งซื้อของฉัน
            </h1>
            <p className="text-xs sm:text-sm text-[#86868b]">
              ติดตามสถานะพัสดุ ตรวจสอบประวัติการสั่งซื้อ และจัดการคำสั่งซื้อของคุณ
            </p>
          </div>

          {/* Pill Search Input */}
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#86868b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา Order ID, สินค้า, ขนส่ง..."
              className="w-full bg-white pl-9 pr-4 py-2 text-xs rounded-full border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071e3] shadow-sm text-[#1d1d1f] placeholder-[#86868b] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Apple Segmented Control Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-3xl border border-black/[0.06] shadow-sm overflow-x-auto scrollbar-none flex items-center gap-1.5">
          {statusList.map((status) => {
            const isActive = activeTab === status;
            const count = statusCounts[status] || 0;
            return (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.3)]'
                    : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
                }`}
              >
                <span>{status}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-tight ${
                      isActive
                        ? 'bg-white text-[#0071e3]'
                        : 'bg-[#f5f5f7] text-[#86868b]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders Content Area */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-black/[0.06] shadow-sm space-y-3">
            <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-[#86868b]">กำลังโหลดรายการคำสั่งซื้อ...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-black/[0.06] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-lg">
              <FaTimes />
            </div>
            <h3 className="text-base font-semibold text-[#1d1d1f]">{error}</h3>
            <button
              onClick={fetchOrders}
              className="px-5 py-2 bg-[#0071e3] text-white text-xs font-semibold rounded-full shadow-sm"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-16 text-center border border-black/[0.06] shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto text-[#0071e3]">
              <FaReceipt className="text-2xl" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1d1d1f]">
                ไม่มีคำสั่งซื้อในสถานะ "{activeTab}"
              </h3>
              <p className="text-xs text-[#86868b] max-w-sm mx-auto leading-relaxed">
                {searchQuery
                  ? 'ไม่พบคำสั่งซื้อที่ตรงกับคำค้นหาของคุณ ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง'
                  : 'คุณยังไม่มีรายการสั่งซื้อในหมวดหมู่นี้ คุณสามารถเลือกชมสินค้าและสั่งซื้อได้ทันที'}
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all"
            >
              <FaShoppingBag className="text-xs" />
              <span>เลือกซื้อสินค้าเลย</span>
            </Link>
          </div>
        ) : (
          /* Orders List Grid */
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const badge = getStatusBadge(order.order?.status);
              const hasTracking = order.order?.trackingNumber && order.order.trackingNumber !== '*';
              const carrier = order.order?.shippingCompany && order.order.shippingCompany !== '*' 
                ? order.order.shippingCompany 
                : null;

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-md space-y-5 p-6 sm:p-7"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-sm text-[#1d1d1f] flex items-center gap-1.5">
                        <FaReceipt className="text-[#0071e3] text-xs" />
                        <span>#ORDER-{order.orderId}</span>
                      </span>

                      <span className="text-xs text-[#86868b] flex items-center gap-1">
                        <FaClock className="text-[10px]" />
                        <span>{formatDate(order.order?.date)}</span>
                      </span>

                      {/* Payment Method Tag */}
                      <span className="px-2.5 py-0.5 bg-[#f5f5f7] text-[#1d1d1f] text-[11px] font-semibold rounded-full">
                        {order.pay}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Tracking Bar (If Shipped) */}
                  {hasTracking && (
                    <div className="bg-blue-50/60 rounded-2xl p-3.5 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#0071e3] text-white flex items-center justify-center flex-shrink-0">
                          <FaTruck className="text-xs" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1d1d1f]">
                            {carrier ? `จัดส่งโดย ${carrier}` : 'พัสดุอยู่ระหว่างจัดส่ง'}
                          </p>
                          <p className="text-[11px] text-[#86868b]">
                            เลขพัสดุ: <span className="font-mono font-bold text-[#0071e3]">{order.order.trackingNumber}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyTracking(order.order.trackingNumber)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-[#0071e3] text-xs font-medium rounded-full border border-blue-200 transition-colors self-start sm:self-auto"
                      >
                        {copiedTracking === order.order.trackingNumber ? (
                          <>
                            <FaCheck className="text-emerald-500 text-[10px]" />
                            <span className="text-emerald-600 font-semibold">คัดลอกแล้ว!</span>
                          </>
                        ) : (
                          <>
                            <FaCopy className="text-[10px]" />
                            <span>คัดลอกเลขพัสดุ</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Delivery Info Mini Banner */}
                  <div className="bg-[#f5f5f7] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <FaMapMarkerAlt className="text-[#0071e3] text-sm mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-[#1d1d1f]">
                          ผู้รับ: {order.address?.name} {order.address?.lastname}
                          <span className="ml-2 font-mono text-[#86868b]">({order.address?.phone})</span>
                        </p>
                        <p className="text-[11px] text-[#86868b]">
                          {order.address?.housenumber} {order.address?.village ? `หมู่ ${order.address.village}` : ''} ต.{order.address?.tambon} อ.{order.address?.district} จ.{order.address?.province} {order.address?.zipcode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                      {order.slip && (
                        <button
                          onClick={() => setSelectedSlip(order.slip)}
                          className="px-3 py-1.5 bg-white hover:bg-black/5 text-[#0071e3] text-xs font-medium rounded-full border border-black/[0.06] transition-colors inline-flex items-center gap-1"
                        >
                          <FaReceipt className="text-[10px]" />
                          <span>ดูสลิปโอนเงิน</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedOrder(order.address)}
                        className="px-3 py-1.5 bg-white hover:bg-black/5 text-[#1d1d1f] text-xs font-medium rounded-full border border-black/[0.06] transition-colors"
                      >
                        ดูที่อยู่เต็ม
                      </button>
                    </div>
                  </div>

                  {/* Products List in this Order */}
                  <div className="divide-y divide-black/[0.04] pt-1">
                    {order.order?.ordercart?.map((cartItem) => (
                      <div key={cartItem.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 border border-black/[0.06] flex items-center justify-center flex-shrink-0">
                            <img
                              src={cartItem.product?.file}
                              alt={cartItem.product?.ItemName || 'Product'}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <h4 className="font-semibold text-xs text-[#1d1d1f] truncate">
                              {cartItem.product?.ItemName}
                            </h4>
                            <p className="text-[11px] text-[#86868b]">
                              จำนวน: <span className="font-semibold text-[#1d1d1f]">{cartItem.total} ชิ้น</span>
                              <span className="mx-1.5">•</span>
                              ชิ้นละ ฿{cartItem.product?.price?.toLocaleString() || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right font-bold text-xs text-[#1d1d1f] flex-shrink-0">
                          ฿{cartItem.price?.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Apple 4-Step Stepper Progress Bar */}
                  {order.order?.status !== 'ยกเลิกแล้ว' && order.order?.status !== 'ยกเลิกโดยทางร้าน' && (
                    <div className="pt-5 pb-2 border-t border-black/[0.05]">
                      <div className="relative w-full max-w-2xl mx-auto">
                        {/* Connecting Line Track */}
                        <div className="absolute top-[18px] left-[12.5%] right-[12.5%] h-1 bg-gray-200 rounded-full z-0 -translate-y-1/2 overflow-hidden">
                          {/* Active Progress Fill Line */}
                          <div 
                            className="h-full bg-[#0071e3] rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${(Math.max(0, Math.min(3, getStepIndex(order.order?.status))) / 3) * 100}%`
                            }}
                          />
                        </div>

                        {/* 4 Step Items */}
                        <div className="grid grid-cols-4 gap-2 text-center relative z-10">
                          {stepList.map((step, idx) => {
                            const stepIdx = getStepIndex(order.order?.status);
                            const isDone = stepIdx >= idx;
                            const isCurrent = stepIdx === idx;
                            return (
                              <div key={step.title} className="flex flex-col items-center space-y-2">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ring-white ${
                                    isDone
                                      ? 'bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.35)]'
                                      : 'bg-[#f5f5f7] text-[#86868b] border border-black/[0.08]'
                                  } ${isCurrent ? 'scale-105 ring-blue-100' : ''}`}
                                >
                                  {step.icon}
                                </div>
                                <span
                                  className={`text-[11px] font-semibold tracking-tight whitespace-nowrap transition-colors ${
                                    isDone ? 'text-[#1d1d1f]' : 'text-[#86868b]'
                                  }`}
                                >
                                  {step.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancelled Reason Box (If Cancelled) */}
                  {(order.order?.status === 'ยกเลิกแล้ว' || order.order?.status === 'ยกเลิกโดยทางร้าน') && (
                    <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200/60 text-xs space-y-1">
                      <p className="font-semibold text-rose-800">
                        {order.order?.status === 'ยกเลิกโดยทางร้าน' ? 'ยกเลิกโดยทางร้าน' : 'คุณได้ยกเลิกคำสั่งซื้อนี้'}
                      </p>
                      {order.order?.cancel && (
                        <p className="text-[11px] text-rose-700">
                          เหตุผล: <span className="font-medium">{order.order.cancel}</span>
                        </p>
                      )}
                      {order.pay === 'โอนจ่าย' && (
                        <p className="text-[11px] text-rose-600 pt-1">
                          * ท่านสามารถติดต่อขอรับเงินคืนได้ผ่านทาง Line ID: @cs.shop124
                        </p>
                      )}
                    </div>
                  )}

                  {/* Order Card Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-black/[0.05]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-[#86868b]">ยอดรวมทั้งสิ้น:</span>
                      <span className="text-xl font-bold text-[#1d1d1f]">
                        ฿{order.order?.price_all?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Customer confirmation button */}
                      {order.order?.status === 'กำลังจัดส่ง' && (
                        <button
                          onClick={() => handleMarkAsDelivered(order)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <FaCheckCircle className="text-xs" />
                          <span>ฉันได้รับสินค้าแล้ว</span>
                        </button>
                      )}

                      {/* Cancel order button */}
                      {order.order?.status === 'รอดำเนินการ' && (
                        <button
                          onClick={() => handleOpenCancelModal(order)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 active:scale-[0.98] text-[#ff3b30] text-xs font-semibold rounded-full border border-rose-200/80 transition-all cursor-pointer"
                        >
                          ยกเลิกคำสั่งซื้อ
                        </button>
                      )}

                      <button
                        onClick={() => setStatusModalOrder(order)}
                        className="px-4 py-2 bg-[#f5f5f7] hover:bg-black/10 active:scale-[0.98] text-[#1d1d1f] text-xs font-medium rounded-full transition-all cursor-pointer"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Address Details Modal (Apple Frosted Glass) */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/[0.06] shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center">
                  <FaMapMarkerAlt className="text-xs" />
                </div>
                <h3 className="text-base font-semibold text-[#1d1d1f]">รายละเอียดที่อยู่จัดส่ง</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="bg-[#f5f5f7] rounded-2xl p-4 text-xs space-y-2 text-[#424245]">
              <div className="flex justify-between font-semibold text-[#1d1d1f]">
                <span>{selectedOrder.name} {selectedOrder.lastname}</span>
                <span className="font-mono">{selectedOrder.phone}</span>
              </div>
              <p className="leading-relaxed">
                บ้านเลขที่ {selectedOrder.housenumber} {selectedOrder.village ? `หมู่ ${selectedOrder.village}` : ''}
              </p>
              <p>
                ตำบล {selectedOrder.tambon} อำเภอ {selectedOrder.district}
              </p>
              <p>
                จังหวัด {selectedOrder.province} {selectedOrder.zipcode}
              </p>
              {selectedOrder.other && (
                <p className="pt-2 border-t border-black/[0.05] italic text-[#86868b]">
                  หมายเหตุ: {selectedOrder.other}
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 bg-[#f5f5f7] hover:bg-black/10 text-xs font-semibold text-[#1d1d1f] rounded-full transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Slip Viewer Modal (Apple Frosted Glass) */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-black/[0.06] shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
              <h3 className="text-sm font-semibold text-[#1d1d1f]">หลักฐานการโอนเงิน (สลิป)</h3>
              <button
                onClick={() => setSelectedSlip(null)}
                className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-black/[0.06] max-h-[60vh] flex items-center justify-center bg-[#f5f5f7]">
              <img
                src={selectedSlip}
                alt="Slip Preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <button
              onClick={() => setSelectedSlip(null)}
              className="w-full py-2.5 bg-[#f5f5f7] hover:bg-black/10 text-xs font-semibold text-[#1d1d1f] rounded-full transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Cancel Order Modal (Apple Frosted Glass) */}
      {cancelModalOpen && orderToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={handleCloseCancelModal}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-black/[0.06] shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <div>
                <h3 className="text-lg font-bold text-[#1d1d1f]">ยกเลิกคำสั่งซื้อ #{orderToCancel.orderId}</h3>
                <p className="text-xs text-[#86868b] mt-0.5">กรุณาเลือกหรือระบุเหตุผลการยกเลิก</p>
              </div>
              <button
                onClick={handleCloseCancelModal}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Quick Reason Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1d1d1f]">
                เลือกสาเหตุการยกเลิก:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'เปลี่ยนใจ / สั่งซื้อผิดรายการ',
                  'ต้องการเปลี่ยนที่อยู่จัดส่ง',
                  'ต้องการเปลี่ยนวิธีชำระเงิน',
                  'พบราคาที่ถูกกว่าที่อื่น',
                  'อื่นๆ'
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setCancelReason(reason)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                      cancelReason === reason
                        ? 'bg-[#ff3b30] text-white font-semibold'
                        : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/10'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                รายละเอียดเพิ่มเติม:
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="ระบุเหตุผลการยกเลิกคำสั่งซื้อ..."
                className="w-full bg-[#f5f5f7] border-0 rounded-2xl p-3.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#ff3b30] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/[0.04]">
              <button
                type="button"
                onClick={handleCloseCancelModal}
                className="px-5 py-2.5 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium text-[#1d1d1f] rounded-full transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={loadingCancel || !cancelReason.trim()}
                className="px-6 py-2.5 bg-[#ff3b30] hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(255,59,48,0.3)] transition-all cursor-pointer"
              >
                {loadingCancel ? 'กำลังยกเลิก...' : 'ยืนยันการยกเลิก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details & Timeline Modal (Apple Frosted Glass) */}
      {statusModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setStatusModalOrder(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-black/[0.06] shadow-2xl space-y-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <div>
                <h3 className="text-lg font-bold text-[#1d1d1f]">
                  สถานะคำสั่งซื้อ #{statusModalOrder.orderId}
                </h3>
                <p className="text-xs text-[#86868b] mt-0.5">
                  สั่งซื้อเมื่อ {formatDate(statusModalOrder.order?.date)}
                </p>
              </div>
              <button
                onClick={() => setStatusModalOrder(null)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Stepper Inside Modal */}
            <div className="bg-[#f5f5f7] rounded-2xl p-5 space-y-4">
              <span className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider block">
                ขั้นตอนการจัดส่ง
              </span>

              <div className="relative w-full py-1">
                {/* Connecting Track Line */}
                <div className="absolute top-[18px] left-[12.5%] right-[12.5%] h-1 bg-gray-300/80 rounded-full z-0 -translate-y-1/2 overflow-hidden">
                  <div
                    className="h-full bg-[#0071e3] rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(Math.max(0, Math.min(3, getStepIndex(statusModalOrder.order?.status))) / 3) * 100}%`
                    }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center relative z-10">
                  {stepList.map((step, idx) => {
                    const stepIdx = getStepIndex(statusModalOrder.order?.status);
                    const isDone = stepIdx >= idx;
                    const isCurrent = stepIdx === idx;
                    return (
                      <div key={step.title} className="flex flex-col items-center space-y-2">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ring-[#f5f5f7] ${
                            isDone
                              ? 'bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.35)]'
                              : 'bg-white text-[#86868b] border border-black/[0.08]'
                          } ${isCurrent ? 'scale-105' : ''}`}
                        >
                          {step.icon}
                        </div>
                        <span
                          className={`text-[11px] font-semibold tracking-tight whitespace-nowrap transition-colors ${
                            isDone ? 'text-[#1d1d1f]' : 'text-[#86868b]'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-black/[0.04]">
                <span className="text-[#86868b]">วิธีชำระเงิน</span>
                <span className="font-semibold text-[#1d1d1f]">{statusModalOrder.pay}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-black/[0.04]">
                <span className="text-[#86868b]">สถานะปัจจุบัน</span>
                <span className="font-semibold text-[#0071e3]">{statusModalOrder.order?.status}</span>
              </div>

              {statusModalOrder.order?.trackingNumber && statusModalOrder.order?.trackingNumber !== '*' && (
                <div className="flex justify-between py-2 border-b border-black/[0.04]">
                  <span className="text-[#86868b]">เลขพัสดุ</span>
                  <span className="font-mono font-bold text-[#0071e3]">{statusModalOrder.order?.trackingNumber}</span>
                </div>
              )}

              <div className="flex justify-between py-2 pt-3 font-bold text-sm text-[#1d1d1f]">
                <span>ราคารวมทั้งสิ้น</span>
                <span>฿{statusModalOrder.order?.price_all?.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setStatusModalOrder(null)}
              className="w-full py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Productpict;
