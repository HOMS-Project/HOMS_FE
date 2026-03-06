import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Tag, message, Modal, Select, Form, Space } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const ResourceAllocation = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Form and Resource Data
    const [form] = Form.useForm();
    const [drivers, setDrivers] = useState([]);
    const [staff, setStaff] = useState([]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            // Fetch CONFIRMED invoices ready for dispatching
            const response = await api.get('/invoices?status=CONFIRMED');
            if (response.data && response.data.success) {
                setInvoices(response.data.data);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách hóa đơn: ' + (error.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const fetchResources = async () => {
        try {
            const [driverRes, staffRes] = await Promise.all([
                api.get('/customer/drivers'),
                api.get('/customer/staff')
            ]);
            
            if (driverRes.data?.success) setDrivers(driverRes.data.data);
            if (staffRes.data?.success) setStaff(staffRes.data.data);
            
        } catch (error) {
            message.error('Lỗi khi tải danh sách nhân sự.');
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchResources();
    }, []);

    const showDispatchModal = (invoice) => {
        setSelectedInvoice(invoice);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedInvoice(null);
    };

    const handleSubmit = async (values) => {
        if (!selectedInvoice) return;
        
        setSubmitting(true);
        try {
            // Xe (Vehicle) sẽ được tự động tính toán và điều phối trong backend dựa trên trọng lượng/thể tích
            const payload = {
                driverIds: values.driverIds,
                staffIds: values.staffIds,
                totalWeight: selectedInvoice.requestTicketId?.surveyDataId?.totalWeight || 1000, // Fallback nếu chưa có survey chi tiết
                totalVolume: selectedInvoice.requestTicketId?.surveyDataId?.totalVolume || 10,
                estimatedDuration: 480 // Mặc định 8 tiếng
            };
            
            await api.post(`/invoices/${selectedInvoice._id}/dispatch`, payload);
            message.success('Đã điều phối xe và nhân sự thành công!');
            
            setIsModalVisible(false);
            fetchInvoices(); // Refresh list
        } catch (error) {
            message.error('Lỗi khi điều phối: ' + (error.response?.data?.message || ''));
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { 
            title: 'Mã Hóa Đơn', 
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Text strong>{text}</Text>
        },
        { 
            title: 'Mã Yêu Cầu', 
            dataIndex: ['requestTicketId', 'code'],
            key: 'ticketCode'
        },
        { 
            title: 'Khách hàng', 
            dataIndex: ['customerId', 'fullName'],
            key: 'customerName'
        },
        { 
            title: 'Địa chỉ lấy', 
            dataIndex: ['pickup', 'address'],
            key: 'pickup',
            ellipsis: true
        },
        { 
            title: 'Địa chỉ giao', 
            dataIndex: ['delivery', 'address'],
            key: 'delivery',
            ellipsis: true
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => <Tag color="blue">{status}</Tag> 
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    style={{ background: '#52c41a' }} 
                    icon={<CarOutlined />}
                    onClick={() => showDispatchModal(record)}
                >
                    Điều xe & Nhân sự
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
            <Title level={4}>Điều phối Xe & Đội ngũ bốc xếp</Title>
            <Table 
                columns={columns} 
                dataSource={invoices} 
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={`Điều phối hệ thống tự động cho đơn: ${selectedInvoice?.code}`}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <div style={{ marginBottom: 20 }}>
                    <Text type="secondary">
                        Hệ thống sẽ tự động tự động tìm kiếm và phân công xe tải phù hợp dựa trên khối lượng và thể tích đồ đạc của đơn hàng. Bạn chỉ cần chọn Tài xế và Phụ xe.
                    </Text>
                </div>

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item 
                        name="driverIds" 
                        label="Chọn Tài xế" 
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 tài xế' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn tên tài xế"
                            style={{ width: '100%' }}
                            allowClear
                        >
                            {drivers.map(d => (
                                <Option key={d._id} value={d._id}>{d.fullName} - {d.phone}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item 
                        name="staffIds" 
                        label="Chọn Nhân viên bốc xếp (Tùy chọn)"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn tên nhân viên bốc xếp"
                            style={{ width: '100%' }}
                            allowClear
                        >
                            {staff.map(s => (
                                <Option key={s._id} value={s._id}>{s.fullName} - {s.phone}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginTop: 30, marginBottom: 0 }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                Xác nhận điều phối
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ResourceAllocation;