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
        const response = await axios.get('https://ecom-api2-df4u.onrender.com/auth/getproduct', {
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
          await axios.delete(`https://ecom-api2-df4u.onrender.com/auth/delete/${id}`, {
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
      await axios.put('https://ecom-api2-df4u.onrender.com/auth/updateproduct', {
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

  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenuItems = menuItems.filter(item =>
    item.ItemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 fade-in-page max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            จัดการสินค้า
          </h1>
          <p className="text-sm text-[#86868b] mt-1">
            รายการสินค้าทั้งหมดในร้านค้า สามารถดูรายละเอียด แก้ไข หรือลบสินค้าได้
          </p>
        </div>
        <Link to="/Add">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-sm font-medium rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all">
            <span>+ เพิ่มสินค้าใหม่</span>
          </button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="ค้นหาชื่อสินค้า หรือหมวดหมู่..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:border-[#0071e3] focus:outline-none rounded-full px-4 py-2.5 text-sm text-[#1d1d1f] placeholder-[#86868b] transition-all"
        />
      </div>

      {/* Products Grid */}
      {filteredMenuItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-black/[0.06]">
          <p className="text-sm text-[#86868b]">ไม่พบสินค้าในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-black/[0.06] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full">
                    {item.category || 'หมวดหมู่'}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                      item.stock > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/70'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {item.stock > 0 ? `สต็อก: ${item.stock}` : 'สินค้าหมด'}
                  </span>
                </div>

                <div className="w-full h-48 bg-white flex items-center justify-center p-2 mb-3">
                  <img
                    src={item.file}
                    alt={item.ItemName}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>

                <h3 className="font-semibold text-sm sm:text-base text-[#1d1d1f] tracking-tight line-clamp-1">
                  {item.ItemName}
                </h3>
                <p className="text-base font-bold text-[#1d1d1f] mt-1">
                  ฿{Number(item.price).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-black/[0.04] flex items-center justify-between gap-2">
                <button
                  onClick={() => openModal(item, 'view')}
                  className="flex-1 py-1.5 px-3 bg-[#f5f5f7] hover:bg-black/10 text-[#1d1d1f] text-xs font-medium rounded-full transition-colors"
                >
                  รายละเอียด
                </button>
                <button
                  onClick={() => openModal(item, 'edit')}
                  className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#0071e3] text-xs font-medium rounded-full transition-colors"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="py-1.5 px-3 hover:bg-red-50 text-[#ff3b30] text-xs font-medium rounded-full transition-colors"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Details and Edit */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/[0.06] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors focus:outline-none"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f] mb-6">
              {isEditing ? 'แก้ไขข้อมูลสินค้า' : 'รายละเอียดสินค้า'}
            </h2>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Image Section */}
              <div className="w-full sm:w-1/2 bg-white rounded-2xl p-4 flex items-center justify-center h-56 border border-black/[0.06]">
                <img
                  src={selectedProduct?.file}
                  alt=""
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Details / Edit Form */}
              <div className="w-full sm:w-1/2 space-y-3">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                        ชื่อสินค้า
                      </label>
                      <input
                        type="text"
                        name="ItemName"
                        value={editProduct?.ItemName || ''}
                        onChange={handleChange}
                        className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2 text-sm text-[#1d1d1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                        ราคา (บาท)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={editProduct?.price || ''}
                        onChange={handleChange}
                        className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2 text-sm text-[#1d1d1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                        จำนวนสต็อก
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={editProduct?.stock || ''}
                        onChange={handleChange}
                        className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2 text-sm text-[#1d1d1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                        รายละเอียด
                      </label>
                      <textarea
                        rows="3"
                        name="description"
                        value={editProduct?.description || ''}
                        onChange={handleChange}
                        className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-3.5 py-2 text-sm text-[#1d1d1f]"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 text-sm">
                    <h3 className="text-lg font-semibold text-[#1d1d1f]">
                      {selectedProduct?.ItemName}
                    </h3>
                    <p className="text-xs text-[#86868b]">
                      หมวดหมู่: <span className="font-medium text-[#1d1d1f]">{selectedProduct?.category}</span>
                    </p>
                    <p className="text-base font-bold text-[#1d1d1f] pt-1">
                      ราคา: ฿{Number(selectedProduct?.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-[#86868b]">
                      สต็อก: <span className="font-medium text-[#1d1d1f]">{selectedProduct?.stock} ชิ้น</span>
                    </p>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-[#86868b] mb-1">รายละเอียด:</p>
                      <p className="text-xs text-[#1d1d1f] bg-[#f5f5f7] p-3 rounded-xl leading-relaxed">
                        {selectedProduct?.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-black/[0.04]">
              {isEditing ? (
                <>
                  <button
                    className="px-5 py-2 rounded-full text-xs font-medium bg-[#f5f5f7] hover:bg-black/10 text-[#1d1d1f] transition-colors"
                    onClick={closeModal}
                  >
                    ยกเลิก
                  </button>
                  <button
                    className="px-5 py-2 rounded-full text-xs font-medium bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm transition-all"
                    onClick={handleUpdate}
                  >
                    บันทึกการแก้ไข
                  </button>
                </>
              ) : (
                <button
                  className="px-5 py-2 rounded-full text-xs font-medium bg-[#f5f5f7] hover:bg-black/10 text-[#1d1d1f] transition-colors"
                  onClick={closeModal}
                >
                  ปิด
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
