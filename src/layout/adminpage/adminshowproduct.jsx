import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AdminHome() {
  const [menuItems, setMenuItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://ecomapi2-production.up.railway.app/auth/getproduct', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMenuItems(response.data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete(`https://ecomapi2-production.up.railway.app/auth/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMenuItems(menuItems.filter(item => item.id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          });
        }
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      Swal.fire({
        title: "Error",
        text: "There was an error deleting the product.",
        icon: "error"
      });
    }
  };

  const openModal = (product, mode) => {
    setSelectedProduct(product);
    setEditProduct(product);
    setIsEditing(mode === 'edit');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setEditProduct(null);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditProduct(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      if (!editProduct.ItemName || editProduct.price === undefined || editProduct.stock === undefined) {
        return Swal.fire({
          title: "Validation Error",
          text: "Please fill in all required fields.",
          icon: "error"
        });
      }

      const token = localStorage.getItem('token');
      await axios.put('https://ecomapi2-production.up.railway.app/auth/updateproduct', {
        ...editProduct,
        productId: editProduct.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMenuItems(menuItems.map(item => item.id === editProduct.id ? editProduct : item));
      Swal.fire({
        title: "Updated!",
        text: "Product details have been updated.",
        icon: "success"
      });
      closeModal();
    } catch (error) {
      console.error('Error updating product:', error.response ? error.response.data : error.message);
      Swal.fire({
        title: "Update Error",
        text: "There was an error updating the product.",
        icon: "error"
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center py-10">
        <div>
          <p className="text-[50px] font-semibold text-center">จัดการสินค้า</p>
        </div>
        <div>
          <Link to={`/Add`}>
            <button className="text-blue-500 font-semibold">เพิ่มสินค้า</button>
          </Link>
        </div>
        <div className="container mx-auto mt-10 p-4 rounded-lg">
          {menuItems.map((item) => (
            <div key={item.id} className="rounded-xl border p-4 mb-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className='flex items-center'>
                  <img src={item.file} alt="" className="w-20 h-20 rounded-md mr-4" />
                  <div>
                    <p className="font-semibold">{item.ItemName}</p>
                    <p>ราคา {item.price}</p>
                    <p>จำนวนสินค้า {item.stock}</p>
                  </div>
                </div>
                <div className="button-group">
                  <button className="text-blue-500 font-semibold" onClick={() => openModal(item, 'view')}>รายละเอียด</button>
                  <button className="text-yellow-500 font-semibold ml-4" onClick={() => openModal(item, 'edit')}>แก้ไข</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal for Details and Edit */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full flex flex-col">
            <div className="flex flex-grow">
              {/* Image Section */}
              <div className="flex-shrink-0 w-[40%]">
                <img src={selectedProduct?.file} alt="" className="w-full h-full object-cover" />
              </div>
              {/* Details Section */}
              <div className="flex-grow pl-6">
                <h2 className="text-2xl font-semibold mb-4">{isEditing ? editProduct?.ItemName : selectedProduct?.ItemName}</h2>
                <p className ="mb-4 font-semibold" >ประเภทสินค้า: {isEditing ? editProduct?.category : selectedProduct?.category}</p>
                <p className="mb-4 font-semibold">ราคา: {isEditing ? editProduct?.price : selectedProduct?.price}</p>
                <p className="mb-4">รายละเอียด: {isEditing ? editProduct?.description : selectedProduct?.description}</p>
                <p className ="mb-4 font-semibold" >จำนวนสินค้า: {isEditing ? editProduct?.stock : selectedProduct?.stock}</p>
                
                {isEditing && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold">ชื่อสินค้า:</label>
                      <input 
                        type="text" 
                        name="ItemName" 
                        value={editProduct?.ItemName || ''} 
                        onChange={handleChange} 
                        className="border rounded p-2 w-full" 
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold">ราคา:</label>
                      <input 
                        type="number" 
                        name="price" 
                        value={editProduct?.price || ''} 
                        onChange={handleChange} 
                        className="border rounded p-2 w-full" 
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold">รายละเอียด:</label>
                      <textarea 
                        name="description" 
                        value={editProduct?.description || ''} 
                        onChange={handleChange} 
                        className="border rounded p-2 w-full" 
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold">จำนวนสินค้า:</label>
                      <input 
                        type="number" 
                        name="stock" 
                        value={editProduct?.stock || ''} 
                        onChange={handleChange} 
                        className="border rounded p-2 w-full" 
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-auto">
              {isEditing ? (
                <>
                  <button className="text-blue-500 font-semibold mr-4" onClick={handleUpdate}>Update</button>
                  <button className="text-blue-500 font-semibold" onClick={closeModal}>Close</button>
                </>
              ) : (
                <button className="text-blue-500 font-semibold" onClick={closeModal}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
