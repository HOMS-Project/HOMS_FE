import React, { useState, useEffect } from 'react';
import { List, Card, Tag, Button, Spin, Empty, Row, Col, Divider, message, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../../services/bookingService'; // Assuming you have this
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // For showing "booked X days ago"
import './MyBookings.css'; // Add CSS for custom styling

dayjs.extend(relativeTime);

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                // Assuming getUserRequestHistory fetches all bookings for the logged-in user
                const data = await bookingService.getUserRequestHistory();
                // Sort bookings, maybe pending first, then by creation date
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBookings(data);
            } catch (error) {
                messageApi.error("Không thể tải lịch sử đặt phòng.");
                console.error("Fetch bookings error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [messageApi]);

    const handlePayNow = (bookingId, boardingHouseId, roomId) => {
        // Navigate to checkout and request immediate payment
        navigate("/customer/checkout", { state: { bookingId, boardingHouseId, roomId, autoPay: true } });
    };

    const handleCancelRequest = async (bookingId) => {
        // TODO: Implement API call to cancel a 'pending_approval' booking
        messageApi.loading({ content: 'Đang hủy yêu cầu...', key: `cancel_${bookingId}` });
        try {
            await bookingService.cancelBookingRequest(bookingId);
            messageApi.success({ content: 'Đã hủy yêu cầu đặt phòng.', key: `cancel_${bookingId}` });
            // Refresh list
            const updatedBookings = bookings.map(b => {
                if (b._id === bookingId) {
                    return { ...b, contractStatus: 'cancelled_by_tenant' };
                }
                return b;
            });
            setBookings(updatedBookings);
        } catch (error) {
            messageApi.error({ content: 'Hủy yêu cầu thất bại.', key: `cancel_${bookingId}` });
        }

    };
    
    const getStatusTag = (booking) => {
        const { contractStatus, status } = booking; // contractStatus is for approval, status is for payment/completion

        if (status === 'paid') return <Tag color="success">Đã thanh toán</Tag>;
        if (status === 'completed') return <Tag color="default">Đã hoàn thành</Tag>; // For past stays
        if (status === 'cancelled') return <Tag color="default">Đã hủy</Tag>; // For past stays

        if (contractStatus === 'pending_approval') return <Tag color="processing">Chờ duyệt</Tag>;
        if (contractStatus === 'approved') return <Tag color="warning">Chờ thanh toán</Tag>;
        if (contractStatus === 'rejected') return <Tag color="error">Đã từ chối</Tag>;
        if (contractStatus === 'cancelled_by_tenant') return <Tag color="default">Đã hủy</Tag>;

        return <Tag>{contractStatus || status || 'Không rõ'}</Tag>; // Fallback
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin size="large" /></div>;
    }

    if (bookings.length === 0) {
        return <Empty description="Bạn chưa có yêu cầu đặt phòng nào." style={{ marginTop: '50px' }} />;
    }

    return (
        <>
            {contextHolder}
            <div className="my-bookings-container">
                <h1>Lịch sử Đặt phòng</h1>
                <List
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                    dataSource={bookings}
                    renderItem={(booking) => {
                        // Need to populate these details in the backend API response
                        const house = booking.boardingHouseId;
                        const room = booking.roomId || booking.propertyId; // Handle both possibilities
                        const imageUrl = house?.photos?.[0] ? `http://localhost:5000${house.photos[0]}` : '/default-image.jpg';

                        return (
                            <List.Item>
                                <Card
                                    className="booking-card-item"
                                    hoverable
                                    cover={<img alt={house?.name || 'Property'} src={imageUrl} style={{ height: 180, objectFit: 'cover' }} />}
                                    actions={[
                                        // Conditional Actions
                                        booking.contractStatus === 'approved' && booking.status !== 'paid' && (
                                            <Button type="primary" onClick={() => handlePayNow(booking._id, house._id, room._id)}>
                                                Thanh toán ngay
                                            </Button>
                                        ),
                                        booking.contractStatus === 'pending_approval' && (
                                            <Popconfirm
                                                title="Hủy yêu cầu?"
                                                description="Bạn có chắc muốn hủy yêu cầu đặt phòng này?"
                                                onConfirm={() => handleCancelRequest(booking._id)}
                                                okText="Đồng ý"
                                                cancelText="Không"
                                            >
                                                <Button danger>Hủy yêu cầu</Button>
                                            </Popconfirm>
                                        ),
                                        <Button onClick={() => navigate(`/customer/property/${house?._id}`)}>
                                            Xem chi tiết trọ
                                        </Button>,
                                    ].filter(Boolean)} // Filter out false values for cleaner rendering
                                >
                                    <Card.Meta
                                        title={<span style={{ fontWeight: 'bold' }}>{house?.name || 'Chỗ ở không xác định'}</span>}
                                        description={`Phòng ${room?.roomNumber || 'N/A'}`}
                                    />
                                    <Divider style={{ margin: '12px 0' }} />
                                    <div className="booking-details">
                                        <p><strong>Địa chỉ:</strong> {`${house?.location?.street || ''}, ${house?.location?.district || ''}`}</p>
                                        <p><strong>Ngày yêu cầu:</strong> {dayjs(booking.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                                        <p><strong>Trạng thái:</strong> {getStatusTag(booking)}</p>
                                        {booking.contractStatus === 'rejected' && booking.rejectionReason && (
                                            <p style={{ color: 'red' }}><strong>Lý do từ chối:</strong> {booking.rejectionReason}</p>
                                        )}
                                        {/* You can add more details like start date, duration if available */}
                                        <p><strong>Giá phòng:</strong> {room?.price ? `${room.price.toLocaleString('vi-VN')} VNĐ/tháng` : 'N/A'}</p>
                                    </div>
                                </Card>
                            </List.Item>
                        );
                    }}
                />
            </div>
        </>
    );
};

export default MyBookings;