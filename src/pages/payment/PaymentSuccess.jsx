// src/pages/PaymentSuccess.jsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticketId = searchParams.get('ticketId');
  const code = searchParams.get('code'); 

  return (
    <Result
      status={code === '00' ? "success" : "warning"}
      title={code === '00' ? "Thanh toán đặt cọc thành công!" : "Đã xử lý giao dịch!"}
      subTitle="Chúng tôi sẽ liên hệ để tiến hành khảo sát trong thời gian sớm nhất."
      extra={[
        <Button type="primary" key="console" onClick={() => navigate('/customer/orders')}>
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