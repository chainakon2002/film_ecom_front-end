import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://ecomapi2-production.up.railway.app/auth/getorder', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(response.data);
      } catch (err) {
        setError('Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Payment List</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Product Name</th>
            <th>Price</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id}>
              <td>{payment.id}</td>
              <td>{payment.username}</td>
              <td>{payment.productname}</td>
              <td>{payment.price}</td>
              <td>{payment.amount}</td>
              <td>{payment.status}</td>
              <td>{new Date(payment.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentList;


