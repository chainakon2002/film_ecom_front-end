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
      const rs = await axios.post('https://ecomapi2-production.up.railway.app/auth/register', input);
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
    <div className="flex items-center justify-center h-screen mt-[20px]">
      <div className="text-3xl mb-5"></div>
      <form
        className="bg-white p-6 rounded-[20px] shadow-lg  max-w-[700px] w-full max-h-[90vh] overflow-y-auto transition-transform transform hover:scale-105"
        onSubmit={hdlSubmit}
      >
        <p className="font-semibold text-[24px] text-[#5473E3] text-center">สมัครสมาชิก</p>
        
        <div  className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 w-[600px]'>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">ชื่อผู้ใช้</span>
          </div>
          <input
            type="text"
            className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
            name="username"
            value={input.username}
            onChange={hdlChange}
          />
        </label>

        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">ชื่อ</span>
          </div>
          <input
            type="text"
            className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
            name="name"
            value={input.name}
            onChange={hdlChange}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">นามสกุล</span>
          </div>
          <input
            type="text"
            className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
            name="lastname"
            value={input.lastname}
            onChange={hdlChange}
          />
        </label>


        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 '>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">อีเมล</span>
          </div>
          <input
            type="email"
            className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
            name="email"
            value={input.email}
            onChange={hdlChange}
          />
        </label>
        
        
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">เบอร์โทรศัพท์</span>
          </div>
          <input
            type="text"
            className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
            name="phone"
            value={input.phone}
            onChange={hdlChange}
          />
        </label>

        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 '>

        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">รหัสผ่าน</span>
          </div>
          <input
            type="password"
            className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
            name="password"
            value={input.password}
            onChange={hdlChange}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">ยืนยันรหัสผ่าน</span>
          </div>
          <input
            type="password"
            className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
            name="confirmPassword"
            value={input.confirmPassword}
            onChange={hdlChange}
          />
        </label>


        </div>




        
        <div className="flex items-center justify-center mt-[40px]">
          <button type="submit" className="w-full md:w-1/3 bg-blue-700 text-gray-100 p-3 rounded-[20px] font-bold uppercase text-sm focus:outline-none focus:shadow-outline transition-colors duration-300 hover:bg-blue-800">
            สมัครสมาชิก
          </button>
        </div>

        <p className="text-gray-800 text-sm mt-8 text-center">
          มีบัญชีแล้ว{' '}
          <Link to="/" className="text-blue-600 hover:underline ml-1 font-semibold">
            ลงชื่่อเข้าใช้
          </Link>
        </p>
      </form>
    </div>
  );
}
