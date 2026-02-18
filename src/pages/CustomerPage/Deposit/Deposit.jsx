import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Steps, Card, Row, Col, Select, Checkbox, Button, Progress } from "antd";
import { ClockIcon, MapPinIcon, FileText } from "lucide-react";

import AppHeader from "../../../components/header/header";
import AppFooter from "../../../components/footer/footer";

import "./style.css";

const { Content } = Layout;
const { Option } = Select;

const Deposit = () => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Mock data - replace with actual data from previous steps
    const orderData = {
        orderId: "HOMS-2024-00123",
        serviceType: "Chuyển nhà trọn gói",
        surveyMethod: "Offline",
        status: "Chờ đặt cọc",
        progress: 10,
        dateTime: "08:00 - 12:00 • 05/01/2026",
        fromAddress: "26 Lê Trung Đình, Hòa Hải, Ngũ Hành Sơn",
        toAddress: "140 Lê Đình Lý, Thạc Gián, Thanh Khê",
        depositAmount: "100.000 VND"
    };

    const handleSubmit = () => {
        if (paymentMethod && agreedToTerms) {
            console.log("Payment submitted with method:", paymentMethod);
            // Handle payment submission
        }
    };

    return (
        <Layout className="deposit-page">
            <AppHeader />

            <Content>
                {/* HERO */}
                <section className="deposit-hero">
                    <h1>Chuyển Nhà Trọn Gói</h1>
                </section>

                {/* STEPS */}
                <section className="service-steps-container">
                    <Card className="steps-card">
                        <Steps
                            current={3}
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

                {/* DEPOSIT SECTION */}
                <section className="deposit-section">
                    <h1 className="deposit-title">Thông Tin Đặt Cọc</h1>

                    <Row gutter={40}>
                        {/* LEFT SIDE - Order Info & Payment */}
                        <Col md={14} xs={24}>
                            {/* Order Information Card */}
                            <Card className="order-info-card">
                                <div className="order-header">
                                    <h3># {orderData.orderId}</h3>
                                </div>

                                <div className="order-details">
                                    <div className="detail-row">
                                        <span className="label">Loại dịch vụ:</span>
                                        <span className="value">{orderData.serviceType}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Hình thức khảo sát:</span>
                                        <span className="value">{orderData.surveyMethod}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Trạng thái:</span>
                                        <span className="status-badge pending">
                                            <span className="status-dot"></span>
                                            {orderData.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="progress-section">
                                    <Progress percent={orderData.progress} strokeColor="#5f7d67" />
                                </div>
                            </Card>

                            {/* Schedule & Location Card */}
                            <Card className="schedule-card">
                                <div className="schedule-item">
                                    <ClockIcon size={20} />
                                    <span>{orderData.dateTime}</span>
                                </div>
                                <div className="location-item">
                                    <MapPinIcon size={20} />
                                    <span>{orderData.fromAddress}</span>
                                </div>
                                <div className="location-item">
                                    <MapPinIcon size={20} />
                                    <span>{orderData.toAddress}</span>
                                </div>
                            </Card>

                            {/* Payment Section */}
                            <div className="payment-section">
                                <h2>Thanh toán</h2>
                                
                                <Select
                                    placeholder="Chọn phương thức thanh toán"
                                    className="payment-select"
                                    size="large"
                                    value={paymentMethod}
                                    onChange={(value) => setPaymentMethod(value)}
                                >
                                    <Option value="bank_transfer">Chuyển khoản ngân hàng</Option>
                                    <Option value="momo">Ví MoMo</Option>
                                    <Option value="vnpay">VNPay</Option>
                                    <Option value="zalopay">ZaloPay</Option>
                                </Select>

                                <div className="terms-checkbox">
                                    <Checkbox
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    >
                                        Bằng cách nhấp vào <strong>"Gửi yêu cầu"</strong> bên dưới, tôi đã đọc và đồng ý với các điều khoản chính sách của hợp đồng
                                    </Checkbox>
                                </div>

                                <Button
                                    type="primary"
                                    size="large"
                                    className={`submit-payment-button ${!paymentMethod || !agreedToTerms ? 'disabled' : ''}`}
                                    onClick={handleSubmit}
                                    disabled={!paymentMethod || !agreedToTerms}
                                >
                                    Gửi yêu cầu
                                </Button>
                            </div>
                        </Col>

                        {/* RIGHT SIDE - Invoice */}
                        <Col md={10} xs={24}>
                            <div className="invoice-card">
                                <div className="invoice-header">
                                    <div className="invoice-logo">
                                        <img src="/images/logo (2).png" alt="HOMS Logo" className="logo-img" />
                                    </div>
                                    <div className="invoice-text">HOMS</div>
                                </div>

                                <div className="invoice-body">
                                    <div className="invoice-row">
                                        <span className="invoice-label">Mã đơn hàng</span>
                                        <span className="invoice-value">{orderData.orderId}</span>
                                    </div>
                                    <div className="invoice-row highlight">
                                        <span className="invoice-label">Phí đặt cọc<br />(khảo sát)</span>
                                        <span className="invoice-value">{orderData.depositAmount}</span>
                                    </div>

                                    <div className="invoice-divider"></div>

                                    <div className="invoice-total">
                                        <div className="total-row">
                                            <span className="total-label">Tổng khoản tiền thanh toán</span>
                                            <FileText size={32} className="invoice-icon" />
                                        </div>
                                        <div className="total-amount">{orderData.depositAmount}</div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </section>
            </Content>

            <AppFooter />
        </Layout>
    );
};

export default React.memo(Deposit);
