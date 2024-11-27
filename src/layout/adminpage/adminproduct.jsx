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
      const rs = await axios.post('https://ecomapi2-production.up.railway.app/auth/product', formData, {
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
    <div className="flex justify-center items-start mt-[100px]">
      {preview && (
        <div className="w-[450px] h-[650px] mr-[150px] rounded-lg shadow-md flex flex-col items-center">
          <img src={preview} alt="Preview" className="w-full" />
          <div className="mt-4 text-center">
            <p className="text-xl font-semibold">{input.ItemName}</p>
            <p className="text-lg text-gray-600">ราคา : {input.price}</p>
          </div>
        </div>
      )}
      <form
        className="flex flex-col justify-center items-center outline-none border-10 w-[30rem] h-[960px] rounded-[20px] shadow-md transition duration-500 ease-in-out transform "
        onSubmit={hdlSubmit}
      >
        <div className='mt-[10px]'>
        <p className="font-semibold text-base text-[#5473E3] text-center ">เพิ่มสินค้า</p>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text font-semibold">ชื่อสินค้า</span>
          </div>
          <input
            type="text"
            className="input input-bordered w-full max-w-xs"
            name="ItemName"
            value={input.ItemName}
            onChange={hdlChange}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text font-semibold">ราคา</span>
          </div>
          <input
            type="number"
            className="input input-bordered w-full max-w-xs"
            name="price"
            value={input.price}
            onChange={hdlChange}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text font-semibold">รายละเอียด</span>
          </div>
          <textarea
            className="textarea textarea-bordered w-full max-w-xs"
            name="description"
            value={input.description}
            onChange={hdlChange}
            rows={4}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text font-semibold">จำนวนสินค้า</span>
          </div>
          <input
            type="number"
            className="input input-bordered w-full max-w-xs"
            name="stock"
            value={input.stock}
            onChange={hdlChange}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text font-semibold">ประเภทสินค้า</span>
          </div>
          <select
            name="category"
            className="select select-bordered w-full max-w-xs"
            value={input.category || ''}
            onChange={hdlChange}
          >
            <option value="">เลือกประเภท</option>
            <option value="SOFTWARE">ซอฟต์แวร์</option>
            <option value="HARDWARE">ฮาร์ดแวร์</option>
          </select>
        </label>
        <div className="w-[320px] px-3 mb-[10px] mt-[20px]">
  <label
    className="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-400 bg-white p-6 text-center"
    htmlFor="dropzone-file"
  >
    {preview ? (
      <img src={preview} alt="Preview" className="h-36 w-[160px] object-cover rounded-lg" />
    ) : (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-green-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <h2 className="mt-4 text-xl font-medium text-gray-700 tracking-wide">
          Category image
        </h2>

        <p className="mt-2 text-gray-500 tracking-wide">
          Upload or drag & drop your file SVG, PNG, JPG or GIF.
        </p>
      </>
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

        </div>
        <div className="flex gap-5 ">
          <button type="submit" className="btn btn-outline btn-info mt-7">
            ยืนยัน
          </button>
    
        </div>
      </form>
    </div>
  );
}
