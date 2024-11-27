import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // เปลี่ยนจาก useHistory เป็น useNavigate
import axios from 'axios';
import Swal from 'sweetalert2';

const PaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // เปลี่ยนจาก useHistory เป็น useNavigate
  const [formData, setFormData] = useState({
    amount: 1,
    userId: '',
    productId: '',
    username: '',
    price: '',
    productname: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [product, setProduct] = useState({});
  const [user, setUser] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://ecomapi2-production.up.railway.app/auth/getproduct/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProduct(response.data);
        console.log('Fetched product:', response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://ecomapi2-production.up.railway.app/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);

        const addressResponse = await axios.get(`https://ecomapi2-production.up.railway.app/auth/useraddress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(addressResponse.data);
        setSelectedAddress(addressResponse.data[0]);
        console.log('Fetched addresses:', addressResponse.data);
      } catch (error) {
        console.error('Error fetching user or address:', error);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://ecomapi2-production.up.railway.app/auth/payment', {
        productsId: id,
        amount: formData.amount,
        userId: formData.userId,
        productId: formData.productId,
        username: formData.username,
        price: formData.price,
        productname: formData.productname,
        addressId: selectedAddress.id,
        status: 'กำลังดำเนินการ'
      });
      setFormData(response.data);
      console.log('Payment successful:', response.data);

      Swal.fire({
        title: "Order Placed",
        icon: "success",
        showClass: {
          popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
      }).then(() => {
        navigate('/thank'); // เปลี่ยนจาก history.push เป็น navigate
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrorMessage('An error occurred while processing payment. Please try again later.');
    }
  };

  const handleAddressChange = (e) => {
    const address = addresses.find(addr => addr.id === parseInt(e.target.value));
    setSelectedAddress(address);
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg mt-[85px]">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <img src="/src/assets/cod.jpg" alt="COD" className="w-24 mx-auto mt-2" />
          </div>

          <h2 className="text-center text-xl mb-4"><strong>{product.ItemName}</strong></h2>
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <img src={product.file} alt="" className="mx-auto" />
            </div>

            <div className="mb-4">
              <label htmlFor="productId"><strong>{product.ItemName}</strong> ID:</label>
              <input type="text" id="productId" name="productId" value={formData.productId = product.id} onChange={handleChange} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            <div className="mb-4">
              <label htmlFor="productname">Product :</label>
              <input type="text" id="productname" name="productname" value={formData.productname = product.ItemName} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            <hr className="my-4" />

            <div className="mb-4">
              <label htmlFor="amount">Amount:</label>
              <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} min="1" max="5" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            <div className="mb-4">
              <p>Total Price: {product.price * formData.amount}</p>
            </div>

            <div className="mb-4">
              <label htmlFor="price">Price</label>
              <input type="text" name="price" id="price" value={formData.price = product.price * formData.amount} onChange={handleChange} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            <div className="mb-4">
              <label htmlFor="userId">User ID:</label>
              <input type="text" id="userId" name="userId" value={formData.userId = user.id} onChange={handleChange} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            <div className="mb-6">
              <label htmlFor="username">Name:</label>
              <input type="text" name="username" id="username" value={formData.username = user.username} onChange={handleChange} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            {addresses.length > 0 && (
              <div className="mb-6">
                <label htmlFor="address">เลือกที่อยู่:</label>
                <select id="address" onChange={handleAddressChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {`${addr.name}, ${addr.phone}, ${addr.province}, ${addr.district}, ${addr.housenumber}/${addr.village}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedAddress && (
              <div className="mb-6">
                <h2 className="text-xl font-medium text-gray-800 mb-2">Address</h2>
                <p className="text-gray-600"><strong>ชื่อ:</strong> {selectedAddress.name}</p>
                <p className="text-gray-600"><strong>เบอร์โทร:</strong> {selectedAddress.phone}</p>
                <p className="text-gray-600"><strong>จังหวัด:</strong> {selectedAddress.province}</p>
                <p className="text-gray-600"><strong>อำเภอ:</strong> {selectedAddress.district}</p>
                <p className="text-gray-600"><strong>ตำบล:</strong> {selectedAddress.tambon}</p>
                <p className="text-gray-600"><strong>เลขที่:</strong> {selectedAddress.housenumber}</p>
                <p className="text-gray-600"><strong>หมู่ที่:</strong> {selectedAddress.village}</p>
                <p className="text-gray-600"><strong>รหัสไปรษณีย์:</strong> {selectedAddress.zipcode}</p>
                <p className="text-gray-600"><strong>รายละเอียด:</strong> {selectedAddress.other}</p>
              </div>
            )}

            <div className="flex justify-center">
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Order</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm;
