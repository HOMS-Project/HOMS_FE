import React from 'react';
import { Layout, Button, Avatar } from 'antd';
import { Navigate, useNavigate } from 'react-router-dom';

import AppHeader from '../../../components/header/header';
import AppFooter from '../../../components/footer/footer';
import useUser from '../../../contexts/UserContext';
import './Profile.css';

const { Content } = Layout;

const ProfilePage = () => {
    const { user, loading, isAuthenticated } = useUser();
    const navigate = useNavigate();

    // Nếu chưa load xong, hiển thị loading
    if (loading) {
        return (
            <Layout className="profile-page">
                <AppHeader />
                <Content style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Đang tải...</p>
                </Content>
                <AppFooter />
            </Layout>
        );
    }

    // Nếu chưa đăng nhập, redirect về login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />;
    }

    return (
        <Layout className="profile-page">
            <AppHeader />

            <Content>
                {/* HERO */}
                <section className="profile-hero">
                    <h1>Hồ sơ của tôi</h1>
                </section>

                {/* MAIN CONTENT */}
                <section className="profile-container">

                    {/* CONTACT INFO */}
                    <div className="profile-grid">
                        <div className="profile-card">
                            <h3>Thông tin liên lạc</h3>

                            <div className="profile-row">
                                <span>Email</span>
                                <strong>{user.email || 'N/A'}</strong>
                            </div>

                            <div className="profile-row">
                                <span>Số điện thoại</span>
                                <strong>{user.phone || 'N/A'}</strong>
                            </div>

                            <div className="profile-row">
                                <span>Địa chỉ</span>
                                <strong>
                                    {user.address || '26 Lê Trung Đình, Phường Hòa Hải, Quận Ngũ Hành Sơn, TP. Đà Nẵng'}
                                </strong>
                            </div>

                            <Button className="btn-primary">
                                Cập nhật thông tin
                            </Button>
                        </div>

                        {/* ACCOUNT INFO */}
                        <div className="profile-card profile-avatar">
                            <Avatar
                                src={user.avatar}
                                size={128}
                                style={{ 
                                    backgroundColor: "#44624A",
                                    fontSize: "48px",
                                    fontWeight: "bold"
                                }}
                            >
                                {user.fullName?.charAt(0)}
                            </Avatar>
                            <h4>{user.fullName || 'N/A'}</h4>
                            <p>{user.role || 'Khách hàng'}</p>

                            <Button className="btn-outline">
                                Đổi ảnh đại diện
                            </Button>
                        </div>
                    </div>

                    {/* ACCOUNT DETAILS */}
                    <div className="profile-card full-width">
                        <h3>Thông tin tài khoản</h3>

                        <div className="profile-row">
                            <span>Tên người dùng</span>
                            <strong>{user.fullName || 'N/A'}</strong>
                        </div>

                        <div className="profile-row">
                            <span>Email đăng nhập</span>
                            <strong>{user.email || 'N/A'}</strong>
                        </div>

                        <div className="profile-row">
                            <span>Vai trò</span>
                            <strong>{user.role || 'Khách hàng'}</strong>
                        </div>

                        <div className="profile-row">
                            <span>Ngày tạo tài khoản</span>
                            <strong>
                                {user.createdAt 
                                    ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                                    : 'N/A'
                                }
                            </strong>
                        </div>
                    </div>

                    {/* SECURITY */}
                    <div className="profile-card full-width">
                        <h3>Bảo mật & mật khẩu</h3>

                        <div className="profile-row">
                            <span>Mật khẩu</span>
                            <Button 
                                className="btn-outline"
                                onClick={() => navigate('/change-password')}
                            >
                                Đổi mật khẩu
                            </Button>
                        </div>

                        <div className="profile-row">
                            <span>Trạng thái bảo mật</span>
                            <strong className="status-safe">
                                Đang hoạt động
                            </strong>
                        </div>

                        <div className="profile-row">
                            <span>Phiên đăng nhập</span>
                            <Button danger>
                                Đăng xuất tất cả
                            </Button>
                        </div>
                    </div>

                </section>
            </Content>

            <AppFooter />
        </Layout>
    );
};

export default ProfilePage;