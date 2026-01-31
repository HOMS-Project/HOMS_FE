import { Form, Input, Button, Divider, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../../services/userService";

const PRIMARY_COLOR = "#44624A";

const ChangePasswordForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      message.success("Đổi mật khẩu thành công!");
      // Chuyển về trang profile
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      message.error(err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      requiredMark={false}
    >
      <Form.Item
        label="Enter Current Password"
        name="currentPassword"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
        ]}
      >
        <Input.Password
          size="large"
          placeholder="@#*%"
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        label="Enter New Password"
        name="newPassword"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu mới" },
          { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
        ]}
      >
        <Input.Password
          size="large"
          placeholder="@#*%"
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
            },
          }),
        ]}
      >
        <Input.Password
          size="large"
          placeholder="@#*%"
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading}
          style={{
            backgroundColor: PRIMARY_COLOR,
            borderColor: PRIMARY_COLOR,
            height: 48,
            fontSize: 16,
            borderRadius: 24,
            marginTop: 16,
          }}
        >
          Update
        </Button>
      </Form.Item>

      {/* Divider with OR */}
      <Divider style={{ margin: "32px 0", color: "#999" }}>OR</Divider>

      {/* Create Account Text */}
      <div style={{ marginBottom: 16, textAlign: "center" }}>
        <span style={{ color: "#999" }}>Don't have an account? </span>
        <Button
          type="link"
          onClick={() => navigate("/register")}
          style={{
            padding: 0,
            color: PRIMARY_COLOR,
            fontWeight: 600,
          }}
        >
          Create now
        </Button>
      </div>

      {/* Register Button */}
      <Button
        size="large"
        block
        onClick={() => navigate("/register")}
        style={{
          height: 48,
          fontSize: 16,
          borderRadius: 24,
          borderColor: PRIMARY_COLOR,
          color: PRIMARY_COLOR,
        }}
      >
        Register
      </Button>
    </Form>
  );
};

export default ChangePasswordForm;
