import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { FaHome, FaShoppingCart, FaClipboardList, FaMapMarkerAlt, FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const guestNav = [
  { to: '/', text: '' },
  { to: '/register', text: '' },
];

const userNav = [
  { to: '/', text: 'หน้าแรก', icon: <FaHome /> },
  { to: '/cart', text: 'ตะกร้า', icon: <FaShoppingCart /> },
  { to: '/product01', text: 'คำสั่งซื้อของฉัน', icon: <FaClipboardList /> },
  { to: '/address', text: 'ที่อยู่', icon: <FaMapMarkerAlt /> },
];

const adminNav = [
  { to: '/home', text: 'Home' },
  { to: '/order', text: 'Order' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const finalNav = user?.id ? (user?.role === 'ADMIN' ? adminNav : userNav) : guestNav;
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false); // ควบคุมเมนูบนมือถือ

  const hdlLogout = () => {
    logout();
    navigate('/');
  };

  const hdlPro = () => {
    navigate('/profile');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('https://ecom-api2-df4u.onrender.com/cart/carts/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartCount(response.data.length);
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    };

    if (user?.id) {
      fetchCartCount();
    }
  }, [user?.id]);

  return (
    <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/85 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border-b border-black/[0.06]' 
        : 'bg-white/70 backdrop-blur-lg border-b border-black/[0.04]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img 
              src="/assets/DISNEY copy.png" 
              alt="Logo" 
              className="h-9 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105" 
            />
            <span className="font-semibold text-lg tracking-tight text-[#1d1d1f] flex items-center gap-1.5">
              CS.SHOP
            </span>
          </Link>

          {user?.id && (
            <button 
              onClick={hdlPro}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] text-xs font-medium rounded-full transition-all duration-200"
              title="ดูโปรไฟล์"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {user.name}
            </button>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {finalNav.map((el) => {
            if (!el.text && !el.icon) return null;
            return (
              <Link
                key={el.to}
                to={el.to}
                className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/[0.05] rounded-full transition-all duration-200 relative"
              >
                {el.icon && <span className="text-base text-[#1d1d1f]/70">{el.icon}</span>}
                <span>{el.text}</span>
                {el.to === '/cart' && cartCount > 0 && (
                  <span className="bg-[#0071e3] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}

          {user?.id && (
            <button
              onClick={hdlLogout}
              className="ml-2 px-3.5 py-1.5 text-sm font-medium text-[#86868b] hover:text-[#ff3b30] hover:bg-red-50/60 rounded-full transition-all duration-200"
            >
              ออกจากระบบ
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-[#1d1d1f] hover:bg-black/[0.05] rounded-full transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div 
          className="md:hidden fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-50 flex justify-end"
          onClick={() => setMenuOpen(false)}
        >
          <div 
            className="bg-white/95 backdrop-blur-2xl w-64 h-[calc(100vh-4rem)] p-6 shadow-2xl border-l border-black/[0.06] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {user?.id && (
                <div 
                  onClick={() => { hdlPro(); setMenuOpen(false); }}
                  className="p-3 mb-3 bg-[#f5f5f7] rounded-xl flex items-center gap-2 cursor-pointer hover:bg-black/[0.06] transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <div className="text-sm font-semibold text-[#1d1d1f]">{user.name}</div>
                </div>
              )}

              {finalNav.map((el) => {
                if (!el.text && !el.icon) return null;
                return (
                  <Link
                    key={el.to}
                    to={el.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-[#1d1d1f] hover:bg-black/[0.05] rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {el.icon && <span className="text-base text-[#86868b]">{el.icon}</span>}
                      <span>{el.text}</span>
                    </div>
                    {el.to === '/cart' && cartCount > 0 && (
                      <span className="bg-[#0071e3] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {user?.id && (
              <button
                onClick={() => { hdlLogout(); setMenuOpen(false); }}
                className="w-full text-center py-2.5 text-sm font-medium text-[#ff3b30] bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                ออกจากระบบ
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
