import React from "react";
import { Button } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const OrderHero = ({ onOpenTour }) => {
  return (
    <section className="order-hero" style={{ position: 'relative' }}>
      <div className="overlay" />
      <h1>Thông Tin Chi Tiết</h1>
      <Button
        type="primary"
        icon={<QuestionCircleOutlined />}
        onClick={onOpenTour}
        style={{
          position: 'absolute',
          right: 40,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.2)',
          borderColor: 'white',
          color: 'white',
          zIndex: 2
        }}
      >
        Hướng dẫn xem đơn
      </Button>
    </section>
  );
};

export default OrderHero;
