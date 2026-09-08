import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageProducts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError(new Error('Token is missing'));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('https://ecom-api2-df4u.onrender.com/auth/getuserdetails', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      await axios.patch(`https://ecom-api2-df4u.onrender.com/auth/updateuser/${selectedUser.id}`, selectedUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch users to update the list
      const response = await axios.get('https://ecom-api2-df4u.onrender.com/auth/getuserdetails', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err);
    } finally {
      handleCloseModal();
    }
  };

  const filteredUsers = users.filter(user =>
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <span className="loading loading-dots loading-lg text-[#0071e3]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 rounded-3xl p-6 text-center text-sm border border-red-100">
        เกิดข้อผิดพลาด: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-page max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">
          ข้อมูลผู้ใช้งาน
        </h1>
        <p className="text-sm text-[#86868b] mt-1">
          จัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และข้อมูลติดต่อ
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="ค้นหาชื่อ, username หรืออีเมล..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:border-[#0071e3] focus:outline-none rounded-full px-4 py-2.5 text-sm text-[#1d1d1f] placeholder-[#86868b] transition-all"
        />
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-[#86868b] bg-[#fbfbfd] border-b border-black/[0.04]">
              <tr>
                <th scope="col" className="px-6 py-4">ผู้ใช้งาน</th>
                <th scope="col" className="px-6 py-4">ชื่อผู้ใช้ (Username)</th>
                <th scope="col" className="px-6 py-4">เบอร์โทรศัพท์</th>
                <th scope="col" className="px-6 py-4 text-center">สิทธิ์ (Role)</th>
                <th scope="col" className="px-6 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#86868b]">
                    ไม่พบข้อมูลผู้ใช้งาน
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const roleUpper = (user.role || 'USER').toUpperCase();
                  const roleBadgeClass =
                    roleUpper === 'ADMIN'
                      ? 'bg-purple-50 text-purple-700 border border-purple-100'
                      : roleUpper === 'OFFICER'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100';

                  return (
                    <tr key={user.id} className="hover:bg-[#fbfbfd] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#f5f5f7] text-[#1d1d1f] font-semibold text-xs flex items-center justify-center flex-shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[#1d1d1f]">{user.name}</div>
                            <div className="text-xs text-[#86868b] truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#1d1d1f] font-medium">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-[#86868b]">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="px-3 py-1.5 bg-[#f5f5f7] hover:bg-black/10 text-[#0071e3] text-xs font-medium rounded-full transition-colors"
                        >
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for editing user */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-black/[0.06] max-w-md w-full space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors focus:outline-none"
              onClick={handleCloseModal}
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
              แก้ไขข้อมูลผู้ใช้
            </h2>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#1d1d1f] mb-1">ชื่อ</label>
                <input
                  type="text"
                  value={selectedUser?.name || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="w-full bg-[#f5f5f7] border-0 rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1d1d1f] mb-1">ชื่อผู้ใช้ (Username)</label>
                <input
                  type="text"
                  value={selectedUser?.username || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  className="w-full bg-[#f5f5f7] border-0 rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1d1d1f] mb-1">สิทธิ์ (Role)</label>
                <select
                  value={selectedUser?.role || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full bg-[#f5f5f7] border-0 rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]"
                >
                  <option value="">เลือกสิทธิ์</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                  <option value="OFFICER">OFFICER</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 bg-[#f5f5f7] hover:bg-black/10 text-xs font-medium rounded-full transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium rounded-full shadow-sm transition-all"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
