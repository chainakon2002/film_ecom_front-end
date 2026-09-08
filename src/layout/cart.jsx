import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cart.css';

function Cart() {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const rs = await axios.get('https://ecom-api2-df4u.onrender.com/cart/carts/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(rs.data);
        console.log(rs.data);
      } catch (err) {
        console.error(err);
      }
    };

    // Check if the page needs to be reloaded
    const needsReload = localStorage.getItem('needsReload') === 'true';

    if (needsReload) {
      localStorage.removeItem('needsReload');
      window.location.reload();
    } else {
      fetchData();
    }
  }, []);


  const deleteCart = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://ecom-api2-df4u.onrender.com/cart/carts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(cart.filter((item) => item.id !== id));
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const updateTotal = async (id, data) => {
    try {
      const currentItem = cart.find((item) => item.id === id);

      let newAllPrice;
      if (data > currentItem.total) {
        newAllPrice = (currentItem.price / currentItem.total) * data;
      } else if (data < currentItem.total) {
        newAllPrice = (currentItem.price / currentItem.total) * data;
      } else {
        newAllPrice = currentItem.all_price;
      }

      await axios.put(`https://ecom-api2-df4u.onrender.com/cart/carts/${id}`, {
        total: data,
        price: newAllPrice,
      });

      setCart(cart.map((item) =>
        item.id === id ? { ...item, total: data, price: newAllPrice } : item
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTotalPrice = () => {
    const selectedCartItems = cart.filter(item => selectedItems.includes(item.id));
    return selectedCartItems.reduce((total, item) => total + item.price, 0);
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((itemId) => itemId !== id)
        : [...prevSelectedItems, id]
    );
  };

  const Linkpayment = () => {
    const selectedCartItems = cart.filter(item => selectedItems.includes(item.id));
    navigate('/pay', { state: { selectedCartItems } });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-6 pb-24 fade-in-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            ตะกร้าสินค้า
          </h1>
          <p className="text-sm text-[#86868b] mt-1">
            ตรวจสอบและจัดการรายการสินค้าที่คุณต้องการสั่งซื้อ
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/[0.06] p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4 text-[#86868b] text-2xl">
              🛒
            </div>
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-1">ไม่มีสินค้าในตะกร้า</h2>
            <p className="text-sm text-[#86868b] mb-6">เริ่มเลือกซื้อสินค้าที่น่าสนใจจากร้านของเรา</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-medium rounded-full transition-colors"
            >
              เลือกดูสินค้า
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-[#86868b] bg-[#fbfbfd] border-b border-black/[0.04]">
                    <tr>
                      <th scope="col" className="px-6 py-4 w-12">
                        <span className="sr-only">Select</span>
                      </th>
                      <th scope="col" className="px-6 py-4">
                        สินค้า
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        จำนวน
                      </th>
                      <th scope="col" className="px-6 py-4 text-right">
                        ราคา
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {cart.map((carts) => (
                      <tr key={carts.id} className="hover:bg-[#fbfbfd] transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(carts.id)}
                            onChange={() => handleCheckboxChange(carts.id)}
                            className="custom-checkbox"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 border border-black/[0.06]">
                              <img
                                src={carts.product.file}
                                alt={carts.product.name}
                                className="max-h-full max-w-full object-contain mix-blend-multiply"
                              />
                            </div>
                            <span className="font-medium text-[#1d1d1f] text-sm">
                              {carts.product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateTotal(carts.id, Math.max(1, carts.total - 1))}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-black/10 text-[#1d1d1f] transition-colors"
                              aria-label="ลดจำนวน"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-medium text-sm text-[#1d1d1f]">
                              {carts.total}
                            </span>
                            <button
                              onClick={() => updateTotal(carts.id, carts.total + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-black/10 text-[#1d1d1f] transition-colors"
                              aria-label="เพิ่มจำนวน"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-[#1d1d1f]">
                          ฿{carts.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => deleteCart(carts.id)}
                            className="text-xs font-medium text-[#86868b] hover:text-[#ff3b30] transition-colors"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total and Checkout summary */}
            <div className="bg-white rounded-3xl border border-black/[0.06] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#86868b]">
                  เลือกแล้ว {selectedItems.length} จาก {cart.length} รายการ
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-medium text-[#86868b]">ยอดรวมทั้งสิ้น:</span>
                  <span className="text-2xl font-bold text-[#1d1d1f]">
                    ฿{calculateTotalPrice().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={Linkpayment}
                disabled={selectedItems.length === 0}
                className="w-full sm:w-auto px-8 py-3 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] disabled:bg-[#f5f5f7] disabled:text-[#86868b] disabled:cursor-not-allowed text-white text-sm font-medium rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] disabled:shadow-none transition-all duration-200"
              >
                ดำเนินการสั่งซื้อ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
