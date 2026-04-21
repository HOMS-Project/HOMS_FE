import React from 'react';
import { Modal, Alert, Space, Typography, Card, Button, Tag } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const InsufficientResourcesModal = ({
    open,
    onClose,
    data,
    submitting,
    onRebuildTeam,
    onPickAlternativeTime,
    onForceProceed,
}) => {
    if (!data) return null;

    const sameTeam =
        !data.suggestedTeam.leaderId ||
        (data.valuesSnapshot &&
            data.suggestedTeam.leaderId === data.valuesSnapshot.leaderId &&
            (data.suggestedTeam.driverIds || []).length === (data.valuesSnapshot.driverIds || []).length &&
            (data.suggestedTeam.staffIds || []).length === (data.valuesSnapshot.staffIds || []).length);

    return (
        <Modal
            title="⚠️ Phát hiện thiếu hụt nhân sự"
            open={open}
            onCancel={onClose}
            footer={null}
            width={650}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                    type="warning"
                    showIcon
                    message="Không đủ nhân sự rảnh rỗi vào khung giờ đã chọn!"
                    description={
                        <div style={{ marginTop: 8 }}>
                            <Text style={{ display: 'block', marginBottom: 8 }}>So sánh yêu cầu phân công và số lượng rảnh rỗi thực tế:</Text>
                            <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid #ffe58f' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Vai trò</Text>
                                    <div style={{ width: 140, display: 'flex', justifyContent: 'space-between' }}>
                                        <Text type="secondary" style={{ fontSize: 13 }}>Yêu cầu</Text>
                                        <Text type="secondary" style={{ fontSize: 13 }}>Hiện có</Text>
                                    </div>
                                </div>
                                {/* Leader */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 6, paddingBottom: 4 }}>
                                    <Text style={{ fontSize: 13 }}>Trưởng nhóm (Tài xế chính)</Text>
                                    <div style={{ width: 140, display: 'flex', justifyContent: 'space-between' }}>
                                        <Text strong>{data.shortages.required.leader}</Text>
                                        <Text strong type={data.shortages.available.leader < data.shortages.required.leader ? 'danger' : 'success'}>{data.shortages.available.leader}</Text>
                                    </div>
                                </div>
                                {/* Drivers */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 6, paddingBottom: 4 }}>
                                    <Text style={{ fontSize: 13 }}>Tài xế phụ</Text>
                                    <div style={{ width: 140, display: 'flex', justifyContent: 'space-between' }}>
                                        <Text strong>{data.shortages.required.drivers}</Text>
                                        <Text strong type={data.shortages.available.drivers < data.shortages.required.drivers ? 'danger' : 'success'}>{data.shortages.available.drivers}</Text>
                                    </div>
                                </div>
                                {/* Helpers */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 6 }}>
                                    <Text style={{ fontSize: 13 }}>Nhân viên phụ bốc xếp</Text>
                                    <div style={{ width: 140, display: 'flex', justifyContent: 'space-between' }}>
                                        <Text strong>{data.shortages.required.helpers}</Text>
                                        <Text strong type={data.shortages.available.helpers < data.shortages.required.helpers ? 'danger' : 'success'}>{data.shortages.available.helpers}</Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                />

                <div style={{ marginTop: 16 }}>
                    <Text strong>Các phương án xử lý:</Text>

                    {/* Option 1: Rebuild team */}
                    <Card size="small" style={{ marginTop: 8, borderColor: '#1890ff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>1. Tái cấu trúc theo thực tế (Hệ thống gợi ý)</Text>
                                {sameTeam ? (
                                    <div style={{ color: '#cf1322', fontSize: 13, marginTop: 4 }}>
                                        Hiện tại không có nhân sự trống lịch nào khác ngoài đội hình bạn đã chọn. Không thể áp dụng đội hình mới.
                                        <br />Vui lòng dời ngày hoặc tiếp tục phân công với tình trạng thiếu hụt.
                                    </div>
                                ) : (
                                    <div style={{ color: '#595959', fontSize: 13, marginTop: 4 }}>
                                        Sử dụng đội hình có sẵn tại thời điểm này: <br />
                                        • Trưởng nhóm: 1 <br />
                                        • Tài xế phụ: {data.suggestedTeam.driverIds?.length || 0} <br />
                                        • Nhân viên hậu cần: {data.suggestedTeam.staffIds?.length || 0} <br />
                                        Hệ thống sẽ cập nhật lại Form để bạn xem lại và nhấn xác nhận.
                                    </div>
                                )}
                            </div>
                            <Button type="primary" onClick={onRebuildTeam} disabled={sameTeam}>
                                Áp dụng Đội hình này
                            </Button>
                        </div>
                    </Card>

                    {/* Option 2: Pick alternative time */}
                    <Card size="small" style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>2. Dời thời gian vận chuyển</Text>
                                <div style={{ color: '#595959', fontSize: 13, marginTop: 4 }}>
                                    Hệ thống quét được các khung giờ sau sẽ đủ đội hình như bạn mong muốn (Nhấn chọn): <br />
                                    {data.nextAvailableSlots.length > 0 ? (
                                        <Space style={{ marginTop: 8, flexWrap: 'wrap' }}>
                                            {data.nextAvailableSlots.map((s, i) => (
                                                <Tag
                                                    color="geekblue"
                                                    key={i}
                                                    style={{ cursor: 'pointer', padding: '4px 8px', fontSize: 13, margin: '4px 0' }}
                                                    onClick={typeof s === 'string' ? () => onPickAlternativeTime(s) : undefined}
                                                >
                                                    {dayjs(s).format('HH:mm DD/MM')}
                                                </Tag>
                                            ))}
                                        </Space>
                                    ) : (
                                        <Text type="danger">Không tìm thấy khung giờ phù hợp trong ngày.</Text>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Option 3: Force proceed */}
                    {data.canForce && (
                        <Card size="small" style={{ marginTop: 8, background: '#fff1f0', borderColor: '#ffa39e' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text strong type="danger">3. Buộc thực hiện (Thiếu người)</Text>
                                    <div style={{ color: '#595959', fontSize: 13, marginTop: 4 }}>
                                        Lệnh điều phối sẽ tiếp tục với số người thực tế có sẵn. <br />
                                        <Text type="danger" style={{ fontSize: 12 }}>* Khách hàng sẽ nhận được thông báo thiếu hụt nhân sự.</Text>
                                    </div>
                                </div>
                                <Button danger onClick={onForceProceed} loading={submitting}>
                                    Vẫn tiến hành
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </Space>
        </Modal>
    );
};

export default InsufficientResourcesModal;
