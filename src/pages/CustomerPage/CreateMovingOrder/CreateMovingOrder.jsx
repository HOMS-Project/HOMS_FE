import React from "react";
import { Layout, Steps, Card, Row, Col, Input, Button } from "antd";
import { EnvironmentOutlined, CalendarOutlined } from "@ant-design/icons";

import AppHeader from "../../../components/header/header";
import AppFooter from "../../../components/footer/footer";

import "./style.css";

const { Content } = Layout;
const { TextArea } = Input;

const MovingInformationPage = () => {
    return (
        <Layout className="moving-info-page">
            <AppHeader />

            <Content>

                {/* HERO */}
                <section className="moving-hero">
                    <h1>Chuyển Nhà Trọn Gói</h1>
                </section>

                {/* STEPS */}
                <section className="service-steps-container">
                    <Card className="steps-card">
                        <Steps
                            current={1}
                            responsive
                            items={[
                                { title: 'Chọn dịch vụ' },
                                { title: 'Địa điểm & Thông tin đồ đạc' },
                                { title: 'Xác nhận' },
                                { title: 'Đặt cọc' },
                            ]}
                        />
                    </Card>
                </section>

                {/* LOCATION SECTION */}
                <section className="moving-location">
                    <h2>Chúng Tôi Cần Biết Bạn Chuyển Từ Đâu Đến Đâu</h2>

                    <Row gutter={40}>
                        <Col md={10} xs={24}>
                            <div className="location-form">
                                <h3>Địa điểm chuyển đi</h3>

                                <Input
                                    placeholder="Địa chỉ chuyển đi"
                                    prefix={<EnvironmentOutlined />}
                                    className="custom-input"
                                />

                                <Input
                                    placeholder="Thời gian"
                                    prefix={<CalendarOutlined />}
                                    className="custom-input"
                                />

                                <TextArea
                                    rows={3}
                                    placeholder="Mô tả sơ bộ"
                                    className="custom-input"
                                />

                                <div className="location-switch">
                                    <Button type="primary">Nơi chuyển đi</Button>
                                    <Button>Nơi chuyển đến</Button>
                                </div>
                            </div>
                        </Col>

                        <Col md={14} xs={24}>
                            <div className="map-placeholder">
                                <span>Bản đồ sẽ hiển thị tại đây</span>
                            </div>
                        </Col>
                    </Row>
                </section>

                {/* ITEMS SECTION */}
                <section className="moving-items">
                    <h2>Cho Chúng Tôi Biết Bạn Cần Chuyển Những Gì</h2>

                    <div className="upload-box">
                        <div className="upload-placeholder">
                            <p>Chụp ảnh để AI ước tính nhanh chóng</p>
                            <span>Hỗ trợ định dạng JPG, PNG (tối đa 20MB)</span>
                        </div>
                    </div>

                    <div className="manual-section">
                        <h3>Hoặc nhập thủ công nếu bạn cần kiểm soát chi tiết</h3>

                        <Row gutter={40}>
                            <Col md={12} xs={24}>
                                <div className="house-size">
                                    <h4>Kích thước nhà</h4>
                                    <div className="house-options">
                                        <div className="house-card active">2 Phòng ngủ 1 Bếp</div>
                                        <div className="house-card">3 Phòng ngủ 1 Bếp</div>
                                        <div className="house-card">4 Phòng ngủ 1 Bếp</div>
                                        <div className="house-card add">+</div>
                                    </div>
                                </div>
                            </Col>

                            <Col md={12} xs={24}>
                                <div className="furniture-section">
                                    <h4>Đồ nội thất</h4>
                                    <div className="furniture-grid">
                                        <div className="furniture-item">Giường</div>
                                        <div className="furniture-item">Sofa</div>
                                        <div className="furniture-item">Tủ</div>
                                        <div className="furniture-item">TV</div>
                                        <div className="furniture-item">Tủ lạnh</div>
                                        <div className="furniture-item">Máy giặt</div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div className="note-section">
                            <h4>Ghi chú đặc biệt</h4>
                            <TextArea rows={4} placeholder="Két sắt, server, piano..." />
                        </div>
                    </div>

                    <div className="next-button">
                        <Button type="primary" size="large">
                            Tiếp theo
                        </Button>
                    </div>
                </section>

            </Content>

            <AppFooter />
        </Layout>
    );
};

export default React.memo(MovingInformationPage);
