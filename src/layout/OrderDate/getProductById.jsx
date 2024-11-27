import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './getProduct.css';

export default function ProductDetail() {
  const [product, setProduct] = useState({});
  const [cart, setCart] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://ecomapi2-production.up.railway.app/auth/getproduct/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProduct(response.data);

        const cartResponse = await axios.get('https://ecomapi2-production.up.railway.app/cart/carts/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(cartResponse.data);
      } catch (error) {
        console.error('Error fetching product or cart:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const existingCartItem = cart.find(c => c.productId === product.id);

      if (existingCartItem) {
        const updatedTotal = existingCartItem.total + 1;
        const updatedPrice = existingCartItem.price + product.price;
        await axios.put(`https://ecomapi2-production.up.railway.app/cart/carts/${existingCartItem.id}/`, {
          total: updatedTotal,
          price: updatedPrice
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('https://ecomapi2-production.up.railway.app/cart/carts', {
          total: 1,
          price: product.price,
          UserId: userId,
          productId: product.id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      
      setIsAnimating(true);

      

      setTimeout(() => {
        setIsAnimating(false);
        
        navigate('/cart'); // Navigate to the /cart page
      }, 500); // Match the duration of the animation
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div className="product-container">
      <div className="product-image-container">
        <img 
          src={product.file || 'default-image.jpg'} 
          alt={product.ItemName || 'Product Image'} 
          className={`product-image ${isAnimating ? 'animate-float' : ''}`} 
        />
      </div>
      <div className='product-details-container'>
        <h2 className='name'>{product.ItemName}</h2>
        <div className='product-details'>
          <p className='det'>{product.description}</p>
          <p className='price'>ราคา: {product.price ? product.price.toLocaleString() : 'N/A'}</p>
          <p className='stock'>
            เหลือสินค้า: {product.stock > 0 ? product.stock : 'สินค้าหมด'} 
          </p>
        </div>
        <div className='buttoncart'>
          {product.stock > 0 && (
            <button className='btn-hover color-9' onClick={handleAddToCart}>
              เพิ่มลงตะกร้า
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
