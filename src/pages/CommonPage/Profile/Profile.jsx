import React from 'react';
import { Layout, Button } from 'antd';

import AppHeader from '../../../components/header/header';
import AppFooter from '../../../components/footer/footer';
import './Profile.css';

const { Content } = Layout;

const ProfilePage = () => {
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
                                <strong>example@gmail.com</strong>
                            </div>

                            <div className="profile-row">
                                <span>Số điện thoại</span>
                                <strong>1234567890</strong>
                            </div>

                            <div className="profile-row">
                                <span>Địa chỉ</span>
                                <strong>
                                    26 Lê Trung Đình, Hòa Hải,
                                    Ngũ Hành Sơn, Đà Nẵng
                                </strong>
                            </div>

                            <Button className="btn-primary">
                                Cập nhật thông tin
                            </Button>
                        </div>

                        {/* ACCOUNT INFO */}
                        <div className="profile-card profile-avatar">
                            <img
                                src="/images/avatar.png"
                                alt="avatar"
                            />
                            <h4>Bùi Lê Việt Anh</h4>
                            <p>Khách hàng</p>

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
                            <strong>Bùi Lê Việt Anh</strong>
                        </div>

                        <div className="profile-row">
                            <span>Email đăng nhập</span>
                            <strong>example@gmail.com</strong>
                        </div>

                        <div className="profile-row">
                            <span>Vai trò</span>
                            <strong>Khách hàng</strong>
                        </div>

                        <div className="profile-row">
                            <span>Ngày tạo tài khoản</span>
                            <strong>12/01/2025</strong>
                        </div>
                    </div>

                    {/* SECURITY */}
                    <div className="profile-card full-width">
                        <h3>Bảo mật & mật khẩu</h3>

                        <div className="profile-row">
                            <span>Mật khẩu</span>
                            <Button className="btn-outline">
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