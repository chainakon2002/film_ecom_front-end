import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setError(new Error('Token is missing'));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('https://ecomapi2-production.up.railway.app/auth/getuserme', {
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
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!token || !editedUser) return;

    try {
      await axios.put('https://ecomapi2-production.up.railway.app/auth/updateprofile', editedUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(editedUser);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating user data:', err);
      setError(err);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  return (
    <div className="relative flex flex-col w-full mt-[50px] min-w-0 mb-6 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30 p-6">
      {/* User Profile Header */}
      <div className="px-9 pt-9 flex-auto min-h-[70px] pb-0 bg-transparent">
        <div className="flex flex-wrap mb-6 xl:flex-nowrap">
          <div className="mb-5 mr-5">
            <div className="relative inline-block shrink-0 rounded-2xl">
              <img
                className="inline-block shrink-0 rounded-2xl w-[80px] h-[80px] lg:w-[160px] lg:h-[160px]"
                src="https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/riva-dashboard-tailwind/img/avatars/avatar1.jpg"
                alt="Profile"
              />
              <div className="group/tooltip relative">
                <span className="w-[15px] h-[15px] absolute bg-success rounded-full bottom-0 end-0 -mb-1 -mr-2 border border-white"></span>
                <span className="text-xs absolute z-10 transition-opacity duration-300 ease-in-out px-3 py-2 whitespace-nowrap text-center transform bg-white rounded-2xl shadow-sm bottom-0 -mb-2 start-full ml-4 font-medium text-secondary-inverse group-hover/tooltip:opacity-100 opacity-0 block">
                  Status: Active
                </span>
              </div>
            </div>
          </div>
          <div className="grow">
            <div className="flex flex-wrap items-start justify-between mb-2">
              <div className="flex flex-col">
                <p className="text-lg font-semibold mb-2">
                  <strong>Username:</strong> {user.username}
                </p>
                <p className="text-lg font-semibold mb-2">
                  <strong>Name:</strong> {user.name} {user.lastname}
                </p>

                <p className="text-lg font-semibold mb-2">
                  <strong>Phone:</strong> {user.phone}
                </p>
                <div className="flex flex-wrap pr-2 mb-4 font-medium">
  
                  <a
                    href="javascript:void(0)"
                    className="flex items-center mb-2 mr-5 text-secondary-dark hover:text-primary"
                  >
                    <span className="mr-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67zM22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                      </svg>
                    </span>
                    {user.email}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap my-auto">
        
                <button
  onClick={handleEditClick}
  className="inline-block px-6 py-3 text-base font-medium leading-normal text-center text-white align-middle transition-colors duration-150 ease-in-out border-0 shadow-none cursor-pointer rounded-2xl bg-primary hover:bg-primary-dark active:bg-primary-dark focus:bg-primary-dark"
>
  Edit Profile
</button>

              </div>
            </div>

          </div>
        </div>
      </div>
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={editedUser.username}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedUser.name}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lastname" className="block text-sm font-medium mb-2">
                Lastname
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={editedUser.lastname}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={editedUser.email}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={editedUser.phone}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleSaveChanges}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Save
              </button>
              <button
                onClick={handleCloseModal}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      
    </div>
  );
};

export default UserProfile;
