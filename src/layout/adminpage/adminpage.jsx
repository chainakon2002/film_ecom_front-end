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
                const response = await axios.get('https://ecomapi2-production.up.railway.app/auth/getorderadmin', {
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

    // Array of colors for each bar
    const colors = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
    ];

    const data = {
        labels: productSales.map(product => product.name),
        datasets: [
            {
                label: 'จำนวนขาย',
                data: productSales.map(product => product.quantity),
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.6', '1')),
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                    },
                    color: '#333',
                },
            },
            title: {
                display: true,
                text: 'ยอดขายสินค้าตามจำนวน',
                font: {
                    size: 20,
                },
                color: '#333',
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 12,
                    },
                    color: '#666',
                },
                grid: {
                    display: false,
                },
            },
            y: {
                ticks: {
                    font: {
                        size: 12,
                    },
                    color: '#666',
                    beginAtZero: true,
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)',
                },
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
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">คำสั่งซื้อทั้งหมด</h1>
            
            {/* Grand Total and Best-Selling Product Display */}
            <div className="mb-8">
                <div className="text-right mb-4">
                    <p className="text-2xl font-bold">ยอดรวมทั้งหมด: {grandTotal} บาท</p>
                </div>
                {bestSellingProduct && (
                    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center mb-8">
                        <img
                            src={bestSellingProduct.image}
                            alt={bestSellingProduct.name}
                            className="w-32 h-32 object-cover rounded-lg mr-4"
                        />
                        <div>
                            <h2 className="text-xl font-bold">สินค้าขายดีที่สุด</h2>
                            <p className="text-lg font-medium">{bestSellingProduct.name}</p>
                            <p className="text-lg">จำนวนขาย: {bestSellingProduct.quantity} ชิ้น</p>
                        </div>
                    </div>
                )}
            </div>
            
            {productSales.length > 0 && (
                <div className="mb-8">
                    <Bar data={data} options={options} />
                </div>
            )}

            {orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map(order => {
                        const totalOrderPrice = order.order.ordercart.reduce(
                            (sum, cartItem) => sum + cartItem.price, 0
                        );

                        return (
                            <div className="bg-white p-4 rounded-lg shadow-md" key={order.id}>
                                <h2 className="text-xl font-semibold mb-2">Order ID: {order.orderId}</h2>
                                <p><strong>สถานะ:</strong> {order.order.status}</p>
                                <p><strong>User ID:</strong> {order.userId}</p>
                                <p><strong>Payment Method:</strong> {order.pay}</p>
                                <p><strong>Total Price:</strong> {order.order.price_all} บาท</p>
                                <p><strong>Date:</strong> {formatDate(order.order.date)}</p>
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold mb-2">สินค้า:</h3>
                                    {order.order.ordercart.map(cartItem => (
                                        <div className="flex items-center mb-4" key={cartItem.id}>
                                            <img
                                                src={cartItem.product.file}
                                                alt={cartItem.product.ItemName}
                                                className="w-16 h-16 object-cover rounded-lg mr-4"
                                            />
                                            <div className="flex-1">
                                                <h4 className="text-md font-medium">{cartItem.product.ItemName}</h4>
                                                <p><strong>Quantity:</strong> {cartItem.total}</p>
                                                <p><strong>Price:</strong> {cartItem.price} บาท</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-right mt-4">
                                        <p className="text-lg font-bold">ยอดรวมสินค้า: {totalOrderPrice} บาท</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-700">ไม่มีคำสั่งซื้อในขณะนี้</p>
            )}
        </div>
    );
};

export default OrdersPage;
