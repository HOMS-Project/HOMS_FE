import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Input, Select, Row, Col, Avatar, notification } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import adminUserService from '../../../services/adminUserService';

const { Title, Text } = Typography;
const { Option } = Select;

const PRIMARY_GREEN = '#cad5c1';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Fetch user data via API, since adminUserService.getAllUsers exists we can try to fetch them all 
        // and filter by ID or ideally the backend has a /users/:id GET endpoint.
        const fetchUser = async () => {
            try {
                setLoading(true);
                // Assume backend structure handles retrieving a single user or we find them in general fetch
                const response = await adminUserService.getAllUsers({ search: '' });
                const data = response.data?.users || response.data || [];
                const foundUser = data.find(u => u._id === id);

                if (foundUser) {
                    setUser(foundUser);
                } else {
                    // Placeholder mock data if specifically testing layout
                    setUser({
                        _id: id,
                        fullName: 'Nguyễn Văn A',
                        email: 'Avanhnguyen@gmail.com',
                        role: 'Delivery Staff',
                        gender: 'Male',
                        phoneNumber: '123456789',
                        country: 'Vietnam',
                        timeZone: 'GMT+7'
                    });
                }
            } catch (error) {
                console.error("Failed to load user profile", error);
                notification.error({ message: 'Error loading profile' });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (!user && loading) return <div style={{ padding: 24 }}>Loading...</div>;
    if (!user) return <div style={{ padding: 24 }}>User not found.</div>;

    return (
        <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Text type="secondary" style={{ fontSize: 16 }}>{user.role} profile</Text>
                <Title level={3} style={{ margin: 0 }}>{user.role === 'staff' ? 'Delivery Staff' : user.role === 'customer' ? 'Customer Profile' : user.role}</Title>
            </div>

            <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {/* Header Profile Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
                    <Avatar size={80} icon={<UserOutlined />} src={user.avatar} style={{ backgroundColor: PRIMARY_GREEN }} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>{user.fullName || 'No Name'}</Title>
                        <Text type="secondary">{user.email || 'No Email'}</Text>
                    </div>
                </div>

                {/* Form Data Display */}
                <Row gutter={[32, 24]}>
                    <Col span={12}>
                        <div style={{ marginBottom: 8 }}><Text strong>Full Name</Text></div>
                        <Input value={user.fullName} readOnly style={{ backgroundColor: '#f9f9f9', border: 'none', borderRadius: '8px' }} size="large" />
                    </Col>
                    <Col span={12}>
                        <div style={{ marginBottom: 8 }}><Text strong>Nick Name</Text></div>
                        <Input placeholder="Your Nick Name" readOnly style={{ backgroundColor: '#f9f9f9', border: 'none', borderRadius: '8px' }} size="large" />
                    </Col>

                    <Col span={12}>
                        <div style={{ marginBottom: 8 }}><Text strong>Gender</Text></div>
                        <Select value={user.gender || 'Select'} style={{ width: '100%' }} size="large" disabled>
                            <Option value="Male">Male</Option>
                            <Option value="Female">Female</Option>
                        </Select>
                    </Col>
                    <Col span={12}>
                        <div style={{ marginBottom: 8 }}><Text strong>Country</Text></div>
                        <Input placeholder="Vietnam" value={user.country || 'Vietnam'} readOnly style={{ backgroundColor: '#f9f9f9', border: 'none', borderRadius: '8px' }} size="large" />
                    </Col>

                    <Col span={12}>
                        <div style={{ marginBottom: 8 }}><Text strong>Phone Number</Text></div>
                        <Input value={user.phoneNumber || ''} readOnly style={{ backgroundColor: '#f9f9f9', border: 'none', borderRadius: '8px' }} size="large" />
                    </Col>
                    <Col span={12}>
                        <div style={{ marginBottom: 8 }}><Text strong>Time Zone</Text></div>
                        <Input placeholder="GMT+7" value={user.timeZone || 'GMT+7'} readOnly style={{ backgroundColor: '#f9f9f9', border: 'none', borderRadius: '8px' }} size="large" />
                    </Col>
                </Row>

                <div style={{ marginTop: '40px' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        size="large"
                        style={{ backgroundColor: PRIMARY_GREEN, color: '#333', border: 'none', borderRadius: '24px', fontWeight: 'bold', padding: '0 32px' }}
                        onClick={() => navigate('/admin/users')}
                    >
                        Back
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default UserProfile;
