import React, { useState } from 'react';
import { Modal, Alert, Space, Typography, Card, Button, Tag, Progress, Divider, Checkbox, Row, Col, Table, Tooltip } from 'antd';
import {
    CalendarOutlined,
    InfoCircleOutlined,
    WarningOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    CarOutlined,
    SafetyCertificateOutlined,
    RocketOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const InsufficientResourcesModal = ({
    open,
    onClose,
    data,
    submitting,
    onRebuildTeam,
    onPickAlternativeTime,
    onForceProceed,
    onExternalStaff,
}) => {
    const [understoodRisk, setUnderstoodRisk] = useState(false);

    if (!data) return null;

    const feasibility = data.feasibility || {};
    const decision = feasibility.decision || 'CONFIRM';
    const staffingRatio = feasibility.staffingRatio || 0;
    const staffingLevel = feasibility.staffingLevel || 'SAFE';
    const hasConflict = feasibility.hasConflict || false;
    const impactLevel = feasibility.impactLevel || 'LOW';
    const shortages = data.shortages || {};

    // ==============================================
    // CORE RULE: Is the dispatch missing an authorized driver?
    // ==============================================
    const isMissingDriver = (shortages.missing?.leader > 0) || (shortages.missing?.drivers > 0);

    const getStaffingColor = (level) => {
        if (level === 'SAFE') return '#52c41a';
        if (level === 'WARNING') return '#faad14';
        return '#f5222d';
    };

    const getImpactColor = (level) => {
        if (level === 'HIGH') return '#f5222d';
        if (level === 'LOW') return '#faad14';
        return '#52c41a';
    };

    const sameTeam =
        !data.suggestedTeam?.leaderId ||
        (data.valuesSnapshot &&
            data.suggestedTeam.leaderId === data.valuesSnapshot.leaderId &&
            (data.suggestedTeam.driverIds || []).length === (data.valuesSnapshot.driverIds || []).length &&
            (data.suggestedTeam.staffIds || []).length === (data.valuesSnapshot.staffIds || []).length);

    const resourceColumns = [
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Yêu cầu',
            dataIndex: 'required',
            key: 'required',
            align: 'center',
            render: (val) => <Tag color="blue">{val}</Tag>
        },
        {
            title: 'Hiện có',
            dataIndex: 'available',
            key: 'available',
            align: 'center',
            render: (val, record) => (
                <Tag color={val < record.required ? 'red' : 'green'}>{val}</Tag>
            )
        },
        {
            title: 'Thiếu hụt',
            dataIndex: 'missing',
            key: 'missing',
            align: 'center',
            render: (val) => val > 0 ? <Text type="danger" strong>-{val}</Text> : <CheckCircleOutlined style={{ color: '#52c41a' }} />
        }
    ];

    const resourceData = [
        { role: 'Đội trưởng', required: shortages.required?.leader || 0, available: shortages.available?.leader || 0, missing: shortages.missing?.leader || 0 },
        { role: 'Tài xế', required: shortages.required?.drivers || 0, available: shortages.available?.drivers || 0, missing: shortages.missing?.drivers || 0 },
        { role: 'Bốc hàng', required: shortages.required?.helpers || 0, available: shortages.available?.helpers || 0, missing: shortages.missing?.helpers || 0 },
    ];

    const renderHeader = () => {
        if (isMissingDriver) {
            return (
                <Alert
                    type="error"
                    showIcon
                    icon={<CarOutlined />}
                    message={<Text strong style={{ fontSize: 16 }}>THIẾU TÀI XẾ CHO PHƯƠNG TIỆN</Text>}
                    description="Mỗi phương tiện yêu cầu bắt buộc phải có ít nhất 1 Tài xế/Đội trưởng. Hiện tại không có đủ nhân sự lái xe cho số lượng xe được yêu cầu."
                    style={{ borderRadius: 8, borderLeftWidth: 4 }}
                />
            );
        }
        if (decision === 'BLOCK') {
            return (
                <Alert
                    type="error"
                    showIcon
                    icon={<CloseCircleOutlined />}
                    message={<Text strong style={{ fontSize: 16 }}>ĐIỀU PHỐI BỊ CHẶN</Text>}
                    description="Kế hoạch này vi phạm các tiêu chuẩn an toàn hoặc giới hạn thời gian vận chuyển tối đa. Hệ thống không cho phép thực hiện điều phối này."
                    style={{ borderRadius: 8, borderLeftWidth: 4 }}
                />
            );
        }
        if (decision === 'REQUIRE_CUSTOMER') {
            return (
                <Alert
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    message={<Text strong style={{ fontSize: 16 }}>CẦN KHÁCH HÀNG PHÊ DUYỆT</Text>}
                    description="Tỉ lệ nhân sự quá thấp (< 50%). Bạn chỉ có thể gửi đề xuất để khách hàng xác nhận hoặc dời lịch."
                    style={{ borderRadius: 8, borderLeftWidth: 4 }}
                />
            );
        }
        return (
            <Alert
                type="warning"
                showIcon
                message={<Text strong style={{ fontSize: 16 }}>ĐÁNH GIÁ RỦI RO LỊCH TRÌNH</Text>}
                description="Hệ thống phát hiện một số hạn chế về nhân sự hoặc xung đột thời gian có thể ảnh hưởng đến đơn hàng này hoặc các đơn tiếp theo."
                style={{ borderRadius: 8, borderLeftWidth: 4 }}
            />
        );
    };

    return (
        <Modal
            title={
                <Space>
                    <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
                    <span>Hệ Thống Phân Tích Tính Khả Thi Điều Phối</span>
                </Space>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={720}
            centered
            className="feasibility-modal"
        >
            <style>
                {`
                .feasibility-modal .ant-modal-content {
                    border-radius: 12px;
                    overflow: hidden;
                }
                .option-card {
                    transition: all 0.3s ease;
                    border-left-width: 4px !important;
                }
                .option-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .time-slot-tag {
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }
                .time-slot-tag:hover {
                    border-color: #44624a;
                    background: #eef2ef !important;
                    color: #44624a !important;
                }
                .dashboard-item {
                    text-align: center;
                    padding: 12px;
                    border-radius: 8px;
                    background: #fff;
                    box-shadow: inset 0 0 0 1px #f0f0f0;
                }
                `}
            </style>

            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {renderHeader()}

                {/* Scorecard Layer */}
                <Card size="small" style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <div className="dashboard-item">
                                <Text type="secondary" size="small" style={{ display: 'block', marginBottom: 4 }}>Nhân sự đáp ứng</Text>
                                <Title level={3} style={{ margin: 0, color: getStaffingColor(staffingLevel) }}>
                                    {Math.round(staffingRatio * 100)}%
                                </Title>
                                <Progress
                                    percent={Math.round(staffingRatio * 100)}
                                    strokeColor={getStaffingColor(staffingLevel)}
                                    showInfo={false}
                                    size="small"
                                />
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="dashboard-item">
                                <Text type="secondary" size="small" style={{ display: 'block', marginBottom: 4 }}>Thời gian dự kiến</Text>
                                <Title level={3} style={{ margin: 0 }}>
                                    {(feasibility.estimatedDuration / 60).toFixed(1)}h
                                </Title>
                                <Tag icon={<ClockCircleOutlined />} color={feasibility.durationExceeded ? 'red' : 'blue'}>
                                    {feasibility.durationExceeded ? 'VƯỢT GIỚI HẠN' : 'TRONG TẦM KIỂM SOÁT'}
                                </Tag>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="dashboard-item">
                                <Text type="secondary" size="small" style={{ display: 'block', marginBottom: 4 }}>Xung đột Domino</Text>
                                <div style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {hasConflict ? (
                                        <Tooltip title={`Ảnh hưởng đơn tiếp theo khoảng ${Math.round(feasibility.maxDelayMinutes)} phút`}>
                                            <Tag color={getImpactColor(impactLevel)} icon={<WarningOutlined />} style={{ margin: 0 }}>
                                                CÓ XUNG ĐỘT ({impactLevel})
                                            </Tag>
                                        </Tooltip>
                                    ) : (
                                        <Tag color="green" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>AN TOÀN</Tag>
                                    )}
                                </div>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    {hasConflict ? `Dự kiến trễ: ${Math.round(feasibility.maxDelayMinutes)}p` : 'Không ảnh hưởng đơn khác'}
                                </Text>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Resource Details Table */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <TeamOutlined style={{ color: '#1890ff' }} />
                        <Text strong>Chi tiết khoảng cách nhân sự thực tế:</Text>
                    </div>
                    <Table
                        dataSource={resourceData}
                        columns={resourceColumns}
                        pagination={false}
                        size="small"
                        bordered
                        style={{ borderRadius: 8, overflow: 'hidden' }}
                    />
                </div>

                <Divider style={{ margin: '8px 0' }}>CÁC PHƯƠNG ÁN XỬ LÝ GỢI Ý</Divider>

                <div className="options-container">
                    {/* Option 1: Rebuild team */}
                    <Card size="small" className="option-card" style={{ borderLeftColor: '#1890ff', marginBottom: 12 }}>
                        <Row align="middle" gutter={16}>
                            <Col flex="auto">
                                <Space align="start">
                                    <RocketOutlined style={{ color: '#1890ff', fontSize: 18, marginTop: 4 }} />
                                    <div>
                                        <Text strong>Tái cấu trúc đội hình tối ưu</Text>
                                        <div style={{ color: '#64748b', fontSize: 13 }}>
                                            {sameTeam ? 'Hệ thống không tìm thấy đội hình nào rảnh hơn vào giờ này.' : 'Tự động hoán đổi sang những nhân sự đang rảnh rỗi và gần điểm pickup nhất.'}
                                        </div>
                                    </div>
                                </Space>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    ghost
                                    onClick={onRebuildTeam}
                                    disabled={sameTeam}
                                    icon={<CheckCircleOutlined />}
                                >
                                    Áp dụng
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Option 2: Alternative Time Slots */}
                    <Card size="small" className="option-card" style={{ borderLeftColor: '#44624a', marginBottom: 12 }}>
                        <div style={{ marginBottom: 8 }}>
                            <Space>
                                <CalendarOutlined style={{ color: '#44624a', fontSize: 18 }} />
                                <Text strong>Đổi sang khung giờ có đủ nhân sự</Text>
                            </Space>
                        </div>
                        {data.nextAvailableSlots?.length > 0 ? (
                            <Space wrap size={[8, 8]} style={{ paddingLeft: 26 }}>
                                {data.nextAvailableSlots.map((s, i) => (
                                    <Tag
                                        key={i}
                                        color="#f0fdf4"
                                        className="time-slot-tag"
                                        style={{
                                            cursor: 'pointer',
                                            padding: '6px 12px',
                                            borderRadius: 6,
                                            color: '#166534',
                                            border: '1px solid #bcf0da'
                                        }}
                                        onClick={() => onPickAlternativeTime(s)}
                                    >
                                        <ClockCircleOutlined style={{ marginRight: 6 }} />
                                        {dayjs(s).format('HH:mm [Ngày] DD/MM')}
                                    </Tag>
                                ))}
                            </Space>
                        ) : (
                            <div style={{ paddingLeft: 26 }}>
                                <Text type="secondary" italic style={{ fontSize: 13 }}>Không tìm thấy khung giờ trống khả thi trong 48h tới.</Text>
                            </div>
                        )}
                    </Card>

                    {/* Option 3: External Staff */}
                    <Card size="small" className="option-card" style={{ borderLeftColor: isMissingDriver ? '#d9d9d9' : '#52c41a', marginBottom: 12 }}>
                        <Row align="middle" gutter={16}>
                            <Col flex="auto">
                                <Space align="start">
                                    <TeamOutlined style={{ color: isMissingDriver ? '#bfbfbf' : '#52c41a', fontSize: 18, marginTop: 4 }} />
                                    <div>
                                        <Text strong style={{ color: isMissingDriver ? '#bfbfbf' : 'inherit' }}>Sử dụng nhân viên thuê ngoài (Tạp vụ)</Text>
                                        <div style={{ color: '#64748b', fontSize: 13 }}>
                                            Bù đắp phần nhân sự thiếu hụt bằng cộng tác viên. Hệ thống sẽ ghi nhận chi phí thuê ngoài cho đơn này.
                                        </div>
                                    </div>
                                </Space>
                            </Col>
                            <Col>
                                <Tooltip title={isMissingDriver ? "Chỉ hỗ trợ thuê tạp vụ ngoài. Không thể áp dụng cho tài xế." : ""}>
                                    <Button
                                        style={isMissingDriver ? {} : { borderColor: '#52c41a', color: '#52c41a' }}
                                        onClick={onExternalStaff}
                                        loading={submitting}
                                        disabled={isMissingDriver}
                                    >
                                        Thuê ngoài
                                    </Button>
                                </Tooltip>
                            </Col>
                        </Row>
                    </Card>

                    {/* Final Action: Force Dispatch */}
                    <div style={{ marginTop: 24 }}>
                        {isMissingDriver ? (
                            <Alert
                                type="error"
                                message="Hành động bị vô hiệu hóa (Thiếu Tài xế)"
                                description="Mỗi xe tải bắt buộc phải có 1 Tài xế phụ trách. Xe không thể tự di chuyển. Vui lòng dời lịch hoặc tìm kiếm Tài xế khác."
                                showIcon
                            />
                        ) : decision === 'BLOCK' ? (
                            <Alert
                                type="error"
                                message="Hành động bị vô hiệu hóa"
                                description="Vui lòng chọn dời lịch hoặc tái cấu trúc đội hình. Bạn không thể cưỡng ép thực hiện một ca vận chuyển không an toàn."
                                showIcon
                            />
                        ) : (
                            <Card
                                size="small"
                                style={{
                                    background: decision === 'REQUIRE_CUSTOMER' ? '#fffbeb' : '#fef2f2',
                                    border: `1px solid ${decision === 'REQUIRE_CUSTOMER' ? '#fef3c7' : '#fee2e2'}`,
                                    borderRadius: 12
                                }}
                            >
                                <Row gutter={16} align="middle">
                                    <Col flex="auto">
                                        <div style={{ marginBottom: 4 }}>
                                            <ExclamationCircleOutlined style={{ color: decision === 'REQUIRE_CUSTOMER' ? '#d97706' : '#dc2626', marginRight: 8 }} />
                                            <Text strong type={decision === 'REQUIRE_CUSTOMER' ? 'warning' : 'danger'}>
                                                {decision === 'REQUIRE_CUSTOMER' ? 'Gửi đề xuất rủi ro cho Khách hàng' : 'Cưỡng ép điều phối (Chấp nhận rủi ro)'}
                                            </Text>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#475569' }}>
                                            {decision === 'REQUIRE_CUSTOMER'
                                                ? 'Sau khi bạn gửi, khách hàng sẽ nhận được yêu cầu xác nhận rủi ro trễ ca trên ứng dụng.'
                                                : 'Lưu ý: Lựa chọn này có thể dẫn đến khiếu nại về chất lượng và thời gian do thiếu nhân sự hoặc trễ dây chuyền.'}
                                        </div>
                                        <Checkbox
                                            style={{ marginTop: 12 }}
                                            checked={understoodRisk}
                                            onChange={e => setUnderstoodRisk(e.target.checked)}
                                        >
                                            <Text style={{ fontSize: 12 }}>Tôi đã đánh giá kỹ và chấp nhận rủi ro vận hành.</Text>
                                        </Checkbox>
                                    </Col>
                                    <Col>
                                        <Button
                                            type="primary"
                                            danger={decision !== 'REQUIRE_CUSTOMER'}
                                            style={decision === 'REQUIRE_CUSTOMER' ? { background: '#faad14', borderColor: '#faad14' } : {}}
                                            onClick={onForceProceed}
                                            loading={submitting}
                                            disabled={!understoodRisk}
                                            size="large"
                                            icon={<RocketOutlined />}
                                        >
                                            {decision === 'REQUIRE_CUSTOMER' ? 'Gửi đề xuất' : 'Force Dispatch'}
                                        </Button>
                                    </Col>
                                </Row>
                            </Card>
                        )}
                    </div>
                </div>
            </Space>
        </Modal>
    );
};

export default InsufficientResourcesModal;