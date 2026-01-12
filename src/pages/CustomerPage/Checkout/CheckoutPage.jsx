import React, { useEffect, useState } from "react";
// Sửa: Dùng axiosInstance thay vì axios
import axiosInstance from "../../../services/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import bookingService from "../../../services/bookingService";
import {
  Row,
  Col,
  Input,
  Select,
  Radio,
  Button,
  Divider,
  notification,
  DatePicker,
  Spin,
  Result,
  message
} from "antd";
import {
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import "./CheckoutPage.css";
import { getBoardingHouseById } from "../../../services/boardingHouseAPI";
import useUser from "../../../contexts/UserContext";

const { Option } = Select;

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId: stateBookingId, boardingHouseId: stateBoardingHouseId, roomId: stateRoomId, fromContract, autoPay } = location.state || {};
  // KHÔNG DÙNG propertyId nữa, luồng mới dựa trên bookingId
  // const propertyId = location.state?.accommodationId; 

  // form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");

  const [startDate, setStartDate] = useState(null);
  const [leaseDuration, setLeaseDuration] = useState(null);
  const [guests, setGuests] = useState(1);

  const { user } = useUser();
  const [paymentMethod, setPaymentMethod] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();
  const [booking, setBooking] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [boardingHouseDetails, setBoardingHouseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Định nghĩa tiền cọc (Nếu động, hãy lấy từ API)
  const DEPOSIT_FEE = 500000;

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  // --- Fetch Booking và Data liên quan (Logic mới) ---
  useEffect(() => {
    const fetchBookingDetails = async () => {
      const bookingId = stateBookingId;
      // If bookingId provided, fetch booking and populate
  if (bookingId) {
        setLoading(true);
        try {
          const bookingData = await bookingService.getBookingById(bookingId);
          if (!bookingData) throw new Error("Không tìm thấy thông tin đặt phòng.");
          if (bookingData.status === 'paid') {
            throw new Error('Đơn đặt phòng này đã được thanh toán.');
          }
          setBooking(bookingData);

          const houseData = bookingData.boardingHouseId;
          const specificRoom = bookingData.roomId;
          setBoardingHouseDetails(houseData);
          setRoomDetails(specificRoom);

          const info = bookingData.guestInfo || {};
          const nameParts = user?.name?.trim()?.split(" ") || [];
          const userFirstName = nameParts[0] || "";
          const userLastName = nameParts.slice(1).join(' ') || "";

          setFirstName(info.firstName || userFirstName);
          setLastName(info.lastName || userLastName);
          setEmail(info.email || user?.email || "");
          setPhone(info.phone || user?.phone || "");
          setPurpose(info.purpose || "");
          setStartDate(info.startDate ? dayjs(info.startDate) : dayjs());
          setLeaseDuration(info.leaseDuration || 6);
          setGuests(info.guests || 1);
        } catch (err) {
          setError(err.message || "Lỗi khi tải thông tin đặt phòng.");
          console.error("Checkout fetch error:", err);
        } finally {
          setLoading(false);
        }
        // after booking is fetched and state updated, return to avoid executing other branches
        return;
      }

      // If no bookingId, but boardingHouseId + roomId provided (starting flow), fetch boarding house and room
      const boardingHouseId = stateBoardingHouseId;
      const roomId = stateRoomId;
      if (boardingHouseId && roomId) {
        setLoading(true);
        try {
          const houseData = await getBoardingHouseById(boardingHouseId);
          const specificRoom = houseData.rooms.find(r => r._id === roomId);
          if (!specificRoom) throw new Error('Không thể tải thông tin phòng.');
          setBoardingHouseDetails(houseData);
          setRoomDetails(specificRoom);

          // Prefill from user
          const nameParts = user?.name?.trim()?.split(" ") || [];
          const userFirstName = nameParts[0] || "";
          const userLastName = nameParts.slice(1).join(' ') || "";
          setFirstName(userFirstName);
          setLastName(userLastName);
          setEmail(user?.email || "");
          setPhone(user?.phone || "");
          setStartDate(dayjs());
          setLeaseDuration(6);
          setGuests(1);
        } catch (err) {
          setError(err.message || 'Không thể tải thông tin nhà trọ.');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Neither bookingId nor boardingHouseId provided
      setError("Thông tin đặt phòng không hợp lệ.");
      setLoading(false);
    };

    fetchBookingDetails();
  }, [stateBookingId, stateBoardingHouseId, stateRoomId, user]); // Phụ thuộc vào location.state và user

  // Create booking and navigate to contract
  const handleContinueToContract = async () => {
    if (!stateBoardingHouseId || !stateRoomId) return messageApi.error('Thiếu thông tin phòng.');
    // Validate form fields
    const allFieldsFilled = startDate && leaseDuration && guests && purpose && firstName && lastName && email && phone;
    if (!allFieldsFilled) {
      return messageApi.warning("Vui lòng điền đầy đủ thông tin khách và chi tiết đặt phòng.");
    }

    try {
      setLoading(true);
      const payload = {
        boardingHouseId: stateBoardingHouseId,
        roomId: stateRoomId,
        guestInfo: {
          firstName, lastName, email, phone, purpose,
          startDate: startDate.format ? startDate.format('YYYY-MM-DD') : startDate,
          leaseDuration, guests
        }
      };
      const newBooking = await bookingService.requestBooking(payload);
      messageApi.success('Yêu cầu đặt phòng đã được tạo. Tiếp tục sang hợp đồng.');
      // Navigate to contract with bookingId
      navigate(`/customer/contract/${stateBoardingHouseId}/${stateRoomId}`, { state: { bookingId: newBooking._id } });
    } catch (err) {
      console.error('Error creating booking:', err);
      messageApi.error(err.response?.data?.message || 'Không thể tạo yêu cầu đặt phòng.');
    } finally {
      setLoading(false);
    }
  };

  // If we arrived with autoPay and booking data is present, start payment automatically
  useEffect(() => {
    if (autoPay && stateBookingId && booking && roomDetails && boardingHouseDetails) {
      // Default to PayOS and initiate payment
      setPaymentMethod('payos');
      // Slight delay to ensure UI settles
      const t = setTimeout(() => {
        handleBook();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [autoPay, stateBookingId, booking, roomDetails, boardingHouseDetails]);

  // --- Xử lý kết quả trả về từ VNPay ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("vnp_ResponseCode") === "00") {
      messageApi.success({ content: "Thanh toán thành công! Đặt phòng của bạn đã được xác nhận.", duration: 5 });
      setTimeout(() => navigate('/customer/my-bookings'), 3000);
    } else if (params.get("vnp_ResponseCode")) {
      messageApi.error({ content: "Thanh toán thất bại hoặc đã bị hủy.", duration: 5 });
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [navigate, messageApi]);

  // --- Xử lý nhấn nút Thanh toán (Đã sửa) ---
  const handleBook = async () => {
    console.log("Book button pressed");
    if (!paymentMethod) return messageApi.warning("Vui lòng chọn phương thức thanh toán.");
    if (!booking || !roomDetails) return messageApi.error("Thông tin đặt phòng chưa được tải.");
    if (!user?._id) return messageApi.error("Vui lòng đăng nhập lại.");

    // Validate form
    const allFieldsFilled = startDate && leaseDuration && guests && purpose && firstName && lastName && email && phone;
    if (!allFieldsFilled) {
      return messageApi.warning("Vui lòng điền đầy đủ thông tin khách và chi tiết đặt phòng.");
    }
    if (startDate && startDate.isBefore(dayjs().startOf('day'))) {
      notification.error({
        message: "Ngày không hợp lệ",
        description: "Ngày bắt đầu thuê không thể là ngày trong quá khứ."
      });
      return;
    }

    // 1. Tính toán số tiền
    const amountToPay = roomDetails.price + DEPOSIT_FEE;

    // 2. (Tùy chọn) Cập nhật guestInfo vào booking trước khi thanh toán
    // Bạn có thể tạo 1 endpoint (vd: PUT /api/bookings/:id/guestinfo)
    /*     const guestInfo = {
      firstName, lastName, email, phone, purpose,
      startDate: startDate.format("YYYY-MM-DD"),
      leaseDuration, guests,
    };
    await bookingService.updateGuestInfo(booking._id, guestInfo); 
    */

    // 3. Tạo link thanh toán
    try {
      if (paymentMethod === "payos") {
        const res = await axiosInstance.post("/payment/create", { // Dùng axiosInstance
          // amount: amountToPay,
          amount: 5000,
          userId: user._id,
          bookingId: booking._id, // Dùng bookingId đã fetch được
          type: "booking",
        });

        // Chuyển hướng sang trang checkout PayOS
        window.location.href = res.data.url;
      } else {
        messageApi.warning("Phương thức thanh toán chưa được hỗ trợ.");
      }
    } catch (err) {
      messageApi.error("Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.");
      console.error("Payment initiation error:", err.response?.data || err.message);
    }
  };

  // --- XÓA useEffect cũ (dòng 269-291) ---
  // useEffect(() => { ... }, [user, propertyId]); // ĐÃ XÓA

  // --- Tính toán các giá trị cho Summary Card ---
  const endDate = (startDate && leaseDuration)
    ? startDate.add(leaseDuration, 'month').format('DD/MM/YYYY')
    : 'N/A';

  const amountDueNow = (roomDetails?.price || 0) + DEPOSIT_FEE;

  // --- Xử lý trạng thái Loading và Error ---
  if (loading) {
    return (
      <div className="checkout-container" style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p>Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-container">
        <Result
          status="error"
          title="Đã xảy ra lỗi"
          subTitle={error}
          extra={[
            <Button type="primary" key="console" onClick={() => navigate('/customer/my-bookings')}>
              Về trang Yêu cầu
            </Button>,
          ]}
        />
      </div>
    );
  }

  // Đảm bảo data đã về trước khi render
  // - nếu đang ở chế độ thanh toán (có stateBookingId) thì cần booking + room + house
  // - nếu bắt đầu flow từ trang chi tiết (không có bookingId) thì chỉ cần roomDetails + boardingHouseDetails
  if (stateBookingId) {
    if (!booking || !roomDetails || !boardingHouseDetails) {
      return (
        <div className="checkout-container">
          <Result
            status="warning"
            title="Không tìm thấy dữ liệu"
            subTitle="Không thể tải chi tiết đặt phòng. Vui lòng thử lại."
          />
        </div>
      );
    }
  } else {
    if (!roomDetails || !boardingHouseDetails) {
      return (
        <div className="checkout-container">
          <Result
            status="warning"
            title="Không tìm thấy dữ liệu"
            subTitle="Không thể tải chi tiết đặt phòng. Vui lòng thử lại."
          />
        </div>
      );
    }
  }

  // --- Render JSX ---
  return (
    <div className="checkout-container">
      {contextHolder} {/* Hiển thị messageApi */}
      <Row gutter={[40, 40]}>
        {/* Left side - Guest details */}
        <Col xs={24} md={14}>
          <h2 className="section-title">Chi tiết khách thuê</h2>
          <Row gutter={16}>
            <Col span={12}><Input placeholder="Tên" size="large" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Col>
            <Col span={12}><Input placeholder="Họ" size="large" value={lastName} onChange={(e) => setLastName(e.target.value)} /></Col>
          </Row>
          <Input placeholder="Email" size="large" style={{ marginTop: 16 }} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input addonBefore="+84" placeholder="Số điện thoại" size="large" style={{ marginTop: 16 }} value={phone} onChange={(e) => setPhone(e.target.value)} />

          <div className="sub-section">
            <p className="sub-label">Chi tiết đặt phòng</p>
            <DatePicker placeholder="Ngày bắt đầu thuê" suffixIcon={<CalendarOutlined />} value={startDate} onChange={setStartDate} disabledDate={disabledDate} style={{ width: "100%", marginBottom: 12 }} format="DD/MM/YYYY" />
            <Select placeholder="Thời hạn thuê" style={{ width: "100%", marginBottom: 12 }} value={leaseDuration} onChange={setLeaseDuration}>
              <Option value={3}>3 tháng</Option>
              <Option value={6}>6 tháng</Option>
              <Option value={12}>12 tháng</Option>
            </Select>
            <Input type="number" min={1} placeholder="Số người ở" value={guests} onChange={(e) => setGuests(Number(e.target.value))} style={{ width: "100%" }} />
          </div>

          <div className="sub-section">
            <p className="sub-label">Mục đích thuê</p>
            <Radio.Group className="purpose-options" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              <Radio value="work">Đi làm/Công tác</Radio>
              <Radio value="moving">Chuyển đến thành phố</Radio>
              <Radio value="study">Học tập</Radio>
              <Radio value="other">Khác</Radio>
            </Radio.Group>
          </div>

          {/* Payment Method */}
          <div className="payment-method-section">
            <h3 className="section-title">Phương thức thanh toán</h3>
            <Select
              placeholder="Chọn phương thức thanh toán"
              size="large"
              style={{ width: "100%" }}
              value={paymentMethod}
              onChange={setPaymentMethod}
            >
              <Option value="payos">Thanh toán qua PayOS (Thẻ ATM, QR, Visa)</Option>
            </Select>
            <p className="terms-note">Bằng việc nhấn nút bên dưới, bạn đồng ý với các điều khoản...</p>
            {stateBookingId ? (
              <Button className="book-button" onClick={handleBook} disabled={!user || !paymentMethod}>
                Thanh toán
              </Button>
            ) : (
              <Button className="book-button" type="primary" onClick={handleContinueToContract} disabled={!user}>
                Tiếp tục sang hợp đồng
              </Button>
            )}
          </div>
        </Col>

        {/* Right side - Summary */}
        <Col xs={24} md={10}>
          <div className="summary-card">
            <img
              src={boardingHouseDetails?.photos?.[0] ? `http://localhost:5000${boardingHouseDetails.photos[0]}` : "/default-image.jpg"}
              alt={boardingHouseDetails?.name || 'Boarding House'}
              className="summary-image"
            />
            <div className="summary-section">
              <h3>{boardingHouseDetails?.name}</h3>
              <p>Phòng: {roomDetails?.roomNumber}</p>
              <p>{`${boardingHouseDetails?.location?.addressDetail}, ${boardingHouseDetails?.location?.street}, ${boardingHouseDetails?.location?.district}`}</p>
              <Divider />
              <Row>
                <Col span={12}>
                  <CalendarOutlined /> Nhận phòng
                  <div>{startDate ? startDate.format('DD/MM/YYYY') : 'N/A'}</div>
                </Col>
                <Col span={12}>
                  <CalendarOutlined /> Trả phòng (dự kiến)
                  <div>{endDate}</div>
                </Col>
              </Row>
              <Divider />
              <h4>Chi tiết thanh toán</h4>
              <div className="payment-detail-row">
                <span>Tiền thuê tháng đầu</span>
                <span>{roomDetails?.price ? roomDetails.price.toLocaleString('vi-VN') : 0} VNĐ</span>
              </div>
              <div className="payment-detail-row">
                <span>Tiền cọc</span>
                <span>{DEPOSIT_FEE.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <Divider />
              <div className="payment-detail-row total-cost">
                <span>Tổng cộng thanh toán ngay</span>
                <span>{amountDueNow.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <Divider />
              <h4>Lịch trình thanh toán</h4>
              <div className="payment-detail-row">
                <span>Tiền thuê hàng tháng</span>
                <span>
                  {roomDetails?.price
                    ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(roomDetails.price)
                    : "—"}
                </span>
              </div>
              <div className="payment-detail-row">
                <span>
                  Thanh toán khi đặt phòng <InfoCircleOutlined />
                </span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(amountDueNow)
                  }
                </span>
              </div>

              <Divider />

              <h4>Payment timeline</h4>
              <div className="payment-timeline">
                <div className="timeline-line"></div>

                <div className="payment-item">
                  <div className="bullet-point" />
                  <div className="payment-content">
                    <strong>Thanh toán giữ phòng</strong>
                    <div className="sub-note">
                      Thanh toán ngay (Bao gồm tiền cọc)
                    </div>
                  </div>
                  <div className="payment-amount">
                    <span>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(amountDueNow)
                      }
                    </span>
                    A new
                  </div>
                </div>

                <div className="payment-item">
                  <div className="bullet-point" />
                  <div className="payment-content">
                    Tên
                    <strong>Sau khi trả phòng</strong>
                    <div className="sub-note">
                      Hoàn {DEPOSIT_FEE.toLocaleString('vi-VN')}đ tiền cọc
                      <InfoCircleOutlined style={{ fontSize: 12 }} />
                    </div>
                  </div>
                  <div className="payment-amount">
                    <span>
                      +{DEPOSIT_FEE.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div >
  );
};

export default CheckoutPage;