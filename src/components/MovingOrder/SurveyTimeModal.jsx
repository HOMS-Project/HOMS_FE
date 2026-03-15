import React from "react";
import {
  Modal,
  Button,
  Empty,
  Row,
  Col,
  Card,
  Typography,
  Space,
  message,Divider
} from "antd";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InboxOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { confirm } = Modal;

const SurveyTimeModal = ({
  open,
  onClose,
  ticket,
  survey,
  onAcceptTime,
  onCancelOrder
}) => {

  if (!ticket) return null;

  const handleAccept = async (time) => {
    try {
      await onAcceptTime(ticket._id, time);
      message.success("Đã chấp nhận lịch khảo sát");
      onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const handleCancel = () => {
    confirm({
      title: "Bạn có chắc muốn hủy yêu cầu?",
      content: "Yêu cầu này sẽ bị hủy và không thể khôi phục.",
      okText: "Xác nhận hủy",
      okType: "danger",
      cancelText: "Quay lại",
      onOk: async () => {
        try {
          await onCancelOrder(ticket._id);
          message.success("Đã hủy yêu cầu");
          onClose();
        } catch (err) {
          message.error(err?.response?.data?.message || err.message);
        }
      }
    });
  };

  return (
    <Modal
      title="Chọn thời gian khảo sát"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
    >

      {/* RESCHEDULE REASON */}
      {ticket?.rescheduleReason && (
        <Card type="inner" style={{ marginBottom: 16 }}>
          <Text strong>Lý do đề xuất lịch mới:</Text>
          <br />
          {ticket.rescheduleReason}
        </Card>
      )}

      {/* DISPATCHER */}
      {ticket?.dispatcherId && (
        <Card type="inner" style={{ marginBottom: 16 }}>
          <Text strong>Nhân viên khảo sát:</Text>{" "}
          {ticket.dispatcherId.fullName}
          {ticket.dispatcherId.phone && ` - ${ticket.dispatcherId.phone}`}
        </Card>
      )}

      {/* PROPOSED TIMES */}
      <Space direction="vertical" style={{ width: "100%" }}>
        {ticket?.proposedSurveyTimes?.map((time, index) => (
          <Card key={index} size="small">
            <Row justify="space-between" align="middle">
              <Col>
                <Text>
                  {new Date(time).toLocaleString("vi-VN")}
                </Text>
              </Col>

              <Col>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleAccept(time)}
                >
                  Chấp nhận
                </Button>
              </Col>
            </Row>
          </Card>
        ))}
      </Space>

      {ticket?.proposedSurveyTimes?.length === 0 && (
        <Empty description="Chưa có lịch khảo sát" />
      )}

      {/* CANCEL ORDER */}
      {ticket?.proposedSurveyTimes?.length > 0 && (
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleCancel}
          >
            Hủy yêu cầu
          </Button>
        </div>
      )}

      {/* ITEMS */}
      {survey && (
        <>
          <Divider />

          <Title level={4}>
            <InboxOutlined /> Danh sách đồ đạc khảo sát
          </Title>

          <Row gutter={[16, 16]}>
            {(survey?.items || []).map((item, idx) => {

              const isCritical =
                item?.name?.startsWith("⚠️") ||
                item?.name?.startsWith("[CRIT");

              return (
                <Col xs={24} sm={12} md={8} key={idx}>
                  <Card
                    size="small"
                    style={{
                      borderColor: isCritical ? "#ff4d4f" : undefined
                    }}
                  >
                    <Text strong>
                      {isCritical && (
                        <WarningOutlined style={{ marginRight: 4 }} />
                      )}
                      {item?.name}
                    </Text>

                    <br />

                    <Text type="secondary">
                      {item?.actualWeight > 0 && (
                        <>
                          <InfoCircleOutlined /> {item.actualWeight} kg
                        </>
                      )}

                      {item?.actualVolume > 0 &&
                        ` • ${item.actualVolume} m³`}
                    </Text>

                    {item?.notes && (
                      <>
                        <br />
                        <Text type="secondary" italic>
                          {item.notes}
                        </Text>
                      </>
                    )}

                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </Modal>
  );
};

export default SurveyTimeModal;