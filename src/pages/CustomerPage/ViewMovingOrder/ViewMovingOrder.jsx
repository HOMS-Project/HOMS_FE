import React from "react";
import { Layout, Table, Tag, Empty, Button, Card } from "antd";
import {
    EnvironmentOutlined,
    CalendarOutlined,
    PhoneOutlined,
    InboxOutlined,
} from "@ant-design/icons";
import { FaBoxOpen } from "react-icons/fa";

import AppHeader from "../../../components/header/header";
import AppFooter from "../../../components/footer/footer";

import "./style.css";

const { Content } = Layout;

const ViewMovingOrder = ({ movingOrders }) => {
    // If no moving order found
    // if (!movingOrders) {
    //     return (
    //         <Layout className="view-order-page">
    //             <AppHeader />
    //             <Content className="empty-container">
    //                 <Empty
    //                     image={<InboxOutlined style={{ fontSize: 80, color: "#44624A" }} />}
    //                     description="Không tìm thấy đơn chuyển nhà nào"
    //                 >
    //                     <Button type="primary" className="btn-primary">
    //                         Tạo đơn mới
    //                     </Button>
    //                 </Empty>
    //             </Content>
    //             <AppFooter />
    //         </Layout>
    //     );
    // }

    // Sample columns for schedule table
    const columns = [
        {
            title: "Thời Gian",
            dataIndex: "time",
        },
        {
            title: "Chuyển từ",
            dataIndex: "from",
        },
        {
            title: "Chuyển đến",
            dataIndex: "to",
        },
        {
            title: "Trạng Thái",
            dataIndex: "status",
            render: (status) => (
                <Tag color={status === "Đang xử lý" ? "processing" : "success"}>
                    {status}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            render: () => (
                <Button type="link" icon={<PhoneOutlined />}>
                    Liên hệ
                </Button>
            ),
        },
    ];

    return (
        <Layout className="view-order-page">
            <AppHeader />

            <Content>
                {/* HERO */}
                <section className="order-hero">
                    <div className="overlay" />
                    <h1>Thông Tin Chi Tiết</h1>
                </section>

                {/* SCHEDULE */}
                <section className="order-section">
                    <h2>Lịch Chuyển Nhà Của Tôi</h2>

                    <Table
                        columns={columns}
                        dataSource={movingOrders ? [movingOrders] : []}
                        pagination={false}
                        rowKey="_id"
                    />
                </section>

                {/* FURNITURE LIST + LAYOUT */}
                <section className="order-layout-section">
                    <div className="furniture-list">
                        <h3>Danh Sách Đồ Đạc</h3>

                        {movingOrders?.items?.map((item, index) => (
                            <div key={index} className="furniture-item">
                                <span>{item.name}</span>
                                <strong>x{item.quantity}</strong>
                            </div>
                        ))}
                    </div>

                    <Card className="layout-preview">
                        <h3>Sơ đồ phòng</h3>
                        <div className="layout-box">
                            <p>Preview layout ở đây</p>
                        </div>
                    </Card>
                </section>
            </Content>

            <AppFooter />
        </Layout>
    );
};

export default ViewMovingOrder;
