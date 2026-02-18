import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Steps, Card, Row, Col, Button, Calendar, Checkbox } from "antd";
import { Monitor, Users } from "lucide-react";

import AppHeader from "../../../components/header/header";
import AppFooter from "../../../components/footer/footer";

import "./style.css";

const { Content } = Layout;

const ConfirmMovingOrder = () => {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTimeIndex, setSelectedTimeIndex] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const timeSlots = [
        '09:00', '10:30', '10:30', '10:30',
        '10:30', '10:30', '10:30', '10:30'
    ];

    const handleCancel = () => {
        navigate('/');
    };

    const handleConfirm = () => {
        // Handle confirmation logic here
        const selectedTime = selectedTimeIndex !== null ? timeSlots[selectedTimeIndex] : null;
        console.log('Confirmed with:', { selectedMethod, selectedDate, selectedTime });
        
        // Navigate to deposit page
        navigate('/customer/deposit');
    };

    const onDateSelect = (date) => {
        setSelectedDate(date);
    };

    const dateCellRender = (value) => {
        // Add any custom date rendering logic here
        return null;
    };

    return (
        <Layout className="confirm-order-page">
            <AppHeader />

            <Content>
                {/* HERO */}
                <section className="confirm-hero">
                    <h1>Chuyển Nhà Trọn Gói</h1>
                </section>

                {/* STEPS */}
                <section className="service-steps-container">
                    <Card className="steps-card">
                        <Steps
                            current={2}
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

                {/* CONFIRMATION SECTION */}
                <section className="confirmation-section">
                    <h1 className="confirmation-title">Xác Nhận Để Chúng Tôi Báo Giá Chính Xác Nhất</h1>
                    <p className="confirmation-subtitle">Chọn hình thức khảo sát</p>

                    <Row gutter={40} className="survey-methods">
                        {/* ONLINE METHOD */}
                        <Col md={12} xs={24}>
                            <div 
                                className={`survey-card ${selectedMethod === 'online' ? 'active' : ''}`}
                                onClick={() => setSelectedMethod('online')}
                            >
                                <div className="survey-icon">
                                    <Monitor size={80} />
                                </div>
                                <h3>Online (Video Call)</h3>
                                <p>Khảo sát từ xa qua cuộc gọi video, nhanh chóng và linh hoạt, phù hợp với đa dạng đơn giản.</p>
                            </div>
                        </Col>

                        {/* OFFLINE METHOD */}
                        <Col md={12} xs={24}>
                            <div 
                                className={`survey-card ${selectedMethod === 'offline' ? 'active' : ''}`}
                                onClick={() => setSelectedMethod('offline')}
                            >
                                <div className="survey-icon">
                                    <Users size={80} />
                                </div>
                                <h3>Offline (Khảo Sát Trực Tiếp)</h3>
                                <p>Nhân viên đến tận nơi khảo sát, đánh giá chính xác, phù hợp với nhà lớn hoặc nhiều đồ cồng kềnh.</p>
                            </div>
                        </Col>
                    </Row>

                    {/* CALENDAR AND TIME SLOTS - SHOWN BELOW CARDS */}
                    {selectedMethod && (
                        <div className="survey-details-container">
                            <div className="survey-details">
                                <Calendar 
                                    fullscreen={false}
                                    onSelect={onDateSelect}
                                    value={selectedDate}
                                />
                                
                                <div className="time-slots">
                                    {timeSlots.map((time, index) => (
                                        <div
                                            key={index}
                                            className={`time-slot ${selectedTimeIndex === index ? 'selected' : ''}`}
                                            onClick={() => setSelectedTimeIndex(index)}
                                        >
                                            {time}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="confirmation-info">
                        <Checkbox 
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            disabled={!selectedMethod || !selectedDate || selectedTimeIndex === null}
                        >
                            Tôi xác nhận thông tin là chính xác
                        </Checkbox>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="action-buttons">
                        <Button size="large" className="cancel-button" onClick={handleCancel}>
                            Hủy bỏ
                        </Button>
                        <Button 
                            type="primary" 
                            size="large" 
                            className={`confirm-button ${!isConfirmed || !selectedMethod || !selectedDate || selectedTimeIndex === null ? 'disabled' : ''}`}
                            onClick={handleConfirm}
                            disabled={!isConfirmed || !selectedMethod || !selectedDate || selectedTimeIndex === null}
                        >
                            Xác nhận & Gửi yêu cầu
                        </Button>
                    </div>
                </section>
            </Content>

            <AppFooter />
        </Layout>
    );
};

export default React.memo(ConfirmMovingOrder);
