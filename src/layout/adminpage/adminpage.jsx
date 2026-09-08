import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [productSales, setProductSales] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [bestSellingProduct, setBestSellingProduct] = useState(null);
    const token = localStorage.getItem('token');


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('https://ecom-api2-df4u.onrender.com/auth/getorderadmin', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Filter orders with status "จัดส่งแล้ว"
                const shippedOrders = response.data.filter(order => order.order.status === 'จัดส่งสำเร็จ');

                setOrders(shippedOrders);
                calculateProductSales(shippedOrders);
                calculateGrandTotal(shippedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        const calculateProductSales = (orders) => {
            const sales = {};

            orders.forEach(order => {
                order.order.ordercart.forEach(cartItem => {
                    const productId = cartItem.product.id;
                    const productName = cartItem.product.ItemName;
                    const quantity = cartItem.total;

                    if (sales[productId]) {
                        sales[productId].quantity += quantity;
                    } else {
                        sales[productId] = {
                            name: productName,
                            quantity: quantity,
                            image: cartItem.product.file, // Adding image field
                        };
                    }
                });
            });

            const salesData = Object.values(sales);
            setProductSales(salesData);

            // Find the best-selling product
            if (salesData.length > 0) {
                const bestProduct = salesData.reduce((max, product) =>
                    product.quantity > max.quantity ? product : max
                );
                setBestSellingProduct(bestProduct);
            }
        };

        const calculateGrandTotal = (orders) => {
            let total = 0;

            orders.forEach(order => {
                const totalOrderPrice = order.order.ordercart.reduce(
                    (sum, cartItem) => sum + cartItem.price, 0
                );
                total += totalOrderPrice;
            });

            setGrandTotal(total);
        };

        fetchOrders();
    }, [token]);

    // Modern Apple-tailored color palette for chart bars
    const colors = [
        '#0071e3', // Apple Blue
        '#34c759', // Apple Green
        '#5856d6', // Apple Indigo
        '#ff9500', // Apple Orange
        '#af52de', // Apple Purple
        '#30b0c7', // Apple Teal
    ];

    const data = {
        labels: productSales.map(product => product.name),
        datasets: [
            {
                label: 'จำนวนขาย (ชิ้น)',
                data: productSales.map(product => product.quantity),
                backgroundColor: colors,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.5,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(29, 29, 31, 0.9)',
                titleFont: {
                    family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Prompt", sans-serif',
                    size: 13,
                },
                bodyFont: {
                    family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Prompt", sans-serif',
                    size: 12,
                },
                padding: 12,
                cornerRadius: 12,
                boxPadding: 6,
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Prompt", sans-serif',
                        size: 12,
                    },
                    color: '#86868b',
                },
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                }
            },
            y: {
                ticks: {
                    font: {
                        family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Prompt", sans-serif',
                        size: 12,
                    },
                    color: '#86868b',
                    beginAtZero: true,
                    stepSize: 1,
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.04)',
                },
                border: {
                    display: false,
                }
            },
        },
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('th-TH') + ' ' + date.toLocaleTimeString('th-TH');
    };

    return (
        <div className="space-y-8 fade-in-page max-w-6xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    ภาพรวมระบบ (Dashboard)
                </h1>
                <p className="text-sm text-[#86868b] mt-1">
                    สถิติยอดขายและภาพรวมคำสั่งซื้อที่จัดส่งสำเร็จแล้ว
                </p>
            </div>

            {/* Apple Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Total Revenue */}
                <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                            ยอดขายรวมทั้งหมด
                        </span>
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-full border border-emerald-100/70">
                            จัดส่งสำเร็จ
                        </span>
                    </div>
                    <div>
                        <p className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
                            ฿{grandTotal.toLocaleString()}
                        </p>
                        <p className="text-xs text-[#86868b] mt-1.5">
                            รายได้จากคำสั่งซื้อที่สำเร็จทั้งหมด
                        </p>
                    </div>
                </div>

                {/* Best Selling Product */}
                <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
                    {bestSellingProduct ? (
                        <>
                            <div className="w-18 h-18 bg-white rounded-2xl p-2 flex items-center justify-center flex-shrink-0 border border-black/[0.06]">
                                <img
                                    src={bestSellingProduct.image}
                                    alt={bestSellingProduct.name}
                                    className="max-h-16 max-w-16 object-contain rounded-lg mix-blend-multiply"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0071e3] bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                                    สินค้าขายดีที่สุด
                                </span>
                                <h3 className="font-semibold text-sm text-[#1d1d1f] truncate">
                                    {bestSellingProduct.name}
                                </h3>
                                <p className="text-xs text-[#86868b] mt-0.5">
                                    ยอดขาย: <span className="font-semibold text-[#1d1d1f]">{bestSellingProduct.quantity} ชิ้น</span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center w-full py-4 text-xs text-[#86868b]">
                            ยังไม่มีข้อมูลสินค้าขายดี
                        </div>
                    )}
                </div>

                {/* Completed Orders Count */}
                <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                            คำสั่งซื้อสำเร็จ
                        </span>
                        <span className="px-2.5 py-0.5 bg-[#f5f5f7] text-[#86868b] text-[11px] font-medium rounded-full">
                            รวม
                        </span>
                    </div>
                    <div>
                        <p className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
                            {orders.length} <span className="text-base font-normal text-[#86868b]">รายการ</span>
                        </p>
                        <p className="text-xs text-[#86868b] mt-1.5">
                            รายการคำสั่งซื้อที่เสร็จสมบูรณ์
                        </p>
                    </div>
                </div>
            </div>

            {/* Sales Chart Section */}
            {productSales.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">
                                ยอดขายสินค้าตามจำนวน (ชิ้น)
                            </h2>
                            <p className="text-xs text-[#86868b] mt-0.5">
                                กราฟแสดงสัดส่วนยอดจำหน่ายสินค้าแต่ละรายการ
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]"></span>
                            <span className="text-xs text-[#86868b]">จำนวนขาย</span>
                        </div>
                    </div>
                    <div className="h-[280px] w-full pt-4">
                        <Bar data={data} options={options} />
                    </div>
                </div>
            )}

            {/* Completed Orders Details */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
                        รายการคำสั่งซื้อที่จัดส่งสำเร็จ
                    </h2>
                    <span className="text-xs text-[#86868b]">
                        ทั้งหมด {orders.length} รายการ
                    </span>
                </div>

                {orders.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {orders.map(order => {
                            const totalOrderPrice = order.order.ordercart.reduce(
                                (sum, cartItem) => sum + cartItem.price, 0
                            );

                            return (
                                <div 
                                    className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200 space-y-4" 
                                    key={order.id}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/[0.04]">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-sm text-[#1d1d1f]">
                                                Order #{order.orderId}
                                            </span>
                                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100/70">
                                                {order.order.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-[#86868b]">
                                            {formatDate(order.order.date)}
                                        </div>
                                    </div>

                                    {/* Products in this order */}
                                    <div className="divide-y divide-black/[0.04]">
                                        {order.order.ordercart.map(cartItem => (
                                            <div className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0" key={cartItem.id}>
                                                <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 border border-black/[0.06]">
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
                                                    <p className="text-xs text-[#86868b]">
                                                        จำนวน: {cartItem.total} ชิ้น
                                                    </p>
                                                </div>
                                                <div className="text-sm font-semibold text-[#1d1d1f]">
                                                    ฿{cartItem.price.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] text-xs text-[#86868b]">
                                        <div>
                                            <span>วิธีชำระ: <strong className="text-[#1d1d1f] font-medium">{order.pay}</strong></span>
                                            <span className="mx-2">•</span>
                                            <span>ผู้ใช้ ID: <strong className="text-[#1d1d1f] font-medium">{order.userId}</strong></span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-[#86868b] mr-2">ยอดรวมคำสั่งซื้อ:</span>
                                            <span className="text-base font-bold text-[#1d1d1f]">
                                                ฿{totalOrderPrice.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-black/[0.06]">
                        <p className="text-sm text-[#86868b]">ไม่มีคำสั่งซื้อที่จัดส่งสำเร็จในขณะนี้</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
