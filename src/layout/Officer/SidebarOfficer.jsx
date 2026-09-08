import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FaClipboardList, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hdlLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-72 bg-white/90 backdrop-blur-xl border-r border-black/[0.06] p-5 flex flex-col justify-between z-30 select-none">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-black/[0.04]">
          <img
            src="/assets/DISNEY copy.png"
            alt="Logo"
            className="h-9 w-auto object-contain rounded-lg"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-base tracking-tight text-[#1d1d1f]">
              CS.SHOP
            </span>
            <span className="text-[11px] font-medium text-[#86868b] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              เจ้าหน้าที่ • {user?.username || user?.name || 'Officer'}
            </span>
          </div>
        </div>

        <div className="px-3 mb-2">
          <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
            เมนูการทำงาน
          </p>
        </div>

        <nav className="space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all"
          >
            <FaClipboardList className="text-base" />
            <span>รายการสั่งซื้อทั้งหมด</span>
          </Link>
        </nav>
      </div>

      <div className="pt-4 border-t border-black/[0.04]">
        <button
          onClick={hdlLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#ff3b30] hover:bg-red-50 transition-colors duration-200"
        >
          <FaSignOutAlt className="text-base" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
