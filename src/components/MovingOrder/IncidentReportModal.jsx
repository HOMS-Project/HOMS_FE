import React from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Upload,
  message
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const ReportIncidentModal = ({
  open,
  onClose,
  onSubmit,
  form,
  fileList,
  setFileList,
  handleCustomUpload,
  submitting,
  ticketId
}) => {

  const handleOk = () => {
    form.validateFields().then(async (values) => {

      const isUploading = fileList.some(
        (file) => file.status === "uploading"
      );

      if (isUploading) {
        message.warning("Vui lòng đợi ảnh/video tải lên hoàn tất!");
        return;
      }

      const uploadedUrls = fileList
        .filter((file) => file.status === "done")
        .map((file) => file.response);

      await onSubmit({
        ticketId,
        mediaUrls: uploadedUrls,
        ...values
      });
    });
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  return (
    <Modal
      title="Báo cáo sự cố đơn hàng"
      open={open}
      onCancel={onClose}
      confirmLoading={submitting}
      okText="Gửi báo cáo"
      cancelText="Hủy"
      onOk={handleOk}
    >
      <Form form={form} layout="vertical">

        <Form.Item
          name="type"
          label="Loại sự cố"
          rules={[{ required: true, message: "Vui lòng chọn loại sự cố" }]}
        >
          <Select placeholder="Chọn loại sự cố">
            <Select.Option value="DAMAGE">Hư hỏng đồ đạc</Select.Option>
            <Select.Option value="LOSS">Mất mát tài sản</Select.Option>
            <Select.Option value="STAFF">Thái độ nhân viên</Select.Option>
            <Select.Option value="OTHER">Khác</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[{ required: true, message: "Vui lòng mô tả chi tiết" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Vui lòng mô tả chi tiết sự cố..."
          />
        </Form.Item>

        <Form.Item label="Hình ảnh/Video (tối đa 5 file)">
          <Upload
            customRequest={handleCustomUpload}
            fileList={fileList}
            onChange={handleFileChange}
            listType="picture-card"
            accept="image/*,video/*"
            multiple
          >
            {fileList.length >= 5 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default ReportIncidentModal;