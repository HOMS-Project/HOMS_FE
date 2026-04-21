import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Steps,
  Card,
  Row,
  Col,
  Input,
  Button,
  DatePicker,
  message,
  Alert,
  Select,
  Checkbox,
  ConfigProvider,
} from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";

import AppHeader from "../../../components/header/header";
import AppFooter from "../../../components/footer/footer";
import LocationPicker from "../../../components/LocationPicker/LocationPicker";
import api from "../../../services/api";
import { createOrder, getVehicles } from "../../../services/orderService";

import "./style.css";

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const MAX_PORTERS = {
  "500KG": 1,
  "1TON": 2,
  "1.5TON": 3,
  "2TON": 4,
};

const CreateTruckRental = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  // From navigation state ideally
  const serviceId = location.state?.serviceId || 4;

  // Pick-up location state
  const [pickupLocation, setPickupLocation] = useState(
    JSON.parse(sessionStorage.getItem("pickupLocation")) || null,
  );
  const [pickupDescription, setPickupDescription] = useState("");

  // Rental details
  const [truckType, setTruckType] = useState("1TON");
  const [rentalDurationHours, setRentalDurationHours] = useState(2);
  const [extraStaffCount, setExtraStaffCount] = useState(0);
  const [needsPacking, setNeedsPacking] = useState(false);
  const [needsAssembling, setNeedsAssembling] = useState(false);

  // Schedule state
  const [movingDate, setMovingDate] = useState(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Restore moving date if cached
    const savedDate = sessionStorage.getItem("movingDate");
    if (savedDate) setMovingDate(dayjs(savedDate));
  }, []);
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehicles();

        // chỉ lấy xe AVAILABLE
        const available = data.filter(v => v.status === "Available");

        setVehicles(available);
      } catch (err) {
        message.error("Không tải được danh sách xe");
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    const limit = MAX_PORTERS[truckType] || 0;
    if (extraStaffCount > limit) {
      setExtraStaffCount(limit);
    }
  }, [truckType]);

  const handleLocationChange = (locationData) => {
    setPickupLocation(locationData);
    sessionStorage.setItem("pickupLocation", JSON.stringify(locationData));
    setErrors((prev) => ({ ...prev, pickupLocation: null }));
  };

  const handleNext = async () => {
    const newErrors = {};

    if (
      !pickupLocation ||
      !pickupLocation.lat ||
      !pickupLocation.lng ||
      !pickupLocation.address
    ) {
      newErrors.pickupLocation =
        "Vui lòng chọn địa điểm nhận xe hợp lệ từ bản đồ";
    }

    if (!movingDate) {
      newErrors.movingDate = "Vui lòng chọn ngày giờ nhận xe";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const now = dayjs();
    const selectedMovingDate = dayjs(movingDate);


    const hoursUntilMoving = selectedMovingDate.diff(now, 'hour', true);
    if (hoursUntilMoving < 2) {
      setErrors(prev => ({
        ...prev,
        movingDate: 'Thời gian nhận xe phải cách hiện tại ít nhất 2 tiếng'
      }));
      setIsSubmitting(false);
      return;
    }

    // Important: for ConfirmMovingOrder, we want dropoffLocation to be pickupLocation or null. Setting identical.
    const orderData = {
      serviceId,
      serviceName: "Thuê Xe Tải",
      pickupLocation,
      dropoffLocation: pickupLocation, // Both needed
      pickupDescription,
      movingDate: movingDate.toISOString(),
      moveType: "TRUCK_RENTAL",
      rentalDetails: {
        truckType,
        rentalDurationHours,
        extraStaffCount,
        needsPacking,
        needsAssembling,
      },
    };

    try {
      const response = await createOrder(orderData);
      message.success("Tạo đơn thuê xe thành công!");
      // Save state or ID if needed, then navigate to dashboard
      navigate("/customer/order");
    } catch (error) {
      message.error(
        error?.message || "Có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout className="create-order-layout">
      <AppHeader />
      <Content className="create-order-content">
        <main className="main-container">
          {/* HERO */}
          <section className="moving-hero" style={{ position: "relative" }}>
            <h1>Thuê Xe Tải</h1>
          </section>

          {/* STEPS */}
          <section className="service-steps-container">
            <Card className="steps-card">
              <Steps
                current={0}
                responsive
                items={[{ title: "Chọn Ngày & Xe" }, { title: "Xác nhận Đơn" }]}
              />
            </Card>
          </section>

          <section className="moving-location">
            <h1>Bạn Mong Muốn Nhận Xe Ở Đâu?</h1>
            <Row gutter={40}>
              <Col md={10} xs={24}>
                <Card className="location-card" bordered={false}>
                  <div className="location-form">
                    <h3>Địa điểm nhận xe</h3>
                    <Input
                      placeholder="Địa chỉ tự động từ bản đồ"
                      value={pickupLocation?.address}
                      prefix={<EnvironmentOutlined />}
                      readOnly
                      style={{ marginBottom: 15 }}
                    />
                    {errors.pickupLocation && (
                      <div
                        style={{
                          color: "#ff4d4f",
                          marginBottom: 15,
                          marginTop: -10,
                          fontSize: 13,
                        }}
                      >
                        {errors.pickupLocation}
                      </div>
                    )}

                    <TextArea
                      placeholder="Ghi chú thêm về địa điểm (vd: Xe có thể đậu trước hẻm)..."
                      value={pickupDescription}
                      onChange={(e) => setPickupDescription(e.target.value)}
                      rows={2}
                      style={{ marginBottom: 15 }}
                    />

                    <h3>Loại xe</h3>
                    <Row gutter={10} style={{ marginBottom: 15 }}>
                      {vehicles.map((v) => (
                        <Col span={12} key={v._id}>
                          <Button
                            type={truckType === v.vehicleType ? "primary" : "default"}
                            block
                            onClick={() => setTruckType(v.vehicleType)}
                            style={{ height: 50 }}
                          >
                            {v.vehicleType} ({v.loadCapacity || "?"} kg)
                          </Button>
                        </Col>
                      ))}
                    </Row>
                    <h3>Thời gian thuê</h3>
                    <Row gutter={10} style={{ marginBottom: 15 }}>
                      {[2, 4, 8, 24].map((hour) => (
                        <Col span={12} key={hour}>
                          <Button
                            type={rentalDurationHours === hour ? "primary" : "default"}
                            block
                            onClick={() => setRentalDurationHours(hour)}
                            style={{ height: 45 }}
                          >
                            {hour === 24 ? "1 ngày" : `${hour} tiếng`}
                          </Button>
                        </Col>
                      ))}
                    </Row>

                    <h3>Ngày giờ nhận xe</h3>
                    <ConfigProvider locale={viVN}>
                      <DatePicker
                        placeholder="Chọn ngày giờ"
                        showTime={{ format: "HH:mm", minuteStep: 15 }}
                        format="DD/MM/YYYY HH:mm"
                        value={movingDate}
                        onChange={(v) => {
                          setMovingDate(v);
                          if (v)
                            sessionStorage.setItem("movingDate", v.toISOString());
                          else sessionStorage.removeItem("movingDate");

                          setErrors((prev) => ({
                            ...prev,
                            movingDate: null,
                          }));
                        }}
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day")
                        }
                        style={{ width: "100%", padding: "10px 14px" }}
                      />
                    </ConfigProvider>

                    {errors.movingDate && (
                      <div style={{ color: "#ff4d4f", marginTop: 5, fontSize: 13 }}>
                        {errors.movingDate}
                      </div>
                    )}

                    <div style={{ marginTop: 20 }}>
                      <h3>Dịch vụ bổ sung</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 14 }}>Số lượng nhân viên bốc xếp bổ sung:</span>
                          <Select 
                            value={extraStaffCount} 
                            onChange={v => setExtraStaffCount(v)}
                            style={{ width: 120 }}
                          >
                            {Array.from({ length: (MAX_PORTERS[truckType] || 0) + 1 }, (_, i) => i).map(n => (
                              <Option key={n} value={n}>{n === 0 ? "Không có" : `${n} người`}</Option>
                            ))}
                          </Select>
                        </div>
                        <Checkbox
                          checked={needsPacking}
                          onChange={e => setNeedsPacking(e.target.checked)}
                        >
                          Dịch vụ đóng gói đồ đạc (thùng carton, màng PE...)
                        </Checkbox>
                        <Checkbox
                          checked={needsAssembling}
                          onChange={e => setNeedsAssembling(e.target.checked)}
                        >
                          Dịch vụ tháo lắp (giường, tủ, máy lạnh...)
                        </Checkbox>
                      </div>
                    </div>

                  </div>
                </Card>
              </Col>

              <Col md={14} xs={24}>
                <div style={{ height: "700px" }}>
                  <LocationPicker
                    onLocationChange={handleLocationChange}
                    initialPosition={
                      pickupLocation
                        ? { lat: pickupLocation.lat, lng: pickupLocation.lng }
                        : null
                    }
                    currentLocationData={pickupLocation}
                    locationType="pickup"
                  />
                </div>
              </Col>
            </Row>
          </section>

          <div className="next-button">
            <Button
              type="primary"
              size="large"
              onClick={handleNext}
              loading={isSubmitting}
            >
              Tiếp tục đặt xe
            </Button>
          </div>
        </main>
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default CreateTruckRental;
