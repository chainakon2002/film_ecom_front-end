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
        const response = await axios.get('https://e-comapi-production.up.railway.app/cart/carts/', {
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
    <div className={`navbar bg-base-100 fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'} ${scrolled ? 'bg-white' : 'bg-base-100'}`}>
      <div className="flex-1 flex items-center">
        <img src="/assets/DISNEY copy.png" alt="" className={`transition-transform duration-300 ${scrolled ? 'h-16' : 'h-20'} w-auto mx-5`} />
        <a className="btn btn-ghost text-xl" onClick={hdlPro}>CS.SHOP | {user?.id ? user.name : ''}</a>
      </div>
      
      {/* ปุ่มเปิดเมนูมือถือ */}
      <div className="md:hidden flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl p-2 focus:outline-none">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* เมนูหลัก (ซ่อนในมือถือ, แสดงบนจอใหญ่) */}
      <div className="hidden md:flex">
        <ul className="menu menu-horizontal px-1">
          {finalNav.map(el => (
            <li key={el.to} className="mx-2 flex items-center">
              <Link
                to={el.to}
                className="text-[16px] font-semibold text-black hover:bg-gray-600 hover:text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center"
              >
                <span className="mr-2">{el.icon}</span>
                {!scrolled && el.text}
                {el.to === '/cart' && cartCount > 0 && (
                  <span className="ml-[1px] bg-red-500 text-white rounded-full px-1 text-xs">{cartCount}</span>
                )}
              </Link>
            </li>
          ))}
          {user?.id && (
            <li>
              <Link to="#" className="text-[16px] font-semibold hover:bg-red-400 transition-colors" onClick={hdlLogout}>ออกจากระบบ</Link>
            </li>
          )}
        </ul>
      </div>

      {/* เมนูสำหรับมือถือ (slide-in) */}
      {menuOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-3/4 h-full shadow-lg flex flex-col items-start p-5">
            <button onClick={() => setMenuOpen(false)} className="self-end text-2xl p-2">
              <FaTimes />
            </button>
            <ul className="w-full mt-5">
              {finalNav.map(el => (
                <li key={el.to} className="mb-3 w-full">
                  <Link
                    to={el.to}
                    className="text-lg font-semibold text-black hover:bg-gray-600 hover:text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center w-full"
                    onClick={() => setMenuOpen(false)} // ปิดเมนูเมื่อกด
                  >
                    <span className="mr-2">{el.icon}</span>
                    {el.text}
                    {el.to === '/cart' && cartCount > 0 && (
                      <span className="ml-[1px] bg-red-500 text-white rounded-full px-1 text-xs">{cartCount}</span>
                    )}
                  </Link>
                </li>
              ))}
              {user?.id && (
                <li>
                  <Link to="#" className="text-lg font-semibold text-red-500 hover:bg-red-400 transition-colors w-full block px-4 py-2 rounded-md" onClick={hdlLogout}>
                    ออกจากระบบ
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
