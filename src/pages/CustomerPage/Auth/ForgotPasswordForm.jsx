import { Form, Input, Button, message } from "antd";
import { useState } from "react";
import { forgotPassword } from "../../../services/authService";
import AuthFormWrapper from "../../../components/auth/AuthFormWrapper";

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await forgotPassword(values.email);
      message.success("Đã gửi mã otp vào email!");
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không tìm thấy email"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper
      title="Quên mật khẩu"
      subtitle="Nhớ lại rồi?"
      linkText="Đăng nhập"
      linkTo="/login"
    >
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input size="large" placeholder="example@email.com" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
            style={{
    backgroundColor: "#44624A",
    borderColor: "#44624A",
  }}
        >
         Nhập Email
        </Button>
      </Form>
    </AuthFormWrapper>
  );
};

export default ForgotPasswordForm;
