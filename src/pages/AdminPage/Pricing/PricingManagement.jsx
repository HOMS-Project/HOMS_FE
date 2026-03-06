import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Typography, Tooltip, notification, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, DollarCircleOutlined } from '@ant-design/icons';
import adminPriceService from '../../../services/adminPriceService';
import PriceModal from './components/PriceModal';

const { Title } = Typography;

const PricingManagement = () => {
    const [loading, setLoading] = useState(false);
    const [priceLists, setPriceLists] = useState([]);

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);

    const fetchPriceLists = async () => {
        try {
            setLoading(true);
            const response = await adminPriceService.getAllPriceLists();
            const data = response.data?.priceLists || response.data || [];

            // Mock data fallback if DB returns empty (for UI validation)
            if (data.length === 0) {
                const mData = [
                    { _id: '1', vehicleType: 'truck', basePrice: 500000, pricePerKm: 15000, status: 'Active' },
                    { _id: '2', vehicleType: 'container truck', basePrice: 2000000, pricePerKm: 30000, status: 'Active' },
                ];
                setPriceLists(mData);
                return;
            }

            setPriceLists(data);
        } catch (error) {
            console.error('Failed to fetch price lists', error);
            notification.error({ message: 'Error fetching price lists.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPriceLists();
    }, []);

    const handleDelete = async (id) => {
        try {
            await adminPriceService.deletePriceList(id);
            notification.success({ message: 'Price list deleted successfully' });
            fetchPriceLists();
        } catch (error) {
            console.error('Failed to delete', error);
            notification.error({ message: 'Error deleting price list' });
        }
    };

    const openCreateModal = () => {
        setEditingPrice(null);
        setIsModalVisible(true);
    };

    const openEditModal = (record) => {
        setEditingPrice(record);
        setIsModalVisible(true);
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const columns = [
        {
            title: 'Vehicle Type',
            dataIndex: 'vehicleType',
            key: 'vehicleType',
            render: (text) => <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{text}</span>
        },
        {
            title: 'Base Price',
            dataIndex: 'basePrice',
            key: 'basePrice',
            render: (val) => (
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                    <DollarCircleOutlined style={{ marginRight: 4 }} />
                    {formatCurrency(val)}
                </span>
            )
        },
        {
            title: 'Price per Km',
            dataIndex: 'pricePerKm',
            key: 'pricePerKm',
            render: (val) => formatCurrency(val)
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' ? 'success' : 'error'}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Edit Pricing">
                        <Button type="text" icon={<EditOutlined />} style={{ color: '#1890ff' }} onClick={() => openEditModal(record)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Are you sure?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Pricing & Compensation</Title>
            </div>

            <Card style={{ borderRadius: '12px', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ borderRadius: '8px' }}>
                        Add Price List
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={priceLists}
                    rowKey="_id"
                    pagination={false}
                    loading={loading}
                />
            </Card>

            <PriceModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                priceList={editingPrice}
                onSuccess={fetchPriceLists}
            />
        </div>
    );
};

export default PricingManagement;
