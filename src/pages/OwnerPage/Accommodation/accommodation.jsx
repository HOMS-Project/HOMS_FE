// file TroNhanh_FE/src/pages/OwnerPage/Accommodation/ManageBoardingHouses.jsx

import React, { useState, useEffect } from "react";
// ✅ Import thêm Upload
import {
    Table,
    Button,
    Tag,
    Modal,
    Carousel,
    message,
    Input,
    InputNumber,
    Form,
    Space,
    Upload,
    Select
} from "antd";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { geocodeWithOpenCage } from "../../../services/OpenCage";
import "./accommodation.css";
import {
    getOwnerBoardingHouses,
    getOwnerMembershipInfo,
    createBoardingHouse,
    deleteBoardingHouse,
    updateBoardingHouse,
    getBoardingHouseById,
    addRoomsToBoardingHouse,
} from "../../../services/boardingHouseAPI";
import useUser from "../../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../services/axiosInstance";

// ✅ Hàm trợ giúp để lấy fileList từ event của Upload component
const normFile = (e) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e && e.fileList;
};

const ManageBoardingHouses = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const { user } = useUser();
    const [form] = Form.useForm();
    const [manageForm] = Form.useForm();

    const [boardingHouses, setBoardingHouses] = useState([]);
    const [membershipInfo, setMembershipInfo] = useState(null);
    const [selectedBoardingHouse, setSelectedBoardingHouse] = useState(null);
    const [detailedHouse, setDetailedHouse] = useState(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    // Manage rooms modal state
    const [isManageRoomsModalVisible, setIsManageRoomsModalVisible] =
        useState(false);
    const [manageExistingRooms, setManageExistingRooms] = useState([]); // existing rooms fetched
    const [existingFilesMap, setExistingFilesMap] = useState({}); // { roomId: [File, ...] }
    const [editingBoardingHouse, setEditingBoardingHouse] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?._id) {
            fetchBoardingHouses();
            fetchMembershipInfo();
        }
    }, [user]);

    const fetchMembershipInfo = async () => {
        try {
            const response = await getOwnerMembershipInfo();
            setMembershipInfo({
                name: response.membershipInfo.packageName,
                currentPosts: response.membershipInfo.currentPostsCount,
                maxPosts: response.membershipInfo.postsAllowed,
            });
        } catch (error) {
            console.error("Error fetching membership info:", error);
        }
    };

    const fetchBoardingHouses = async () => {
        try {
            const data = await getOwnerBoardingHouses(user._id);
            setBoardingHouses(data.map((item) => ({ ...item, key: item._id })));
        } catch (error) {
            console.error("Error fetching boarding houses:", error);
            messageApi.error("Không thể tải danh sách nhà trọ.");
        }
    };

    const handleView = (record) => {
        setSelectedBoardingHouse(record);
        setIsViewModalVisible(true);
    };

    const openManageRoomsModal = async (boardingHouseId) => {
        try {
            const data = await getBoardingHouseById(boardingHouseId);
            setManageExistingRooms(Array.isArray(data.rooms) ? data.rooms : []);
            setExistingFilesMap({});
            setIsManageRoomsModalVisible(true);
        } catch (err) {
            console.error("Failed to load rooms for manage modal", err);
            messageApi.error("Không thể tải danh sách phòng");
        }
    };

    const handleExistingUploadChange = (roomId, info) => {
        const files =
            info && info.fileList
                ? info.fileList.map((f) => f.originFileObj || f)
                : [];
        setExistingFilesMap((prev) => ({ ...prev, [roomId]: files }));
    };

    const handleManageRoomsSubmit = async (values) => {
        try {
            // 1) Create new rooms (if any)
            const newRooms = values?.newRooms || [];
            if (newRooms.length > 0) {
                const fd = new FormData();
                const roomsPayload = newRooms.map((r, idx) => ({
                    tempId: `nr_${Date.now()}_${idx}`,
                    roomNumber: r.roomNumber,
                    price: Number(r.price),
                    area: Number(r.area),
                    description: r.description,
                }));
                fd.append("rooms", JSON.stringify(roomsPayload));

                const photosMap = {};
                newRooms.forEach((r, idx) => {
                    const tempId = roomsPayload[idx].tempId;
                    const roomFiles = r.upload || [];
                    if (Array.isArray(roomFiles) && roomFiles.length > 0) {
                        photosMap[tempId] = roomFiles.map((f) => f.name);
                        roomFiles.forEach((f) => {
                            if (f.originFileObj) fd.append("files", f.originFileObj, f.name);
                        });
                    }
                });
                fd.append("photosMap", JSON.stringify(photosMap));

                await addRoomsToBoardingHouse(selectedBoardingHouse._id, fd);
            }

            // 2) Upload photos for existing rooms
            const entries = Object.entries(existingFilesMap || {});
            if (entries.length > 0) {
                await Promise.all(
                    entries.map(async ([roomId, files]) => {
                        if (!Array.isArray(files) || files.length === 0) return;
                        const fd2 = new FormData();
                        files.forEach((f) =>
                            fd2.append("files", f, f.name || f.fileName || "file")
                        );
                        await axiosInstance.post(`rooms/${roomId}/photos`, fd2, {
                            headers: { "Content-Type": "multipart/form-data" },
                        });
                    })
                );
            }

            messageApi.success("Cập nhật phòng thành công");
            setIsManageRoomsModalVisible(false);
            setExistingFilesMap({});
            manageForm.resetFields();
            // refresh details
            if (selectedBoardingHouse) {
                const data = await getBoardingHouseById(selectedBoardingHouse._id);
                setDetailedHouse(data);
                fetchBoardingHouses();
            }
        } catch (err) {
            console.error("Error managing rooms", err);
            messageApi.error(err.response?.data?.message || "Lỗi khi cập nhật phòng");
        }
    };

    const handleRemove = async (id) => {
        if (
            window.confirm(
                "Bạn có chắc chắn muốn xóa nhà trọ này không? Mọi phòng bên trong cũng sẽ bị xóa."
            )
        ) {
            try {
                await deleteBoardingHouse(id);
                setBoardingHouses(boardingHouses.filter((item) => item._id !== id));
                fetchMembershipInfo();
                messageApi.success("Xóa nhà trọ thành công!");
            } catch (error) {
                console.error("Error deleting boarding house:", error);
                messageApi.error(
                    error.response?.data?.message || "Lỗi khi xóa nhà trọ."
                );
            }
        }
    };

    const handleUpdate = (record) => {
        setEditingBoardingHouse({ ...record, files: [] });
        setIsUpdateModalVisible(true);
    };

    const handleAddClick = () => {
        if (
            membershipInfo &&
            membershipInfo.currentPosts >= membershipInfo.maxPosts
        ) {
            messageApi.warning(
                "Bạn đã đạt giới hạn bài đăng. Vui lòng nâng cấp gói thành viên."
            );
            return;
        }
        setIsAddModalVisible(true);
    };

    const columns = [
        { title: "Tên nhà trọ", dataIndex: "name" },
        { title: "Địa chỉ", dataIndex: ["location", "street"] },
        { title: "Quận", dataIndex: ["location", "district"] },
        {
            title: "Giá (VND)",
            key: "price",
            render: (_, record) => (
                <span>
                    {record.minPrice?.toLocaleString() || "N/A"} -{" "}
                    {record.maxPrice?.toLocaleString() || "N/A"}
                </span>
            ),
        },
        {
            title: "Phòng",
            key: "rooms",
            render: (_, record) => (
                <Tag color="cyan">
                    {`${record.availableRoomsCount}/${record.totalRooms}`} trống
                </Tag>
            ),
        },
        {
            title: "Trạng thái duyệt",
            dataIndex: "approvedStatus",
            render: (status) => {
                let color = "default";
                switch (status) {
                    case "approved":
                        color = "green";
                        break;
                    case "pending":
                        color = "blue";
                        break;
                    case "rejected":
                        color = "red";
                        break;
                    default:
                        color = "default";
                }
                return <Tag color={color}>{status?.toUpperCase()}</Tag>;
            },
        },
        {
            title: "Hành động",
            render: (_, record) => (
                <Space>
                    <Button onClick={() => handleView(record)}>Xem</Button>
                    <Button onClick={() => handleUpdate(record)}>Sửa</Button>
                    <Button danger onClick={() => handleRemove(record._id)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const handleAddFormSubmit = async (values) => {
        try {
            const { name, description, location, rooms } = values;
            const fullAddress = `${location.street}, ${location.district}, Đà Nẵng`;
            const coords = await geocodeWithOpenCage(fullAddress);

            if (!coords) {
                return messageApi.error("Không thể lấy tọa độ từ địa chỉ.");
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("ownerId", user._id);
            formData.append("location", JSON.stringify({ ...location, ...coords }));
            formData.append("rooms", JSON.stringify(rooms || [])); // Đảm bảo rooms là mảng
            if (values.amenities && values.amenities.length > 0) {
                formData.append("amenities", JSON.stringify(values.amenities));
            }
            // ✅ Logic xử lý file ảnh (nhà trọ) và ảnh từng phòng
            if (values.upload && values.upload.length > 0) {
                values.upload.forEach((file) => {
                    formData.append("photos", file.originFileObj);
                });
            }

            // Build photosMap from rooms' upload fields: key by roomNumber
            const photosMap = {};
            if (rooms && Array.isArray(rooms)) {
                rooms.forEach((r, idx) => {
                    const roomFiles = r.upload || [];
                    if (Array.isArray(roomFiles) && roomFiles.length > 0) {
                        photosMap[String(r.roomNumber || idx)] = roomFiles.map(
                            (f) => f.name
                        );
                        roomFiles.forEach((f) => {
                            if (f.originFileObj)
                                formData.append("files", f.originFileObj, f.name);
                        });
                    }
                });
            }

            formData.append("photosMap", JSON.stringify(photosMap));

            await createBoardingHouse(formData);
            messageApi.success("Thêm nhà trọ thành công!");
            setIsAddModalVisible(false);
            fetchBoardingHouses();
            fetchMembershipInfo();
            form.resetFields();
        } catch (error) {
            console.error("Error adding boarding house:", error);
            messageApi.error(
                error.response?.data?.message || "Lỗi khi thêm nhà trọ."
            );
        }
    };

    const handleUpdateFormSubmit = async (values) => {
        try {
            const { name, description, location, amenities } = values;
            const fullAddress = `${location.street}, ${location.district}, Đà Nẵng`;
            const coords = await geocodeWithOpenCage(fullAddress);

            if (!coords) {
                return messageApi.error("Không thể lấy tọa độ từ địa chỉ đã nhập.");
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("location", JSON.stringify({ ...location, ...coords }));
            if (amenities && amenities.length > 0) {
                formData.append("amenities", JSON.stringify(amenities));
            }
            if (values.upload && values.upload.length > 0) {
                values.upload.forEach((file) => {
                    if (file.originFileObj) {
                        // Chỉ thêm các file mới được người dùng chọn
                        formData.append("photos", file.originFileObj);
                    }
                });
            }

            // Gọi API cập nhật
            await updateBoardingHouse(editingBoardingHouse._id, formData);

            messageApi.success(
                "Cập nhật nhà trọ thành công! Bài đăng đã được chuyển sang trạng thái chờ duyệt lại."
            );
            setIsUpdateModalVisible(false);

            // ✅ THAY ĐỔI QUAN TRỌNG: Thay vì cập nhật thủ công, hãy gọi lại hàm fetch
            fetchBoardingHouses();
        } catch (error) {
            console.error("Error updating boarding house:", error);
            messageApi.error(
                error.response?.data?.message || "Lỗi khi cập nhật nhà trọ."
            );
        }
    };

    return (
        <>
            {contextHolder}
            <div className="accommodation-wrapper">
                <div className="header-row">
                    <h2>Quản lý nhà trọ</h2>
                    <Button className="add-btn" onClick={handleAddClick}>
                        THÊM NHÀ TRỌ
                    </Button>
                </div>

                {membershipInfo && (
                    <div className="membership-info-card">
                        <h3>Thông tin gói thành viên</h3>
                        <p>Gói: {membershipInfo.name}</p>
                        <p>
                            Số bài đăng: {membershipInfo.currentPosts} /{" "}
                            {membershipInfo.maxPosts}
                        </p>
                    </div>
                )}

                <Table
                    className="accommodation-table"
                    columns={columns}
                    dataSource={boardingHouses}
                    pagination={{ pageSize: 10 }}
                />

                {/* MODAL THÊM NHÀ TRỌ */}
                <Modal
                    title="Thêm nhà trọ mới"
                    open={isAddModalVisible}
                    onCancel={() => {
                        setIsAddModalVisible(false);
                        form.resetFields();
                    }}
                    onOk={() => form.submit()}
                    width={800}
                    okText="Thêm mới"
                    cancelText="Hủy"
                >
                    <Form form={form} layout="vertical" onFinish={handleAddFormSubmit}>
                        <Form.Item
                            name="name"
                            label="Tên nhà trọ"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="Mô tả chung"
                            rules={[{ required: true }]}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Form.Item label="Tiện ích" name="amenities">
                            <Select
                                mode="tags"
                                style={{ width: "100%" }}
                                placeholder="Chọn hoặc nhập tiện ích"
                                options={[
                                    { value: "WiFi" },
                                    { value: "Máy lạnh" },
                                    { value: "Giữ xe" },
                                    { value: "Giặt đồ" },
                                    { value: "Camera an ninh" },
                                ]}
                            />
                        </Form.Item>
                        {/* ✅ THÊM MỤC UPLOAD ẢNH */}
                        <Form.Item
                            name="upload"
                            label="Hình ảnh nhà trọ (tối đa 10 ảnh)"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                        >
                            <Upload
                                listType="picture-card"
                                beforeUpload={() => false} // Quan trọng: Ngăn upload tự động
                                multiple
                                maxCount={10}
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            </Upload>
                        </Form.Item>

                        <Space>
                            <Form.Item
                                name={["location", "district"]}
                                label="Quận"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name={["location", "street"]}
                                label="Đường"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Space>
                        <Form.Item
                            name={["location", "addressDetail"]}
                            label="Địa chỉ chi tiết"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>

                        <hr />
                        <h4>Danh sách phòng</h4>
                        <Form.List name="rooms">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space
                                            key={key}
                                            style={{ display: "flex", marginBottom: 8 }}
                                            align="baseline"
                                        >
                                            <Form.Item
                                                {...restField}
                                                name={[name, "roomNumber"]}
                                                rules={[{ required: true, message: "Nhập số phòng" }]}
                                            >
                                                <Input placeholder="Số phòng" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "price"]}
                                                rules={[{ required: true, message: "Nhập giá" }]}
                                            >
                                                <InputNumber
                                                    placeholder="Giá (VND)"
                                                    style={{ width: "100%" }}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "area"]}
                                                rules={[{ required: true, message: "Nhập diện tích" }]}
                                            >
                                                <InputNumber placeholder="Diện tích (m²)" />
                                            </Form.Item>
                                            {/* Upload ảnh riêng cho từng phòng */}
                                            <Form.Item
                                                {...restField}
                                                name={[name, "upload"]}
                                                valuePropName="fileList"
                                                getValueFromEvent={normFile}
                                            >
                                                <Upload
                                                    listType="picture"
                                                    beforeUpload={() => false}
                                                    multiple
                                                    maxCount={5}
                                                >
                                                    <Button>Chọn ảnh phòng</Button>
                                                </Upload>
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Thêm phòng
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form>
                </Modal>

                {/* MODAL XEM CHI TIẾT */}
                <Modal
                    title="Chi tiết nhà trọ"
                    open={isViewModalVisible}
                    onCancel={() => {
                        setIsViewModalVisible(false);
                        setDetailedHouse(null);
                    }}
                    footer={null}
                    width={700}
                >
                    {useEffect(() => {
                        if (isViewModalVisible && selectedBoardingHouse) {
                            const fetchDetails = async () => {
                                try {
                                    const data = await getBoardingHouseById(
                                        selectedBoardingHouse._id
                                    );
                                    setDetailedHouse(data);
                                } catch (error) {
                                    messageApi.error("Không thể tải chi tiết nhà trọ.");
                                }
                            };
                            fetchDetails();
                        }
                    }, [isViewModalVisible, selectedBoardingHouse, messageApi])}

                    {detailedHouse ? (
                        <div>
                            {detailedHouse.photos && detailedHouse.photos.length > 0 && (
                                <Carousel autoplay>
                                    {detailedHouse.photos.map((photo, index) => (
                                        <div key={index}>
                                            <img
                                                src={`http://localhost:5000${photo}`}
                                                alt={`photo-${index}`}
                                                style={{
                                                    width: "100%",
                                                    maxHeight: "300px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            )}
                            <h3>{detailedHouse.name}</h3>
                            <p>
                                <strong>Mô tả:</strong> {detailedHouse.description}
                            </p>
                            <p>
                                <strong>Địa chỉ:</strong>{" "}
                                {`${detailedHouse.location.addressDetail}, ${detailedHouse.location.street}, ${detailedHouse.location.district}`}
                            </p>

                            {detailedHouse.amenities && detailedHouse.amenities.length > 0 && (
                                <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                                    <strong>Tiện ích:</strong>
                                    <div style={{ marginTop: "5px" }}>
                                        {detailedHouse.amenities.map((amenity, index) => (
                                            <Tag color="blue" key={index} style={{ marginBottom: "5px" }}>
                                                {amenity}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <h4>Danh sách phòng:</h4>
                            <div style={{ marginBottom: 12 }}>
                                <Button
                                    type="primary"
                                    onClick={() =>
                                        openManageRoomsModal(selectedBoardingHouse._id)
                                    }
                                >
                                    Thêm/Quản lý phòng
                                </Button>
                            </div>
                            <Table
                                dataSource={detailedHouse.rooms}
                                rowKey={(record) => record._id}
                                columns={[
                                    { title: "Số phòng", dataIndex: "roomNumber" },
                                    {
                                        title: "Giá",
                                        dataIndex: "price",
                                        render: (price) => price.toLocaleString() + " VND",
                                    },
                                    {
                                        title: "Diện tích",
                                        dataIndex: "area",
                                        render: (area) => `${area} m²`,
                                    },
                                    {
                                        title: "Trạng thái",
                                        dataIndex: "status",
                                        render: (status) => (
                                            <Tag color={status === "Available" ? "green" : "red"}>
                                                {status}
                                            </Tag>
                                        ),
                                    },
                                ]}
                                pagination={false}
                                size="small"
                            />
                        </div>
                    ) : (
                        <p>Đang tải dữ liệu...</p>
                    )}
                </Modal>

                {/* MODAL QUẢN LÝ / THÊM PHÒNG (nội bộ, thay thế route riêng) */}
                <Modal
                    title="Thêm / Quản lý phòng"
                    open={isManageRoomsModalVisible}
                    onCancel={() => {
                        setIsManageRoomsModalVisible(false);
                        setExistingFilesMap({});
                        manageForm.resetFields();
                    }}
                    onOk={() => manageForm.submit()}
                    width={900}
                    okText="Lưu"
                    cancelText="Huỷ"
                >
                    <div style={{ marginBottom: 12 }}>
                        <h4>Ảnh cho phòng hiện có</h4>
                        {manageExistingRooms.length === 0 && <p>Không có phòng nào.</p>}
                        {manageExistingRooms.map((room) => (
                            <div
                                key={room._id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: 8,
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <strong>Phòng {room.roomNumber}</strong>
                                    <div style={{ color: "#666" }}>
                                        {room.price?.toLocaleString
                                            ? `${room.price.toLocaleString()} VNĐ`
                                            : ""}{" "}
                                        - {room.area ? `${room.area} m²` : ""}
                                    </div>
                                </div>
                                <div style={{ width: 320 }}>
                                    <Upload
                                        listType="picture"
                                        beforeUpload={() => false}
                                        multiple
                                        maxCount={5}
                                        onChange={(info) =>
                                            handleExistingUploadChange(room._id, info)
                                        }
                                    >
                                        <Button>Chọn ảnh để thêm</Button>
                                    </Upload>
                                </div>
                            </div>
                        ))}
                    </div>

                    <hr />
                    <Form
                        form={manageForm}
                        layout="vertical"
                        onFinish={handleManageRoomsSubmit}
                    >
                        <h4>Thêm phòng mới</h4>
                        <Form.List name="newRooms">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space
                                            key={key}
                                            style={{ display: "flex", marginBottom: 8 }}
                                            align="baseline"
                                        >
                                            <Form.Item
                                                {...restField}
                                                name={[name, "roomNumber"]}
                                                rules={[{ required: true, message: "Nhập số phòng" }]}
                                            >
                                                <Input placeholder="Số phòng" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "price"]}
                                                rules={[{ required: true, message: "Nhập giá" }]}
                                            >
                                                <InputNumber
                                                    placeholder="Giá (VND)"
                                                    style={{ width: "100%" }}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "area"]}
                                                rules={[{ required: true, message: "Nhập diện tích" }]}
                                            >
                                                <InputNumber placeholder="Diện tích (m²)" />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, "upload"]}
                                                valuePropName="fileList"
                                                getValueFromEvent={normFile}
                                            >
                                                <Upload
                                                    listType="picture"
                                                    beforeUpload={() => false}
                                                    multiple
                                                    maxCount={5}
                                                >
                                                    <Button>Chọn ảnh phòng</Button>
                                                </Upload>
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Thêm phòng
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form>
                </Modal>

                {/* MODAL CẬP NHẬT NHÀ TRỌ */}
                <Modal
                    title="Cập nhật thông tin nhà trọ"
                    open={isUpdateModalVisible}
                    onCancel={() => {
                        setIsUpdateModalVisible(false);
                        setEditingBoardingHouse(null); // Xóa dữ liệu đang sửa khi đóng
                        form.resetFields(); // Reset form
                    }}
                    onOk={() => form.submit()}
                    width={800}
                    okText="Lưu thay đổi"
                    cancelText="Hủy"
                >
                    {/* Dùng useEffect để điền dữ liệu vào form khi modal mở */}
                    {useEffect(() => {
                        if (editingBoardingHouse) {
                            form.setFieldsValue({
                                name: editingBoardingHouse.name,
                                description: editingBoardingHouse.description,
                                location: editingBoardingHouse.location,
                                amenities: editingBoardingHouse.amenities || [],
                            });
                        }
                    }, [editingBoardingHouse, form])}

                    {editingBoardingHouse && (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleUpdateFormSubmit}
                        >
                            <Form.Item
                                name="name"
                                label="Tên nhà trọ"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="description"
                                label="Mô tả chung"
                                rules={[{ required: true }]}
                            >
                                <Input.TextArea rows={4} />
                            </Form.Item>

                            <Form.Item label="Tiện ích" name="amenities">
                                <Select
                                    mode="tags"
                                    style={{ width: "100%" }}
                                    placeholder="Chọn hoặc nhập tiện ích"
                                    options={[
                                        { value: "WiFi" },
                                        { value: "Máy lạnh" },
                                        { value: "Giữ xe" },
                                        { value: "Giặt đồ" },
                                        { value: "Camera an ninh" },
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item label="Hình ảnh (bỏ trống nếu không muốn thay đổi)">
                                {/* Hiển thị ảnh cũ */}
                                <div>
                                    {editingBoardingHouse.photos?.map((photo) => (
                                        <img
                                            key={photo}
                                            src={`http://localhost:5000${photo}`}
                                            alt="ảnh cũ"
                                            style={{
                                                width: 102,
                                                height: 102,
                                                objectFit: "cover",
                                                marginRight: 8,
                                                marginBottom: 8,
                                                border: "1px solid #d9d9d9",
                                                borderRadius: 8,
                                            }}
                                        />
                                    ))}
                                </div>
                                {/* Upload ảnh mới */}
                                <Form.Item
                                    name="upload"
                                    valuePropName="fileList"
                                    getValueFromEvent={normFile}
                                    noStyle
                                >
                                    <Upload
                                        listType="picture-card"
                                        beforeUpload={() => false}
                                        multiple
                                        maxCount={10}
                                    >
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Tải ảnh mới</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            </Form.Item>

                            <Space>
                                <Form.Item
                                    name={["location", "district"]}
                                    label="Quận"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name={["location", "street"]}
                                    label="Đường"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Space>
                            <Form.Item
                                name={["location", "addressDetail"]}
                                label="Địa chỉ chi tiết"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>

                            {/* Lưu ý: Việc sửa/xóa/thêm phòng nên được làm ở một giao diện riêng để tránh phức tạp */}
                            <p style={{ color: "#888" }}>
                                Việc quản lý danh sách phòng sẽ được thực hiện ở một chức năng
                                riêng.
                            </p>
                        </Form>
                    )}
                </Modal>
            </div>
        </>
    );
};

export default ManageBoardingHouses;