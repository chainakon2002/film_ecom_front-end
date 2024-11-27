import React from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYouPage = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/product01');
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-3xl font-bold mb-4">ขอบคุณที่สั่งซื้อสินค้ากับเรา!</h1>
      <button 
        onClick={handleNavigate} 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        ดูคำสั่งซื้อ
      </button>
    </div>
  );
};

export default ThankYouPage;

