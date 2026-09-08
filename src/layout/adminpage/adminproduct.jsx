import axios from 'axios';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function AdminProduct() {
  const navigate = useNavigate();

  const [input, setInput] = useState({
    ItemName: '',
    price: '',
    description: '',
    stock: '',
    category: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const hdlChange = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const hdlFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    } else {
      setPreview('');
    }
  };

  const hdlSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('ItemName', input.ItemName);
    formData.append('description', input.description);
    formData.append('price', input.price);
    formData.append('stock', input.stock);
    formData.append('category', input.category);

    if (file) {
      formData.append('image', file);
    }

    try {
      const rs = await axios.post('https://ecom-api2-df4u.onrender.com/auth/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(rs);
      if (rs.status === 200) {
        Swal.fire({
          title: 'เพิ่มข้อมูลเรียบร้อย',
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster',
          },
        });
        navigate('/adminshow');
      }
    } catch (err) {
      console.error(err.message);
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'An error occurred',
        icon: 'error',
      });
    }
  };

  return (
    <div className="space-y-8 fade-in-page max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            เพิ่มสินค้าใหม่
          </h1>
          <p className="text-sm text-[#86868b] mt-1">
            กรอกข้อมูลรายละเอียดสินค้าและอัปโหลดรูปภาพเพื่อเปิดขายในระบบ
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/adminshow')}
          className="px-4 py-2 bg-white hover:bg-black/5 text-[#1d1d1f] text-xs font-medium rounded-full border border-black/[0.08] transition-colors"
        >
          &larr; กลับหน้ารายการสินค้า
        </button>
      </div>

      <form onSubmit={hdlSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Upload & Preview */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <h2 className="text-sm font-semibold text-[#1d1d1f]">รูปภาพสินค้า</h2>
          
          <label
            htmlFor="dropzone-file"
            className="cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/[0.1] hover:border-[#0071e3] bg-white p-6 transition-all min-h-[280px]"
          >
            {preview ? (
              <div className="space-y-3 text-center w-full flex flex-col items-center justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-56 max-w-full object-contain mx-auto rounded-xl mix-blend-multiply"
                />
                <p className="text-xs text-[#0071e3] font-medium">คลิกเพื่อเปลี่ยนรูปภาพ</p>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto text-[#86868b]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-[#1d1d1f]">
                  คลิกเพื่อเลือกไฟล์รูปภาพ
                </p>
                <p className="text-[11px] text-[#86868b]">
                  รองรับไฟล์ PNG, JPG หรือ WEBP
                </p>
              </div>
            )}

            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              name="fileInput"
              onChange={hdlFileChange}
              accept="image/png, image/jpeg, image/webp"
            />
          </label>
        </div>

        {/* Right Column: Product Details Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <h2 className="text-sm font-semibold text-[#1d1d1f]">ข้อมูลสินค้า</h2>

          <div>
            <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5 ml-1">
              ชื่อสินค้า
            </label>
            <input
              type="text"
              className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm text-[#1d1d1f] transition-all"
              placeholder="เช่น Intel Core i7 14700K"
              name="ItemName"
              value={input.ItemName}
              onChange={hdlChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5 ml-1">
                ราคา (บาท)
              </label>
              <input
                type="number"
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm text-[#1d1d1f] transition-all"
                placeholder="เช่น 14100"
                name="price"
                value={input.price}
                onChange={hdlChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5 ml-1">
                จำนวนสินค้าในสต็อก
              </label>
              <input
                type="number"
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm text-[#1d1d1f] transition-all"
                placeholder="เช่น 10"
                name="stock"
                value={input.stock}
                onChange={hdlChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5 ml-1">
              ประเภทสินค้า
            </label>
            <select
              name="category"
              className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm text-[#1d1d1f] transition-all"
              value={input.category || ''}
              onChange={hdlChange}
              required
            >
              <option value="">เลือกประเภทสินค้า</option>
              <option value="SOFTWARE">ซอฟต์แวร์ (Software)</option>
              <option value="HARDWARE">ฮาร์ดแวร์ (Hardware)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5 ml-1">
              รายละเอียดสินค้า
            </label>
            <textarea
              rows={4}
              className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm text-[#1d1d1f] transition-all"
              placeholder="กรอกสเปกหรือรายละเอียดสำคัญของสินค้า..."
              name="description"
              value={input.description}
              onChange={hdlChange}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/adminshow')}
              className="px-6 py-2.5 bg-[#f5f5f7] hover:bg-black/10 text-[#1d1d1f] text-sm font-medium rounded-full transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-sm font-medium rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all"
            >
              บันทึกสินค้า
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
