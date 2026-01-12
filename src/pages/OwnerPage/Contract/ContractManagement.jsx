// file: src/pages/OwnerPage/ContractManagement/ContractManagement.jsx

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin, Card, Alert } from 'antd';
import { getOwnerContractTemplate, createOrUpdateContractTemplate } from '../../../services/boardingHouseAPI';
import useUser from '../../../contexts/UserContext';
import SignatureGenerator from './SignatureGenerator';
import './ContractManagement.css';

const { TextArea } = Input;

const ContractManagement = () => {
    const { user } = useUser();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [existingSignature, setExistingSignature] = useState(null);
    const [generatedSignature, setGeneratedSignature] = useState(null); // ✅ State để lưu chữ ký mới

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const template = await getOwnerContractTemplate();
                form.setFieldsValue({ title: template.title, content: template.content });
                if (template.signatureImage) {
                    setExistingSignature(`http://localhost:5000${template.signatureImage}`);
                }
            } catch (error) {
                console.log("Chưa có mẫu hợp đồng.");
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, [form]);

    const handleSaveTemplate = async (values) => {
        const payload = {
            title: values.title,
            content: values.content,
            signatureDataUrl: generatedSignature
        };

        try {
            // ✅ API service cần được cập nhật để gửi JSON thay vì FormData
            await createOrUpdateContractTemplate(payload);
            message.success('Đã lưu mẫu hợp đồng thành công!');
        } catch (error) {
            message.error('Lỗi khi lưu mẫu hợp đồng.');
        }
    };

    if (loading) {
        return <Spin tip="Đang tải..." size="large" style={{ display: 'block', marginTop: '50px' }} />;
    }

    return (
        <div className="contract-management-container">
            <Card title="Quản lý Mẫu Hợp đồng Thuê nhà">
                <Alert
                    message="Hướng dẫn sử dụng Biến Placeholder"
                    description={
                        <div>
                            <p>Sử dụng các biến dưới đây trong nội dung hợp đồng. Hệ thống sẽ tự động thay thế bằng thông tin thực tế khi khách thuê xem.</p>
                            <code>{'{{tenantName}}'}</code>, <code>{'{{tenantEmail}}'}</code>, <code>{'{{roomNumber}}'}</code>, <code>{'{{roomPrice}}'}</code>, <code>{'{{roomArea}}'}</code>, <code>{'{{houseAddress}}'}</code>, <code>{'{{ownerName}}'}</code>, <code>{'{{currentDate}}'}</code>
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Form form={form} layout="vertical" onFinish={handleSaveTemplate}>
                    <Form.Item
                        name="title"
                        label="Tiêu đề Hợp đồng"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                        initialValue="Hợp Đồng Thuê Phòng Trọ"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Nội dung Hợp đồng"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <TextArea rows={20} placeholder="Soạn thảo nội dung hợp đồng của bạn ở đây..." />
                    </Form.Item>

                    {/* ✅ Phần hiển thị và tạo chữ ký mới */}
                    <Form.Item label="Chữ ký Điện tử">
                        <p>Đây là chữ ký sẽ được tự động tạo dựa trên tên của bạn.</p>
                        {user?.name && (
                            <SignatureGenerator
                                name={user.name}
                                onSignatureGenerated={setGeneratedSignature}
                            />
                        )}
                        {existingSignature && !generatedSignature && (
                            <div style={{ marginTop: 12 }}>
                                <p>Chữ ký hiện tại:</p>
                                <img src={existingSignature} alt="Chữ ký" style={{ maxHeight: '80px', border: '1px solid #d9d9d9', padding: '4px' }} />
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">Lưu Mẫu Hợp đồng</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ContractManagement;