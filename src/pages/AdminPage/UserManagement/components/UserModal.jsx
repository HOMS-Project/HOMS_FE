import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import adminUserService from '../../../../services/adminUserService';

const { Option } = Select;

const UserModal = ({ visible, onClose, onSuccess, user }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (user) {
                form.setFieldsValue({
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    gender: user.gender,
                    role: user.role,
                    status: user.status
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, user, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (user) {
                // Edit existing user
                await adminUserService.updateUser(user._id, values);
                message.success('User updated successfully');
            } else {
                // Create new user
                await adminUserService.createUser(values);
                message.success('User created successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving user:', error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Failed to save user. Please check your inputs.');
            }
        }
    };

    const [confirmVisible, setConfirmVisible] = React.useState(false);

    const handleConfirmSubmit = () => {
        setConfirmVisible(false);
        handleSubmit();
    };

    const attemptSubmit = async () => {
        try {
            await form.validateFields();
            setConfirmVisible(true);
        } catch (error) {
            // Validation failed, do nothing, form shows errors natively
        }
    };

    return (
        <>
            <Modal
                title={user ? "Edit User" : "Create New Staff Account"}
                open={visible}
                onCancel={onClose}
                onOk={attemptSubmit}
                okText={user ? "Save Changes" : "Create"}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: 'Please enter full name' }]}>
                        <Input placeholder="Enter full name" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                        <Input placeholder="Enter email" disabled={!!user} />
                    </Form.Item>
                    {!user && (
                        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter password' }]}>
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    )}
                    <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true, message: 'Please enter phone number' }]}>
                        <Input placeholder="Enter phone number" />
                    </Form.Item>
                    <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                        <Select placeholder="Select gender">
                            <Option value="Male">Male</Option>
                            <Option value="Female">Female</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                        <Select placeholder="Select role" disabled={!!user && user.role === 'admin'}>
                            <Option value="customer">Customer</Option>
                            <Option value="dispatcher">Dispatcher</Option>
                            <Option value="driver">Driver</Option>
                            <Option value="staff">Staff</Option>
                        </Select>
                    </Form.Item>
                    {user && (
                        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                            <Select placeholder="Select status">
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            <Modal
                title={null}
                open={confirmVisible}
                onCancel={() => setConfirmVisible(false)}
                footer={null}
                closable={false}
                centered
                bodyStyle={{ textAlign: 'center', padding: '30px 20px', backgroundColor: '#cad5c1', borderRadius: '16px' }}
                width={300}
            >
                <h3 style={{ color: 'white', marginBottom: '30px', fontWeight: 'bold' }}>
                    Xác nhận "{user ? 'lưu' : 'tạo'}"<br />người dùng ?
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <Button
                        onClick={handleConfirmSubmit}
                        style={{ borderRadius: '20px', padding: '0 24px', fontWeight: 'bold' }}
                    >
                        Xác nhận
                    </Button>
                    <Button
                        onClick={() => setConfirmVisible(false)}
                        style={{ borderRadius: '20px', padding: '0 24px', fontWeight: 'bold' }}
                    >
                        Hủy
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default UserModal;
