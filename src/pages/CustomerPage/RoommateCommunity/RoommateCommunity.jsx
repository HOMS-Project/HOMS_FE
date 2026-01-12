import { useEffect, useState } from "react";
import { Card, Avatar, Tag, List, Button, Spin, message, Divider, Space, Image } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useUser from "../../../contexts/UserContext";
import { useSocket } from "../../../contexts/SocketContext";
import { getRoommatePosts } from "../../../services/roommateAPI";
import { getOrCreateChat } from "../../../services/chatService";

dayjs.extend(relativeTime);

const RoommateCommunity = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creatingChatFor, setCreatingChatFor] = useState(null);
    const navigate = useNavigate();
    const { user } = useUser();
    const { socket } = useSocket();

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await getRoommatePosts();
            setPosts(data || []);
        } catch (err) {
            console.error("Failed to load roommate posts", err);
            message.error("Không thể tải bài đăng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleMessage = async (post) => {
        if (!user?._id) {
            message.info("Vui lòng đăng nhập để nhắn tin.");
            return;
        }

        const postUserId = post.userId?._id || post.userId;
        setCreatingChatFor(postUserId);
        try {
            const { data: chat } = await getOrCreateChat(user._id, postUserId);
            socket?.emit?.("joinRoom", chat._id);

            navigate("/customer/communication", {
                state: {
                    chatId: chat._id,
                    otherUserId: postUserId,
                    otherUserName: post.userId?.name,
                    otherUserAvatar: post.userId?.avatar,
                },
            });
        } catch (err) {
            console.error("Failed to create/get chat", err);
            message.error("Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.");
        } finally {
            setCreatingChatFor(null);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 20 }}>Bảng tin tìm bạn trọ</h2>

            {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <Spin />
                </div>
            ) : (
                <List
                    grid={{ gutter: 16, column: 2 }}
                    dataSource={posts}
                    locale={{ emptyText: "Chưa có bài đăng tìm bạn trọ" }}
                    renderItem={(post) => {
                        const postAuthorId = post.userId?._id || post.userId;
                        const isAuthor = user && postAuthorId === user._id;

                        const now = dayjs();
                        const created = dayjs(post.createdAt);
                        const diffHours = now.diff(created, "hour");
                        let timeDisplay = "";
                        if (diffHours < 1) {
                            const diffMinutes = now.diff(created, "minute");
                            timeDisplay = diffMinutes < 1 ? "Vừa xong" : `${diffMinutes} phút trước`;
                        } else if (diffHours < 24) {
                            timeDisplay = `${diffHours} tiếng trước`;
                        } else {
                            timeDisplay = created.format("DD/MM/YYYY [lúc] hh:mm A");
                        }

                        return (
                            <List.Item key={post._id}>
                                <Card
                                    hoverable
                                    style={{
                                        borderRadius: 12,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                    }}
                                    title={
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <Avatar
                                                src={post.userId?.avatar ? `http://localhost:5000${post.userId.avatar}` : undefined}
                                                style={{ backgroundColor: "#004d40" }}
                                            >
                                                {!post.userId?.avatar && post.userId?.name?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{post.userId?.name || "Người dùng ẩn danh"}</div>
                                                <div style={{ fontSize: 12, color: "#666" }}>{timeDisplay}</div>
                                            </div>
                                        </div>
                                    }
                                    cover={
                                        post.images && post.images.length > 0 ? (
                                            <img
                                                src={`http://localhost:5000${post.images[0]}`}
                                                alt="post"
                                                style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                                            />
                                        ) : null
                                    }
                                >
                                    <p style={{ fontStyle: "italic", color: "#444", marginBottom: 12 }}>
                                        {post.intro || "Không có giới thiệu."}
                                    </p>

                                    {post.images && post.images.length > 0 && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Image.PreviewGroup>
                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                    {post.images.map((img, idx) => (
                                                        <Image
                                                            key={idx}
                                                            src={`http://localhost:5000${img}`}
                                                            width={90}
                                                            height={60}
                                                            style={{ objectFit: 'cover', borderRadius: 6 }}
                                                            alt={`roommate-${idx}`}
                                                        />
                                                    ))}
                                                </div>
                                            </Image.PreviewGroup>
                                        </div>
                                    )}

                                    <Divider style={{ margin: "8px 0" }} />

                                    {/* gender preference */}
                                    <div style={{ marginBottom: 8 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Giới tính mong muốn:</div>
                                        <Tag
                                            color={
                                                post.genderPreference === "male"
                                                    ? "geekblue"
                                                    : post.genderPreference === "female"
                                                        ? "magenta"
                                                        : "default"
                                            }
                                            style={{ fontSize: 13, padding: "2px 8px" }}
                                        >
                                            {post.genderPreference === "male"
                                                ? "Nam"
                                                : post.genderPreference === "female"
                                                    ? "Nữ"
                                                    : "Không quan tâm"}
                                        </Tag>
                                    </div>

                                    {/* living habits */}
                                    {post.habits?.length > 0 && (
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: 4 }}>Thói quen sinh hoạt:</div>
                                            <Space wrap>
                                                {post.habits.map((h, idx) => (
                                                    <Tag key={idx} color="green" style={{ fontSize: 13, padding: "2px 8px" }}>
                                                        {h}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        </div>
                                    )}

                                    <Divider style={{ margin: "12px 0" }} />

                                    {/* Actions */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 10,
                                            marginTop: 16,
                                        }}
                                    >
                                        {post.boardingHouseId && (
                                            <Button
                                                type="primary"
                                                size="middle"
                                                style={{
                                                    background: "linear-gradient(90deg, #576b33 0%, #5576b33 100%)",
                                                    borderColor: "#adc6ff",
                                                    borderRadius: 8,
                                                    fontWeight: 500,
                                                    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
                                                }}
                                                onClick={() =>
                                                    navigate(`/customer/property/${post.boardingHouseId?._id || post.boardingHouseId}`)
                                                }
                                            >
                                                Xem nhà trọ
                                            </Button>
                                        )}

                                        {!isAuthor && (
                                            <Button
                                                type="primary"
                                                size="middle"
                                                style={{
                                                    borderRadius: 8,
                                                    background: "linear-gradient(90deg, #999fa8ff 0%, #5576b33 100%)",
                                                    fontWeight: 500,
                                                    boxShadow: "0 2px 6px rgba(22, 119, 255, 0.25)",
                                                }}
                                                onClick={() => handleMessage(post)}
                                                loading={creatingChatFor === post.userId?._id}
                                            >
                                                Nhắn tin
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </List.Item>
                        );
                    }}
                />
            )}
        </div>
    );
};

export default RoommateCommunity;
