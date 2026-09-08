import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaEdit, 
  FaMapMarkerAlt, 
  FaPlus, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaUser, 
  FaHome, 
  FaTimes, 
  FaCheck,
  FaShieldAlt
} from 'react-icons/fa';
import provincesData from '../data/json/thai_provinces.json';
import amphuresData from '../data/json/thai_amphures.json';
import tambonsData from '../data/json/thai_tambons.json';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userRes = await axios.get(`https://ecom-api2-df4u.onrender.com/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data);

        const addressRes = await axios.get(`https://ecom-api2-df4u.onrender.com/auth/useraddress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(Array.isArray(addressRes.data) ? addressRes.data : []);
      } catch (error) {
        console.error('Error fetching user or address:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProvinceChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
      district: '',
      tambon: '',
      zipcode: ''
    }));

    const selectedProvince = provincesData.find((p) => p.name_th === value);
    if (selectedProvince) {
      const amphures = amphuresData.filter((a) => a.province_id === selectedProvince.id);
      setFilteredAmphures(amphures);
      setFilteredTambons([]);
      setZipcode('');
    } else {
      setFilteredAmphures([]);
      setFilteredTambons([]);
      setZipcode('');
    }
  };

  const handleDistrictChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
      tambon: '',
      zipcode: ''
    }));

    const selectedAmphur = filteredAmphures.find((a) => a.name_th === value);
    if (selectedAmphur) {
      const tambons = tambonsData.filter((t) => t.amphure_id === selectedAmphur.id);
      setFilteredTambons(tambons);
    } else {
      setFilteredTambons([]);
    }
  };

  const handleTambonChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value
    }));

    const selectedTambon = tambonsData.find((t) => t.name_th === value);
    if (selectedTambon) {
      setZipcode(selectedTambon.zip_code);
    } else {
      setZipcode('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`https://ecom-api2-df4u.onrender.com/auth/addUserAddress`, {
        ...newAddress,
        zipcode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAddresses((prev) => [...prev, response.data]);
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
      setZipcode('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding new address:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (address) => {
    setEditAddress({ ...address });
    setZipcode(address.zipcode || '');

    const selectedProvince = provincesData.find((p) => p.name_th === address.province);
    if (selectedProvince) {
      const amphures = amphuresData.filter((a) => a.province_id === selectedProvince.id);
      setFilteredAmphures(amphures);
      const selectedAmphur = amphures.find((a) => a.name_th === address.district);
      if (selectedAmphur) {
        const tambons = tambonsData.filter((t) => t.amphure_id === selectedAmphur.id);
        setFilteredTambons(tambons);
      }
    }
    setIsEditModalOpen(true);
  };

  const handleEditProvinceChange = (e) => {
    const value = e.target.value;
    setEditAddress((prev) => ({
      ...prev,
      province: value,
      district: '',
      tambon: '',
      zipcode: ''
    }));

    const selectedProvince = provincesData.find((p) => p.name_th === value);
    if (selectedProvince) {
      const amphures = amphuresData.filter((a) => a.province_id === selectedProvince.id);
      setFilteredAmphures(amphures);
      setFilteredTambons([]);
      setZipcode('');
    } else {
      setFilteredAmphures([]);
      setFilteredTambons([]);
      setZipcode('');
    }
  };

  const handleEditDistrictChange = (e) => {
    const value = e.target.value;
    setEditAddress((prev) => ({
      ...prev,
      district: value,
      tambon: '',
      zipcode: ''
    }));

    const selectedAmphur = filteredAmphures.find((a) => a.name_th === value);
    if (selectedAmphur) {
      const tambons = tambonsData.filter((t) => t.amphure_id === selectedAmphur.id);
      setFilteredTambons(tambons);
    } else {
      setFilteredTambons([]);
    }
  };

  const handleEditTambonChange = (e) => {
    const value = e.target.value;
    setEditAddress((prev) => ({
      ...prev,
      tambon: value
    }));

    const selectedTambon = tambonsData.find((t) => t.name_th === value);
    if (selectedTambon) {
      setZipcode(selectedTambon.zip_code);
    } else {
      setZipcode('');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://ecom-api2-df4u.onrender.com/auth/updateaddress/${editAddress.id}`, {
        ...editAddress,
        zipcode,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAddresses((prev) =>
        prev.map((addr) => (addr.id === editAddress.id ? response.data : addr))
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating address:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-10 px-4 sm:px-6 lg:px-8 fade-in-page">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* User Profile Card (Apple Style) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] text-white flex items-center justify-center font-bold text-xl shadow-[0_4px_12px_rgba(0,113,227,0.3)] flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight text-[#1d1d1f]">
                    {user?.name || 'ผู้ใช้งาน'}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-[#f5f5f7] text-[#1d1d1f] text-[11px] font-semibold rounded-full uppercase tracking-wider">
                    {user?.role || 'MEMBER'}
                  </span>
                </div>
                <p className="text-xs text-[#86868b] flex items-center gap-1.5 mt-1">
                  <FaEnvelope className="text-[10px]" />
                  <span>{user?.email || 'ยังไม่ได้ระบุอีเมล'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all cursor-pointer"
            >
              <FaPlus className="text-[10px]" />
              <span>เพิ่มที่อยู่จัดส่งใหม่</span>
            </button>
          </div>
        </section>

        {/* Addresses Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
                ที่อยู่สำหรับจัดส่งสินค้า
              </h2>
              <p className="text-xs text-[#86868b] mt-0.5">
                ที่อยู่ที่คุณบันทึกไว้สำหรับรับสินค้าจากการสั่งซื้อ
              </p>
            </div>
            <span className="text-xs font-medium text-[#86868b]">
              ทั้งหมด {addresses.length} รายการ
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-black/[0.06]">
              <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-[#86868b]">กำลังโหลดข้อมูลที่อยู่...</p>
            </div>
          ) : addresses.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-black/[0.06] shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto text-[#86868b]">
                <FaMapMarkerAlt className="text-2xl text-[#0071e3]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#1d1d1f]">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้</h3>
                <p className="text-xs text-[#86868b] max-w-sm mx-auto">
                  เพิ่มที่อยู่จัดส่งของคุณตอนนี้ เพื่อให้ขั้นตอนสั่งซื้อสินค้าสะดวกรวดเร็วและแม่นยำยิ่งขึ้น
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all cursor-pointer"
              >
                <FaPlus className="text-[10px]" />
                <span>เพิ่มที่อยู่จัดส่งแรกของคุณ</span>
              </button>
            </div>
          ) : (
            /* Address Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address, index) => (
                <div
                  key={address.id || index}
                  className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#0071e3] bg-blue-50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-blue-100">
                        <FaHome className="text-[10px]" />
                        <span>ที่อยู่ #{index + 1}</span>
                      </span>

                      <button
                        onClick={() => openEditModal(address)}
                        className="text-xs font-medium text-[#86868b] hover:text-[#0071e3] transition-colors inline-flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-[#f5f5f7]"
                      >
                        <FaEdit className="text-[11px]" />
                        <span>แก้ไข</span>
                      </button>
                    </div>

                    {/* Recipient info */}
                    <div>
                      <h3 className="font-semibold text-base text-[#1d1d1f]">
                        {address.name} {address.lastname}
                      </h3>
                      <p className="text-xs text-[#86868b] flex items-center gap-1 mt-0.5">
                        <FaPhoneAlt className="text-[10px]" />
                        <a href={`tel:${address.phone}`} className="hover:text-[#0071e3]">
                          {address.phone}
                        </a>
                      </p>
                    </div>

                    {/* Address content */}
                    <div className="text-xs text-[#424245] leading-relaxed pt-2 border-t border-black/[0.04] space-y-0.5">
                      <p>
                        บ้านเลขที่ {address.housenumber} {address.village ? `หมู่ ${address.village}` : ''}
                      </p>
                      <p>
                        ต.{address.tambon} อ.{address.district}
                      </p>
                      <p>
                        จ.{address.province} {address.zipcode}
                      </p>
                      {address.other && (
                        <p className="text-[11px] text-[#86868b] pt-1 italic">
                          หมายเหตุ: {address.other}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add Address Modal (Apple Glass Style) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-black/[0.06] shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f]">เพิ่มที่อยู่จัดส่งใหม่</h3>
                <p className="text-xs text-[#86868b] mt-0.5">กรอกข้อมูลผู้รับและที่อยู่ให้ถูกต้องครบถ้วน</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipient Inputs */}
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-2 uppercase tracking-wider">
                  ข้อมูลผู้รับ
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    name="name"
                    value={newAddress.name}
                    onChange={handleChange}
                    placeholder="ชื่อจริง"
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                  />
                  <input
                    type="text"
                    name="lastname"
                    value={newAddress.lastname}
                    onChange={handleChange}
                    placeholder="นามสกุล"
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={newAddress.phone}
                    onChange={handleChange}
                    placeholder="เบอร์โทรศัพท์"
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Location Selectors */}
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-2 uppercase tracking-wider">
                  จังหวัด / อำเภอ / ตำบล
                </label>
                <div className="space-y-2">
                  <select
                    name="province"
                    value={newAddress.province}
                    onChange={handleProvinceChange}
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                  >
                    <option value="">-- เลือกจังหวัด --</option>
                    {provincesData.map((province) => (
                      <option key={province.id} value={province.name_th}>
                        {province.name_th}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      name="district"
                      value={newAddress.district}
                      onChange={handleDistrictChange}
                      required
                      disabled={!newAddress.province}
                      className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all disabled:opacity-50"
                    >
                      <option value="">-- เลือกอำเภอ/เขต --</option>
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
                      disabled={!newAddress.district}
                      className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all disabled:opacity-50"
                    >
                      <option value="">-- เลือกตำบล/แขวง --</option>
                      {filteredTambons.map((tambon) => (
                        <option key={tambon.id} value={tambon.name_th}>
                          {tambon.name_th}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Details & Zipcode */}
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-2 uppercase tracking-wider">
                  ที่อยู่โดยละเอียด
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
                  <input
                    type="text"
                    name="housenumber"
                    value={newAddress.housenumber}
                    onChange={handleChange}
                    placeholder="บ้านเลขที่"
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                  />
                  <input
                    type="text"
                    name="village"
                    value={newAddress.village}
                    onChange={handleChange}
                    placeholder="หมู่ที่ / อาคาร"
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                  />
                  <input
                    type="text"
                    name="zipcode"
                    value={zipcode}
                    readOnly
                    placeholder="รหัสไปรษณีย์"
                    required
                    className="w-full bg-neutral-200/70 border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] font-mono cursor-not-allowed"
                  />
                </div>

                <textarea
                  name="other"
                  value={newAddress.other}
                  onChange={handleChange}
                  rows={2}
                  placeholder="รายละเอียดเพิ่มเติม เช่น จุดสังเกต หรือเวลาที่สะดวกรับพัสดุ (ถ้ามี)"
                  className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium text-[#1d1d1f] rounded-full transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all disabled:opacity-60"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกที่อยู่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Address Modal (Apple Glass Style) */}
      {isEditModalOpen && editAddress && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-black/[0.06] shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f]">แก้ไขที่อยู่จัดส่ง</h3>
                <p className="text-xs text-[#86868b] mt-0.5">แก้ไขรายละเอียดที่อยู่ของคุณ</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Recipient Inputs */}
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-2 uppercase tracking-wider">
                  ข้อมูลผู้รับ
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    name="name"
                    value={editAddress.name}
                    onChange={(e) => setEditAddress({ ...editAddress, name: e.target.value })}
                    placeholder="ชื่อจริง"
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                  />
                  <input
                    type="text"
                    name="lastname"
                    value={editAddress.lastname}
                    onChange={(e) => setEditAddress({ ...editAddress, lastname: e.target.value })}
                    placeholder="นามสกุล"
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={editAddress.phone}
                    onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value })}
                    placeholder="เบอร์โทรศัพท์"
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Location Selectors */}
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-2 uppercase tracking-wider">
                  จังหวัด / อำเภอ / ตำบล
                </label>
                <div className="space-y-2">
                  <select
                    name="province"
                    value={editAddress.province}
                    onChange={handleEditProvinceChange}
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                  >
                    <option value="">-- เลือกจังหวัด --</option>
                    {provincesData.map((province) => (
                      <option key={province.id} value={province.name_th}>
                        {province.name_th}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      name="district"
                      value={editAddress.district}
                      onChange={handleEditDistrictChange}
                      required
                      className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                    >
                      <option value="">-- เลือกอำเภอ/เขต --</option>
                      {filteredAmphures.map((amphur) => (
                        <option key={amphur.id} value={amphur.name_th}>
                          {amphur.name_th}
                        </option>
                      ))}
                    </select>

                    <select
                      name="tambon"
                      value={editAddress.tambon}
                      onChange={handleEditTambonChange}
                      required
                      className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                    >
                      <option value="">-- เลือกตำบล/แขวง --</option>
                      {filteredTambons.map((tambon) => (
                        <option key={tambon.id} value={tambon.name_th}>
                          {tambon.name_th}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Details & Zipcode */}
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-2 uppercase tracking-wider">
                  ที่อยู่โดยละเอียด
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
                  <input
                    type="text"
                    name="housenumber"
                    value={editAddress.housenumber}
                    onChange={(e) => setEditAddress({ ...editAddress, housenumber: e.target.value })}
                    placeholder="บ้านเลขที่"
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                  />
                  <input
                    type="text"
                    name="village"
                    value={editAddress.village || ''}
                    onChange={(e) => setEditAddress({ ...editAddress, village: e.target.value })}
                    placeholder="หมู่ที่ / อาคาร"
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                  />
                  <input
                    type="text"
                    name="zipcode"
                    value={zipcode}
                    readOnly
                    placeholder="รหัสไปรษณีย์"
                    required
                    className="w-full bg-neutral-200/70 border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] font-mono cursor-not-allowed"
                  />
                </div>

                <textarea
                  name="other"
                  value={editAddress.other || ''}
                  onChange={(e) => setEditAddress({ ...editAddress, other: e.target.value })}
                  rows={2}
                  placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                  className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] placeholder-[#86868b] focus:bg-white transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium text-[#1d1d1f] rounded-full transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all disabled:opacity-60"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
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
