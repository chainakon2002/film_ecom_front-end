import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaTimes, FaShieldAlt, FaCheck } from 'react-icons/fa';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setError(new Error('Token is missing'));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('https://ecom-api2-df4u.onrender.com/auth/getuserme', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setEditedUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleEditClick = () => {
    setEditedUser({ ...user });
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();
    if (!token || !editedUser) return;

    try {
      setSaving(true);
      await axios.put('https://ecom-api2-df4u.onrender.com/auth/updateprofile', editedUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(editedUser);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating user data:', err);
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 text-center border border-black/[0.06] shadow-sm">
          <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-[#86868b]">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-black/[0.06] shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <FaTimes />
          </div>
          <h3 className="text-base font-semibold text-[#1d1d1f]">เกิดข้อผิดพลาด</h3>
          <p className="text-xs text-[#86868b]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Breadcrumb / Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
            โปรไฟล์ของฉัน
          </h1>
          <p className="text-xs text-[#86868b]">
            จัดการข้อมูลส่วนตัว ชื่อ-นามสกุล และช่องทางการติดต่อของคุณ
          </p>
        </div>

        {/* Apple Minimal Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-8">
          {/* Avatar and Top Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-black/[0.06]">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] text-white flex items-center justify-center font-bold text-3xl shadow-[0_6px_20px_rgba(0,113,227,0.3)] flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-[#1d1d1f]">
                    {user?.name} {user?.lastname}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-semibold rounded-full inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    พร้อมใช้งาน
                  </span>
                </div>
                <p className="text-xs text-[#86868b]">
                  @{user?.username || 'user'}
                </p>
              </div>
            </div>

            <button
              onClick={handleEditClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all cursor-pointer self-start sm:self-auto"
            >
              <FaEdit className="text-xs" />
              <span>แก้ไขโปรไฟล์</span>
            </button>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f5f5f7] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">ชื่อผู้ใช้ (Username)</span>
              <p className="text-sm font-medium text-[#1d1d1f]">{user?.username || '-'}</p>
            </div>

            <div className="bg-[#f5f5f7] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">ชื่อ - นามสกุล</span>
              <p className="text-sm font-medium text-[#1d1d1f]">{user?.name} {user?.lastname}</p>
            </div>

            <div className="bg-[#f5f5f7] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
                <FaEnvelope className="text-[10px]" /> อีเมล
              </span>
              <p className="text-sm font-medium text-[#1d1d1f]">{user?.email || '-'}</p>
            </div>

            <div className="bg-[#f5f5f7] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
                <FaPhone className="text-[10px]" /> เบอร์โทรศัพท์
              </span>
              <p className="text-sm font-medium text-[#1d1d1f]">{user?.phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* Apple ID Style Security Note */}
        <div className="bg-white rounded-3xl p-5 border border-black/[0.06] flex items-center gap-3.5 text-xs text-[#86868b]">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center flex-shrink-0">
            <FaShieldAlt className="text-sm" />
          </div>
          <div>
            <p className="font-semibold text-[#1d1d1f]">ความปลอดภัยและความเป็นส่วนตัว</p>
            <p className="mt-0.5">ข้อมูลส่วนตัวของคุณได้รับการปกป้องและเข้ารหัสความปลอดภัยตามมาตรฐาน</p>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal (Apple Glass Style) */}
      {isEditing && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/[0.06] shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f]">แก้ไขโปรไฟล์</h3>
                <p className="text-xs text-[#86868b] mt-0.5">อัปเดตข้อมูลส่วนตัวของคุณ</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editedUser?.username || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                    ชื่อจริง
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editedUser?.name || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                    นามสกุล
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={editedUser?.lastname || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  name="email"
                  value={editedUser?.email || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editedUser?.phone || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#f5f5f7] border-0 rounded-2xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.04]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium text-[#1d1d1f] rounded-full transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all disabled:opacity-60"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
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
