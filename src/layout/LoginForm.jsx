import axios from 'axios';
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import './css/login.css';
import { Link } from 'react-router-dom';
import Promote from "../layout/Promote";

export default function LoginForm() {
  const { setUser } = useAuth();
  const [input, setInput] = useState({
    username: '',
    password: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  // Fetch products when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://ecom-api2-df4u.onrender.com/auth/usergetproduct');
        setProducts(response.data);
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const hdlChange = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const hdlSubmit = async (e) => {
    try {
      e.preventDefault();
      // Perform login
      const rs = await axios.post('https://ecom-api2-df4u.onrender.com/auth/login', input);
      localStorage.setItem('token', rs.data.token);
      const rs1 = await axios.get('https://ecom-api2-df4u.onrender.com/auth/me', {
        headers: { Authorization: `Bearer ${rs.data.token}` }
      });
      localStorage.setItem('userId', rs1.data.id);
      setUser(rs1.data);
      setShowModal(false); // Close modal after successful login
    } catch (err) {
      console.log(err.message);
    }
  };


  const handleProductClick = () => {
    setShowModal(true);
  };
  const CloseDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-24 fade-in-page">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-3 pt-4">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            CS.SHOP
          </h1>
          <p className="text-sm sm:text-base text-[#86868b] max-w-md mx-auto">
            เข้าสู่ระบบเพื่อสำรวจและสั่งซื้ออุปกรณ์ไอทีคุณภาพพรีเมียม
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-sm font-medium rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all duration-200"
            >
              ลงชื่อเข้าใช้
            </button>
          </div>
        </section>

        {/* Promote Carousel */}
        <section aria-label="Promotion Banner">
          <Promote />
        </section>

        {/* Product Showcase */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                รายการสินค้าแนะนำ
              </h2>
              <p className="text-xs text-[#86868b] mt-0.5">
                คลิกที่สินค้าเพื่อลงชื่อเข้าใช้และสั่งซื้อ
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs font-medium text-[#0071e3] hover:underline"
            >
              เข้าสู่ระบบเพื่อสั่งซื้อ &rarr;
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <span className="loading loading-dots loading-lg text-[#0071e3]"></span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-center text-sm">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={handleProductClick}
                  className="group bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold tracking-wider text-[#86868b] uppercase bg-[#f5f5f7] px-2.5 py-0.5 rounded-full">
                      {product.category || 'สินค้า'}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                        product.stock > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/70'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {product.stock > 0 ? `เหลือ ${product.stock} ชิ้น` : 'สินค้าหมด'}
                    </span>
                  </div>

                  <div className="w-full h-48 flex items-center justify-center p-2 mb-3 bg-white rounded-xl overflow-hidden">
                    <img
                      src={product.file}
                      alt={product.ItemName}
                      className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base text-[#1d1d1f] tracking-tight group-hover:text-[#0071e3] transition-colors line-clamp-2 min-h-[44px] flex items-center justify-center text-center">
                    {product.ItemName}
                  </h3>

                  <div className="mt-2 text-center">
                    <span className="text-base sm:text-lg font-semibold text-[#1d1d1f]">
                      ฿{product.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-3 mt-auto">
                    <button
                      className="w-full py-2 px-4 bg-[#f5f5f7] group-hover:bg-[#0071e3] group-hover:text-white text-[#1d1d1f] font-medium text-xs rounded-full transition-all duration-200"
                    >
                      เข้าสู่ระบบเพื่อสั่งซื้อ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Apple-style Login Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-black/[0.06] w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors focus:outline-none"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                เข้าสู่ระบบ
              </h2>
              <p className="text-xs text-[#86868b] mt-1">
                กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าถึงบัญชี CS.SHOP
              </p>
            </div>

            <form className="space-y-4" onSubmit={hdlSubmit}>
              <div>
                <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5 ml-1">
                  ชื่อผู้ใช้
                </label>
                <input
                  placeholder="Username"
                  type="text"
                  className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm text-[#1d1d1f] transition-all"
                  name="username"
                  value={input.username}
                  onChange={hdlChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5 ml-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm text-[#1d1d1f] transition-all"
                  name="password"
                  value={input.password}
                  onChange={hdlChange}
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white font-medium text-sm rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all"
                >
                  ลงชื่อเข้าใช้
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-[#86868b]">
                  ยังไม่มีบัญชีผู้ใช้?{' '}
                  <Link to="/register" className="text-[#0071e3] hover:underline font-medium">
                    สมัครสมาชิก
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

