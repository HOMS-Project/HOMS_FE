import React, { useState, useEffect } from 'react';
import {
  List,
  Card,
  Button,
  Tag,
  Typography,
  Spin,
  Empty,
  Avatar,
  Modal,
  Input,
  message,
  Divider
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import api from '../../../services/api';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusTag = (status) => {
  switch (status) {
    case 'pending':
      return <Tag color="blue">Đang chờ xử lý</Tag>;
    case 'confirmed':
      return <Tag color="green">Đã xác nhận</Tag>;
    case 'rejected':
      return <Tag color="red">Đã từ chối</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const OwnerVisitRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/visit-requests/owner');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch visit requests:', error);
      message.error(error.response?.data?.message || 'Lỗi khi tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateRequestStatus = (id, status, ownerNotes = null) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req._id === id ? { ...req, status, ownerNotes } : req
      )
    );
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/visit-requests/${id}/respond`, { status: 'confirmed' });
      messageApi.success('Đã duyệt lịch hẹn!');
      updateRequestStatus(id, 'confirmed');
    } catch (error) {
      messageApi.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const showRejectModal = (id) => {
    setCurrentRequestId(id);
    setIsModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason) {
      messageApi.warning('Vui lòng nhập lý do từ chối.');
      return;
    }
    setModalLoading(true);
    try {
      await api.put(`/visit-requests/${currentRequestId}/respond`, {
        status: 'rejected',
        ownerNotes: rejectionReason
      });
      messageApi.success('Đã từ chối lịch hẹn.');
      updateRequestStatus(currentRequestId, 'rejected', rejectionReason);
      setIsModalVisible(false);
      setRejectionReason("");
      setCurrentRequestId(null);
    } catch (error) {
      messageApi.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setRejectionReason("");
    setCurrentRequestId(null);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;
  }

  if (requests.length === 0) {
    return <Empty description="Bạn chưa có lịch hẹn nào." />;
  }

  return (
    <div>
      {contextHolder}
      <Title level={2}>Quản lý Lịch hẹn xem trọ</Title>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 3,
          xxl: 3
        }}
        dataSource={requests}
        renderItem={item => (
          <List.Item>
            <Card
              hoverable
           style={{ minHeight: 520, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              title={
                <Link to={`/accommodation/${item.accommodationId?._id}`}>
                  {item.accommodationId?.title || 'Phòng trọ đã bị xóa'}
                </Link>
              }
              cover={
                item.accommodationId?.photos?.[0] && (
                  <img
                    alt="accommodation"
                    src={`http://localhost:5000${item.accommodationId.photos[0]}`}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                )
              }
              actions={
                item.status === 'pending'
                  ? [
                    <Button type="primary" onClick={() => handleApprove(item._id)}>
                      Duyệt
                    </Button>,
                    <Button danger onClick={() => showRejectModal(item._id)}>
                      Từ chối
                    </Button>
                  ]
                  : [getStatusTag(item.status)]
              }
            >
              <Card.Meta
                avatar={<Avatar src={item.customerId?.avatar} icon={<UserOutlined />} />}
                title={`Khách: ${item.customerId?.name || 'N/A'}`}
                description={getStatusTag(item.status)}
              />
              <Divider />
              <Paragraph>
                <PhoneOutlined style={{ marginRight: 8 }} />
                {item.customerId?.phone || 'Chưa có SĐT'}
              </Paragraph>
              <Paragraph>
                <MailOutlined style={{ marginRight: 8 }} />
                {item.customerId?.email || 'Không có email'}
              </Paragraph>
              <Paragraph>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                <strong>Thời gian hẹn:</strong> {formatDateTime(item.requestedDateTime)}
              </Paragraph>
              <Paragraph>
                <MessageOutlined style={{ marginRight: 8 }} />
                <strong>Lời nhắn của khách:</strong> {item.message || <Text type="secondary">(Không có)</Text>}
              </Paragraph>

              {item.status === 'rejected' && item.ownerNotes && (
                <Paragraph
                  style={{
                    background: '#fff1f0',
                    color: '#cf1322',
                    padding: 8,
                    borderRadius: 4,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '100%',
                  }}
                >
                  <Text strong>Lý do từ chối:</Text> {item.ownerNotes}
                </Paragraph>
              )}
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Lý do từ chối"
        open={isModalVisible}
        onOk={handleRejectSubmit}
        onCancel={handleCancelModal}
        confirmLoading={modalLoading}
      >
        <TextArea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Ví dụ: Giờ đó tôi bận, bạn vui lòng chọn giờ khác..."
        />
      </Modal>
    </div>
  );
};

export default OwnerVisitRequests;
