// file: src/pages/OwnerPage/PendingBookings/PendingBookings.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Avatar, Button, Tag, Spin, Empty, message, Modal, Input } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import bookingService from '../../../services/bookingService'; // Import service
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import './PendingBookings.css'; // Add CSS later

dayjs.extend(relativeTime);
const { TextArea } = Input;

const PendingBookings = () => {
    const [pendingBookings, setPendingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    const fetchPendingBookings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await bookingService.getOwnerPendingBookings();
            setPendingBookings(data);
        } catch (error) {
            messageApi.error("Không thể tải danh sách yêu cầu.");
            console.error("Fetch pending bookings error:", error);
        } finally {
            setLoading(false);
        }
    }, [messageApi]);

    useEffect(() => {
        fetchPendingBookings();
    }, [fetchPendingBookings]);

    const handleApprove = async (bookingId) => {
        messageApi.loading({ content: 'Đang chấp thuận...', key: `approve_${bookingId}` });
        try {
            await bookingService.updateBookingApproval(bookingId, { status: 'approved' });
            messageApi.success({ content: 'Đã chấp thuận yêu cầu!', key: `approve_${bookingId}` });
            // Remove from list or refresh
            setPendingBookings(pendingBookings.filter(b => b._id !== bookingId));
             // TODO: Trigger notification to tenant (if using WebSocket)
        } catch (error) {
            messageApi.error({ content: error.response?.data?.message || 'Chấp thuận thất bại.', key: `approve_${bookingId}` });
        }
    };

    const openRejectModal = (bookingId) => {
        setSelectedBookingId(bookingId);
        setRejectModalVisible(true);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            messageApi.warning("Vui lòng nhập lý do từ chối.");
            return;
        }
        messageApi.loading({ content: 'Đang từ chối...', key: `reject_${selectedBookingId}` });
        try {
            await bookingService.updateBookingApproval(selectedBookingId, { status: 'rejected', reason: rejectReason });
            messageApi.success({ content: 'Đã từ chối yêu cầu.', key: `reject_${selectedBookingId}` });
            setRejectModalVisible(false);
            setRejectReason('');
             // Remove from list or refresh
            setPendingBookings(pendingBookings.filter(b => b._id !== selectedBookingId));
            setSelectedBookingId(null);
            // TODO: Trigger notification to tenant (if using WebSocket)
        } catch (error) {
            messageApi.error({ content: error.response?.data?.message || 'Từ chối thất bại.', key: `reject_${selectedBookingId}` });
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <>
            {contextHolder}
            <div className="pending-bookings-container">
                <h1>Yêu cầu Đặt phòng Chờ duyệt</h1>
                {pendingBookings.length === 0 ? (
                    <Empty description="Không có yêu cầu nào đang chờ duyệt." />
                ) : (
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
                        dataSource={pendingBookings}
                        renderItem={(booking) => (
                            <List.Item>
                                <Card
                                    className="pending-booking-card"
                                    title={`Yêu cầu cho phòng ${booking.roomId?.roomNumber || 'N/A'}`}
                                    actions={[
                                        <Button
                                            type="primary"
                                            icon={<CheckOutlined />}
                                            onClick={() => handleApprove(booking._id)}
                                        >
                                            Chấp thuận
                                        </Button>,
                                        <Button
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => openRejectModal(booking._id)}
                                        >
                                            Từ chối
                                        </Button>,
                                    ]}
                                >
                                    <Card.Meta
                                        avatar={<Avatar icon={<UserOutlined />} src={booking.userId?.avatar} />}
                                        title={booking.userId?.name || 'Người dùng không xác định'}
                                        description={`Yêu cầu ${dayjs(booking.createdAt).fromNow()}`}
                                    />
                                    <div className="booking-request-details">
                                        <p><strong>Email:</strong> {booking.userId?.email || 'N/A'}</p>
                                        <p><strong>Điện thoại:</strong> {booking.userId?.phone || 'N/A'}</p>
                                        <p>
                                            <strong>Nhà trọ:</strong>{' '}
                                            {booking.boardingHouseId.name || 'N/A'}
                                        </p>
                                        <p><strong>Giá phòng:</strong> {booking.roomId?.price?.toLocaleString('vi-VN') || 'N/A'} VNĐ</p>
                                        {/* Hiển thị thêm thông tin từ guestInfo nếu có */}
                                        {booking.guestInfo && (
                                             <>
                                                 <p><strong>Ngày bắt đầu dự kiến:</strong> {booking.guestInfo.startDate ? dayjs(booking.guestInfo.startDate).format('DD/MM/YYYY') : 'N/A'}</p>
                                                 <p><strong>Thời hạn thuê:</strong> {booking.guestInfo.leaseDuration ? `${booking.guestInfo.leaseDuration} tháng` : 'N/A'}</p>
                                                 <p><strong>Số người ở:</strong> {booking.guestInfo.guests || 'N/A'}</p>
                                                 <p><strong>Mục đích:</strong> {booking.guestInfo.purpose || 'N/A'}</p>
                                             </>
                                        )}
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </div>

            {/* Reject Reason Modal */}
            <Modal
                title="Lý do từ chối yêu cầu đặt phòng"
                open={rejectModalVisible}
                onOk={handleReject}
                onCancel={() => {
                    setRejectModalVisible(false);
                    setRejectReason('');
                    setSelectedBookingId(null);
                }}
                okText="Xác nhận Từ chối"
                cancelText="Hủy"
            >
                <TextArea
                    rows={4}
                    placeholder="Nhập lý do bạn từ chối yêu cầu này..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
            </Modal>
        </>
    );
};

export default PendingBookings;