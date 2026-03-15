import React from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Tag,
  Divider,
  Empty,
  Typography,
  Tooltip,
  Space
} from "antd";

import {
  EyeOutlined,
  CheckCircleOutlined,
  CarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  WarningOutlined,
  DollarOutlined
} from "@ant-design/icons";

const { Text, Title } = Typography;

const SurveyPricingModal = ({
  open,
  onClose,
  ticket,
  survey,
  pricing,
  onAcceptQuote,
  onPayDeposit
}) => {

  const renderFooter = () => {
    const buttons = [];

    if (ticket?.status === "QUOTED") {
      buttons.push(
        <Button
          key="accept"
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => onAcceptQuote(ticket._id)}
        >
          Chấp nhận & ký hợp đồng
        </Button>
      );
    }

    if (
      ticket?.status === "ACCEPTED" &&
      ticket?.invoice?.paymentStatus === "UNPAID"
    ) {
      buttons.push(
        <Button
          key="pay"
          type="primary"
          danger
          onClick={() => onPayDeposit(ticket._id)}
        >
          Thanh toán cọc
        </Button>
      );
    }

    buttons.push(
      <Button key="close" onClick={onClose}>
        Đóng
      </Button>
    );

    return buttons;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      footer={renderFooter()}
      title={
        <Space>
          <EyeOutlined style={{ color: "#44624A" }} />
          <span>
            Chi tiết khảo sát & Báo giá —
            <Text strong style={{ color: "#44624A" }}>
              #{ticket?.code?.slice(-10)?.toUpperCase()}
            </Text>
          </span>
        </Space>
      }
    >
      {!survey || !pricing ? (
        <Empty description="Chưa có thông tin khảo sát" />
      ) : (
        <>
          {/* SURVEY INFO */}
          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <Space direction="vertical">
                <Text>
                  <EnvironmentOutlined /> Quãng đường: {survey?.distanceKm} km
                </Text>

                <Text>Tầng lầu: {survey?.floors}</Text>

                <Tag color={survey?.hasElevator ? "success" : "default"}>
                  {survey?.hasElevator ? "Có thang máy" : "Không thang máy"}
                </Tag>
              </Space>
            </Col>

            <Col xs={24} md={12}>
              <Space direction="vertical">
                <Text>
                  <TeamOutlined /> Nhân viên: {survey?.suggestedStaffCount}
                </Text>

                <Text>
                  <CarOutlined /> Xe tải: {survey?.suggestedVehicle}
                </Text>

                <Text>
                  <ClockCircleOutlined /> {survey?.estimatedHours} giờ
                </Text>
              </Space>
            </Col>
          </Row>

          <Divider />

          {/* ITEMS */}
          {survey?.items?.length > 0 && (
            <>
              <Title level={5}>
                <InboxOutlined /> Danh sách đồ đạc ({survey.items.length})
              </Title>

              <Space wrap>
                {survey.items.map((item, idx) => {

                  const isCritical =
                    item?.name?.startsWith("⚠️") ||
                    item?.name?.startsWith("[CRIT");

                  return (
                    <Tooltip key={idx} title={item?.condition}>
                      <Tag
                        color={isCritical ? "error" : "blue"}
                        icon={isCritical ? <WarningOutlined /> : null}
                      >
                        {item?.name}
                      </Tag>
                    </Tooltip>
                  );
                })}
              </Space>
            </>
          )}

          <Divider />

          {/* PRICING */}
          <Row>
            <Col span={24}>
              <Space direction="vertical">

                <Text>
                  Phí cơ bản:{" "}
                  {pricing?.breakdown?.baseTransportFee?.toLocaleString()} ₫
                </Text>

                <Text>
                  Nhân công:{" "}
                  {pricing?.breakdown?.laborFee?.toLocaleString()} ₫
                </Text>

                <Text>
                  Xe tải:{" "}
                  {pricing?.breakdown?.vehicleFee?.toLocaleString()} ₫
                </Text>

                <Divider />

                <Title level={4} style={{ color: "#237804" }}>
                  <DollarOutlined /> Tổng cộng:{" "}
                  {pricing?.totalPrice?.toLocaleString()} ₫
                </Title>

              </Space>
            </Col>
          </Row>
        </>
      )}
    </Modal>
  );
};

export default SurveyPricingModal;