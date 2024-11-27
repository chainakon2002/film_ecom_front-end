import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const hdlLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-[380px] p-4 bg-white text-gray-700 shadow-xl shadow-blue-gray-900/5 rounded-xl overflow-y-auto flex flex-col">
      <div className="mb-2 p-2">
        <h5 className="block antialiased tracking-normal font-sans text-xl font-semibold leading-snug text-gray-900">
          <div className="flex items-center ml-0">
            <img
              src="/src/assets/DISNEY copy.png"
              alt=""
              className="h-[100px] w-[109px] "
            />
            <a className="btn btn-ghost text-xl " sty le={{ marginLeft: '-8px' }}>
              CS.SHOP | {user?.id ? user.username : ''}
            </a>
 
          </div>
        </h5>
      </div>
      <div className="flex justify-center py-4 border-b border-gray-200">
      <p className="text-[24px] font-bold text-blue-700">พนักงาน</p>

      </div>
      <nav className="flex flex-col flex-grow gap-1 p-2 font-sans text-base font-normal text-gray-700">

        <Link
          to="/"
          className="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-blue-50 hover:bg-opacity-80 focus:bg-blue-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-blue-900 focus:text-blue-900 active:text-blue-900 outline-none"
        >
          <div className="grid place-items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M6.912 3a3 3 0 00-2.868 2.118l-2.411 7.838a3 3 0 00-.133.882V18a3 3 0 003 3h15a3 3 0 003-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0017.088 3H6.912zm13.823 9.75l-2.213-7.191A1.5 1.5 0 0017.088 4.5H6.912a1.5 1.5 0 00-1.434 1.059L3.265 12.75H6.11a3 3 0 012.684 1.658l.256.513a1.5 1.5 0 001.342.829h3.218a1.5 1.5 0 001.342-.83l.256-.512a3 3 0 012.684-1.658h2.844z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          รายการสั่งซื้อทั้งหมด
        </Link>

      </nav>
      <button
        onClick={hdlLogout}
        className="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-blue-50 hover:bg-opacity-80 focus:bg-blue-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-blue-900 focus:text-blue-900 active:text-blue-900 outline-none text-red-500 font-semibold mt-auto"
      >
        <div className="grid place-items-center mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M12 2a1 1 0 00-1 1v6.586l-4.707-4.707a1 1 0 00-1.414 1.414L10.586 11H7a1 1 0 000 2h3.586l-4.707 4.707a1 1 0 001.414 1.414L12 13.414V20a1 1 0 002 0V3a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        ออกจากระบบ
      </button>
    </div>
  );
};

export default Sidebar;
