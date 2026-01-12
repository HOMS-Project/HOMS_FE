// components/RoommatePostModal.jsx
import { Modal, Form, Input, Select, Checkbox, Button, message } from 'antd';
import { useState } from 'react';
import { createRoommatePost } from '../../../services/roommateAPI';

const HABIT_OPTIONS = [
  "Ngăn nắp, sạch sẽ",
  "Yên tĩnh",
  "Hút thuốc",
  "Thường thức khuya",
  "Nấu ăn tại nhà",
  "Có thú cưng",
  "Thích giao lưu",
  "Học tập/làm việc tại nhà"
];

const RoommatePostModal = ({ visible, onClose, boardingHouseId, roomId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    if (!roomId) {
      message.error('Không tìm thấy thông tin phòng!');
      return;
    }

    setLoading(true);
    try {
      console.log('[RoommatePostModal] submit payload:', { ...values, boardingHouseId, roomId });
      const newPost = await createRoommatePost({
        ...values,
        boardingHouseId,
        roomId,
      });
      message.success('Đăng bài thành công!');
      form.resetFields();
      onSuccess?.(newPost); // Trả về dữ liệu bài đăng mới
    } catch (error) {
      console.error("Failed to post roommate", error);
      // normalize error message with nested checks for validation errors
      let errMsg = 'Đăng bài thất bại, vui lòng thử lại!';
      if (!error) {
        errMsg = 'Không nhận được phản hồi từ server.';
      } else if (typeof error === 'string') {
        errMsg = error;
      } else if (error.message) {
        errMsg = error.message;
      }
      // some server responses include an `error` object with more details
      if (error.error && error.error.message) {
        errMsg = error.error.message;
      }
      // mongoose validation errors
      if (error.error && error.error.errors) {
        const details = Object.values(error.error.errors).map(e => e.message).join('; ');
        if (details) errMsg = details;
      }
      // if server returned data.message
      if (error.data && error.data.message) {
        errMsg = error.data.message;
      }
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      title="Đăng bài tìm bạn trọ"
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
            genderPreference: 'other',
            habits: []
          }}
      >
        <Form.Item
          name="intro"
          label="Giới thiệu bản thân"
          rules={[{ required: true, message: 'Vui lòng giới thiệu về bản thân!' }]}
        >
          <Input.TextArea
            placeholder="Giới thiệu ngắn gọn về bản thân, thói quen sinh hoạt, công việc/học tập..."
            rows={4}
          />
        </Form.Item>

        <Form.Item
          name="genderPreference"
          label="Giới tính mong muốn"
          rules={[{ required: true, message: 'Vui lòng chọn giới tính mong muốn!' }]}
        >
          <Select>
            <Select.Option value="other">Không quan trọng</Select.Option>
            <Select.Option value="male">Nam</Select.Option>
            <Select.Option value="female">Nữ</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="habits"
          label="Thói quen sinh hoạt"
          extra="Chọn những thói quen phù hợp với bạn"
        >
          <Checkbox.Group options={HABIT_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="note"
          label="Ghi chú thêm"
        >
          <Input.TextArea
            placeholder="Những yêu cầu hoặc thông tin khác muốn chia sẻ..."
            rows={3}
          />
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Đăng bài
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RoommatePostModal;
