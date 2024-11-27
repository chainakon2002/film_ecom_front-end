import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Paymentall.css';

function Paymentcarts() {
    const location = useLocation();
    const carts = location.state.selectedCartItems;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(() => {
        // Retrieve last used address from local storage, if any
        const savedAddress = localStorage.getItem('selectedAddress');
        return savedAddress ? JSON.parse(savedAddress) : null;
    });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [slipImage, setSlipImage] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);


    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await axios.get('https://ecomapi2-production.up.railway.app/auth/useraddress', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAddresses(response.data);
            } catch (err) {
                console.error('Error fetching addresses:', err);
            }
        };

        fetchAddresses();
    }, [token]);

    const all_total = () => {
        const tl = carts.reduce((e, i) => e + i.total, 0);
        const pr = carts.reduce((e, i) => e + i.price, 0);
        const shippingCost = getShippingCost();
        const totalWithShipping = pr + shippingCost;
    
        return (
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm mt-4 text-right">
                <h1 className="text-lg font-semibold">จำนวนรวม: {tl}</h1>
                <h1 className="text-lg font-semibold">ราคารวม: {pr.toLocaleString()}</h1>
                <h1 className="text-lg font-semibold">ค่าจัดส่ง: {shippingCost}</h1>
                <h1 className="text-lg font-semibold">รวมทั้งหมด: {totalWithShipping.toLocaleString()}</h1>
            </div>
        );
    };
    

    const orderFn = async () => {
        try {
            const tl = carts.reduce((e, i) => e + i.total, 0);
            const pr = carts.reduce((e, i) => e + i.price, 0);
            const shippingCost = getShippingCost();
            const totalWithShipping = pr + shippingCost;
            
            const rs = await axios.post('https://ecomapi2-production.up.railway.app/order/order', {
                total_all: tl,
                price_all: totalWithShipping,  // รวมราคากับค่าจัดส่ง
                status: 'รอดำเนินการ',
                shippingCompany: '*',
                trackingNumber: '*',
                cancel: '*',
                cancelstore: '*',
                date: new Date()
            });
            ordercartFn(rs.data.orders.id);
        } catch (err) {
            console.error('Error placing order:', err);
        }
    };
    

    const ordercartFn = async (id) => {
        try {
            await Promise.all(
                carts.map(async (m) => {
                    await axios.post('https://ecomapi2-production.up.railway.app/order/ordercart', {
                        price: m.price,
                        total: m.total,
                        userId: m.UserId,
                        productId: m.productId,
                        orderId: id
                    });
                })
            );
            deletecartFn();
            updatestockFn();
            PaymentFn(id);
        } catch (err) {
            console.error('Error processing order cart:', err);
        }
    };

    const deletecartFn = async () => {
        try {
            await Promise.all(
                carts.map(async (m) => {
                    await axios.delete(`https://ecomapi2-production.up.railway.app/cart/carts/${m.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                })
            );
        } catch (err) {
            console.error('Error deleting cart:', err);
        }
    };

    const PaymentFn = async (id) => {
        try {
            const userid = localStorage.getItem('userId');
            const paymentData = {
                status: 'ชำระแล้ว',
                userId: userid,
                pay: paymentMethod,
                addressId: selectedAddress.id,
                orderId: id,
            };

            if (slipImage) {
                paymentData.slip = slipImage;
            }

            await axios.post('https://ecomapi2-production.up.railway.app/payment/payments', paymentData);
            Swal.fire({
                title: 'สั่งซื้อสำเร็จ!',
                text: 'สินค้าของคุณได้ถูกสั่งซื้อแล้ว.',
                icon: 'success'
            });
            navigate('/product01');
        } catch (err) {
            console.error('Error processing payment:', err);
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถดำเนินการชำระเงินได้ กรุณาลองใหม่.',
                icon: 'error'
            });
        }
    };

    const updatestockFn = async () => {
        try {
            await Promise.all(
                carts.map(async (m) => {
                    const stocks = m.product.stock - m.total;
                    await axios.put(`https://ecomapi2-production.up.railway.app/auth/products/${m.product.id}`, {
                        stock: stocks
                    });
                })
            );
        } catch (err) {
            console.error('Error updating stock:', err);
        }
    };

    const handleOrderConfirmation = () => {
        if (paymentMethod === 'โอนจ่าย') {
            setShowModal(true);
        } else {
            Swal.fire({
                title: 'คุณแน่ใจหรือไม่?',
                text: "คุณต้องการยืนยันการสั่งซื้อนี้หรือไม่?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'ยืนยัน',
                cancelButtonText: 'ยกเลิก',
            }).then((result) => {
                if (result.isConfirmed) {
                    orderFn()
                        .catch((error) => {
                            Swal.fire({
                                title: 'เกิดข้อผิดพลาด!',
                                text: 'ไม่สามารถสั่งซื้อได้ กรุณาลองใหม่.',
                                icon: 'error'
                            });
                        });
                }
            });
        }
    };

    const handleSlipUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setSlipImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleConfirmWithSlip = () => {
        setShowModal(false);
        orderFn();
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
       
        setShowAddressModal(false);
    };


    const getShippingCost = () => {
        if (paymentMethod === 'จ่ายปลายทาง') {
            return 45;
        }
        return 0;
    };
    
    return (
        <div className='mt-[130px] p-6 '>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Product Images Section */}
                <div className="flex-1">
                    <div className="flex flex-col gap-6">
                        {carts.map(m => (
                            <div key={m.id} className="bg-white rounded-lg shadow-md p-4 flex items-center">
                                <img src={m.product.file} alt="" className="w-36 h-36 rounded-md mr-4" />
                                <div className="flex flex-col text-gray-700">
                                    <p className='text-[22px] font-semibold'>{m.product.ItemName}</p>
                                    <p>จำนวน: {m.total}</p>
                                    <p>ราคา: {m.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>



                {/* Address and Payment Section */}
                <div className="flex-1  rounded-lg p-4 shadow-md">
                    <div className="mt-[10px]">
                    <p className="mt-[10px] text-[20px] font-semibold">ช่องทางการชำระเงิน</p>




                    <form className="mt-5 grid gap-6">
                    <div className="relative">
    <input
      className="peer hidden"
      id="radio_1"
      type="radio"
      name="radio"
      value="จ่ายปลายทาง"
      checked={paymentMethod === 'จ่ายปลายทาง'}
      onChange={(e) => setPaymentMethod(e.target.value)}
    />
    <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white"></span>
    <label
      className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
      htmlFor="radio_1"
    >
      <img
        className="w-14 object-contain rounded-xl"
        src="/src/assets/cod.jpg"
      />
      <div className="ml-5">
        <span className="mt-2 font-semibold">จ่ายปลายทาง</span>
        <p className="text-slate-500 text-sm leading-6">จัดส่งประมาณ 2-4วัน</p>
        
      </div>
    </label>
  </div>

  {/* ตัวเลือกที่ 2 */}
  <div className="relative">
    <input
      className="peer hidden"
      id="radio_2"
      type="radio"
      name="radio"
      value="โอนจ่าย"
      checked={paymentMethod === 'โอนจ่าย'}
      onChange={(e) => setPaymentMethod(e.target.value)}
    />
    <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white"></span>
    <label
      className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
      htmlFor="radio_2"
    >
      <img
        className="w-16 object-contain"
        src="/src/assets/icon-thaiqr.png"
      />
      <div className="ml-5">
        <span className="mt-2 font-semibold">โอนจ่าย</span>
        <p className="text-slate-500 text-sm leading-6">จัดส่งประมาณ 2-4วัน</p>
        <p className="text-slate-500 text-sm leading-6">ส่งฟรี</p>
      </div>
    </label>
  </div>
</form>



{selectedAddress ? (
  <div>
    
    
  </div>
) : (
  <button
  onClick={() => setShowAddressModal(true)}
  className="text-[20px] font-semibold text-gray-800 mb-2 mt-[20px]"
>
  เลือกที่อยู่
</button>

)}

{selectedAddress && (
  <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
    <h2 className="text-[20px] font-semibold text-gray-800 mb-2">ที่อยู่</h2>
    <div className="flex items-center justify-between">
      {/* ชื่อที่อยู่ */}
      <p className="text-gray-600">
        <strong></strong> {selectedAddress.name} {selectedAddress.lastname} , {selectedAddress.phone}  , {selectedAddress.housenumber}/{selectedAddress.village},  {selectedAddress.tambon}, {selectedAddress.district} , {selectedAddress.province} , {selectedAddress.zipcode}
      </p>
      {/* ปุ่มเปลี่ยนที่อยู่ */}
      <button
        onClick={() => setShowAddressModal(true)}
        className="ml-auto w-[130px] p-2rounded text-gray-800 hover:bg-gray-300 transition"
      >
        {selectedAddress ? 'เปลี่ยนที่อยู่ >' : 'เลือกที่อยู่ที่ต้องการจัดส่ง'}
      </button>
    </div>
  </div>
)}



                    </div>
                    <div className='text-center mt-6'>
                        {all_total()}
                    </div>
                    <div className="text-center mt-6">
                        <button 
                            onClick={handleOrderConfirmation} 
                            className="text-white bg-blue-500 px-6 py-2 rounded-lg hover:bg-blue-600"
                        >
                            ยืนยันการสั่งซื้อ
                        </button>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-[600px] w-full">
      <h2 className="text-xl font-medium text-gray-800 mb-4">เลือกที่อยู่</h2>
      <form>
        
        {addresses.map((address) => (
          <div key={address.id} className="relative mb-4">
            <input
              className="peer hidden"
              id={`address-${address.id}`}
              type="radio"
              name="address"
              value={address.id}
              checked={selectedAddress && selectedAddress.id === address.id}
              onChange={() => handleAddressSelect(address)}
            />
            <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-5 w-5 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white"></span>
            <label
              className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
              htmlFor={`address-${address.id}`}
            >
         
              <div className="ml-5">
                <span className="mt-2 text-lg font-semibold">{address.name} {address.lastname} </span>
                <p className="text-slate-500 text-sm leading-6">{address.phone}  , {address.housenumber}/{address.village},  {address.tambon}, {address.district} , {address.province} , {address.zipcode}
                </p>
              </div>
            </label>
          </div>
        ))}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => setShowAddressModal(false)}
            className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  </div>
)}



 

{showModal && (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 mt-[90px]">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-[750px] w-full max-h-[670px] overflow-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">อัพโหลดสลิปการโอนเงิน</h2>
            <div className="flex justify-between items-start mb-4">
               
                <img src="/src/assets/pay.jpg" alt="Example Slip" className="w-[350px] h-auto border border-gray-200 rounded-lg shadow-sm mr-4" />
               
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleSlipUpload}
                    className="file-input w-full max-w-xs"
                />
                <div>
                    
                </div>
            </div>
            {slipImage && (
                <div className="mt-4 flex justify-end">
                    {/* Uploaded slip image on the right */}
                    {/* <img src={slipImage} alt="Slip" className="max-w-full max-h-60 object-contain border border-gray-300 rounded-lg shadow-sm" /> */}
                </div>
            )}
            <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 mr-2"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleConfirmWithSlip}
                                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                ยืนยันการสั่งซื้อ
                            </button>
                        </div>
        </div>
    </div>
)}
        </div>
    );
}

export default Paymentcarts;
