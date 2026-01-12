import React, { useState } from 'react';
import { Form, Input, Button, Typography, message as antMessage, Modal, Select,Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login, saveAccessToken, loginGoogle, assignRole } from '../../../services/authService'; 
import { initAutoLogout } from '../../../services/autoLogout';
import useUser from '../../../contexts/UserContext';
import styles from './LoginPage.module.css';
import { useSocket } from "../../../contexts/SocketContext";
import { GoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";

const { Title } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { fetchUser } = useUser();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antMessage.useMessage();
  const { socket } = useSocket();


  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await login(values);
      saveAccessToken(res.data.accessToken, 30 * 60 * 1000, res.data.refreshToken);
      await fetchUser();

      if (socket && !socket.connected) {
        socket.auth = { userId: res.data.user._id };
        socket.connect();
      }

      initAutoLogout();

      const role = res.data.user.role;

      if (role === 'admin') {
        await messageApi.success('Login successful!');
        navigate('/admin/dashboard');
      } else if (role === 'owner' || role === 'customer') {
       messageApi.success('Login successful!');
setTimeout(() => navigate('/homepage'), 500);
      } else {
        messageApi.error('Role không hợp lệ hoặc chưa được phân quyền!');
        return;
      }

    } catch (err) {
      const errors = err.response?.data?.errors;
      if (Array.isArray(errors)) {
        form.setFields(errors.map(error => ({
          name: error.param,
          errors: [error.msg],
        })));
      } else {
        console.log('Login error:', err);
        messageApi.error(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      const decoded = jwtDecode(googleToken);

      console.log("Google user:", decoded);
      const res = await loginGoogle(googleToken);
 
      if (res.data.user.role === 'pending') {
        setPendingUser(res.data.user);
        setRoleModalVisible(true);
        return;
      }

      saveAccessToken(res.data.accessToken, 30 * 60 * 1000, res.data.refreshToken);
      await fetchUser();
      initAutoLogout();
     messageApi.success('Login successful!');
setTimeout(() => navigate('/homepage'), 500);
    } catch (err) {
      console.error("Google login error:", err);
      messageApi.error("Google login failed");
    }
  };

  return (
    <div className={styles.loginWrapper}>
      {contextHolder}

      <div className={styles.leftPane}>
        <video
          className={styles.video}
          src={require('../../../assets/images/Login.mp4')}
          autoPlay
          loop
          muted
        />
      </div>

      <div className={styles.rightPane}>
        <Form layout="vertical" form={form} onFinish={onFinish} className={styles.formBox}>
          <Title level={2} className={styles.title}>Welcome Back 👋</Title>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please enter your email!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#49735A' }} />}
              placeholder="Enter your email"
              type="email"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#49735A' }} />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className={styles.submitButton}
            >
              <LoginOutlined />
              Login
            </Button>
          </Form.Item>
<Divider plain>OR</Divider>
        <div style={{ display: "flex", justifyContent: "center" }}>
  <GoogleLogin
    onSuccess={handleGoogleLogin}
    onError={() => messageApi.error("Google login failed")}
    useOneTap={false}
    width="250"   
  />
</div>

          <Form.Item style={{ textAlign: 'center', marginTop: 10 }}>
            <Button type="link" size="small" href="/forgot-password">
              Forgot password?
            </Button>
          </Form.Item>

          <Form.Item>
            <p className={styles.login}>
              Don't have an account? <a href="/register">Register</a>
            </p>
          </Form.Item>
        </Form>
      </div>

      {/* Modal chọn role */}
      <Modal
        title="Choose your role"
        open={roleModalVisible}
        onCancel={() => {
          setRoleModalVisible(false);
          setSelectedRole(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setRoleModalVisible(false);
            setSelectedRole(null);
          }}>
            Cancel
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={async () => {
              if (!selectedRole) {
                messageApi.error("Please select a role!");
                return;
              }
              try {
                const res = await assignRole({ userId: pendingUser.id, role: selectedRole });
                saveAccessToken(res.data.accessToken, 30 * 60 * 1000, res.data.refreshToken);
                await fetchUser();
                initAutoLogout();
                navigate("/homepage");
                messageApi.success("Role assigned and login successful!");
              } catch (err) {
                console.error("Assign role error:", err);
                messageApi.error("Assign role failed!");
              } finally {
                setRoleModalVisible(false);
                setSelectedRole(null);
                setPendingUser(null);
              }
            }}
          >
            OK
          </Button>
        ]}
      >
        <p>Please select your role:</p>
        <Select
          style={{ width: "100%" }}
          placeholder="Select role"
          value={selectedRole}
          onChange={(value) => setSelectedRole(value)}
          options={[
            { value: "customer", label: "Customer" },
            { value: "owner", label: "Owner" },
          ]}
        />
      </Modal>
    </div>
  );
};

export default LoginPage;