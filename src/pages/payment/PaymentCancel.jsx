import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button } from "antd";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ticketId = searchParams.get("ticketId");

  return (
    <Result
      status="warning"
      title="Bạn đã hủy thanh toán"
      subTitle={`Đơn hàng ${ticketId} vẫn đang chờ đặt cọc.`}
      extra={[
        <Button key="home" onClick={() => navigate("/")}>
          Trang chủ
        </Button>,
      ]}
    />
  );
};

export default PaymentCancel;