import React, { useState } from 'react';
import { Layout, Row, Col, Button, Input, Drawer, Menu } from 'antd';
import { 
  MenuOutlined, 
  SearchOutlined, 
  RightOutlined 
} from '@ant-design/icons';
import './header.css';

const { Header } = Layout;

const AppHeader = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard'); // State để track menu đang active

  // Danh sách menu mới theo yêu cầu
  const navItems = [
    { key: 'dashboard', label: 'Bảng Điều Khiển' },
    { key: 'services', label: 'Các Dịch Vụ' },
    { key: 'orders', label: 'Đơn Hàng' },
    { key: 'transport', label: 'Phương Tiện Di Chuyển' },
    { key: 'about', label: 'Về Chúng Tôi' },
  ];

  const handleMenuClick = (key) => {
    setActiveMenu(key);
    // Logic scroll có thể thêm vào đây tùy key
  };

  return (
    <Header className="custom-header-wrapper">
      {/* --- PHẦN 1: TOP BAR (NỀN TRẮNG) --- */}
      <div className="header-top">
        <div className="container">
          <Row align="middle" justify="space-between" style={{ height: '100%' }}>
            {/* Logo bên trái */}
            <Col>
              <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                 <img 
                   src="./images/logo.png" 
                   alt="HOMS" 
                   style={{ height: '60px' }} 
                 />
                 {/* Hoặc dùng text nếu chưa có ảnh thật */}
                 {/* <h2 style={{ margin: 0, color: '#2D4F36', fontWeight: 'bold' }}>HOMS</h2> */}
              </div>
            </Col>

            {/* Giữa & Phải: Tìm kiếm + Nút Liên Hệ */}
            <Col xs={0} md={16} lg={12}>
              <div className="top-actions">
                <Input 
                  prefix={<SearchOutlined style={{ color: '#ccc' }} />} 
                  placeholder="Chuyển nhà, báo giá..." 
                  className="header-search"
                  bordered={false}
                />
                <Button 
                  type="primary" 
                  className="contact-btn-top"
                  iconPosition="end"
                >
                  Liên Hệ Ngay <RightOutlined style={{ fontSize: '10px' }} />
                </Button>
              </div>
            </Col>

            {/* Mobile Menu Button (Hiện khi màn hình nhỏ) */}
            <Col xs={4} md={0} style={{ textAlign: 'right' }}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuVisible(true)}
                style={{ color: '#2D4F36' }}
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* --- PHẦN 2: BOTTOM BAR (NỀN XANH #44624A) --- */}
      <div className="header-bottom">
        <div className="container">
          <ul className="bottom-nav">
            {navItems.map((item) => (
              <li 
                key={item.key} 
                className={`nav-item ${activeMenu === item.key ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.key)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile Drawer giữ nguyên logic cũ */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={250}
      >
        <Menu
          mode="vertical"
          selectedKeys={[activeMenu]}
          items={navItems.map(item => ({ key: item.key, label: item.label }))}
          onClick={(e) => {
            setActiveMenu(e.key);
            setMobileMenuVisible(false);
          }}
          style={{ border: 'none' }}
        />
      </Drawer>
    </Header>
  );
};

export default AppHeader;