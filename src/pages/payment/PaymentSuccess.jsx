// src/pages/PaymentSuccess.jsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import api from '../../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticketId = searchParams.get('ticketId');
  const code = searchParams.get('code');

  useEffect(() => {
    // If returning from PayOS with success, manually trigger a backend verification.
    // This provides a fallback for local environments without ngrok webhooks, 
    // ensuring the invoice status explicitly updates to PAID/PARTIAL and CONFIRMED.
    if (code === '00' && ticketId) {
      api.get(`/request-tickets/${ticketId}/verify-payment`)
        .catch(err => console.error("Verify payment fallback failed:", err));
    }
  }, [code, ticketId]);

  return (
    <Result
      status={code === '00' ? "success" : "warning"}
      title={code === '00' ? "Thanh toán đặt cọc thành công!" : "Đã xử lý giao dịch!"}
      subTitle="Chúng tôi sẽ liên hệ để tiến hành khảo sát trong thời gian sớm nhất."
      extra={[
        <Button type="primary" key="console" onClick={() => navigate('/customer/order')}>
          Quản lý đơn hàng
        </Button>,
        <Button key="home" onClick={() => navigate('/')}>
          Trang chủ
        </Button>,
      ]}
    />
  );
};

export default PaymentSuccess;