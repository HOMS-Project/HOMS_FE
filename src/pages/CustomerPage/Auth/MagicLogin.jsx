import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Input, Button, Typography, message, Layout } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import api from '../../../services/api'; 
import useUser from '../../../contexts/UserContext'; 
import { saveAccessToken } from '../../../services/authService';
const { Title, Text } = Typography;

const MagicLogin = () => {
  const { setUser, setIsAuthenticated } = useUser(); 
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ fullName: '', email: '' });
  const [password, setPassword] = useState(''); 
  
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const redirectUrl = searchParams.get('redirect') || '/customer/order';

  useEffect(() => {
    if (!token) {
      message.error('Link không hợp lệ!');
      navigate('/login');
      return;
    }
    try {
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decodedPayload = JSON.parse(jsonPayload);
      setUserInfo({
        fullName: decodedPayload.fullName || 'Khách hàng',
        email: decodedPayload.email || ''
      });
    } catch (e) {
      console.log('Lỗi giải mã token', e);
    }
  }, [token, navigate]);

  const handleSubmit = async () => {
    if (!password) {
      return message.warning('Vui lòng tạo mật khẩu của bạn.');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/magic', { token, password });

      if (res.data.success) {
       if (res.data.accessToken) {
            const expiresIn = res.data.expiresInMs || (15 * 60 * 1000);
            saveAccessToken(res.data.accessToken, expiresIn);
        }

        if (res.data.data && res.data.data.user) {
            setUser(res.data.data.user);
        }
        setIsAuthenticated(true);
        message.success('Thiết lập tài khoản thành công!');
        navigate(redirectUrl); 
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400, marginTop: '10vh', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#2D4F36' }}>Kích Hoạt Tài Khoản</Title>
          <Text type="secondary">Vui lòng tạo mật khẩu để quản lý hợp đồng bảo mật.</Text>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Họ và Tên</Text>
          <Input size="large" prefix={<UserOutlined />} value={userInfo.fullName} disabled style={{ marginTop: 8 }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Email nhận OTP</Text>
          <Input size="large" prefix={<MailOutlined />} value={userInfo.email} disabled style={{ marginTop: 8 }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong>Tạo mật khẩu mới</Text>
          <Input.Password 
            size="large" prefix={<LockOutlined />} placeholder="Nhập mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginTop: 8 }} 
          />
        </div>

        <Button type="primary" size="large" block loading={loading} onClick={handleSubmit} style={{ background: '#2D4F36', borderColor: '#2D4F36' }}>
          Lưu & Tiến hành ký Hợp Đồng
        </Button>
      </Card>
    </Layout>
  );
};

export default MagicLogin;