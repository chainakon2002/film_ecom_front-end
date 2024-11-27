import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [editedOrder, setEditedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('รอดำเนินการ'); // For managing tabs
    const [loadingAccept, setLoadingAccept] = useState(null); // Loading state สำหรับการรับคำสั่ง
   
    const [loadingShipping, setLoadingShipping] = useState(false); 
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [loadingCancel, setLoadingCancel] = useState(false);
    const [statusCount, setStatusCount] = useState({});
    
    
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('https://ecomapi2-production.up.railway.app/auth/getorderadmin', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Sorting orders by date in descending order
                const sortedOrders = response.data.sort((a, b) => new Date(b.order.date) - new Date(a.order.date));
        setOrders(sortedOrders);
        countOrderStatus(sortedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, [token]);
    

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('th-TH') + ' ' + date.toLocaleTimeString('th-TH');
    };

    const handleOpenDetails = (address) => {
        setSelectedOrder(address);
    };

    const handleCloseDetails = () => {
        setSelectedOrder(null);
    };

    const handleOpenSlip = (slip) => {
        setSelectedSlip(slip);
    };

    const handleCloseSlip = () => {
        setSelectedSlip(null);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setLoadingAccept(orderId); 
        try {
            const response = await axios.put(
                `https://ecomapi2-production.up.railway.app/auth/updateorderstatus`,
                { orderId, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                setOrders(prevOrders => prevOrders.map(order =>
                    order.orderId === orderId ? { ...order, order: { ...order.order, status: newStatus } } : order
                ));
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        } finally {
            setLoadingAccept(null); 
        }
    };
    

    const handleShippingUpdate = (orderId, newShippingCompany, newTrackingNumber) => {
        setEditedOrder(prev => ({
            ...prev,
            orderId,
            shippingCompany: newShippingCompany,
            trackingNumber: newTrackingNumber
        }));
    };

    const confirmShippingUpdate = async () => {
        if (editedOrder) {
            setLoadingShipping(true); // Set loading state
            try {
                const response = await axios.put(
                    `https://ecomapi2-production.up.railway.app/auth/updateshipping`,
                    { 
                        orderId: editedOrder.orderId, 
                        shippingCompany: editedOrder.shippingCompany, 
                        trackingNumber: editedOrder.trackingNumber,
                        status: 'กำลังจัดส่ง' // Update status
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.status === 200) {
                    setOrders(prevOrders => prevOrders.map(order =>
                        order.orderId === editedOrder.orderId
                            ? { 
                                ...order, 
                                order: { 
                                    ...order.order, 
                                    shippingCompany: editedOrder.shippingCompany, 
                                    trackingNumber: editedOrder.trackingNumber,
                                    status: 'กำลังจัดส่ง' // Update status
                                }
                            }
                            : order
                    ));
                    setEditedOrder(null);
                    // Refresh the page
                    window.location.reload();
                }
            } catch (error) {
                console.error('Error updating shipping information:', error);
            } finally {
                setLoadingShipping(false); // Reset loading state
            }
        }
    };

    const handleCancelOrder = async () => {
        setLoadingCancel(true); // Show the loading spinner
        try {
          const token = localStorage.getItem("token");
          await axios.put(
            'https://ecomapi2-production.up.railway.app/auth/cancel',
            { 
              orderId: orderToCancel.orderId, 
              status: 'ยกเลิกโดยทางร้าน', 
              cancel: cancelReason
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        
          setOrders((prevOrders) =>
            prevOrders.map((o) =>
              o.orderId === orderToCancel.orderId
                ? { ...o, order: { ...o.order, status: 'ยกเลิกโดยทางร้าน', cancel: cancelReason } }
                : o
            )
          );
          handleCloseCancelModal();
        } catch (error) {
          console.error('Error canceling order:', error);
        } finally {
          setLoadingCancel(false); 
        }
      };
      
    
      const handleOpenCancelModal = (order) => {
        setOrderToCancel(order);
        setCancelModalOpen(true);
      };
      
      const handleCloseCancelModal = () => {
        setCancelModalOpen(false);
        setCancelReason('');
        setOrderToCancel(null);
      };
    
    
      const countOrderStatus = (orders) => {
        // Count the number of orders by status
        const count = orders.reduce((acc, order) => {
          const status = order.order.status; // ใช้ order.order.status ตามที่คุณระบุ
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
    
        setStatusCount(count);
      };
    

    const handleAcceptOrder = (orderId) => {
        handleStatusChange(orderId, 'กำลังเตรียมจัดส่ง');
        window.location.reload()
    };

    const filteredOrders = orders.filter(order => order.order.status === activeTab);

    return (
        <section className="py-24 relative">
            <div className="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto">
                <h2 className="font-manrope font-bold text-3xl sm:text-4xl leading-10 text-black mb-11">รายการสั่งซื้อ</h2>

               {/* Tab Navigation */}
               <div className="flex justify-center space-x-4 mb-8">
  {['ยกเลิกแล้ว', 'ยกเลิกโดยทางร้าน', 'รอดำเนินการ', 'กำลังเตรียมจัดส่ง', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ'].map(status => {
    const count = statusCount[status] || 0;
    return (
      <button
        key={status}
        onClick={() => setActiveTab(status)}
        className={`relative py-2 px-4 rounded-[13px] ${activeTab === status ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
      >
        <span className="relative flex items-center">
          {status}
          {count > 0 && (
            <span className="absolute top-[-5px] right-[-10px] translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </span>
      </button>
    );
  })}
</div>

    

                {/* Orders List */}
                {filteredOrders.length === 0 && <p>No orders found for {activeTab}.</p>}

                {filteredOrders.map((order) => (
                    <motion.div
                        key={order.orderId}
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Order Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 py-6 border-y border-gray-100 mb-6">


                            {/* Order Details */}
                            <div className="box">
                                <p className="font-normal text-base leading-7 text-gray-500 mb-3">วันที่สั่งซื้อ</p>
                                <h6 className="font-semibold font-manrope text-2xl leading-9 text-black">{formatDate(order.order.date)}</h6>
                            </div>
                            <div className="box">
                                <p className="font-normal text-base leading-7 text-gray-500 mb-3">รหัสคำสั่งซื้อ</p>
                                <h6 className="font-semibold font-manrope text-2xl leading-9 text-black">#{order.orderId}</h6>
                            </div>
                            <div className="box cursor-pointer" onClick={() => handleOpenSlip(order.slip)}>
                                <p className="font-normal text-base leading-7 text-gray-500 mb-3">ประเภทชำระเงิน</p>
                                <h6 className="font-semibold font-manrope text-2xl leading-9 text-black">{order.pay}</h6>
                            </div>
                            <div className="box cursor-pointer" onClick={() => handleOpenDetails(order.address)}>
                                <p className="font-normal text-base leading-7 text-gray-500 mb-3">ผู้รับและที่อยู่</p>
                                <h6 className="font-semibold font-manrope text-[30px] leading-9 text-black">
                                    {order.address.name} {order.address.lastname}
                                </h6>
                                <h6 className="font-semibold font-manrope text-[22px] leading-9 text-gray-500">
                                    {order.address.phone}
                                </h6>
                            </div>
                        </div>

                        {/* Product and Order Actions */}
                        <div className="grid grid-cols-7 w-full pb-6 border-b border-gray-100 gap-4">
                            {order.order.ordercart.map((cartItem) => (
                                <motion.div
                                    key={cartItem.id}
                                    className="col-span-7 min-[500px]:col-span-2 md:col-span-1 border border-gray-200 rounded-[15px] p-4 flex flex-col items-center"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <img
                                        src={cartItem.product.file}
                                        alt={cartItem.product.ItemName}
                                        className="w-full rounded-lg object-cover mb-2"
                                    />
                                    <p className="text-sm font-semibold text-gray-700">{cartItem.product.ItemName}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Order Status and Actions */}
                        <motion.div
                            className="flex flex-col items-start justify-between py-6 border-y border-gray-100 space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <p className="font-manrope font-semibold text-2xl leading-9 text-gray-900">
                                <span className="text-gray-900">สถานะ :</span> 
                                <span className="text-red-600"> {order.order.status}</span>
                            </p>

                            {order.order.status === 'รอดำเนินการ' && (
                                <button
                                    onClick={() => handleAcceptOrder(order.orderId)}
                                    className="bg-green-500 text-white py-2 px-4 rounded-lg"
                                >
                                    รับคำสั่งซื้อ
                                </button>
                            )}



{order.order.status === "รอดำเนินการ" && (
  <button
    onClick={() => handleOpenCancelModal(order)}
    className="px-2 py-4 bg-red-500 text-white text-[20px] font-medium rounded-[15px]"
  >
    ยกเลิกคำสั่งซื้อ
  </button>
)}

                            {order.order.status === 'กำลังเตรียมจัดส่ง' && (
                                <button
                                    onClick={() => handleShippingUpdate(order.orderId, 'บริษัทจัดส่งใหม่', '123456')}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                                >
                                    อัพเดตข้อมูลการจัดส่ง
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                ))}

                
                {editedOrder && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold mb-4">อัพเดตข้อมูลการจัดส่ง</h3>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">บริษัทจัดส่ง</label>
                                <input
                                    type="text"
                                    value={editedOrder.shippingCompany}
                                    onChange={(e) => setEditedOrder({ ...editedOrder, shippingCompany: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">หมายเลขติดตาม</label>
                                <input
                                    type="text"
                                    value={editedOrder.trackingNumber}
                                    onChange={(e) => setEditedOrder({ ...editedOrder, trackingNumber: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setEditedOrder(null)}
                                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={confirmShippingUpdate}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                )}

{selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={handleCloseDetails}
            />
            <div
              className="bg-white p-12 rounded-lg shadow-lg z-10 relative max-w-3xl w-full"
              style={{ maxHeight: '80vh', overflowY: 'auto' }}
            >
              <button
                className="absolute top-4 right-4 text-gray-600 text-2xl"
                onClick={handleCloseDetails}
              >
                
              </button>
              <h2 className="text-2xl font-bold mb-6">รายละเอียดที่อยู่</h2>
              <p className="mb-2"><strong>ชื่อ:</strong> {selectedOrder.name}</p>
              <p className="mb-2"><strong>นามสกุล:</strong> {selectedOrder.lastname}</p>
              <p className="mb-2"><strong>โทรศัพท์:</strong> {selectedOrder.phone}</p>
              <p className="mb-2"><strong>จังหวัด:</strong> {selectedOrder.province}</p>
              <p className="mb-2"><strong>อำเภอ:</strong> {selectedOrder.district}</p>
              <p className="mb-2"><strong>ตำบล:</strong> {selectedOrder.tambon}</p>
              <p className="mb-2"><strong>บ้านเลขที่:</strong> {selectedOrder.housenumber}</p>
              <p className="mb-2"><strong>หมู่บ้าน:</strong> {selectedOrder.village}</p>
              <p className="mb-2"><strong>รหัสไปรษณีย์:</strong> {selectedOrder.zipcode}</p>
              <p className="mb-2"><strong>อื่นๆ:</strong> {selectedOrder.other}</p>
            </div>
          </div>
        )}

{selectedSlip && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={handleCloseSlip}
            />
            <div
              className="bg-white p-12 rounded-lg shadow-lg z-10 relative max-w-[600px] flex flex-col items-center"
              style={{ maxHeight: '80vh', overflowY: 'auto' }}
            >
              <button
                className="absolute top-4 right-4 text-gray-600 text-2xl"
                onClick={handleCloseSlip}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-6">หลักฐานการโอนเงิน</h2>
              <div className="flex justify-center w-full">
        <img
          src={selectedSlip}
          alt="Slip"
          className="max-w-full max-h-[60vh] object-contain"
        />
      </div>
            </div>
          </div>
        )}


        {/* Cancel Modal */}
{cancelModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div
      className="fixed inset-0 bg-black opacity-50"
      onClick={handleCloseCancelModal}
    />
    <div
      className="bg-white p-12 rounded-lg shadow-lg z-10 relative max-w-3xl w-full"
      style={{ maxHeight: '80vh', overflowY: 'auto' }}
    >
      <button
        className="absolute top-4 right-4 text-gray-600 text-2xl"
        onClick={handleCloseCancelModal}
      >
        ×
      </button>
      <h2 className="text-2xl font-bold mb-6">เหตุผลการยกเลิกคำสั่งซื้อ</h2>
      <textarea
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
        className="w-full h-32 p-2 border border-gray-300 rounded-lg mb-6"
        placeholder="กรุณากรอกเหตุผลการยกเลิก"
      />
      <div className="flex justify-end">
        <button
          onClick={handleCancelOrder}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg"
          disabled={loadingCancel} // Disable the button while loading
        >
          {loadingCancel ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 16 0 8 8 0 0 1-16 0z"></path>
              </svg>
              Loading...
            </div>
          ) : (
            'ยืนยันการยกเลิก'
          )}
        </button>
      </div>
    </div>
  </div>
)}




            </div>
        </section>
    );
};

export default OrdersPage;