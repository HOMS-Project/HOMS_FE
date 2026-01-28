import { Typography } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;
const PRIMARY_COLOR = "#44624A";

const AuthFormWrapper = ({
  title,
  subtitle,
  linkText,
  linkTo,
  children,
}) => {
  return (
    <>
      <Title level={2}>{title}</Title>
      <Text type="secondary">
        {subtitle}{" "}
        <Link to={linkTo} style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>
          {linkText}
        </Link>
      </Text>

      <div style={{ marginTop: 32 }}>{children}</div>
    </>
  );
};

export default AuthFormWrapper;
