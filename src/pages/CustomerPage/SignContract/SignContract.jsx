import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Button, message, Spin, Checkbox, Typography, Divider } from 'antd';
import { SafetyCertificateOutlined, CheckCircleOutlined, InfoCircleOutlined, EditOutlined } from '@ant-design/icons';
import AppHeader from '../../../components/header/header';
import AppFooter from '../../../components/footer/footer';
import api from '../../../services/api';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const SignContract = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agreed, setAgreed] = useState(false);
    const [signing, setSigning] = useState(false);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/customer/contracts/ticket/${ticketId}`);
                if (response.data?.success) {
                    setContract(response.data.data);
                } else {
                    message.error('Không thể lấy thông tin hợp đồng.');
                }
            } catch (error) {
                console.error(error);
                message.error('Lỗi khi lấy thông tin hợp đồng: ' + (error.response?.data?.message || ''));
            }

            // Also fetch invoice to check payment status
            try {
                const invRes = await api.get(`/invoices/ticket/${ticketId}`);
                if (invRes.data?.success) setInvoice(invRes.data.data);
            } catch (_) {
                // Invoice may not exist yet — that's fine
            }

            setLoading(false);
        };

        if (ticketId) fetchData();
    }, [ticketId]);

    const handleSignContract = async () => {
        if (!agreed) {
            message.warning('Vui lòng đọc và đồng ý với các điều khoản.');
            return;
        }

        setSigning(true);
        try {
            // Fake signature data since there is no actual canvas implemented for customer in this mock
            const payload = {
                signatureImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // transparent pixel
                ipAddress: '127.0.0.1'
            };

            await api.post(`/customer/contracts/${contract._id}/sign`, payload);
            message.success('Ký hợp đồng thành công! Đang chuyển hướng đến cổng thanh toán...');

            // Xử lý thanh toán cọc PayOS cho Invoice vừa được tạo
            try {
                const depositRes = await api.post(`/request-tickets/${ticketId}/deposit`);
                if (depositRes.data?.success && depositRes.data?.data?.checkoutUrl) {
                    window.location.href = depositRes.data.data.checkoutUrl;
                    return; // Stop execution to redirect securely
                } else {
                    message.warning('Không thể tạo link thanh toán, vui lòng thanh toán sau trong chi tiết đơn hàng.');
                    navigate('/customer/order');
                }
            } catch (err) {
                console.error("Lỗi tạo thanh toán cọc PayOS:", err);
                message.warning('Có lỗi xảy ra khi tạo thanh toán, vui lòng thanh toán cọc sau.');
                navigate('/customer/order');
            }

        } catch (error) {
            console.error(error);
            message.error('Ký hợp đồng thất bại: ' + (error.response?.data?.message || ''));
        } finally {
            setSigning(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <AppHeader />
                <Content className="sign-contract-loading">
                    <Spin size="large" />
                </Content>
                <AppFooter />
            </Layout>
        );
    }

    if (!contract) {
        return (
            <Layout>
                <AppHeader />
                <Content style={{ padding: '50px', textAlign: 'center' }}>
                    <Title level={3}>Không tìm thấy hợp đồng.</Title>
                    <Button onClick={() => navigate('/customer/order')}>Quay lại</Button>
                </Content>
                <AppFooter />
            </Layout>
        );
    }

    return (
        <Layout className="sign-contract-page">
            <AppHeader />
            <Content style={{ padding: '40px 20px', backgroundColor: '#f0f2f5' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            overflow: 'hidden'
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        {/* Header của Hợp Đồng */}
                        <div style={{
                            background: '#2D4F36',
                            padding: '30px 40px',
                            color: 'white',
                            borderBottom: '4px solid #e1b12c'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 700 }}>HỢP ĐỒNG VẬN CHUYỂN HOMS</Title>
                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', display: 'block', marginTop: 8 }}>
                                        Mã hợp đồng: <strong style={{ color: '#fff' }}>{contract.contractNumber}</strong>
                                    </Text>
                                </div>
                                <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#e1b12c' }} />
                            </div>
                        </div>

                        {/* Nội dung Hợp Đồng phong cách A4 */}
                        <div style={{ padding: '40px', backgroundColor: '#fff' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px', fontFamily: '"Times New Roman", Times, serif' }}>
                                <Text strong style={{ fontSize: '18px', display: 'block' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
                                <Text strong style={{ fontSize: '16px', display: 'block', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</Text>
                                <Title level={3} style={{ marginTop: '30px', marginBottom: '10px', fontFamily: '"Times New Roman", Times, serif', fontWeight: 'bold' }}>HỢP ĐỒNG CUNG CẤP DỊCH VỤ VẬN CHUYỂN</Title>
                                <Text style={{ fontStyle: 'italic', color: '#666' }}>Số: {contract.contractNumber} / HĐVC</Text>
                            </div>

                            <div
                                className="contract-content-a4"
                                style={{
                                    fontFamily: '"Times New Roman", Times, serif',
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    color: '#000',
                                    textAlign: 'justify',
                                    minHeight: '400px',
                                    padding: '20px 0',
                                    borderTop: '1px solid #eee',
                                    borderBottom: '1px solid #eee',
                                    marginBottom: '30px'
                                }}
                                dangerouslySetInnerHTML={{ __html: contract.content }}
                            />

                            {/* Phần ký kết pháp lý */}
                            {contract.status === 'DRAFT' || contract.status === 'SENT' ? (
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '30px',
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2D4F36', marginBottom: '16px' }}>
                                        <EditOutlined /> XÁC NHẬN VÀ KÝ KẾT ĐIỆN TỬ
                                    </Title>
                                    <Paragraph style={{ color: '#555', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                                        Bằng việc đánh dấu vào ô bên dưới và nhấn nút "CHẤP NHẬN & KÝ", Quý khách hàng xác nhận đã đọc, hiểu rõ và đồng ý với toàn bộ các điều khoản trong Hợp đồng này. Chữ ký điện tử của Quý khách có giá trị pháp lý tương đương với chữ ký tay trực tiếp theo quy định của pháp luật hiện hành về Luật Giao dịch điện tử.
                                    </Paragraph>

                                    <div style={{ marginBottom: 24, padding: '16px', background: '#fff', borderRadius: '6px', border: '1px solid #d9d9d9', borderLeft: '4px solid #1890ff' }}>
                                        <Checkbox
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            style={{ fontSize: '16px', fontWeight: 500 }}
                                        >
                                            Tôi cam kết tuân thủ các điều khoản và đồng ý ký Hợp đồng vận chuyển này.
                                        </Checkbox>
                                    </div>

                                    <div style={{ textAlign: 'center' }}>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<SafetyCertificateOutlined />}
                                            onClick={handleSignContract}
                                            loading={signing}
                                            disabled={!agreed}
                                            style={{
                                                background: agreed ? '#52c41a' : undefined,
                                                borderColor: agreed ? '#52c41a' : undefined,
                                                height: '50px',
                                                padding: '0 40px',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                borderRadius: '25px',
                                                boxShadow: agreed ? '0 4px 14px rgba(82, 196, 26, 0.4)' : 'none'
                                            }}
                                        >
                                            CHẤP NHẬN & KÝ HỢP ĐỒNG
                                        </Button>
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <InfoCircleOutlined style={{ marginRight: 4 }} /> Địa chỉ IP và thời gian thao tác của bạn sẽ được lưu lại nhằm mục đích chứng thực pháp lý.
                                        </Text>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '24px 40px',
                                        background: '#f6ffed',
                                        border: '1px solid #b7eb8f',
                                        borderRadius: '8px',
                                        marginBottom: 24
                                    }}>
                                        <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                                        <Title level={4} style={{ color: '#237804', margin: 0 }}>Hợp đồng đã được ký điện tử thành công</Title>
                                        <Text style={{ display: 'block', marginTop: '8px', color: '#555' }}>Toàn bộ điều khoản đã có hiệu lực pháp lý.</Text>
                                    </div>

                                    {(!invoice || invoice.paymentStatus === 'UNPAID') && (
                                        <div style={{ marginTop: '20px' }}>
                                            <Text strong style={{ display: 'block', marginBottom: '16px', fontSize: '16px' }}>
                                                Vui lòng thanh toán cọc 50% để chúng tôi có thể tiến hành sắp xếp nguồn lực phục vụ Quý khách.
                                            </Text>
                                            <Button
                                                type="primary"
                                                size="large"
                                                loading={paying}
                                                style={{
                                                    background: '#d9363e',
                                                    borderColor: '#d9363e',
                                                    height: '50px',
                                                    padding: '0 40px',
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    borderRadius: '25px',
                                                    boxShadow: '0 4px 14px rgba(217, 54, 62, 0.4)'
                                                }}
                                                onClick={async () => {
                                                    setPaying(true);
                                                    try {
                                                        const depositRes = await api.post(`/request-tickets/${ticketId}/deposit`);
                                                        if (depositRes.data?.success && depositRes.data?.data?.checkoutUrl) {
                                                            window.location.href = depositRes.data.data.checkoutUrl;
                                                        } else {
                                                            message.warning('Không thể tạo link thanh toán, vui lòng thử lại sau.');
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        message.error('Lỗi thanh toán: ' + (err.response?.data?.message || err.message));
                                                    } finally {
                                                        setPaying(false);
                                                    }
                                                }}
                                            >
                                                THANH TOÁN CỌC 50%
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <Divider />
                            <div style={{ textAlign: 'center' }}>
                                <Button type="default" onClick={() => navigate('/customer/order')}>
                                    Quay lại danh sách đơn hàng
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default SignContract;
