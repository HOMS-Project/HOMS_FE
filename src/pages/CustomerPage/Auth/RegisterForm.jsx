import { Form, Input, Button, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useState } from "react";
import { register } from "../../../services/authService";
import { useNavigate } from "react-router-dom";

const PRIMARY_COLOR = "#44624A";

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
          setTimeout(() => {
      navigate("/login");
    }, 800);
    } catch (err) {
  const errors = err.response?.data?.errors;

  if (errors && errors.length > 0) {
    errors.forEach(e => {
      message.error(e.message);
    });
  } else {
    message.error(err.response?.data?.message || "Đăng ký thất bại");
  }
}
finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
  label="Họ và tên"
  name="fullName"
  rules={[
    { required: true, message: "Vui lòng nhập họ và tên" },
    { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
    {
      pattern: /^[\p{L}\s]+$/u,
      message: "Họ tên không được chứa số hoặc ký tự đặc biệt",
    },
  ]}
>
  <Input size="large" placeholder="Nguyễn Văn A" />
</Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      >
        <Input size="large" placeholder="example@gmail.com" />
      </Form.Item>
<Form.Item
  label="Số điện thoại"
  name="phone"
  rules={[
    { required: true, message: "Vui lòng nhập số điện thoại" },
    {
      pattern: /^0\d{9}$/,
      message: "Số điện thoại không hợp lệ",
    },
  ]}
>
  <Input size="large" placeholder="0123456789" />
</Form.Item>

      <Form.Item
        label="Mật khẩu"
        name="password"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu" },
        ]}
      >
        <Input.Password
          size="large"
          placeholder="••••••••"
          iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </Form.Item>

      <Form.Item
        label="Xác nhận mật khẩu"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Mật khẩu xác nhận không khớp"),
              );
            },
          }),
        ]}
      >
        <Input.Password
          size="large"
          placeholder="••••••••"
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        block
        size="large"
        style={{ background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
      >
        Đăng ký
      </Button>
    </Form>
  );
};

export default RegisterForm;
