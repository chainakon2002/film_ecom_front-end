import axios from 'axios';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import 'animate.css';

export default function RegisterForm() {
  const navigate = useNavigate();

  const [input, setInput] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    name: '',
    lastname: '',
    phone: '',
  });

  const hdlChange = e => {
    setInput(prv => ({ ...prv, [e.target.name]: e.target.value }));
  };

  const hdlSubmit = async e => {
    try {
      e.preventDefault();
      // Validation
      if (input.password !== input.confirmPassword) {
        return alert('Please check confirm password');
      }
      const rs = await axios.post('https://ecom-api2-df4u.onrender.com/auth/register', input);
      console.log(rs);
      if (rs.status === 200) {
        Swal.fire({
          title: "สมัครสมาชิกเรียบร้อย",
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster',
          },
        });
        navigate('/');
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4 sm:p-6 fade-in-page">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-black/[0.06] max-w-xl w-full my-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            สมัครสมาชิก
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] mt-1">
            สร้างบัญชีผู้ใช้ใหม่เพื่อเริ่มต้นสั่งซื้อสินค้ากับ CS.SHOP
          </p>
        </div>

        <form onSubmit={hdlSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1 ml-1">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] transition-all"
                name="username"
                value={input.username}
                onChange={hdlChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1 ml-1">
                ชื่อ
              </label>
              <input
                type="text"
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] transition-all"
                name="name"
                value={input.name}
                onChange={hdlChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1 ml-1">
                นามสกุล
              </label>
              <input
                type="text"
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] transition-all"
                name="lastname"
                value={input.lastname}
                onChange={hdlChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1 ml-1">
                อีเมล
              </label>
              <input
                type="email"
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] transition-all"
                name="email"
                value={input.email}
                onChange={hdlChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1 ml-1">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] transition-all"
                name="phone"
                value={input.phone}
                onChange={hdlChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1 ml-1">
                รหัสผ่าน
              </label>
              <input
                type="password"
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] transition-all"
                name="password"
                value={input.password}
                onChange={hdlChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1 ml-1">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] transition-all"
                name="confirmPassword"
                value={input.confirmPassword}
                onChange={hdlChange}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white font-medium text-sm rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all"
            >
              สมัครสมาชิก
            </button>
          </div>

          <p className="text-xs text-[#86868b] text-center pt-2">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/" className="text-[#0071e3] hover:underline font-medium ml-1">
              ลงชื่อเข้าใช้
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
