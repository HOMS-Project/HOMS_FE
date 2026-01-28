import { Row, Col, Typography } from "antd";
import { CustomerServiceOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PRIMARY_COLOR = "#44624A";

const AuthLayout = ({ children }) => {
  return (
    <Row style={{ minHeight: "100vh" }}>
      {/* LEFT */}
      <Col
        xs={24}
        md={12}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div style={{ maxWidth: 400, width: "100%" }}>
          {children}
        </div>
      </Col>

      {/* RIGHT */}
      <Col
        xs={0}
        md={12}
        style={{
          background: PRIMARY_COLOR,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
          position: "relative",
          textAlign: "center",
        }}
      >
        <div style={{ position: "absolute", top: 40, right: 60 }}>
          <CustomerServiceOutlined /> Support
        </div>

        <Title level={1} style={{ color: "#fff" }}>
          Introducing HOMS System
        </Title>

        <img
          src="/loginImage.png"
          alt="HOMS illustration"
          style={{ width: "100%", maxWidth: 320, margin: "24px 0" }}
        />

        <Text style={{ color: "rgba(255,255,255,.85)", maxWidth: 420 }}>
          HOMS is a web-based system designed to support and coordinate
          household moving services through a centralized platform.
        </Text>
      </Col>
    </Row>
  );
};

export default AuthLayout;
