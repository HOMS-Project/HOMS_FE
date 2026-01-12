import React, { useState, useEffect } from "react";
import { Modal, Form, DatePicker, Input, Button, message } from "antd";
import dayjs from 'dayjs';
// 1. Import instance 'api' của bạn
import api from "../../../services/api"; // <-- Đảm bảo đường dẫn này chính xác

const { TextArea } = Input;

const VisitRequestModal = ({ visible, onClose, onSuccess, boardingHouseId, ownerId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Reset form khi modal bị đóng
  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  // Vô hiệu hóa các ngày trong quá khứ
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  // Xử lý khi submit form (ĐÃ CẬP NHẬT)
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      // 2. Chuẩn bị data (Axios tự động stringify)
      const rawBody = {
        ...values,
        boardingHouseId: boardingHouseId,
        ownerId: ownerId,
      };

      console.log("Data to be sent:", rawBody);
      

      const response = await api.post("/visit-requests", rawBody);

      // Nếu code chạy tới đây, nghĩa là response.status là 2xx (thành công)
      onSuccess();
      form.resetFields();

    } catch (error) {
      // 4. Xử lý lỗi từ Axios
      console.error("Error sending visit request:", error);
      let errorMessage = "An error occurred. Please try again.";

      // Lấy thông báo lỗi cụ thể từ backend nếu có
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi nhấn nút "Cancel"
  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Schedule a Visit"
        open={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            Send Request
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          name="visit_request_form"
        >
          <Form.Item
            name="requestedDateTime"
            label="Requested Date & Time"
            rules={[
              {
                required: true,
                message: "Please select your preferred date and time!",
              },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              disabledDate={disabledDate}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="message"
            label="Message (Optional)"
            rules={[
              { max: 500, message: "Message cannot exceed 500 characters." }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="E.g., I'd like to visit around 6 PM. Is that possible?"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default VisitRequestModal;