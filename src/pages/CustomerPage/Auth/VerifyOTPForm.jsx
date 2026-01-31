import { Button, Divider, Input, message } from "antd";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOTP, verifyRegistrationOTP } from "../../../services/authService";

const PRIMARY_COLOR = "#44624A";

const VerifyOTPForm = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verificationType, setVerificationType] = useState('reset'); // 'reset' hoặc 'registration'
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem đang verify cho đăng ký hay reset password
    const registrationData = localStorage.getItem('registrationData');
    if (registrationData) {
      const data = JSON.parse(registrationData);
      if (data.type === 'registration') {
        setVerificationType('registration');
      }
    }
  }, []);

  const handleChange = (index, value) => {
    // Chỉ cho phép nhập số
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Xử lý phím Backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      message.error("Vui lòng nhập đầy đủ mã xác thực");
      return;
    }

    setLoading(true);
    try {
      if (verificationType === 'registration') {
        // Xử lý verify OTP cho đăng ký
        const registrationData = localStorage.getItem('registrationData');
        if (!registrationData) {
          message.error("Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại.");
          navigate('/register');
          return;
        }

        const data = JSON.parse(registrationData);
        await verifyRegistrationOTP({ email: data.email, otp: otpCode });
        message.success("Đăng ký thành công!");
        
        // Xóa dữ liệu đăng ký
        localStorage.removeItem('registrationData');
        
        // Chuyển đến trang login
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        // Xử lý verify OTP cho reset password
        const email = localStorage.getItem('resetEmail');
        if (!email) {
          message.error("Không tìm thấy thông tin email. Vui lòng thử lại từ đầu.");
          navigate('/forgot-password');
          return;
        }

        await verifyOTP({ email, otp: otpCode });
        message.success("Xác thực thành công!");
        
        // Chuyển hướng đến trang reset password
        setTimeout(() => {
          navigate('/reset-password');
        }, 1000);
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* OTP Input Fields */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={inputRefs[index]}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength={1}
            style={{
              width: 56,
              height: 56,
              fontSize: 24,
              fontWeight: 600,
              textAlign: "center",
              borderRadius: 28,
              border: `2px solid ${digit ? PRIMARY_COLOR : "#d9d9d9"}`,
              backgroundColor: digit ? "#f0f5f1" : "#fff",
              color: PRIMARY_COLOR,
            }}
          />
        ))}
      </div>

      {/* Send Button */}
      <Button
        type="primary"
        size="large"
        block
        loading={loading}
        onClick={handleSubmit}
        style={{
          backgroundColor: PRIMARY_COLOR,
          borderColor: PRIMARY_COLOR,
          height: 48,
          fontSize: 16,
          borderRadius: 24,
        }}
      >
        Verify
      </Button>

      {/* Divider with OR */}
      <Divider style={{ margin: "32px 0", color: "#999" }}>OR</Divider>

      {/* Create Account Text */}
      <div style={{ marginBottom: 16 }}>
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
    </div>
  );
};

export default VerifyOTPForm;
