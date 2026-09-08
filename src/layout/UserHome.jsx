import axios from 'axios';
import { useEffect, useState } from 'react';
import './css/UserHome.css';
import Promote from "../layout/Promote";
import { Link } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function UserHome() {
  const [product, setProduct] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // Default to 'ALL'
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://ecom-api2-df4u.onrender.com/auth/getproduct', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProduct(response.data);

        const rs = await axios.get('https://ecom-api2-df4u.onrender.com/cart/carts/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(rs.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, []);

  const filteredProducts = product.filter(item => {
    const matchesSearch = item.ItemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === 'ALL' || item.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const cartShow = async () => {
    try {
      const token = localStorage.getItem('token');
      const rscarts = await axios.get('https://ecom-api2-df4u.onrender.com/cart/carts/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(rscarts.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cartfu = async (item) => {
    const userid = localStorage.getItem('userId');
    const cartItimechix = cart.find(c => c.productId === item.id);
    setAddingId(item.id);
    try {
      if (cartItimechix) {
        const totalAll = cartItimechix.total + 1;
        const nextprice = cartItimechix.price + item.price;
        await axios.put(`https://ecom-api2-df4u.onrender.com/cart/carts/${cartItimechix.id}/`, {
          total: totalAll,
          price: nextprice
        });
      } else {
        await axios.post('https://ecom-api2-df4u.onrender.com/cart/carts', {
          total: 1,
          price: item.price,
          UserId: userid,
          productId: item.id
        });
      }
      window.location.reload();
      cartShow();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] fade-in-page pb-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        {/* Apple Hero Banner */}
        <section aria-label="Hero Promotion">
          <Promote />
        </section>

        {/* Store Title & Description */}
        <section className="text-center pt-4 pb-2 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            รายการสินค้า
          </h1>
          <p className="text-sm sm:text-base text-[#86868b] max-w-lg mx-auto font-normal">
            อุปกรณ์ไอทีและซอฟต์แวร์คุณภาพระดับพรีเมียม เพื่อประสิทธิภาพสูงสุดของคุณ
          </p>
        </section>

        {/* Controls: Apple Pill Search & Segmented Control */}
        <section className="space-y-4 max-w-2xl mx-auto">
          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center w-full bg-white border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus-within:shadow-[0_4px_20px_rgba(0,113,227,0.12)] focus-within:border-[#0071e3] rounded-full px-4 py-2.5 transition-all duration-200">
              <FaSearch className="text-[#86868b] text-sm mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า เช่น Intel, Windows, WD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-[#1d1d1f] placeholder-[#86868b] focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-[#86868b] hover:text-[#1d1d1f] p-1 transition-colors"
                  aria-label="ล้างคำค้นหา"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* Apple Segmented Control Tabs */}
          <div className="flex justify-center">
            <div className="bg-[#e8e8ed]/80 backdrop-blur-sm p-1 rounded-full inline-flex gap-1 border border-black/[0.04]">
              {[
                { id: 'ALL', label: 'ทั้งหมด' },
                { id: 'SOFTWARE', label: 'ซอฟต์แวร์' },
                { id: 'HARDWARE', label: 'ฮาร์ดแวร์' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-[#1d1d1f] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                      : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section aria-label="Product Catalog">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-black/[0.06] shadow-sm my-8">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3 text-[#86868b]">
                <FaSearch className="text-lg" />
              </div>
              <h3 className="text-base font-semibold text-[#1d1d1f] mb-1">ไม่พบสินค้าที่คุณค้นหา</h3>
              <p className="text-xs text-[#86868b] mb-4">ลองค้นหาด้วยคำอื่น หรือเลือกดูสินค้าทั้งหมด</p>
              <button
                onClick={() => { setSearchTerm(''); setActiveTab('ALL'); }}
                className="px-4 py-2 bg-[#0071e3] text-white text-xs font-medium rounded-full hover:bg-[#0077ed] transition-colors"
              >
                ดูสินค้าทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative"
                >
                  {/* Floating Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3 w-full">
                    <span className="text-[10px] font-semibold tracking-wider text-[#86868b] uppercase bg-[#f5f5f7] px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                        item.stock > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/70'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {item.stock > 0 ? `เหลือ ${item.stock} ชิ้น` : 'สินค้าหมด'}
                    </span>
                  </div>

                  {/* Product Details Link */}
                  <Link
                    to={`/product/${item.id}`}
                    className="flex flex-col items-center flex-grow text-center group cursor-pointer"
                  >
                    {/* Product Image Frame */}
                    <div className="w-full h-48 flex items-center justify-center p-2 mb-3 bg-white rounded-xl overflow-hidden">
                      <img
                        src={item.file}
                        alt={item.ItemName}
                        className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Title */}
                    <h2 className="font-semibold text-sm sm:text-base text-[#1d1d1f] tracking-tight group-hover:text-[#0071e3] transition-colors line-clamp-2 min-h-[44px] flex items-center justify-center">
                      {item.ItemName}
                    </h2>

                    {/* Price */}
                    <div className="mt-2 mb-3">
                      <span className="text-base sm:text-lg font-semibold text-[#1d1d1f] tracking-tight">
                        ฿{item.price.toLocaleString()}
                      </span>
                    </div>
                  </Link>

                  {/* Add To Cart Button */}
                  <div className="pt-2 mt-auto w-full">
                    {item.stock > 0 ? (
                      <button
                        onClick={() => cartfu(item)}
                        disabled={addingId === item.id}
                        className="w-full py-2.5 px-4 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white font-medium text-xs sm:text-sm rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.2)] hover:shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition-all duration-200 flex items-center justify-center gap-1.5"
                      >
                        <span>{addingId === item.id ? 'กำลังเพิ่ม...' : 'เพิ่มไปยังตะกร้า'}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 bg-[#f5f5f7] text-[#86868b] font-medium text-xs sm:text-sm rounded-full cursor-not-allowed text-center"
                      >
                        สินค้าหมด
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
