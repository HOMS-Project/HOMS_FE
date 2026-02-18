import React from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Steps, Card, Row, Col, Input, Button } from "antd";
import { BedDouble, Sofa, Armchair, Refrigerator, Tv, WashingMachine, Package, Plus, Minus, Home, ImagePlus, HelpCircle } from "lucide-react";
import { EnvironmentOutlined, CalendarOutlined } from "@ant-design/icons";

import AppHeader from "../../../components/header/header";
import AppFooter from "../../../components/footer/footer";

import "./style.css";

const { Content } = Layout;
const { TextArea } = Input;

const MovingInformationPage = () => {
    const navigate = useNavigate();

    const handleNext = () => {
        navigate('/customer/confirm-order');
    };

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
                    <h1>Chúng Tôi Cần Biết Bạn Chuyển Từ Đâu Đến Đâu</h1>

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
                    <h1>Cho Chúng Tôi Biết Bạn Cần Chuyển Những Gì</h1>

                    <div className="upload-box">
                        <div className="upload-placeholder">
                            <div className="upload-text">
                                <h3>Chụp ảnh để AI ước tính nhanh chóng</h3>
                                <p>Chụp rõ từng món đồ hoặc toàn cảnh phòng để hệ thống tự động<br />ước tính khối lượng và công việc cần thiết.</p>
                            </div>
                            <div className="upload-input">
                                <div className="help-icon-wrapper">
                                    <HelpCircle size={18} className="help-icon" />
                                    <div className="help-tooltip">
                                        <p>Chụp ảnh rõ nét để AI có thể nhận diện chính xác các món đồ của bạn.</p>
                                        <p>Chụp riêng các đồ cồng kềnh (tủ, giường, máy giặt…)</p>
                                        <p>Tránh ảnh mờ, thiếu sáng <br />Có thể chụp nhiều góc cho cùng một món đồ</p>
                                    </div>
                                </div>
                                <ImagePlus size={50} />
                                <span>Hỗ trợ định dạng JPG, PNG, MP4 tối đa 200MB</span>
                            </div>
                        </div>
                    </div>

                    <div className="manual-section">
                        <h2> Hoặc nhập thủ công nếu bạn cần kiểm soát chi tiết </h2>

                        <Row gutter={60}>
                            {/* LEFT SIDE */}
                            <Col md={12} xs={24}>
                                <div className="house-size">
                                    <h4>Kích thước nhà</h4>

                                    <div className="house-options">
                                        <div className="house-card active">
                                            <Home size={40} />
                                            <span>2 Phòng ngủ<br />1 Bếp</span>
                                        </div>

                                        <div className="house-card">
                                            <Home size={40} />
                                            <span>3 Phòng ngủ<br />1 Bếp</span>
                                        </div>

                                        <div className="house-card">
                                            <Home size={40} />
                                            <span>4 Phòng ngủ<br />1 Bếp</span>
                                        </div>

                                        <div className="house-card add">
                                            <Plus size={40} />
                                            <span>Thêm</span>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            {/* RIGHT SIDE */}
                            <Col md={12} xs={24}>
                                <div className="furniture-section">
                                    <div className="furniture-header">
                                        <h4>Đồ nội thất</h4>
                                        <div className="selected-badge">
                                            2 Đồ vật ×
                                        </div>
                                    </div>

                                    <div className="furniture-grid">
                                        <div className="furniture-item bed">
                                            <BedDouble size={28} />
                                            <span>Giường</span>
                                        </div>

                                        <div className="furniture-item sofa">
                                            <Sofa size={28} />
                                            <span>Sofa</span>
                                        </div>

                                        <div className="furniture-item chair">
                                            <Armchair size={28} />
                                            <span>Ghế</span>
                                        </div>

                                        <div className="furniture-item wardrobe">
                                            <Package size={28} />
                                            <span>Tủ quần áo</span>
                                        </div>

                                        <div className="furniture-item fridge">
                                            <Refrigerator size={28} />
                                            <span>Tủ lạnh</span>
                                        </div>

                                        <div className="furniture-item tv">
                                            <Tv size={28} />
                                            <span>TV</span>
                                        </div>

                                        <div className="furniture-item washing">
                                            <WashingMachine size={28} />
                                            <span>Máy giặt</span>
                                        </div>

                                        <div className="furniture-item add">
                                            <Plus size={28} />
                                            <span>Thêm</span>
                                        </div>
                                    </div>

                                    {/* Counter */}
                                    <div className="counter-section">
                                        <span>Các thùng đã đóng gói</span>
                                        <div className="counter">
                                            <button><Minus size={18} /></button>
                                            <span>0</span>
                                            <button><Plus size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* NOTE SECTION */}
                        <div className="note-section">
                            <TextArea
                                rows={6}
                                placeholder="Két sắt, server, piano..."
                            />
                        </div>
                    </div>

                    <div className="next-button">
                        <Button type="primary" size="large" onClick={handleNext}>
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
