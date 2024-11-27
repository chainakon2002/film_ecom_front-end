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
        const response = await axios.get('https://ecomapi2-production.up.railway.app/auth/getuserdetails', {
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

  const handleEditClick = (user) => {
    setSelectedUser(user);
    // Show modal logic here
    document.getElementById('editUserModal').classList.remove('hidden');
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      await axios.patch(`https://ecomapi2-production.up.railway.app/auth/updateuser/${selectedUser.id}`, selectedUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optionally, refetch users to update the list
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err);
    } finally {
      document.getElementById('editUserModal').classList.add('hidden');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
      <div className="flex items-center justify-between flex-col md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-white">
        <label htmlFor="table-search-users" className="sr-only">Search</label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="text" 
            id="table-search-users" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Search for users"
          />
        </div>
      </div>
      <table className="w-full text-sm text-left text-gray-500 bg-white">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="p-4"></th>
            <th scope="col" className="px-6 py-3">Name</th>
            <th scope="col" className="px-6 py-3">Username</th>
            <th scope="col" className="px-6 py-3">Email</th>
            <th scope="col" className="px-6 py-3">Phone</th>
            <th scope="col" className="px-6 py-3">Role</th>
            
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
              <td className="w-4 p-4"></td>
              <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                <div className="ps-3">
                  <div className="text-base font-semibold">{user.name}</div>
                  <div className="font-normal text-gray-500">{user.email}</div>
                </div>
              </th>
              <td className="px-6 py-4">{user.username}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4">{user.phone}</td>
              <td className="px-6 py-4">{user.role}</td>
              <td className="px-6 py-4">
                <a 
                  href="#" 
                  onClick={() => handleEditClick(user)} 
                  className="font-medium text-blue-600 hover:underline"
                >
                 
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for editing user */}
      <div id="editUserModal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center hidden">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
          <h2 className="text-lg font-semibold mb-4">Edit User</h2>
          <form>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                id="name" 
                value={selectedUser?.name || ''} 
                onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                id="username" 
                value={selectedUser?.username || ''} 
                onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="role"
                value={selectedUser?.role || ''}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select role</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Officer">Officer</option>
                {/* Add other roles as needed */}
              </select>
            </div>
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={handleSave} 
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save
              </button>
              <button 
                type="button" 
                onClick={() => document.getElementById('editUserModal').classList.add('hidden')} 
                className="ms-4 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
