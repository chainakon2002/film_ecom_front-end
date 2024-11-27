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
        const rs = await axios.get('https://ecomapi2-production.up.railway.app/cart/carts/', {
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
      await axios.delete(`https://ecomapi2-production.up.railway.app/cart/carts/${id}`, {
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

      await axios.put(`https://ecomapi2-production.up.railway.app/cart/carts/${id}`, {
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
    <div className="container mx-auto mt-[100px] p-4">
      <p className="font-semibold text-2xl text-blue-500 text-center mb-4">Cart</p>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" className="px-6 py-3">
                สินค้า
              </th>
              <th scope="col" className="px-6 py-3">
                จำนวน
              </th>
              <th scope="col" className="px-6 py-3">
                ราคา
              </th>
              <th scope="col" className="px-6 py-3">
                
              </th>
            </tr>
          </thead>
          <tbody>
            {cart.map((carts) => (
              <tr
                key={carts.id}
                className="bg-white border-b hover:bg-gray-50"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(carts.id)}
                    onChange={() => handleCheckboxChange(carts.id)}
                    className="custom-checkbox"
                  />
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  <div className="flex items-center">
                    <img
                      src={carts.product.file}
                      alt={carts.product.name}
                      className="w-16 md:w-32 max-w-full max-h-full"
                    />
                    <span className="ml-4">{carts.product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => updateTotal(carts.id, carts.total - 1)}
                      className="inline-flex items-center justify-center p-1 text-sm font-medium h-6 w-6 text-gray-500 bg-white border border-gray-300 rounded-full"
                    >
                      <span className="sr-only">Decrease Quantity</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 18 2">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={carts.total}
                      min="1"
                      onChange={(e) => updateTotal(carts.id, parseInt(e.target.value))}
                      className="bg-gray-50 w-14 border border-gray-300 text-gray-900 text-sm rounded-lg px-2.5 py-1"
                    />
                    <button
                      onClick={() => updateTotal(carts.id, carts.total + 1)}
                      className="inline-flex items-center justify-center p-1 text-sm font-medium h-6 w-6 text-gray-500 bg-white border border-gray-300 rounded-full"
                    >
                      <span className="sr-only">Increase Quantity</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 18 18">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16" />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {carts.price.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => deleteCart(carts.id)}
                    className="text-red-600 hover:underline"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4" style={{ marginRight: '22px', textAlign: 'right' }}>
  <p className="font-semibold">ราคารวม: {calculateTotalPrice().toFixed(2)}</p>
</div>
        
      </div>
      <div className="text-center mt-4">
          <button
            onClick={Linkpayment}
            className="bg-blue-500 text-white px-4 py-2 rounded-[15px] hover:bg-blue-600"
            disabled={selectedItems.length === 0}
          >
            สั่งซื้อเลย
          </button>
        </div>
    </div>
  );
}

export default Cart;
