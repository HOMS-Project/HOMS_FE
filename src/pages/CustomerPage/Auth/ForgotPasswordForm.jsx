import { Form, Input, Button, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../../services/authService";
import AuthFormWrapper from "../../../components/auth/AuthFormWrapper";

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await forgotPassword(values.email);
      message.success("Đã gửi mã OTP vào email!");
      // Lưu email vào localStorage để dùng ở trang verify OTP
      localStorage.setItem('resetEmail', values.email);
      // Chuyển hướng đến trang verify OTP
      setTimeout(() => {
        navigate('/verify-otp');
      }, 1000);
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
