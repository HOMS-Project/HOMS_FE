import React, { useState } from 'react';
import { Form, Input, Button, Typography, message as antMessage } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../services/authService';

const { Title } = Typography;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = antMessage.useMessage();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await resetPassword(token, { password: values.password });
      messageApi.success(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 800);
    } catch (err) {
      console.error(err);
      const errors = err.response?.data?.errors;

      if (errors && Array.isArray(errors)) {
        errors.forEach(error => {
          messageApi.error(error.msg);
        });
      } else {
        messageApi.error(err.response?.data?.message || "Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      {contextHolder}
      <Title level={3}>Reset Password</Title>

      <Form layout="vertical" onFinish={onFinish}>
        {/* Password field */}
        <Form.Item
          label="New Password"
          name="password"
          rules={[{ required: true, message: "Please enter your new password!" }]}
          hasFeedback
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        {/* Confirm Password field */}
        <Form.Item
  label="Confirm Password"
  name="confirmPassword"
  dependencies={['password']}
  hasFeedback
  validateTrigger="onBlur"
  rules={[
    { required: true, message: "Please confirm your password!" },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue('password') === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Passwords do not match!'));
      },
    }),
  ]}
>
  <Input.Password placeholder="Confirm your new password" />
</Form.Item>


        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordPage;