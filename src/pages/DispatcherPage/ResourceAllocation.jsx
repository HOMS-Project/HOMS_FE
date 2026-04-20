import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Tag, message, Modal, Select, Form, Space, Row, Col, Card, Descriptions, Divider, DatePicker, Alert, notification } from 'antd';
import { Spin as AntdSpin } from 'antd';
import { CarOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../services/api';
import adminRouteService from '../../services/adminRouteService';
import dayjs from 'dayjs';
import ResourceMap from '../../components/ResourceMap/ResourceMap';
import { useSocket } from '../../contexts/SocketContext';

const { Title, Text } = Typography;
const { Option } = Select;

const ResourceAllocation = () => {
    const { socket } = useSocket() || {};
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [isResolutionModalVisible, setIsResolutionModalVisible] = useState(false);
    const [insufficientResourcesData, setInsufficientResourcesData] = useState(null);

    // Form and Resource Data
    const [form] = Form.useForm();
    const vehicleType = Form.useWatch('vehicleType', form);
    const dispatchTime = Form.useWatch('dispatchTime', form);

    const [drivers, setDrivers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [vehicleStats, setVehicleStats] = useState({});
    const [routesList, setRoutesList] = useState([]);
    const [allAdminRoutes, setAllAdminRoutes] = useState([]); // All routes with restrictions
    const [mapCoords, setMapCoords] = useState({ pickup: null, delivery: null });

    // Socket reload trigger for real-time availability updates
    const [reloadTrigger, setReloadTrigger] = useState(0);

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
            // Only update staff and routes if we do NOT have dispatchTime active.
            // If dispatchTime IS active, it gets handled by the checkAvailability effect!
            if (!dispatchTime || !isModalVisible) {
                const [driverRes, staffRes] = await Promise.all([
                    api.get('/customer/drivers'),
                    api.get('/customer/staff')
                ]);

                if (driverRes.data?.success) setDrivers(driverRes.data.data);
                if (staffRes.data?.success) setStaff(staffRes.data.data);
            }

            const routeRes = await adminRouteService.getAllRoutes();
            if (routeRes.success) {
                setRoutesList(routeRes.data || []);
                setAllAdminRoutes(routeRes.data || []);
            }

        } catch (error) {
            message.error('Lỗi khi tải danh sách nhân sự.');
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchResources();
    }, [reloadTrigger]);

    // Socket listener for real-time updates
    useEffect(() => {
        if (!socket) return;
        
        const handleResourcesUpdated = (data) => {
            console.log('🔄 [SOCKET] Giới chức điều phối đã cập nhật. Làm mới dữ liệu...', data);
            message.info({ content: 'Dữ liệu điều phối vừa được cập nhật, đang lấy lại...', key: 'resourceUpdate', duration: 2 });
            setReloadTrigger(prev => prev + 1);
        };

        socket.on('resources_updated', handleResourcesUpdated);
        return () => {
            socket.off('resources_updated', handleResourcesUpdated);
        };
    }, [socket]);

    // New Effect: Watch dispatchTime changes and query Availability Engine
    useEffect(() => {
        const checkAvailability = async () => {
            if (dispatchTime && selectedInvoice && isModalVisible) {
                try {
                    const payload = {
                        dispatchTime: dispatchTime.toISOString(),
                        estimatedDuration: 480
                    };
                    const response = await api.post('/admin/dispatch-assignments/check-availability', payload);
                    if (response.data && response.data.success) {
                        const newDrivers = response.data.data.drivers || [];
                        const newStaff = response.data.data.staff || [];
                        
                        // Immediately update state which reactively rerenders the Select options tags
                        setDrivers(newDrivers);
                        setStaff(newStaff);
                        
                        const vStats = { '500KG': 0, '1TON': 0, '1.5TON': 0, '2TON': 0 };
                        response.data.data.vehicles?.forEach(v => {
                             if (v.availabilityStatus !== 'UNAVAILABLE') {
                                vStats[v.vehicleType] = (vStats[v.vehicleType] || 0) + 1;
                             }
                        });
                        setVehicleStats(vStats);

                        // Automatically filter out selected resources if they just became unavailable
                        const currentVals = form.getFieldsValue(['leaderId', 'driverIds', 'staffIds', 'vehicleType', 'vehicleCount']);
                        const updates = {};
                        let changed = false;

                        if (currentVals.leaderId) {
                            const l = newDrivers.find(d => d._id === currentVals.leaderId) || newStaff.find(s => s._id === currentVals.leaderId);
                            if (l && l.availabilityStatus === 'UNAVAILABLE') {
                                updates.leaderId = undefined;
                                changed = true;
                            }
                        }

                        if (currentVals.driverIds && currentVals.driverIds.length > 0) {
                            const validDrivers = currentVals.driverIds.filter(id => {
                                const d = newDrivers.find(nd => nd._id === id);
                                return d && d.availabilityStatus !== 'UNAVAILABLE';
                            });
                            if (validDrivers.length !== currentVals.driverIds.length) {
                                updates.driverIds = validDrivers;
                                changed = true;
                            }
                        }

                        if (currentVals.staffIds && currentVals.staffIds.length > 0) {
                            const validStaff = currentVals.staffIds.filter(id => {
                                const s = newStaff.find(ns => ns._id === id);
                                return s && s.availabilityStatus !== 'UNAVAILABLE';
                            });
                            if (validStaff.length !== currentVals.staffIds.length) {
                                updates.staffIds = validStaff;
                                changed = true;
                            }
                        }

                        if (currentVals.vehicleType && currentVals.vehicleCount) {
                            const availableForType = vStats[currentVals.vehicleType] || 0;
                            if (availableForType < currentVals.vehicleCount) {
                                updates.vehicleCount = availableForType > 0 ? availableForType : undefined;
                                if (availableForType === 0) updates.vehicleType = undefined;
                                changed = true;
                            }
                        }

                        if (changed) {
                            form.setFieldsValue(updates);
                        }
                    }
                } catch (error) {
                    console.error('Failed to check availability:', error);
                }
            } else if (!dispatchTime && isModalVisible) {
                // If they cleared the time inside the modal, fallback to basic load
                const [driverRes, staffRes] = await Promise.all([
                    api.get('/customer/drivers'),
                    api.get('/customer/staff')
                ]);
                if (driverRes.data?.success) setDrivers(driverRes.data.data);
                if (staffRes.data?.success) setStaff(staffRes.data.data);
            }
        };

        checkAvailability();
    }, [dispatchTime, selectedInvoice, isModalVisible, reloadTrigger]);

    const geocodeAddress = async (address) => {
        if (!address) return null;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), address };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
        return null;
    };

    const showDispatchModal = async (invoice) => {
        setSelectedInvoice(invoice);
        form.resetFields();
        const ticket = invoice.requestTicketId;
        const surveyData = ticket?.surveyDataId || {};

        // Set defaults from survey
        if (ticket?.scheduledTime) {
            form.setFieldsValue({
                dispatchTime: dayjs(ticket.scheduledTime),
                vehicleType: surveyData.suggestedVehicle || undefined
            });
        }
        setIsModalVisible(true);

        // Prepare coordinates for map
        let pCoords = ticket?.pickup?.coordinates;
        let dCoords = ticket?.delivery?.coordinates;

        // Fallback to geocoding if coordinates are missing
        if (!pCoords || !pCoords.lat) {
            pCoords = await geocodeAddress(ticket?.pickup?.address);
        } else {
            pCoords = { ...pCoords, address: ticket.pickup.address };
        }

        if (!dCoords || !dCoords.lat) {
            dCoords = await geocodeAddress(ticket?.delivery?.address);
        } else {
            dCoords = { ...dCoords, address: ticket.delivery.address };
        }

        setMapCoords({ pickup: pCoords, delivery: dCoords });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedInvoice(null);
    };

    const handleSubmit = async (values, isForceProceed = false) => {
        if (!selectedInvoice) return;

        setSubmitting(true);
        try {
            const payload = {
                leaderId: values.leaderId,
                driverIds: values.driverIds || [],
                staffIds: values.staffIds || [],
                vehicleType: values.vehicleType,
                vehicleCount: values.vehicleCount || 1,
                routeId: values.routeId,
                dispatchTime: values.dispatchTime ? values.dispatchTime.toISOString() : null,
                totalWeight: selectedInvoice.requestTicketId?.surveyDataId?.totalWeight || 1000,
                totalVolume: selectedInvoice.requestTicketId?.surveyDataId?.totalVolume || 10,
                estimatedDuration: 480, // Mặc định 8 tiếng
                forceProceed: isForceProceed
            };

            await api.post(`/admin/dispatch-assignments/invoice/${selectedInvoice._id}/allocate`, payload);
            message.success('Đã điều phối xe và nhân sự thành công!');

            setIsResolutionModalVisible(false);
            setIsModalVisible(false);
            fetchInvoices(); // Refresh list
        } catch (error) {
            const errRes = error.response?.data;
            if (errRes?.message === 'INSUFFICIENT_RESOURCES') {
                setInsufficientResourcesData({
                    ...errRes.data,
                    valuesSnapshot: values
                });
                setIsResolutionModalVisible(true);
                // Automatically refresh UI resource list to reflect the newly taken slots
                setReloadTrigger(prev => prev + 1);
            } else {
                message.error('Lỗi khi điều phối: ' + (errRes?.message || ''));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleForceProceed = () => {
        if (!insufficientResourcesData) return;
        
        // We override the values with the newly *suggested* team by the backend to bypass conflicts 
        // AND pass forceProceed = true to bypass shortages limitation.
        const suggested = insufficientResourcesData.suggestedTeam;
        const newValues = {
            ...insufficientResourcesData.valuesSnapshot,
            leaderId: suggested.leaderId,
            driverIds: suggested.driverIds,
            staffIds: suggested.staffIds
        };
        handleSubmit(newValues, true);
    };

    const handleAutoRebuildTeam = () => {
        if (!insufficientResourcesData) return;
        const suggested = insufficientResourcesData.suggestedTeam;
        form.setFieldsValue({
            leaderId: suggested.leaderId,
            driverIds: suggested.driverIds,
            staffIds: suggested.staffIds
        });
        setIsResolutionModalVisible(false);
        message.info('Đã tự động điền lại nhân sự dựa trên gợi ý từ hệ thống.');
    };

    const handlePickAlternativeTime = () => {
        if (!insufficientResourcesData || !insufficientResourcesData.nextAvailableSlots.length) return;
        const nextTime = insufficientResourcesData.nextAvailableSlots[0];
        form.setFieldsValue({
            dispatchTime: dayjs(nextTime)
        });
        setIsResolutionModalVisible(false);
        message.info('Đã chọn một thời gian trống tiếp theo. Vui lòng xác nhận lại phân công.');
    };

    const handleAutoFill = async () => {
        if (!selectedInvoice) return;
        try {
            setSubmitting(true);
            const ticket = selectedInvoice.requestTicketId;
            const payload = {
                requestTicketId: ticket?._id,
                totalWeight: ticket?.surveyDataId?.totalWeight || 1000,
                totalVolume: ticket?.surveyDataId?.totalVolume || 10,
                pickupLocation: mapCoords.pickup ? { coordinates: [mapCoords.pickup.lng, mapCoords.pickup.lat] } : null
            };
            
            console.log('[FE] Requesting Smart Squad (Optimal Squad) with payload:', JSON.stringify(payload, null, 2));
            
            const response = await api.post('/admin/dispatch-assignments/optimal-squad', payload);
            if (response.data && response.data.success) {
                const squad = response.data.data;
                console.log('[FE] Received Smart Squad response:', JSON.stringify(squad, null, 2));

                const newValues = {};
                if (squad.vehicle) newValues.vehicleType = squad.vehicle.vehicleType;
                
                // Đảm bảo đưa User vào list để Select mapping được Tên thay vì hiển thị ID
                if (squad.leader) {
                    setDrivers(prev => prev.some(d => d._id === squad.leader._id) ? prev : [...prev, squad.leader]);
                    newValues.leaderId = squad.leader._id;
                }
                if (squad.driver && squad.driver._id !== squad.leader?._id) {
                    setDrivers(prev => prev.some(d => d._id === squad.driver._id) ? prev : [...prev, squad.driver]);
                    newValues.driverIds = [squad.driver._id];
                }
                if (squad.helpers && squad.helpers.length > 0) {
                    setStaff(prev => {
                        const arr = [...prev];
                        squad.helpers.forEach(h => {
                            if (!arr.some(s => s._id === h._id)) arr.push(h);
                        });
                        return arr;
                    });
                    newValues.staffIds = squad.helpers.map(h => h._id);
                }
                
                form.setFieldsValue(newValues);
                message.success('Đã áp dụng Biệt đội tối ưu (Smart Squad)!');

                if (squad.logisticsPlan) {
                    notification.info({
                        message: 'Logistics Engine Dispatch Plan',
                        description: (
                            <div>
                                <p><strong>Staff Required:</strong> {squad.logisticsPlan.staffTotal} people (Estimated: {squad.logisticsPlan.estimatedMinutes} mins)</p>
                                <p><strong>Vehicle Allocation:</strong> {squad.logisticsPlan.vehicles.map(v => `${v.trips}x ${v.type}`).join(', ')}</p>
                                {squad.logisticsPlan.extraTransport?.motorbikes > 0 && (
                                  <p><strong>Extra Transport Fallback:</strong> {squad.logisticsPlan.extraTransport.motorbikes} motorbikes for missing seats</p>
                                )}
                                <p><strong>Equipment on Truck:</strong> {squad.logisticsPlan.equipmentPlan?.onTruck?.join(', ')}</p>
                                <p><em>Confidence: {squad.logisticsPlan.confidenceLevel}</em></p>
                            </div>
                        ),
                        duration: 8,
                    });
                }
            }
        } catch (error) {
            message.error('Lỗi khi tính toán đội ngũ tối ưu.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderVehicleOption = (label, type) => {
        const count = vehicleStats[type];
        if (count === undefined) return label; // Khi chưa có stats
        
        const isAvailable = count > 0;
        
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ opacity: isAvailable ? 1 : 0.5 }}>{label}</span>
                {isAvailable ? (
                    <Tag color="#44624a" bordered={false} style={{ margin: 0 }}>{count} sẵn sàng</Tag>
                ) : (
                    <Tag color="error" bordered={false} style={{ margin: 0 }}>Hết xe</Tag>
                )}
            </div>
        );
    };

    const renderResourceOption = (resource) => {
        let label = `${resource.fullName} - ${resource.phone}`;
        
        let tag = null;
        if (resource.availabilityStatus === 'UNAVAILABLE') {
            tag = <Tag color="error" bordered={false} style={{ margin: 0 }}>Đang bận</Tag>;
        } else if (resource.availabilityStatus === 'TIGHT') {
            tag = <Tag color="warning" bordered={false} style={{ margin: 0 }}>Sát giờ</Tag>;
        } else {
            // Apply available to explicitly AVAILABLE or when not loaded yet
            tag = <Tag color="#44624a" bordered={false} style={{ margin: 0, color: '#fff' }}>Sẵn sàng</Tag>;
        }
        
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ opacity: resource.availabilityStatus === 'UNAVAILABLE' ? 0.5 : 1 }}>
                    {label}
                </span>
                {tag}
            </div>
        );
    };

    const availableStaff = staff.filter(s => s.availabilityStatus === 'AVAILABLE' || !s.availabilityStatus);
    const tightStaff = staff.filter(s => s.availabilityStatus === 'TIGHT');
    const unavailableStaff = staff.filter(s => s.availabilityStatus === 'UNAVAILABLE');

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
            dataIndex: ['requestTicketId', 'pickup', 'address'],
            key: 'pickup',
            ellipsis: true
        },
        {
            title: 'Địa chỉ giao',
            dataIndex: ['requestTicketId', 'delivery', 'address'],
            key: 'delivery',
            ellipsis: true
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color="blue">{status === 'CONFIRMED' ? 'Đã xác nhận' : status}</Tag>
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    style={{ background: '#44624a' }}
                    icon={<CarOutlined />}
                    onClick={() => showDispatchModal(record)}
                >
                    Điều phối
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>Điều phối Xe & Đội ngũ bốc xếp</Title>
                <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => {
                        setReloadTrigger(prev => prev + 1);
                        message.success('Đã làm mới dữ liệu tổng quan!');
                    }}
                >
                    Làm mới
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={invoices}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={
                    <Space>
                        <CarOutlined style={{ color: '#44624a' }} />
                        <span>Điều phối tài nguyên Vận chuyển</span>
                        <Tag color="#44624a">{selectedInvoice?.code}</Tag>
                    </Space>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={1500}
                style={{ top: 10 }}
                destroyOnClose={true}
            >
                <Row gutter={[24, 24]}>
                    <Col span={10}>
                        <Space direction="vertical" style={{ width: '100%' }} size={16}>
                            {/* Order Summary Card */}
                            <Card
                                size="small"
                                title="Thông tin đơn hàng"
                                styles={{ body: { padding: '8px 16px' }, header: { minHeight: '36px', background: '#f8f9fa' } }}
                            >
                                <Descriptions column={1} size="small" layout="horizontal">
                                    <Descriptions.Item label="Khách hàng">
                                        <Text strong>{selectedInvoice?.customerId?.fullName}</Text>
                                        <Text type="secondary" style={{ marginLeft: 8 }}>({selectedInvoice?.customerId?.phone})</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Điểm lấy hàng">
                                        <Text size="small">{selectedInvoice?.requestTicketId?.pickup?.address}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Điểm giao hàng">
                                        <Text size="small">{selectedInvoice?.requestTicketId?.delivery?.address}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày vận chuyển">
                                        <Text strong style={{ color: '#44624a' }}>
                                            {selectedInvoice?.requestTicketId?.scheduledTime ?
                                                dayjs(selectedInvoice.requestTicketId.scheduledTime).format('DD/MM/YYYY HH:mm') :
                                                'Chưa xác định'}
                                        </Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card
                                size="small"
                                title={<Space><Text strong>Cấu hình Nhân sự & Phương tiện</Text></Space>}
                                extra={
                                    <Space>
                                        <Button 
                                            icon={<ReloadOutlined />} 
                                            size="small" 
                                            onClick={() => {
                                                setReloadTrigger(prev => prev + 1);
                                                message.success('Đã lấy dữ liệu nhân sự mới nhất!');
                                            }}
                                        >
                                            Làm mới tải trọng
                                        </Button>
                                        <Button type="dashed" danger onClick={handleAutoFill} size="small" style={{ borderRadius: '8px' }}>
                                            ✨ Smart Auto-fill
                                        </Button>
                                    </Space>
                                }
                                styles={{ header: { minHeight: '36px', background: '#f8f9fa' } }}
                            >
                                {selectedInvoice?.requestTicketId?.surveyDataId && (
                                    <Alert
                                        message={`Khảo sát đề xuất: Dùng xe ${selectedInvoice.requestTicketId.surveyDataId.suggestedVehicle || 'Chưa định'} và cần ${selectedInvoice.requestTicketId.surveyDataId.suggestedStaffCount || '?'} nhân sự.`}
                                        type="info"
                                        showIcon
                                        style={{ marginBottom: '12px' }}
                                    />
                                )}
                                <Form form={form} layout="vertical" onFinish={(values) => handleSubmit(values, false)} initialValues={{ vehicleCount: 1 }}>
                                    <Divider orientation="left" style={{ margin: '8px 0', fontSize: '13px' }}>Đội ngũ nhân sự</Divider>
                                    <Form.Item
                                        name="leaderId"
                                        label="Trưởng nhóm (Bắt buộc)"
                                        rules={[{ required: true, message: 'Vui lòng chọn 1 tài xế làm trưởng nhóm' }]}
                                    >
                                        <Select
                                            placeholder="Chọn tên tài xế (Trưởng nhóm)"
                                            style={{ width: '100%' }}
                                            allowClear
                                            optionLabelProp="label"
                                            menuItemSelectedIcon={null}
                                        >
                                            {drivers.map(d => (
                                                <Option key={d._id} value={d._id} disabled={d.availabilityStatus === 'UNAVAILABLE'} label={d.fullName}>
                                                    {renderResourceOption(d)}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item name="driverIds" label="Tài xế phụ">
                                        <Select mode="multiple" placeholder="Chọn tên tài xế bổ sung" allowClear optionLabelProp="label" menuItemSelectedIcon={null}>
                                            {drivers.map(d => (
                                                <Option key={d._id} value={d._id} disabled={d.availabilityStatus === 'UNAVAILABLE'} label={d.fullName}>
                                                    {renderResourceOption(d)}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item name="staffIds" label="Nhân viên phụ bốc xếp">
                                        <Select mode="multiple" placeholder="Chọn tên nhân viên bốc xếp" allowClear optionLabelProp="label" menuItemSelectedIcon={null}>
                                            {staff.map(s => (
                                                <Option key={s._id} value={s._id} disabled={s.availabilityStatus === 'UNAVAILABLE'} label={s.fullName}>
                                                    {renderResourceOption(s)}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Divider orientation="left" style={{ margin: '8px 0', fontSize: '13px' }}>Thời gian & Phương tiện</Divider>
                                    <Form.Item
                                        name="dispatchTime"
                                        label="Thời gian điều phối (Dự kiến)"
                                        rules={[{ required: true, message: 'Vui lòng xác nhận thời gian' }]}
                                    >
                                        <DatePicker
                                            showTime
                                            format="DD/MM/YYYY HH:mm"
                                            style={{ width: '100%' }}
                                            placeholder="Chọn ngày và giờ vận chuyển"
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                            disabledTime={(current) => {
                                                if (current && current.isSame(dayjs(), 'day')) {
                                                    return {
                                                        disabledHours: () => Array.from({ length: dayjs().hour() }, (_, i) => i),
                                                        disabledMinutes: (selectedHour) => {
                                                            if (selectedHour === dayjs().hour()) {
                                                                return Array.from({ length: dayjs().minute() }, (_, i) => i);
                                                            }
                                                            return [];
                                                        }
                                                    };
                                                }
                                                return {};
                                            }}
                                        />
                                    </Form.Item>

                                    <Row gutter={16}>
                                        <Col span={14}>
                                            <Form.Item name="vehicleType" label="Loại xe">
                                                <Select placeholder="Chọn loại xe" allowClear>
                                                    <Option value="500KG" disabled={vehicleStats['500KG'] === 0}>{renderVehicleOption('Xe 500 KG', '500KG')}</Option>
                                                    <Option value="1TON" disabled={vehicleStats['1TON'] === 0}>{renderVehicleOption('Xe 1 Tấn', '1TON')}</Option>
                                                    <Option value="1.5TON" disabled={vehicleStats['1.5TON'] === 0}>{renderVehicleOption('Xe 1.5 Tấn', '1.5TON')}</Option>
                                                    <Option value="2TON" disabled={vehicleStats['2TON'] === 0}>{renderVehicleOption('Xe 2 Tấn', '2TON')}</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={10}>
                                            <Form.Item name="vehicleCount" label="Số lượng xe">
                                                <Select placeholder="Số xe">
                                                    <Option value={1}>1 xe</Option>
                                                    <Option value={2}>2 xe</Option>
                                                    <Option value={3}>3 xe</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        shouldUpdate={(prevValues, currentValues) =>
                                            prevValues.vehicleType !== currentValues.vehicleType ||
                                            prevValues.vehicleCount !== currentValues.vehicleCount ||
                                            prevValues.leaderId !== currentValues.leaderId ||
                                            prevValues.driverIds !== currentValues.driverIds ||
                                            prevValues.staffIds !== currentValues.staffIds
                                        }
                                        style={{ marginBottom: '0px' }}
                                    >
                                        {() => {
                                            const vals = form.getFieldsValue(['vehicleType', 'vehicleCount', 'leaderId', 'driverIds', 'staffIds']);
                                            const totalStaff = (vals.leaderId ? 1 : 0) + (vals.driverIds?.length || 0) + (vals.staffIds?.length || 0);
                                            
                                            // Determine max seats per selected vehicle type (including the driver)
                                            let seatsPerVehicle = 2; // 500KG, 1TON
                                            if (vals.vehicleType === '1.5TON' || vals.vehicleType === '2TON') {
                                                seatsPerVehicle = 3;
                                            } else if (vals.vehicleType === '5000KG') {
                                                seatsPerVehicle = 3;
                                            }
                                            
                                            const totalSeats = (vals.vehicleCount || 1) * seatsPerVehicle;
                                            const missingSeats = totalStaff - totalSeats;
                                            
                                            if (missingSeats > 0) {
                                                return (
                                                    <Alert
                                                        message={`Phát sinh di chuyển phụ: Xe tải đã đầy (Tối đa ${totalSeats} chỗ). Có ${missingSeats} nhân viên sẽ di chuyển bằng phương tiện cá nhân (Xe máy).`}
                                                        type="warning"
                                                        showIcon
                                                        style={{ marginTop: '12px' }}
                                                    />
                                                );
                                            }
                                            return null;
                                        }}
                                    </Form.Item>

                                    <Divider style={{ margin: '16px 0' }} />

                                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                                        <Space>
                                            <Button onClick={handleCancel}>Hủy</Button>
                                            <Button type="primary" htmlType="submit" loading={submitting} size="large" style={{ background: '#44624a' }}>
                                                Xác nhận điều phối
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Space>
                    </Col>
                    <Col span={14}>
                        <div style={{ height: '700px', background: '#f0f2f5', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d9d9d9', position: 'relative' }}>
                            {isModalVisible && mapCoords.pickup && mapCoords.delivery ? (
                                <ResourceMap
                                    pickup={mapCoords.pickup}
                                    delivery={mapCoords.delivery}
                                    allRoutes={allAdminRoutes}
                                    vehicleType={vehicleType}
                                    dispatchTime={dispatchTime}
                                />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                    <AntdSpin size="large" />
                                    <span style={{ color: '#8c8c8c', marginTop: 12 }}>Đang chuẩn bị bản đồ địa hình...</span>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Modal>

            {/* Smart Resolution Modal */}
            <Modal
                title="⚠️ Phát hiện thiếu hụt nhân sự"
                open={isResolutionModalVisible}
                onCancel={() => setIsResolutionModalVisible(false)}
                footer={null}
                width={650}
            >
                {insufficientResourcesData && (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Alert 
                            type="warning" 
                            showIcon 
                            message="Không đủ nhân sự rảnh rỗi vào khung giờ đã chọn!"
                            description={`Bạn đang cố phân công ${insufficientResourcesData.shortages.required.drivers} tài xế và ${insufficientResourcesData.shortages.required.helpers} phụ xe, nhưng hiện tại chỉ có ${insufficientResourcesData.shortages.available.drivers} tài xế và ${insufficientResourcesData.shortages.available.helpers} phụ xe trống lịch.`}
                        />
                        
                        <div style={{ marginTop: 16 }}>
                            <Text strong>Các phương án xử lý:</Text>
                            
                            <Card size="small" style={{ marginTop: 8, borderColor: '#1890ff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <Text strong>1. Tái cấu trúc theo thực tế (Hệ thống gợi ý)</Text>
                                        <div style={{ color: '#595959', fontSize: 13, marginTop: 4 }}>
                                            Sử dụng đội hình có sẵn tại thời điểm này: <br/>
                                            • Tài xế: {insufficientResourcesData.suggestedTeam.driverIds.length} <br/>
                                            • Phụ xe: {insufficientResourcesData.suggestedTeam.staffIds.length} <br/>
                                            Hệ thống sẽ cập nhật lại Form để bạn xem lại và nhấn xác nhận.
                                        </div>
                                    </div>
                                    <Button type="primary" onClick={handleAutoRebuildTeam}>
                                        Áp dụng Đội hình này
                                    </Button>
                                </div>
                            </Card>

                            <Card size="small" style={{ marginTop: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <Text strong>2. Dời thời gian vận chuyển</Text>
                                        <div style={{ color: '#595959', fontSize: 13, marginTop: 4 }}>
                                            Hệ thống quét được các khung giờ sau sẽ đủ đội hình như bạn mong muốn: <br/>
                                            {insufficientResourcesData.nextAvailableSlots.map((s, i) => (
                                                <Tag color="green" key={i}>{dayjs(s).format('HH:mm DD/MM')}</Tag>
                                            ))}
                                            {insufficientResourcesData.nextAvailableSlots.length === 0 && <Text type="danger">Không tìm thấy khung giờ phù hợp trong 3 ngày tới.</Text>}
                                        </div>
                                    </div>
                                    <Button disabled={insufficientResourcesData.nextAvailableSlots.length === 0} onClick={handlePickAlternativeTime}>
                                        Đổi thời gian
                                    </Button>
                                </div>
                            </Card>

                            {insufficientResourcesData.canForce && (
                                <Card size="small" style={{ marginTop: 8, background: '#fff1f0', borderColor: '#ffa39e' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Text strong type="danger">3. Buộc thực hiện (Thiếu người)</Text>
                                            <div style={{ color: '#595959', fontSize: 13, marginTop: 4 }}>
                                                Lệnh điều phối sẽ tiếp tục với số người thực tế có sẵn. <br/>
                                                <Text type="danger" style={{ fontSize: 12 }}>* Khách hàng sẽ nhận được thông báo thiếu hụt nhân sự.</Text>
                                            </div>
                                        </div>
                                        <Button danger onClick={handleForceProceed} loading={submitting}>
                                            Vẫn tiến hành
                                        </Button>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default ResourceAllocation;