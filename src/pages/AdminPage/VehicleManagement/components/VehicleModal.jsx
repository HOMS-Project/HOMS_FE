import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, message, Space, Divider, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import adminRouteService from '../../../../services/adminRouteService';

const { Option } = Select;

const VehicleModal = ({ visible, onClose, onSuccess, route }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (route) {
                form.setFieldsValue({
                    startPoint: route.startPoint,
                    endPoint: route.endPoint,
                    distance: route.distance,
                    estimatedTime: route.estimatedTime,
                    trafficRules: route.trafficRules || []
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, route, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (route) {
                // Edit existing route
                await adminRouteService.updateRoute(route._id, values);
                message.success('Route updated successfully');
            } else {
                // Create new route
                await adminRouteService.createRoute(values);
                message.success('Route created successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving route:', error);
            message.error(error.response?.data?.message || 'Failed to save route. Please check your inputs.');
        }
    };

    return (
        <Modal
            title={route ? "Edit Route" : "Create New Route"}
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            okText={route ? "Save Changes" : "Create"}
            width={800}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item name="startPoint" label="Start Point" rules={[{ required: true }]}>
                        <Input placeholder="E.g., Hanoi City Center" />
                    </Form.Item>
                    <Form.Item name="endPoint" label="End Point" rules={[{ required: true }]}>
                        <Input placeholder="E.g., Hai Phong Port" />
                    </Form.Item>
                    <Form.Item name="distance" label="Distance (km)" rules={[{ required: true, type: 'number', min: 0 }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="estimatedTime" label="Estimated Time (hours)" rules={[{ required: true, type: 'number', min: 0 }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Divider orientation="left">Traffic Rules and Restrictions</Divider>

                <Form.List name="trafficRules">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'ruleType']}
                                        rules={[{ required: true, message: 'Missing rule type' }]}
                                    >
                                        <Select placeholder="Rule Type" style={{ width: 150 }}>
                                            <Option value="WeightLimit">Weight Limit</Option>
                                            <Option value="TimeRestriction">Time Restriction</Option>
                                            <Option value="VehicleTypeBan">Vehicle Type Ban</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'description']}
                                        rules={[{ required: true, message: 'Missing description' }]}
                                    >
                                        <Input placeholder="Description e.g., No trucks > 5T" style={{ width: 300 }} />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'value']}
                                    >
                                        <Input placeholder="Value (Optional)" style={{ width: 150 }} />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Traffic Rule
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

            </Form>
        </Modal>
    );
};

export default VehicleModal;
