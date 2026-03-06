import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Row, Col } from 'antd';
import adminPriceService from '../../../../services/adminPriceService';

const { Option } = Select;

const PriceModal = ({ visible, onClose, onSuccess, priceList }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (priceList) {
                form.setFieldsValue({
                    vehicleType: priceList.vehicleType,
                    basePrice: priceList.basePrice,
                    pricePerKm: priceList.pricePerKm,
                    status: priceList.status || 'Active'
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, priceList, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (priceList) {
                await adminPriceService.updatePriceList(priceList._id, values);
                message.success('Price list updated successfully');
            } else {
                await adminPriceService.createPriceList(values);
                message.success('Price list created successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving price list:', error);
            message.error(error.response?.data?.message || 'Failed to save price list');
        }
    };

    return (
        <Modal
            title={priceList ? "Edit Price Mapping" : "Create New Price Mapping"}
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            okText={priceList ? "Save Changes" : "Create"}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item name="vehicleType" label="Vehicle Type" rules={[{ required: true }]}>
                    <Select placeholder="Select vehicle type">
                        <Option value="truck">Truck</Option>
                        <Option value="container truck">Container Truck</Option>
                        <Option value="van">Van</Option>
                        <Option value="motorbike">Motorbike</Option>
                    </Select>
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="basePrice" label="Base Price (VND)" rules={[{ required: true, type: 'number', min: 0 }]}>
                            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="pricePerKm" label="Price per Km (VND)" rules={[{ required: true, type: 'number', min: 0 }]}>
                            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                    <Select>
                        <Option value="Active">Active</Option>
                        <Option value="Inactive">Inactive</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PriceModal;
