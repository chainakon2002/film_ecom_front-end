import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaMapMarkerAlt, FaLock, FaShieldAlt, FaTruck, FaCheck } from 'react-icons/fa';

const PaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: 1,
    userId: '',
    productId: '',
    username: '',
    price: '',
    productname: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [product, setProduct] = useState({});
  const [user, setUser] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://ecom-api2-df4u.onrender.com/auth/getproduct/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://ecom-api2-df4u.onrender.com/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);

        const addressResponse = await axios.get(`https://ecom-api2-df4u.onrender.com/auth/useraddress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const addrList = Array.isArray(addressResponse.data) ? addressResponse.data : [];
        setAddresses(addrList);
        if (addrList.length > 0) {
          setSelectedAddress(addrList[0]);
        }
      } catch (error) {
        console.error('Error fetching user or address:', error);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (newAmount) => {
    if (newAmount < 1 || (product.stock && newAmount > product.stock)) return;
    setFormData((prev) => ({ ...prev, amount: newAmount }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddress) {
      Swal.fire({
        title: "กรุณาระบุที่อยู่",
        text: "โปรดเลือกที่อยู่สำหรับการจัดส่งสินค้า",
        icon: "warning",
        confirmButtonColor: "#0071e3"
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('https://ecom-api2-df4u.onrender.com/auth/payment', {
        productsId: id,
        amount: formData.amount,
        userId: user.id,
        productId: product.id,
        username: user.username,
        price: product.price * formData.amount,
        productname: product.ItemName,
        addressId: selectedAddress.id,
        status: 'กำลังดำเนินการ'
      });
      
      Swal.fire({
        title: "สั่งซื้อสำเร็จ!",
        text: "คำสั่งซื้อของคุณได้รับการบันทึกแล้ว",
        icon: "success",
        confirmButtonColor: "#0071e3",
        confirmButtonText: "ดูสถานะคำสั่งซื้อ"
      }).then(() => {
        navigate('/thank');
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrorMessage('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddressChange = (e) => {
    const address = addresses.find(addr => addr.id === parseInt(e.target.value));
    setSelectedAddress(address);
  };

  const totalPrice = (product.price || 0) * (formData.amount || 1);

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>ย้อนกลับ</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-[#86868b] bg-white px-3 py-1 rounded-full border border-black/[0.06]">
            <FaLock className="text-emerald-500 text-[10px]" />
            <span>การสั่งซื้อปลอดภัย</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Product preview & details */}
          <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#0071e3] bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                สั่งซื้อด่วน
              </span>
              <h1 className="text-xl font-bold text-[#1d1d1f] tracking-tight pt-1">
                {product.ItemName || 'กำลังโหลดข้อมูลสินค้า...'}
              </h1>
            </div>

            {/* Seamless Product Image */}
            <div className="w-full aspect-square bg-white rounded-2xl p-6 border border-black/[0.04] flex items-center justify-center">
              <img
                src={product.file}
                alt={product.ItemName}
                className="max-h-full max-w-full object-contain mix-blend-multiply"
              />
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-black/[0.06]">
              <span className="text-xs font-semibold text-[#1d1d1f]">จำนวนที่ต้องการ:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAmountChange(formData.amount - 1)}
                  disabled={formData.amount <= 1}
                  className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-black/10 disabled:opacity-40 text-xs font-bold transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="font-semibold text-sm w-6 text-center">{formData.amount}</span>
                <button
                  type="button"
                  onClick={() => handleAmountChange(formData.amount + 1)}
                  className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-black/10 text-xs font-bold transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price line */}
            <div className="flex items-baseline justify-between pt-4 border-t border-black/[0.06]">
              <span className="text-xs text-[#86868b]">ยอดรวมสินค้านี้:</span>
              <span className="text-2xl font-bold text-[#1d1d1f]">
                ฿{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right Column: Checkout & Address Form */}
          <div className="md:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
              
              <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04]">
                <FaMapMarkerAlt className="text-[#0071e3]" />
                <h2 className="text-base font-semibold text-[#1d1d1f]">ข้อมูลผู้รับและที่อยู่จัดส่ง</h2>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-xs">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* User Info (Readonly) */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#f5f5f7] rounded-2xl p-3">
                    <span className="text-[10px] text-[#86868b] uppercase font-semibold">ผู้สั่งซื้อ</span>
                    <p className="font-medium text-[#1d1d1f] mt-0.5">{user.name || user.username || '-'}</p>
                  </div>
                  <div className="bg-[#f5f5f7] rounded-2xl p-3">
                    <span className="text-[10px] text-[#86868b] uppercase font-semibold">เบอร์ติดต่อ</span>
                    <p className="font-medium text-[#1d1d1f] mt-0.5">{user.phone || '-'}</p>
                  </div>
                </div>

                {/* Address Selection Dropdown */}
                {addresses.length > 0 ? (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1d1d1f]">
                      เลือกที่อยู่สำหรับจัดส่ง:
                    </label>
                    <select
                      onChange={handleAddressChange}
                      value={selectedAddress?.id}
                      className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {`${addr.name} - ${addr.housenumber} ต.${addr.tambon} จ.${addr.province} ${addr.zipcode}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-2xl text-xs text-amber-800 space-y-2">
                    <p>ยังไม่มีที่อยู่จัดส่งในระบบ</p>
                    <button
                      type="button"
                      onClick={() => navigate('/address')}
                      className="px-3 py-1.5 bg-[#0071e3] text-white rounded-full text-xs font-medium"
                    >
                      + เพิ่มที่อยู่ใหม่
                    </button>
                  </div>
                )}

                {/* Selected Address Card */}
                {selectedAddress && (
                  <div className="bg-[#f5f5f7] rounded-2xl p-4 text-xs text-[#424245] space-y-1 border border-black/[0.04]">
                    <div className="flex justify-between font-semibold text-[#1d1d1f]">
                      <span>{selectedAddress.name}</span>
                      <span className="font-mono">{selectedAddress.phone}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {selectedAddress.housenumber} {selectedAddress.village ? `หมู่ ${selectedAddress.village}` : ''} ต.{selectedAddress.tambon} อ.{selectedAddress.district} จ.{selectedAddress.province} {selectedAddress.zipcode}
                    </p>
                    {selectedAddress.other && (
                      <p className="text-[10px] text-[#86868b] italic pt-1">
                        หมายเหตุ: {selectedAddress.other}
                      </p>
                    )}
                  </div>
                )}

                {/* Method note */}
                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-2.5 text-xs text-[#1d1d1f]">
                  <FaTruck className="text-[#0071e3] text-base" />
                  <div>
                    <span className="font-semibold">ชำระเงินปลายทาง (Cash on Delivery)</span>
                    <p className="text-[11px] text-[#86868b]">ชำระเงินเมื่อเจ้าหน้าที่จัดส่งพัสดุถึงมือคุณ</p>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || !selectedAddress}
                  className="w-full py-3.5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] disabled:opacity-50 text-white text-xs font-semibold rounded-full shadow-[0_2px_12px_rgba(0,113,227,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FaCheck className="text-xs" />
                  <span>{submitting ? 'กำลังสั่งซื้อ...' : `ยืนยันสั่งซื้อ ฿${totalPrice.toLocaleString()}`}</span>
                </button>
              </form>

            </div>

            {/* Apple Guarantee notes */}
            <div className="bg-white rounded-3xl p-5 border border-black/[0.06] flex items-center gap-3 text-xs text-[#86868b]">
              <FaShieldAlt className="text-[#0071e3] text-xl flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#1d1d1f]">การันตีสินค้าแท้ 100%</p>
                <p className="text-[11px]">รับประกันศูนย์ไทย จัดส่งรวดเร็ว มีปัญหาเปลี่ยนคืนได้ตามเงื่อนไข</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PaymentForm;
