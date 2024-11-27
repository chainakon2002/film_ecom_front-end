import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import provincesData from '../data/json/thai_provinces.json';
import amphuresData from '../data/json/thai_amphures.json';
import tambonsData from '../data/json/thai_tambons.json';

const UserProfile = ({ id }) => {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    name: '',
    lastname: '',
    phone: '',
    province: '',
    district: '',
    tambon: '',
    housenumber: '',
    village: '',
    zipcode: '',
    other: ''
  });
  const [filteredAmphures, setFilteredAmphures] = useState([]);
  const [filteredTambons, setFilteredTambons] = useState([]);
  const [zipcode, setZipcode] = useState('');
  const [editAddress, setEditAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      } catch (error) {
        console.error('Error fetching user or address:', error);
      }
    };

    fetchUser();
  }, [id]);

  const handleProvinceChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prevState) => ({
      ...prevState,
      [name]: value,
      
      tambon: '', // Reset tambon when province changes
      zipcode: '' // Reset zipcode when province changes
    }));

    const selectedProvince = provincesData.find(
      (province) => province.name_th === value
    );
    if (selectedProvince) {
      const filteredAmphures = amphuresData.filter(
        (amphur) => amphur.province_id === selectedProvince.id
      );
      setFilteredAmphures(filteredAmphures);
      setFilteredTambons([]); // Clear tambons when province changes
      setZipcode(''); // Clear zipcode when province changes
    } else {
      setFilteredAmphures([]);
      setFilteredTambons([]);
      setZipcode('');
    }
  };

  const handleDistrictChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prevState) => ({
      ...prevState,
      [name]: value,
      tambon: '', // Reset tambon when district changes
      zipcode: '' // Reset zipcode when district changes
    }));
    
    const selectedAmphur = filteredAmphures.find(
      (amphur) => amphur.name_th === value
    );
    if (selectedAmphur) {
      const filteredTambons = tambonsData.filter(
        (tambon) => tambon.amphure_id === selectedAmphur.id
      );
      setFilteredTambons(filteredTambons);
    } else {
      setFilteredTambons([]);
    }
  };
  

  const handleTambonChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prevState) => ({
      ...prevState,
      [name]: value
    }));

    const selectedTambon = tambonsData.find(
      (tambon) => tambon.name_th === value
    );
    if (selectedTambon) {
      setZipcode(selectedTambon.zip_code);
    } else {
      setZipcode('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`https://ecomapi2-production.up.railway.app/auth/addUserAddress`, {
        ...newAddress,
        zipcode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses((prevAddresses) => [...prevAddresses, response.data]);
      setNewAddress({
        name: '',
        lastname: '',
        phone: '',
        province: '',
        district: '',
        tambon: '',
        housenumber: '',
        village: '',
        zipcode: '',
        other: ''
      });
      setIsModalOpen(false); // Close modal after adding address
    } catch (error) {
      console.error('Error adding new address:', error);
    }
  };

  const openEditModal = (address) => {
    setEditAddress(address);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        console.log('Sending data:', { ...editAddress, zipcode }); // ตรวจสอบข้อมูลที่ส่ง
        const response = await axios.put(`https://ecomapi2-production.up.railway.app/auth/updateaddress/${editAddress.id}`, {
            ...editAddress,
            zipcode,
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setAddresses((prevAddresses) =>
            prevAddresses.map((address) =>
                address.id === editAddress.id ? response.data : address
            )
        );
        setIsEditModalOpen(false);
    } catch (error) {
        console.error('Error updating address:', error.response?.data || error.message); // แสดงข้อความผิดพลาดที่ชัดเจนขึ้น
    }
};

  

  
 

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg mt-16">
      {user && (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">ข้อมูลผู้ใช้</h1>
      <p className="text-gray-600 text-lg"><strong>ชื่อ:</strong> {user.name}</p>
      <p className="text-gray-600 text-lg"><strong>อีเมล:</strong> {user.email}</p>
    </div>
  )}
{addresses.length > 0 ? (
  addresses.map((address, index) => (
    <div
      key={index}
      className="mb-6 p-6 border border-gray-200 rounded-[20px] shadow-md bg-white transition-transform transform hover:scale-105"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        ที่อยู่ {index + 1}
      </h2>
      <div className="text-gray-700 space-y-2">
        <p>
          <strong>ชื่อ:</strong> {address.name} {address.lastname}
        </p>
        <p>
          <strong>โทรศัพท์:</strong> {address.phone}
        </p>
        <p>
          <strong>จังหวัด:</strong> {address.province}
        </p>
        <p>
          <strong>อำเภอ:</strong> {address.district}
        </p>
        <p>
          <strong>ตำบล:</strong> {address.tambon}
        </p>
        <p>
          <strong>บ้านเลขที่:</strong> {address.housenumber}
        </p>
        <p>
          <strong>หมู่บ้าน:</strong> {address.village}
        </p>
        <p>
          <strong>รหัสไปรษณีย์:</strong> {address.zipcode}
        </p>
        <p>
          <strong>รายละเอียดเพิ่มเติม:</strong> {address.other}
        </p>
      </div>
      <button
        onClick={() => openEditModal(address)}
        className="mt-4 flex items-center text-blue-600 hover:text-blue-800 space-x-2 transition-colors duration-300"
      >
        <FaEdit className="text-xl" />
        <span className="font-medium">Edit</span>
      </button>
    </div>
  ))
) : (
  <p className="text-gray-600">No addresses found</p>
)}


      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-6 p-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300"
      >
        เพิ่มที่อยู่
      </button>
{/* New Address Modal */}
{isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4">เพิ่มที่อยู่</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 ">
    <input
      type="text"
      name="name"
      value={newAddress.name}
      onChange={handleChange}
      placeholder="ชื่อ"
      required
      className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
    />
    <input
      type="text"
      name="lastname"
      value={newAddress.lastname}
      onChange={handleChange}
      placeholder="นามสกุล"
      required
      className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
    />
    <input
      type="text"
      name="phone"
      value={newAddress.phone}
      onChange={handleChange}
      placeholder="เบอร์โทร"
      required
      className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
    />
  </div>
  <div className="grid grid-cols-1 gap-4 mb-4">
  <select
    name="province"
    value={newAddress.province}
    onChange={handleProvinceChange}
    required
    className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
  >
    <option value="">เลือกจังหวัด</option>
    {provincesData.map((province) => (
      <option key={province.id} value={province.name_th}>
        {province.name_th}
      </option>
    ))}
  </select>
  <select
    name="district"
    value={newAddress.district}
    onChange={handleDistrictChange}
    required
    className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
  >
    <option value="">เลือกอำเภอ</option>
    {filteredAmphures.map((amphur) => (
      <option key={amphur.id} value={amphur.name_th}>
        {amphur.name_th}
      </option>
    ))}
  </select>
  <select
    name="tambon"
    value={newAddress.tambon}
    onChange={handleTambonChange}
    required
    className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
  >
    <option value="">เลือกตำบล</option>
    {filteredTambons.map((tambon) => (
      <option key={tambon.id} value={tambon.name_th}>
        {tambon.name_th}
      </option>
    ))}
  </select>
</div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
    <input
      type="text"
      name="housenumber"
      value={newAddress.housenumber}
      onChange={handleChange}
      placeholder="บ้านเลขที่"
      required
      className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
    />
    <input
      type="text"
      name="village"
      value={newAddress.village}
      onChange={handleChange}
      placeholder="หมู่"
      className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
    />
    <input
      type="text"
      name="zipcode"
      value={zipcode}
      readOnly
      placeholder="รหัสไปรษณีย์"
      required
      className="w-full bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline bg-gray-200"
    />
  </div>
  <div className="mb-4">
    <textarea
      name="other"
      value={newAddress.other}
      onChange={handleChange}
      placeholder="รายละเอียดอื่นๆ"
      className="w-full h-32 bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
    />
  </div>
  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
    <button
      type="submit"
      className="w-full md:w-1/2 bg-blue-900 text-gray-100 p-3 rounded-lg font-bold uppercase text-sm focus:outline-none focus:shadow-outline transition-colors duration-300 hover:bg-blue-800"
    >
      ยืนยัน
    </button>
    <button
      type="button"
      onClick={() => setIsModalOpen(false)}
      className="w-full md:w-1/2 bg-gray-500 text-white p-3 rounded-lg font-bold uppercase text-sm focus:outline-none focus:shadow-outline transition-colors duration-300 hover:bg-red-500"
    >
      ยกเลิก
    </button>
  </div>
</form>

    </div>
  </div>
)}


{isEditModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 mt-[60px]">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4">แก้ไขที่อยู่</h2>
      <form onSubmit={handleEditSubmit}>
        {/* ฟิลด์แก้ไขที่อยู่ */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* First Name */}
          <input
            type="text"
            name="name"
            value={editAddress.name}
            onChange={(e) => setEditAddress({ ...editAddress, name: e.target.value })}
            placeholder="First Name"
            required
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* Last Name */}
          <input
            type="text"
            name="lastname"
            value={editAddress.lastname}
            onChange={(e) => setEditAddress({ ...editAddress, lastname: e.target.value })}
            placeholder="Last Name"
            required
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* Phone */}
          <input
            type="tel"
            name="phone"
            value={editAddress.phone}
            onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value })}
            placeholder="Phone Number"
            required
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* House Number */}
          <input
            type="text"
            name="housenumber"
            value={editAddress.housenumber}
            onChange={(e) => setEditAddress({ ...editAddress, housenumber: e.target.value })}
            placeholder="House Number"
            required
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* Village */}
          <input
            type="text"
            name="village"
            value={editAddress.village}
            onChange={(e) => setEditAddress({ ...editAddress, village: e.target.value })}
            placeholder="Village"
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* Province */}
          <select
            name="province"
            value={editAddress.province}
            onChange={(e) => {
              handleProvinceChange(e);
              setEditAddress({ ...editAddress, province: e.target.value });
            }}
            required
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Province</option>
            {provincesData.map((province) => (
              <option key={province.id} value={province.name_th}>
                {province.name_th}
              </option>
            ))}
          </select>
          {/* District */}
          <select
            name="district"
            value={editAddress.district}
            onChange={(e) => {
              handleDistrictChange(e);
              setEditAddress({ ...editAddress, district: e.target.value });
            }}
            required
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select District</option>
            {filteredAmphures.map((amphur) => (
              <option key={amphur.id} value={amphur.name_th}>
                {amphur.name_th}
              </option>
            ))}
          </select>
          {/* Tambon */}
          <select
            name="tambon"
            value={editAddress.tambon}
            onChange={(e) => {
              handleTambonChange(e);
              setEditAddress({ ...editAddress, tambon: e.target.value });
            }}
            required
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Subdistrict</option>
            {filteredTambons.map((tambon) => (
              <option key={tambon.id} value={tambon.name_th}>
                {tambon.name_th}
              </option>
            ))}
          </select>
          {/* Zipcode */}
          <input
            type="text"
            name="zipcode"
            value={zipcode}
            readOnly
            placeholder="Zipcode"
            required
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
          />
          {/* Other */}
          <input
            type="text"
            name="other"
            value={editAddress.other}
            onChange={(e) => setEditAddress({ ...editAddress, other: e.target.value })}
            placeholder="Other Information"
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {/* ปุ่มบันทึกและยกเลิก */}
        <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
        <button
          type="submit"
          className="w-full md:w-1/2 bg-blue-900 text-gray-100 p-3 rounded-lg font-bold uppercase text-sm focus:outline-none focus:shadow-outline transition-colors duration-300 hover:bg-blue-800"
        >
            บันทึก
        </button>
        <button
          type="button"
          onClick={() => setIsEditModalOpen(false)}
          className="w-full md:w-1/2 bg-gray-500 text-white p-3 rounded-lg font-bold uppercase text-sm focus:outline-none focus:shadow-outline transition-colors duration-300 hover:bg-red-500"
        >
          ยกเลิก
        </button>


        </div>
        
      </form>
    </div>
  </div>
)}




    </div>
  );
};

export default UserProfile;
