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
        const response = await axios.get('https://ecomapi2-production.up.railway.app/auth/usergetproduct');
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
      const rs = await axios.post('https://ecomapi2-production.up.railway.app/auth/login', input);
      localStorage.setItem('token', rs.data.token);
      const rs1 = await axios.get('https://ecomapi2-production.up.railway.app/auth/me', {
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
    <div className="relative">

<div className='mt-[120px]'>
  <div className='mb-[20px]'>
  <p className="text-[50px] font-semibold text-center cursor-pointer " onClick={() => setShowModal(true)}>ลงชื่อเข้าใช้</p>
  <p className="font-semibold text-lg text-center cursor-pointer" onClick={() => setShowModal(true)}>เพื่อสั่งชื่อสินค้าจากทางเรา คลิ๊กนี้เลย </p>
  </div>

<Promote />
</div>


      {/* Product List */}
      {loading ? (
        <p>กำลังโหลดข้อมูลสินค้า...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="p-4 top1">
          <h1 className="text-2xl font-bold mb-4">รายการสินค้า</h1>
          <div className="product-marquee-wrapper">
            <div className="product-marquee">
              {products.concat(products).map((product) => (
                <div
                  key={product.id}
                  className="border p-4 rounded-[20px] shadow-md cursor-pointer flex-shrink-0"
                  onClick={handleProductClick}
                >
                  <img
                    src={product.file}
                    alt={product.ItemName}
                    className="w-full h-40 object-cover mb-2 rounded"
                  />
                  <h2 className="text-lg font-semibold  text-center">{product.ItemName}</h2>
                          <p className="font-semibold text-center text-md mb-4">
            ราคา: {product.price}</p>
                  
                  <p className={`text-sm mt-2 ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    สต็อก: {product.stock > 0 ? `${product.stock} ชิ้น` : 'สินค้าหมด'}
                  </p>
                </div>
                
              ))}
              
            </div>
          </div>
          
        </div>
        
      )}

    
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          

          <div className="relative">
          <button
  className="absolute top-4 right-4 text-[#3D5FD9] text-3xl font-bold bg-transparent border-none cursor-pointer"
  onClick={() => setShowModal(false)}
  aria-label="Close"
>
  &times;
</button>
  

  
    <form
    className="flex flex-col justify-center items-center outline-none bg-white w-[30rem] h-[30rem] rounded-[25px] shadow-md p-10"
    onSubmit={hdlSubmit}
    
  >
    
    <p className="font-semibold text-[40px] text-[#5473E3] text-center mt-1 mb-12">เข้าสู่ระบบ</p>

    <label className="form-control w-full max-w-xs">
      <input
        placeholder="ชื่อผู้ใช้"
        type="text"
        className="input input-bordered w-full max-w-xs border-[#bbc4cf] mt-5 block rounded-[18px]"
        name="username"
        value={input.username}
        onChange={hdlChange}
      />
    </label>

    <label className="form-control w-full max-w-xs">
      <input
        type="password"
        placeholder="รหัสผ่าน"
        className="input input-bordered w-full max-w-xs border-[#bbc4cf] mt-5 block rounded-[18px]"
        name="password"
        value={input.password}
        onChange={hdlChange}
      />
    </label>

    <div className="flex gap-5 mt-8">
      <button
        type="submit"
        className="rounded-full bg-[#3D5FD9] text-[#F5F7FF] w-[15rem] p-3 hover:bg-[#2347C5]"
      >
        ลงชื่อเข้าใช้
      </button>
    </div>

    <p className="text-gray-800 text-sm mt-8 text-center">
      ยังไม่มีบัญชี?{' '}
      <Link to="/register" className="text-blue-600 hover:underline ml-1 font-semibold">
        สมัครสมาชิก
      </Link>
    </p>
  </form>

</div>

        </div>
      )}
    </div>
  );
}
