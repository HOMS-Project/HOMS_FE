import React, { useEffect, useState } from "react";
import {
  Typography,
  Form,
  Input,
  Button,
  Select,
  message as antMessage,
  Spin,
  Card,
  Alert,
} from "antd";
import { createReport, getOwner, checkBookingHistory } from "../../../services/reportService";
import useUser from "../../../contexts/UserContext";
import { ExclamationCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ReportPage = () => {
  const [form] = Form.useForm();
  const { user, loading: userLoading } = useUser();
  const [messageApi, contextHolder] = antMessage.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isEligible, setIsEligible] = useState(null);

  useEffect(() => {
    const fetchUsersAndCheck = async () => {
      try {
        const res = await getOwner();
        const otherUsers = res.data.filter((u) => u._id !== user?._id);
        setUsers(otherUsers);

        if (otherUsers.length > 0) {
          const firstUserId = otherUsers[0]._id;
          form.setFieldsValue({ reportedUserId: firstUserId });

          const historyRes = await checkBookingHistory(firstUserId);
          setIsEligible(historyRes.data?.hasHistory);
        } else {
          setIsEligible(false);
        }
      } catch (error) {
        console.error("❌ Failed to fetch users or check history", error);
        setIsEligible(false);
      }
    };

    if (user) fetchUsersAndCheck();
  }, [user, form]);

  const handleReportedUserChange = async (value) => {
    form.setFieldsValue({ reportedUserId: value });
    try {
      const res = await checkBookingHistory(value);
      setIsEligible(res.data?.hasHistory);


      if (res.data?.hasHistory) {
        const bookingList = res.data?.bookings || [];
        setBookings(bookingList);

        if (bookingList.length > 0) {
          form.setFieldsValue({
            bookingId: bookingList[0]._id,
            accommodationId: bookingList[0].propertyId,
          });
        }
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("❌ Failed to check booking history", err);
      setIsEligible(false);
      setBookings([]);
    }
  };
  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const payload = { ...values };
      console.log("✔️ Payload sent:", payload);
      await createReport(payload);
      messageApi.open({
        type: "success",
        content: "Report submitted successfully!",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
      form.resetFields();
      setIsEligible(null);
      setIsEligible(null);
    } catch (error) {
      console.error("❌ Report submission failed:", error);
      messageApi.error(error?.response?.data?.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Title level={4}>Please log in to submit a report.</Title>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: 24, background: "#f9f9f9", minHeight: "100vh" }}>
      {contextHolder}
      <Card bordered={false} style={{ background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: 8 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 0 }}>
          Submit a Report to Administrator
        </Title>

        <Paragraph style={{ textAlign: "center", color: "#888", marginBottom: 24 }}>
          If you encounter issues such as fraud, fake listings, or abusive landlords, please submit a report.
        </Paragraph>

        <Alert
          type="info"
          showIcon
          message={
            <span>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              Your report is <b>confidential</b> and only visible to administrators.
            </span>
          }
          style={{ marginBottom: 24 }}
        />

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* NGƯỜI BỊ BÁO CÁO */}
          <Form.Item
            label="Reported User"
            name="reportedUserId"
            rules={[{ required: true, message: "Please select a user to report." }]}
          >
            <Select
              showSearch
              placeholder="Select user to report"
              onChange={handleReportedUserChange}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {users.map((u) => (
                <Option key={u._id} value={u._id}>
                  {u.name || u.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* CẢNH BÁO KHÔNG ĐỦ ĐIỀU KIỆN */}
          {isEligible === false && (
            <Alert
              type="warning"
              showIcon
              message="You cannot submit a report because you have no booking history with this landlord."
              description="Only users with whom you have booking history (paid or approved) can be reported."
              style={{ marginBottom: 24 }}
            />
          )}

          {/* CHỈ HIỆN FORM KHI ĐỦ ĐIỀU KIỆN */}
          {isEligible && (
            <>
              {/* LOẠI BÁO CÁO */}
              <Form.Item
                label="Report Category"
                name="type"
                rules={[{ required: true, message: "Please select a report category." }]}
              >
                <Select placeholder="Select report category">
                  <Option value="Landlord Complaint">Landlord Complaint</Option>
                  <Option value="Fake Listing">Fake Listing</Option>
                  <Option value="Scam Behavior">Scam Behavior</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>

              {/* NỘI DUNG */}
              <Form.Item
                label="Report Details"
                name="content"
                rules={[{ required: true, message: "Please enter your report details." }]}
              >
                <TextArea rows={4} placeholder="Describe the issue you encountered..." />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </Button>
              </Form.Item>
            </>
          )}

        </Form>
      </Card>
    </div >
  );
}


export default ReportPage;
