import React from 'react';
import { Layout, Row, Col, Space, Button, Input, Divider } from 'antd';
import {
  PhoneOutlined, MailOutlined, EnvironmentOutlined,
  FacebookOutlined, InstagramOutlined, LinkedinOutlined, TwitterOutlined,
  SendOutlined
} from '@ant-design/icons';
import './footer.css'; // Đảm bảo import file CSS mới

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer className="landing-footer">
      <div className="footer-container">
        {/* justify="space-between" giúp các cột dãn đều ra 2 bên */}
        <Row gutter={[32, 48]} justify="space-between">
          
          {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU */}
          <Col xs={24} sm={24} md={8} lg={8}>
            <div className="footer-brand">
              <div className="logo-wrapper">
                <img 
                  src="/images/logo.png" 
                  alt="HOMS Logo" 
                  className="footer-logo-img"
                />
                <h3 className="footer-brand-name">HOMS</h3>
              </div>
              <p className="footer-desc">
                Chuyển nhà tận tâm - An tâm trọn vẹn.<br/>
                Chúng tôi cung cấp giải pháp vận chuyển hàng đầu Việt Nam với cam kết về chất lượng và sự an toàn.
              </p>
              <div className="footer-socials">
                <Button shape="circle" icon={<FacebookOutlined />} className="social-btn" />
                <Button shape="circle" icon={<InstagramOutlined />} className="social-btn" />
                <Button shape="circle" icon={<LinkedinOutlined />} className="social-btn" />
                <Button shape="circle" icon={<TwitterOutlined />} className="social-btn" />
              </div>
            </div>
          </Col>

          {/* CỘT 2: DỊCH VỤ (Căn giữa hoặc lệch phải tùy màn hình) */}
          <Col xs={24} sm={12} md={8} lg={5}>
            <h4 className="footer-heading">Dịch Vụ</h4>
            <ul className="footer-links">
              <li><a href="#services-section">Chuyển nhà trọn gói</a></li>
              <li><a href="#services-section">Chuyển văn phòng</a></li>
              <li><a href="#services-section">Chuyển đồ đạc</a></li>
              <li><a href="#services-section">Thuê xe tải</a></li>
              <li><a href="#services-section">Hoàn trả mặt bằng</a></li>
            </ul>
          </Col>

          {/* CỘT 3: LIÊN HỆ & NEWSLETTER */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <h4 className="footer-heading">Liên Hệ</h4>
            <Space direction="vertical" size="middle" className="footer-contact-list">
              <div className="contact-item">
                <PhoneOutlined className="contact-icon" /> 
                <span>1900 8888</span>
              </div>
              <div className="contact-item">
                <MailOutlined className="contact-icon" /> 
                <span>contact@homs.vn</span>
              </div>
              <div className="contact-item">
                <EnvironmentOutlined className="contact-icon" /> 
                <span>FPT University, Đà Nẵng</span>
              </div>
            </Space>

            <div className="footer-newsletter">
              <h4 className="footer-heading" style={{ marginTop: '24px', marginBottom: '12px' }}>Đăng ký nhận tin</h4>
              <Space.Compact style={{ width: '100%' }}>
                <Input placeholder="Email của bạn..." style={{ borderRadius: '6px 0 0 6px' }} />
                <Button type="primary" icon={<SendOutlined />} style={{ borderRadius: '0 6px 6px 0', background: '#44624A', borderColor: '#44624A' }} />
              </Space.Compact>
            </div>
          </Col>
        </Row>
      </div>

      <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '40px 0 20px' }} />

      <div className="footer-bottom">
        <div className="footer-container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <p>© 2024 HOMS. All rights reserved.</p>
            <div className="footer-legal">
                <a href="#">Điều khoản sử dụng</a>
                <span className="separator">|</span>
                <a href="#">Chính sách bảo mật</a>
            </div>
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter;