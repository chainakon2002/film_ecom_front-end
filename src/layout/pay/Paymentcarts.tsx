import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaMapMarkerAlt, 
  FaTruck, 
  FaQrcode, 
  FaMoneyBillWave, 
  FaShieldAlt, 
  FaCheck, 
  FaTimes, 
  FaArrowLeft, 
  FaPlus,
  FaReceipt,
  FaChevronRight,
  FaLock,
  FaExclamationCircle
} from 'react-icons/fa';
import './Paymentall.css';

function Paymentcarts() {
  const location = useLocation();
  const carts = location.state?.selectedCartItems || [];
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(() => {
    const saved = localStorage.getItem('selectedAddress');
    return saved ? JSON.parse(saved) : null;
  });
  const [paymentMethod, setPaymentMethod] = useState('โอนจ่าย'); // Default to Transfer / PromptPay
  const [slipImage, setSlipImage] = useState(null);
  
  // Custom Apple Modals State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showCodConfirmModal, setShowCodConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get('https://ecom-api2-df4u.onrender.com/auth/useraddress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const addrList = Array.isArray(response.data) ? response.data : [];
        setAddresses(addrList);
        
        // Auto-select address if not already selected or if current selection is invalid
        if (addrList.length > 0) {
          setSelectedAddress((prev) => {
            if (prev && addrList.some((a) => a.id === prev.id)) {
              return prev;
            }
            localStorage.setItem('selectedAddress', JSON.stringify(addrList[0]));
            return addrList[0];
          });
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      }
    };

    fetchAddresses();
  }, [token]);

  const getShippingCost = () => {
    return paymentMethod === 'จ่ายปลายทาง' ? 45 : 0;
  };

  const totalQuantity = carts.reduce((acc, item) => acc + (item.total || 1), 0);
  const subtotalPrice = carts.reduce((acc, item) => acc + (item.price || 0), 0);
  const shippingCost = getShippingCost();
  const grandTotal = subtotalPrice + shippingCost;

  const orderFn = async () => {
    setIsSubmitting(true);
    try {
      const rs = await axios.post('https://ecom-api2-df4u.onrender.com/order/order', {
        total_all: totalQuantity,
        price_all: grandTotal,
        status: 'รอดำเนินการ',
        shippingCompany: '*',
        trackingNumber: '*',
        cancel: '*',
        cancelstore: '*',
        date: new Date()
      });
      await ordercartFn(rs.data.orders.id);
    } catch (err) {
      console.error('Error placing order:', err);
      setErrorMessage('ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  };

  const ordercartFn = async (orderId) => {
    try {
      await Promise.all(
        carts.map(async (m) => {
          await axios.post('https://ecom-api2-df4u.onrender.com/order/ordercart', {
            price: m.price,
            total: m.total,
            userId: m.UserId,
            productId: m.productId,
            orderId: orderId
          });
        })
      );
      await deletecartFn();
      await updatestockFn();
      await PaymentFn(orderId);
    } catch (err) {
      console.error('Error processing order cart:', err);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกรายการสินค้า');
      setIsSubmitting(false);
    }
  };

  const deletecartFn = async () => {
    try {
      await Promise.all(
        carts.map(async (m) => {
          await axios.delete(`https://ecom-api2-df4u.onrender.com/cart/carts/${m.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        })
      );
    } catch (err) {
      console.error('Error deleting cart:', err);
    }
  };

  const updatestockFn = async () => {
    try {
      await Promise.all(
        carts.map(async (m) => {
          const stocks = (m.product?.stock || 0) - m.total;
          await axios.put(`https://ecom-api2-df4u.onrender.com/auth/products/${m.product.id}`, {
            stock: stocks
          });
        })
      );
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const PaymentFn = async (orderId) => {
    try {
      const userid = localStorage.getItem('userId');
      const paymentData = {
        status: 'ชำระแล้ว',
        userId: userid,
        pay: paymentMethod,
        addressId: selectedAddress?.id,
        orderId: orderId,
      };

      if (slipImage) {
        paymentData.slip = slipImage;
      }

      await axios.post('https://ecom-api2-df4u.onrender.com/payment/payments', paymentData);
      
      // Trigger Apple Style Success Modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error processing payment:', err);
      setErrorMessage('ไม่สามารถดำเนินการชำระเงินได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderConfirmation = () => {
    if (!selectedAddress) {
      setWarningMessage('กรุณาเลือกที่อยู่สำหรับจัดส่งสินค้า');
      return;
    }

    if (!paymentMethod) {
      setWarningMessage('กรุณาเลือกช่องทางการชำระเงิน');
      return;
    }

    if (paymentMethod === 'โอนจ่าย') {
      setShowSlipModal(true);
    } else {
      // Open Apple Style COD Confirmation Modal
      setShowCodConfirmModal(true);
    }
  };

  const handleSlipUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmWithSlip = () => {
    if (!slipImage) {
      setWarningMessage('กรุณาแนบภาพสลิปการโอนเงินเพื่อดำเนินการต่อ');
      return;
    }
    setShowSlipModal(false);
    orderFn();
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    localStorage.setItem('selectedAddress', JSON.stringify(address));
    setShowAddressModal(false);
  };

  // If cart items are empty (e.g. page refreshed without state)
  if (!carts || carts.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] py-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-black/[0.06] shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto text-[#0071e3]">
            <FaReceipt className="text-2xl" />
          </div>
          <h2 className="text-lg font-bold text-[#1d1d1f]">ไม่พบรายการสินค้าที่เลือก</h2>
          <p className="text-xs text-[#86868b]">
            กรุณากลับไปที่ตะกร้าสินค้าเพื่อเลือกสินค้าที่ต้องการสั่งซื้อ
          </p>
          <button
            onClick={() => navigate('/cart')}
            className="w-full py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all"
          >
            กลับไปยังตะกร้าสินค้า
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate('/cart')}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-1"
            >
              <FaArrowLeft className="text-[10px]" />
              <span>กลับไปยังตะกร้าสินค้า</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              ชำระเงินและยืนยันคำสั่งซื้อ
            </h1>
            <p className="text-xs text-[#86868b]">
              ตรวจสอบรายการสินค้า ที่อยู่จัดส่ง และเลือกช่องทางการชำระเงิน
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#86868b] bg-white px-3.5 py-1.5 rounded-full border border-black/[0.06] shadow-sm self-start sm:self-auto">
            <FaLock className="text-emerald-500 text-[11px]" />
            <span>ระบบชำระเงินปลอดภัย 256-bit SSL</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Delivery Address & Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center">
                    <FaMapMarkerAlt className="text-sm" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#1d1d1f]">ที่อยู่สำหรับจัดส่งสินค้า</h2>
                    <p className="text-[11px] text-[#86868b]">พัสดุจะถูกจัดส่งไปยังที่อยู่นี้</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="px-3.5 py-1.5 bg-[#f5f5f7] hover:bg-black/10 text-[#0071e3] text-xs font-semibold rounded-full transition-colors inline-flex items-center gap-1"
                >
                  <span>{selectedAddress ? 'เปลี่ยนที่อยู่' : 'เลือกที่อยู่'}</span>
                  <FaChevronRight className="text-[9px]" />
                </button>
              </div>

              {selectedAddress ? (
                <div className="bg-[#f5f5f7] rounded-2xl p-4 border border-black/[0.03] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#1d1d1f]">
                      {selectedAddress.name} {selectedAddress.lastname}
                    </span>
                    <span className="text-xs text-[#86868b] font-mono">
                      {selectedAddress.phone}
                    </span>
                  </div>
                  <p className="text-xs text-[#424245] leading-relaxed">
                    บ้านเลขที่ {selectedAddress.housenumber} {selectedAddress.village ? `หมู่ ${selectedAddress.village}` : ''} ต.{selectedAddress.tambon} อ.{selectedAddress.district} จ.{selectedAddress.province} {selectedAddress.zipcode}
                  </p>
                  {selectedAddress.other && (
                    <p className="text-[11px] text-[#86868b] italic">
                      หมายเหตุ: {selectedAddress.other}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-amber-900">ยังไม่ได้เลือกที่อยู่จัดส่ง</p>
                    <p className="text-[11px] text-amber-700">กรุณาเลือกหรือเพิ่มที่อยู่จัดส่งสินค้าของคุณ</p>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-full transition-colors self-start sm:self-auto"
                  >
                    + เลือกที่อยู่ตอนนี้
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method Selection Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center">
                  <FaMoneyBillWave className="text-sm" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#1d1d1f]">ช่องทางการชำระเงิน</h2>
                  <p className="text-[11px] text-[#86868b]">เลือกวิธีการชำระเงินที่คุณสะดวกที่สุด</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                
                {/* Option 1: โอนจ่าย / QR พร้อมเพย์ */}
                <div
                  onClick={() => setPaymentMethod('โอนจ่าย')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                    paymentMethod === 'โอนจ่าย'
                      ? 'border-[#0071e3] bg-blue-50/30 shadow-[0_2px_12px_rgba(0,113,227,0.08)]'
                      : 'border-black/[0.06] hover:border-black/[0.15] bg-[#f5f5f7]/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white p-1.5 border border-black/[0.06] flex items-center justify-center flex-shrink-0">
                        <img
                          src="/assets/icon-thaiqr.png"
                          alt="Thai QR"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#1d1d1f]">โอนจ่าย / QR Code</span>
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-semibold rounded-full">
                          ส่งฟรี (Free Shipping)
                        </span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'โอนจ่าย' 
                        ? 'border-[#0071e3] bg-[#0071e3] text-white' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {paymentMethod === 'โอนจ่าย' && <FaCheck className="text-[9px]" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#86868b] leading-relaxed">
                    สแกน QR Code พร้อมเพย์ผ่านทุกแอปธนาคาร จัดส่งด่วน 2-4 วันทำการ
                  </p>
                </div>

                {/* Option 2: ชำระเงินปลายทาง (COD) */}
                <div
                  onClick={() => setPaymentMethod('จ่ายปลายทาง')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                    paymentMethod === 'จ่ายปลายทาง'
                      ? 'border-[#0071e3] bg-blue-50/30 shadow-[0_2px_12px_rgba(0,113,227,0.08)]'
                      : 'border-black/[0.06] hover:border-black/[0.15] bg-[#f5f5f7]/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white p-1.5 border border-black/[0.06] flex items-center justify-center flex-shrink-0">
                        <img
                          src="/assets/cod.jpg"
                          alt="COD"
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#1d1d1f]">เก็บเงินปลายทาง (COD)</span>
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-neutral-100 text-[#1d1d1f] text-[10px] font-semibold rounded-full">
                          ค่าจัดส่ง +฿45
                        </span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'จ่ายปลายทาง' 
                        ? 'border-[#0071e3] bg-[#0071e3] text-white' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {paymentMethod === 'จ่ายปลายทาง' && <FaCheck className="text-[9px]" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#86868b] leading-relaxed">
                    ชำระเงินสดกับเจ้าหน้าที่จัดส่งเมื่อได้รับสินค้า จัดส่งด่วน 2-4 วันทำการ
                  </p>
                </div>

              </div>
            </div>

            {/* Apple Guarantee Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-3.5 border border-black/[0.06] flex items-center gap-3 text-xs text-[#86868b]">
                <FaTruck className="text-[#0071e3] text-base flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#1d1d1f]">จัดส่งด่วนทั่วไทย</p>
                  <p className="text-[10px]">รับสินค้าภายใน 2-4 วัน</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-black/[0.06] flex items-center gap-3 text-xs text-[#86868b]">
                <FaShieldAlt className="text-[#0071e3] text-base flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#1d1d1f]">รับประกันศูนย์แท้ 100%</p>
                  <p className="text-[10px]">มั่นใจในคุณภาพสินค้า</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-black/[0.06] flex items-center gap-3 text-xs text-[#86868b]">
                <FaLock className="text-[#0071e3] text-base flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#1d1d1f]">ชำระเงินปลอดภัย</p>
                  <p className="text-[10px]">ตรวจสอบสลิปแม่นยำ</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Items Summary & Checkout CTA */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Products List & Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
                <h2 className="text-base font-semibold text-[#1d1d1f]">สรุปรายการสินค้า</h2>
                <span className="text-xs font-semibold text-[#86868b] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full">
                  {totalQuantity} ชิ้น
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-black/[0.04] max-h-72 overflow-y-auto pr-1 space-y-3">
                {carts.map((m) => (
                  <div key={m.id} className="pt-3 first:pt-0 flex items-center gap-3.5">
                    {/* Seamless product thumbnail */}
                    <div className="w-16 h-16 rounded-2xl bg-white p-1.5 border border-black/[0.06] flex items-center justify-center flex-shrink-0">
                      <img
                        src={m.product?.file}
                        alt={m.product?.ItemName || 'Product'}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h3 className="font-semibold text-xs text-[#1d1d1f] truncate">
                        {m.product?.ItemName}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-[#86868b]">
                        <span>จำนวน: {m.total} ชิ้น</span>
                        <span>•</span>
                        <span>ชิ้นละ ฿{m.product?.price?.toLocaleString() || '-'}</span>
                      </div>
                    </div>

                    <div className="text-right font-bold text-xs text-[#1d1d1f] flex-shrink-0">
                      ฿{m.price?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-black/[0.06] space-y-2.5 text-xs">
                <div className="flex justify-between text-[#86868b]">
                  <span>ราคารวมสินค้า ({totalQuantity} ชิ้น)</span>
                  <span className="font-medium text-[#1d1d1f]">฿{subtotalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-[#86868b]">
                  <span>ค่าบริการจัดส่ง</span>
                  {shippingCost === 0 ? (
                    <span className="font-semibold text-emerald-600">ฟรี (Free)</span>
                  ) : (
                    <span className="font-medium text-[#1d1d1f]">+฿{shippingCost}</span>
                  )}
                </div>

                {paymentMethod === 'โอนจ่าย' && (
                  <div className="flex justify-between text-emerald-600 text-[11px]">
                    <span>ส่วนลดโปรโมชั่นส่งฟรี (โอนชำระ)</span>
                    <span>-฿45</span>
                  </div>
                )}

                <div className="pt-3 border-t border-black/[0.06] flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-[#1d1d1f]">ยอดชำระสุทธิ</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
                      ฿{grandTotal.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-[#86868b] mt-0.5">รวมภาษีมูลค่าเพิ่มแล้ว</p>
                  </div>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="button"
                onClick={handleOrderConfirmation}
                disabled={isSubmitting || !selectedAddress}
                className="w-full py-3.5 px-6 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full shadow-[0_4px_16px_rgba(0,113,227,0.3)] disabled:shadow-none transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังดำเนินการ...</span>
                  </>
                ) : (
                  <>
                    <FaLock className="text-xs" />
                    <span>ยืนยันและสั่งซื้อสินค้า</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-[#86868b] text-center leading-relaxed">
                เมื่อคลิกยืนยันการสั่งซื้อ ถือว่าคุณยอมรับข้อตกลงและนโยบายความเป็นส่วนตัวของ CS.SHOP
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Address Selection Modal (Apple Frosted Glass) */}
      {showAddressModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setShowAddressModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto border border-black/[0.06] shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f]">เลือกที่อยู่สำหรับจัดส่ง</h3>
                <p className="text-xs text-[#86868b] mt-0.5">เลือกที่อยู่ที่คุณต้องการให้จัดส่งสินค้า</p>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto text-[#86868b]">
                  <FaMapMarkerAlt className="text-lg text-[#0071e3]" />
                </div>
                <p className="text-xs text-[#86868b]">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้ในระบบ</p>
                <Link
                  to="/address"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-sm"
                >
                  <FaPlus className="text-[9px]" />
                  <span>ไปหน้าเพิ่มที่อยู่</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => {
                  const isSelected = selectedAddress?.id === address.id;
                  return (
                    <div
                      key={address.id}
                      onClick={() => handleAddressSelect(address)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 relative ${
                        isSelected
                          ? 'border-[#0071e3] bg-blue-50/40 shadow-sm'
                          : 'border-black/[0.06] hover:border-black/[0.15] bg-[#f5f5f7]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#1d1d1f]">
                          {address.name} {address.lastname}
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#0071e3] bg-[#0071e3] text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <FaCheck className="text-[8px]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#86868b] font-mono">{address.phone}</p>
                      <p className="text-xs text-[#424245] leading-relaxed">
                        {address.housenumber} {address.village ? `หมู่ ${address.village}` : ''} ต.{address.tambon} อ.{address.district} จ.{address.province} {address.zipcode}
                      </p>
                    </div>
                  );
                })}

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    to="/address"
                    className="text-xs text-[#0071e3] hover:underline inline-flex items-center gap-1"
                  >
                    <FaPlus className="text-[9px]" />
                    <span>จัดการหรือเพิ่มที่อยู่ใหม่</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="px-5 py-2 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium text-[#1d1d1f] rounded-full transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slip Upload Modal (Apple Frosted Glass) */}
      {showSlipModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setShowSlipModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-black/[0.06] shadow-2xl space-y-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f]">สแกนจ่ายและแนบสลิปโอนเงิน</h3>
                <p className="text-xs text-[#86868b] mt-0.5">ยอดชำระสุทธิ: ฿{grandTotal.toLocaleString()}</p>
              </div>
              <button
                onClick={() => setShowSlipModal(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Step 1: QR Display & Bank Info */}
            <div className="bg-[#f5f5f7] rounded-2xl p-5 border border-black/[0.04] flex flex-col sm:flex-row items-center gap-5">
              <div className="w-44 h-44 bg-white rounded-2xl p-2 border border-black/[0.06] shadow-sm flex items-center justify-center flex-shrink-0">
                <img
                  src="/assets/pay.jpg"
                  alt="QR Code สำหรับโอนเงิน"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <div className="space-y-2 text-xs w-full">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-[#86868b] tracking-wider">
                    ยอดเงินที่ต้องโอนชำระ
                  </span>
                  <p className="text-2xl font-bold text-[#0071e3]">
                    ฿{grandTotal.toLocaleString()}
                  </p>
                </div>

                <div className="pt-2 border-t border-black/[0.06] space-y-1 text-xs">
                  <p className="text-[#1d1d1f] font-medium">
                    ธนาคาร: <span className="font-semibold">กสิกรไทย (KBANK)</span>
                  </p>
                  <p className="text-[#1d1d1f] font-medium">
                    เลขที่บัญชี: <span className="font-mono font-bold text-sm text-[#1d1d1f]">123-4-56789-0</span>
                  </p>
                  <p className="text-[#1d1d1f] font-medium">
                    ชื่อบัญชี: <span className="font-semibold">CS.SHOP E-COMMERCE</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Upload Slip */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
                อัปโหลดสลิปหลักฐานการโอน
              </label>

              {slipImage ? (
                <div className="relative rounded-2xl border border-black/[0.06] p-3 bg-[#f5f5f7] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={slipImage}
                      alt="Slip Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-black/[0.06]"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#1d1d1f]">แนบสลิปเรียบร้อยแล้ว</p>
                      <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5">
                        <FaCheck className="text-[9px]" /> พร้อมสำหรับการตรวจสอบ
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSlipImage(null)}
                    className="px-3 py-1.5 bg-white hover:bg-red-50 text-[#ff3b30] text-xs font-medium rounded-full border border-black/[0.06] transition-colors"
                  >
                    เปลี่ยนรูป
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-black/[0.12] hover:border-[#0071e3] rounded-2xl p-6 text-center transition-colors bg-[#f5f5f7]/50">
                  <input
                    type="file"
                    id="slip-upload-input"
                    accept="image/*"
                    onChange={handleSlipUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="slip-upload-input"
                    className="cursor-pointer space-y-2 block"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center mx-auto">
                      <FaReceipt className="text-lg" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#0071e3] hover:underline">
                        คลิกเพื่อเลือกรูปภาพสลิป
                      </span>
                      <p className="text-[11px] text-[#86868b] mt-0.5">
                        รองรับไฟล์ JPG, PNG หรือภาพหน้าจอการโอนเงิน
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.04]">
              <button
                type="button"
                onClick={() => setShowSlipModal(false)}
                className="px-5 py-2.5 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium text-[#1d1d1f] rounded-full transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmWithSlip}
                disabled={!slipImage || isSubmitting}
                className="px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] disabled:shadow-none transition-all"
              >
                {isSubmitting ? 'กำลังสั่งซื้อ...' : 'ยืนยันการสั่งซื้อ'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Apple Style COD Confirmation Modal (Replaces old SweetAlert2) */}
      {showCodConfirmModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setShowCodConfirmModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-black/[0.06] shadow-2xl text-center space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Apple Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] text-white flex items-center justify-center mx-auto shadow-[0_6px_20px_rgba(0,113,227,0.3)] text-2xl">
              <FaTruck />
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                ยืนยันการสั่งซื้อสินค้า
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                คุณต้องการสั่งซื้อแบบเก็บเงินปลายทาง (COD) ใช่หรือไม่?
              </p>
            </div>

            {/* Apple Summary Mini Card */}
            <div className="bg-[#f5f5f7] rounded-2xl p-4 text-left space-y-2 text-xs border border-black/[0.03]">
              <div className="flex justify-between items-baseline">
                <span className="text-[#86868b]">ยอดชำระสุทธิ:</span>
                <span className="font-bold text-base text-[#0071e3]">
                  ฿{grandTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">วิธีการชำระ:</span>
                <span className="font-medium text-[#1d1d1f]">เก็บเงินปลายทาง</span>
              </div>
              <div className="pt-2 border-t border-black/[0.06] space-y-0.5">
                <span className="text-[#86868b]">จัดส่งไปยัง:</span>
                <p className="text-[#1d1d1f] font-medium truncate">
                  {selectedAddress?.name} {selectedAddress?.lastname} ({selectedAddress?.phone})
                </p>
                <p className="text-[11px] text-[#86868b] line-clamp-2">
                  {selectedAddress?.housenumber} {selectedAddress?.village ? `หมู่ ${selectedAddress?.village}` : ''} ต.{selectedAddress?.tambon} อ.{selectedAddress?.district} จ.{selectedAddress?.province}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowCodConfirmModal(false);
                  orderFn();
                }}
                disabled={isSubmitting}
                className="w-full py-3 px-5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-xs font-semibold rounded-full shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังดำเนินการ...</span>
                  </>
                ) : (
                  <span>ยืนยันสั่งซื้อสินค้า</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowCodConfirmModal(false)}
                className="w-full py-2.5 px-5 bg-[#f5f5f7] hover:bg-black/5 active:scale-[0.98] text-xs font-medium text-[#1d1d1f] rounded-full transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple Style Order Success Celebration Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-black/[0.06] shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-[0_6px_20px_rgba(16,185,129,0.35)] text-2xl">
              <FaCheck />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                สั่งซื้อสินค้าสำเร็จ!
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                ขอบคุณที่ไว้วางใจ ทางร้านได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว และจะรีบดำเนินการจัดส่งทันที
              </p>
            </div>

            <div className="bg-[#f5f5f7] rounded-2xl p-4 text-xs space-y-1.5 text-left border border-black/[0.03]">
              <div className="flex justify-between">
                <span className="text-[#86868b]">ยอดรวมทั้งสิ้น:</span>
                <span className="font-bold text-[#1d1d1f]">฿{grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">สถานะ:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  บันทึกคำสั่งซื้อแล้ว
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/product01')}
              className="w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-xs font-semibold rounded-full shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition-all cursor-pointer"
            >
              ดูรายการคำสั่งซื้อของฉัน
            </button>
          </div>
        </div>
      )}

      {/* Apple Style Warning Modal */}
      {warningMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setWarningMessage(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-xs w-full border border-black/[0.06] shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto text-xl">
              <FaExclamationCircle />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#1d1d1f]">แจ้งเตือน</h4>
              <p className="text-xs text-[#86868b] leading-relaxed">{warningMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setWarningMessage(null);
                if (!selectedAddress) setShowAddressModal(true);
              }}
              className="w-full py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-sm transition-all"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Apple Style Error Modal */}
      {errorMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setErrorMessage(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-xs w-full border border-black/[0.06] shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto text-xl">
              <FaTimes />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#1d1d1f]">เกิดข้อผิดพลาด</h4>
              <p className="text-xs text-[#86868b] leading-relaxed">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="w-full py-2.5 bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold rounded-full shadow-sm transition-all"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Paymentcarts;
