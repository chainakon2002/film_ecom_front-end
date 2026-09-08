import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaArrowLeft, 
  FaTruck, 
  FaShieldAlt, 
  FaHeadset, 
  FaPlus, 
  FaMinus, 
  FaCheck, 
  FaBolt, 
  FaStar,
  FaAward,
  FaChevronRight,
  FaBoxOpen
} from 'react-icons/fa';
import './getProduct.css';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'shipping'
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch specific product
        const response = await axios.get(`https://ecom-api2-df4u.onrender.com/auth/getproduct/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProduct(response.data);

        // Fetch user's cart
        const cartResponse = await axios.get('https://ecom-api2-df4u.onrender.com/cart/carts/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(cartResponse.data);

        // Fetch all products to pick 4 related products
        const allProductsRes = await axios.get('https://ecom-api2-df4u.onrender.com/auth/getproduct', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(allProductsRes.data)) {
          const others = allProductsRes.data
            .filter(item => item.id !== Number(id))
            .slice(0, 4);
          setRelatedProducts(others);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = async (goToCart = false) => {
    if (!product || product.stock <= 0 || isAdding) return;

    try {
      setIsAdding(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const existingCartItem = cart.find(c => c.productId === product.id);

      if (existingCartItem) {
        const updatedTotal = existingCartItem.total + quantity;
        const updatedPrice = existingCartItem.price + (product.price * quantity);
        await axios.put(`https://ecom-api2-df4u.onrender.com/cart/carts/${existingCartItem.id}/`, {
          total: updatedTotal,
          price: updatedPrice
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('https://ecom-api2-df4u.onrender.com/cart/carts', {
          total: quantity,
          price: product.price * quantity,
          UserId: userId,
          productId: product.id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      if (goToCart) {
        setTimeout(() => navigate('/cart'), 400);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#f5f5f7]">
        <div className="w-10 h-10 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-[#86868b]">กำลังโหลดข้อมูลสินค้า...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f5f5f7] px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-black/[0.06] shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto text-[#86868b]">
            <FaBoxOpen className="text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-[#1d1d1f]">ไม่พบสินค้านี้ในระบบ</h2>
          <p className="text-sm text-[#86868b]">สินค้านี้อาจถูกจำหน่ายหมด หรือถูกนำออกจากระบบแล้ว</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0071e3] text-white text-sm font-medium rounded-full hover:bg-[#0077ed] transition-all"
          >
            <FaArrowLeft className="text-xs" />
            <span>กลับไปยังหน้าร้านค้า</span>
          </Link>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className="bg-[#f5f5f7] min-h-screen pb-20">
      {/* Apple Floating Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1d1d1f] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-white/10">
          <div className="w-6 h-6 rounded-full bg-[#34c759] flex items-center justify-center text-white text-xs flex-shrink-0">
            <FaCheck />
          </div>
          <div className="text-xs">
            <p className="font-semibold">เพิ่มสินค้าลงตะกร้าแล้ว</p>
            <p className="text-neutral-400">{product.ItemName} ({quantity} ชิ้น)</p>
          </div>
          <Link
            to="/cart"
            className="ml-3 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium text-white transition-colors"
          >
            ดูตะกร้า
          </Link>
        </div>
      )}

      {/* Sticky Top Apple Sub-Navigation Bar */}
      <div className="sticky top-16 z-20 bg-white/85 backdrop-blur-xl border-b border-black/[0.06] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              to="/"
              className="text-xs text-[#86868b] hover:text-[#0071e3] transition-colors flex items-center gap-1 flex-shrink-0"
            >
              <FaArrowLeft className="text-[10px]" />
              <span className="hidden sm:inline">ร้านค้า</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-semibold text-[#1d1d1f] truncate">
              {product.ItemName}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-base sm:text-lg font-bold text-[#1d1d1f]">
              ฿{Number(product.price).toLocaleString()}
            </span>
            {inStock ? (
              <button
                onClick={() => handleAddToCart(false)}
                disabled={isAdding}
                className="px-4 sm:px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all flex items-center gap-1.5"
              >
                <FaShoppingCart className="text-[10px]" />
                <span>{isAdding ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-neutral-100 text-neutral-400 text-xs font-medium rounded-full">
                สินค้าหมด
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-12">
        {/* Unified Hero Showcase Card */}
        <section className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_20px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
            {/* Left: Studio Product Stage (Col 7) */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-14 flex flex-col justify-between items-center relative border-b lg:border-b-0 lg:border-r border-black/[0.04]">
              {/* Top Floating Badge */}
              <div className="w-full flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-[#86868b] uppercase bg-[#f5f5f7] px-3.5 py-1 rounded-full">
                  {product.category || 'GENUINE PRODUCT'}
                </span>
                <span className="text-[11px] font-medium text-[#34c759] flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <FaAward className="text-xs" />
                  <span>ของแท้ 100%</span>
                </span>
              </div>

              {/* Central Product Showcase Image */}
              <div className="my-8 w-full flex items-center justify-center group relative">
                <img
                  src={product.file || '/default-image.jpg'}
                  alt={product.ItemName}
                  className="max-h-[340px] sm:max-h-[400px] w-auto max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 select-none"
                />
              </div>

              {/* Bottom Feature Badges */}
              <div className="w-full flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-[11px] text-[#86868b]">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f5f5f7] rounded-full text-[#1d1d1f]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></span>
                  ลิขสิทธิ์ถูกต้อง
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f5f5f7] rounded-full text-[#1d1d1f]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]"></span>
                  ส่งฟรีทั่วประเทศ
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f5f5f7] rounded-full text-[#1d1d1f]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500]"></span>
                  รับประกันศูนย์แท้
                </span>
              </div>
            </div>

            {/* Right: Purchase & Details Column (Col 5) */}
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              {/* Product Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {inStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      มีสินค้าในสต็อก ({product.stock} ชิ้น)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                      สินค้าหมดชั่วคราว
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] leading-snug">
                  {product.ItemName}
                </h1>

                {/* Price Display */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] tracking-tight">
                      ฿{Number(product.price).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#86868b] mt-1">
                    ราคารวมภาษีมูลค่าเพิ่ม 7% แล้ว • ไม่มีค่าธรรมเนียมแอบแฝง
                  </p>
                </div>
              </div>

              {/* Quantity Selector & Action CTAs */}
              <div className="space-y-4 pt-4 border-t border-black/[0.05]">
                {inStock && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#86868b] mb-2">
                      จำนวนที่ต้องการ
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center bg-[#f5f5f7] rounded-full p-1 border border-black/[0.04]">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-8 h-8 rounded-full bg-white text-[#1d1d1f] hover:bg-neutral-50 flex items-center justify-center shadow-xs disabled:opacity-40 transition-all text-xs"
                        >
                          <FaMinus />
                        </button>
                        <span className="w-12 text-center font-semibold text-sm text-[#1d1d1f]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          disabled={quantity >= product.stock}
                          className="w-8 h-8 rounded-full bg-white text-[#1d1d1f] hover:bg-neutral-50 flex items-center justify-center shadow-xs disabled:opacity-40 transition-all text-xs"
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <span className="text-xs text-[#86868b]">
                        ยอดรวม: <strong className="text-[#1d1d1f]">฿{(product.price * quantity).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  {inStock ? (
                    <>
                      <button
                        onClick={() => handleAddToCart(false)}
                        disabled={isAdding}
                        className="w-full py-4 px-6 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white font-semibold text-sm rounded-full shadow-[0_4px_16px_rgba(0,113,227,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                      >
                        <FaShoppingCart className="text-base" />
                        <span>{isAdding ? 'กำลังนำใส่ตะกร้า...' : 'เพิ่มลงในตะกร้า'}</span>
                      </button>

                      <button
                        onClick={() => handleAddToCart(true)}
                        disabled={isAdding}
                        className="w-full py-3.5 px-6 bg-[#f5f5f7] hover:bg-black/5 text-[#1d1d1f] font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>สั่งซื้อทันที (Buy Now)</span>
                        <FaChevronRight className="text-xs text-[#86868b]" />
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 px-6 bg-[#f5f5f7] text-[#86868b] font-medium text-sm rounded-full cursor-not-allowed text-center"
                    >
                      ขออภัย สินค้านี้หมดชั่วคราว
                    </button>
                  )}
                </div>
              </div>

              {/* Apple Highlights Bento Strip */}
              <div className="pt-4 border-t border-black/[0.05] grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-black/[0.03]">
                  <FaTruck className="text-[#0071e3] mx-auto mb-1.5 text-base" />
                  <p className="text-[11px] font-semibold text-[#1d1d1f]">จัดส่งฟรี</p>
                  <p className="text-[9px] text-[#86868b] mt-0.5">ทั่วประเทศไทย</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-black/[0.03]">
                  <FaShieldAlt className="text-[#34c759] mx-auto mb-1.5 text-base" />
                  <p className="text-[11px] font-semibold text-[#1d1d1f]">ของแท้ 100%</p>
                  <p className="text-[9px] text-[#86868b] mt-0.5">ประกันคุณภาพ</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-black/[0.03]">
                  <FaHeadset className="text-[#ff9500] mx-auto mb-1.5 text-base" />
                  <p className="text-[11px] font-semibold text-[#1d1d1f]">บริการช่วยเหลือ</p>
                  <p className="text-[9px] text-[#86868b] mt-0.5">ตลอดการใช้งาน</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Information Tabs & Specs */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
          {/* Segmented Tab Headers */}
          <div className="flex items-center justify-center border-b border-black/[0.06] pb-4 mb-8">
            <div className="bg-[#f5f5f7] p-1 rounded-full inline-flex gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all ${
                  activeTab === 'overview'
                    ? 'bg-white text-[#1d1d1f] shadow-xs'
                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                ภาพรวมและรายละเอียด
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all ${
                  activeTab === 'specs'
                    ? 'bg-white text-[#1d1d1f] shadow-xs'
                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                ข้อมูลจำเพาะ (Specs)
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all ${
                  activeTab === 'shipping'
                    ? 'bg-white text-[#1d1d1f] shadow-xs'
                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                การจัดส่งและรับประกัน
              </button>
            </div>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-3">
                  เกี่ยวกับสินค้าชิ้นนี้
                </h3>
                <p className="text-base text-[#424245] leading-relaxed whitespace-pre-line">
                  {product.description || 'ไม่มีรายละเอียดเพิ่มเติมสำหรับสินค้านี้'}
                </p>
              </div>

              <div className="pt-6 border-t border-black/[0.04] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#fbfbfd] border border-black/[0.03] space-y-1">
                  <div className="flex items-center gap-2 text-[#0071e3] font-semibold text-sm">
                    <FaCheck className="text-xs" />
                    <span>ลิขสิทธิ์แท้ถูกต้อง</span>
                  </div>
                  <p className="text-xs text-[#86868b]">
                    สินค้าทุกชิ้นจัดจำหน่ายโดยถูกต้องตามลิขสิทธิ์ มีหลักฐานยืนยันความถูกต้องครบถ้วน
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#fbfbfd] border border-black/[0.03] space-y-1">
                  <div className="flex items-center gap-2 text-[#34c759] font-semibold text-sm">
                    <FaBolt className="text-xs" />
                    <span>พร้อมใช้งานทันที</span>
                  </div>
                  <p className="text-xs text-[#86868b]">
                    เปิดใช้งานได้สะดวกรวดเร็ว พร้อมคำแนะนำการติดตั้งอย่างละเอียดทุกขั้นตอน
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specs */}
          {activeTab === 'specs' && (
            <div className="max-w-3xl mx-auto">
              <div className="divide-y divide-black/[0.04]">
                <div className="py-3.5 flex justify-between text-sm">
                  <span className="text-[#86868b]">ชื่อสินค้า</span>
                  <span className="font-semibold text-[#1d1d1f]">{product.ItemName}</span>
                </div>
                <div className="py-3.5 flex justify-between text-sm">
                  <span className="text-[#86868b]">หมวดหมู่สินค้า</span>
                  <span className="font-semibold text-[#1d1d1f]">{product.category || 'ทั่วไป'}</span>
                </div>
                <div className="py-3.5 flex justify-between text-sm">
                  <span className="text-[#86868b]">สถานะสต็อก</span>
                  <span className="font-semibold text-emerald-600">{product.stock > 0 ? `พร้อมส่ง (${product.stock} ชิ้น)` : 'สินค้าหมด'}</span>
                </div>
                <div className="py-3.5 flex justify-between text-sm">
                  <span className="text-[#86868b]">รูปแบบผลิตภัณฑ์</span>
                  <span className="font-semibold text-[#1d1d1f]">สินค้าของแท้ กล่องบรรจุภัณฑ์มาตรฐาน</span>
                </div>
                <div className="py-3.5 flex justify-between text-sm">
                  <span className="text-[#86868b]">การรับประกัน</span>
                  <span className="font-semibold text-[#1d1d1f]">รับประกันศูนย์ 1 ปีเต็ม</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Shipping */}
          {activeTab === 'shipping' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#1d1d1f] text-sm flex items-center gap-2">
                    <FaTruck className="text-[#0071e3]" />
                    <span>การจัดส่งสินค้า</span>
                  </h4>
                  <p className="text-xs text-[#86868b] leading-relaxed">
                    ทางร้านจัดส่งพัสดุฟรีทุกวัน ผ่านขนส่งชั้นนำ เช่น Flash Express, Kerry Express, ไปรษณีย์ไทย EMS ได้รับสินค้าภายใน 1-3 วันทำการ มีเลข Tracking ติดตามได้ 24 ชั่วโมง
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-[#1d1d1f] text-sm flex items-center gap-2">
                    <FaShieldAlt className="text-[#34c759]" />
                    <span>นโยบายการรับประกัน</span>
                  </h4>
                  <p className="text-xs text-[#86868b] leading-relaxed">
                    รับประกันความพึงพอใจและสินค้าของแท้ 100% หากพบปัญหาจากการใช้งานหรือสินค้าชำรุดจากการขนส่ง สามารถติดต่อทีมงานเพื่อเคลมเปลี่ยนสินค้าชิ้นใหม่ได้ทันที
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recommended / Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                  สินค้าอื่นที่คุณอาจสนใจ
                </h2>
                <p className="text-xs text-[#86868b] mt-0.5">
                  คัดสรรสินค้าคุณภาพที่เข้ากันได้ดีกับรายการนี้
                </p>
              </div>
              <Link
                to="/"
                className="text-xs font-medium text-[#0071e3] hover:underline flex items-center gap-1"
              >
                <span>ดูสินค้าทั้งหมด</span>
                <FaChevronRight className="text-[10px]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="group bg-white rounded-3xl p-5 border border-black/[0.06] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-40 flex items-center justify-center p-3 mb-3 bg-white rounded-2xl">
                      <img
                        src={item.file}
                        alt={item.ItemName}
                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[#86868b] uppercase bg-[#f5f5f7] px-2.5 py-0.5 rounded-full">
                      {item.category || 'สินค้าแนะนำ'}
                    </span>
                    <h3 className="font-semibold text-sm text-[#1d1d1f] mt-2 line-clamp-2 group-hover:text-[#0071e3] transition-colors">
                      {item.ItemName}
                    </h3>
                  </div>

                  <div className="pt-3 mt-3 border-t border-black/[0.04] flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1d1d1f]">
                      ฿{Number(item.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-[#0071e3] font-medium group-hover:translate-x-0.5 transition-transform">
                      ดูสินค้า →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
