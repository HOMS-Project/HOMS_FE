import { useParams, useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import {
  Row,
  Col,
  Button,
  DatePicker,
  Input,
  Divider,
  Result,
  Card,
  Avatar,
  Select,
  Tag,
  message,
  Modal,
  List,
  Spin,
  Carousel,
  Typography,
  Tabs
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  HeartOutlined,
  HeartFilled,
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  WifiOutlined,
  CarOutlined,
  SkinOutlined,
  SecurityScanOutlined,
  BulbOutlined,
  MessageOutlined,
  TagOutlined, CheckOutlined
} from "@ant-design/icons";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  getBoardingHouseById,
  addToFavorite,
  getUserFavorites,
  removeFromFavorite
} from "../../../services/boardingHouseAPI";
import { getUserBookingForBoardingHouse } from "../../../services/bookingService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./ApartmentDetails.css";
import { useEffect, useState, useRef } from "react";
import useUser from "../../../contexts/UserContext";
import RoommatePostModal from "./RoommatePostModal";
import { getRoommatePosts, deleteRoommatePost } from "../../../services/roommateAPI";
// riel-time messaging
import { useSocket } from "../../../contexts/SocketContext";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Slider from "react-slick";
import { getValidAccessToken } from "../../../services/authService";
import VisitRequestModal from "./VisitRequestModal";
import { summarizeReviews } from "../../../services/aiService";
const { Option } = Select;
const { TextArea } = Input;

const RoomCard = ({ room, onBook, bookingStatus, onView }) => (
  <Card size="small" style={{ marginBottom: 12, cursor: 'pointer' }} bodyStyle={{ padding: "12px" }}>
    <Row align="middle" justify="space-between" gutter={8}>
      <Col flex="auto">
        <p style={{ margin: 0, fontWeight: "bold" }}>Phòng {room.roomNumber}</p>
        <small>{room.area} m²</small>
      </Col>

      <Col>
        <p style={{ margin: 0, color: "#004d40", fontWeight: "bold", whiteSpace: "nowrap" }}>
          {room.price.toLocaleString("vi-VN")} VNĐ/tháng
        </p>
      </Col>

      <Col style={{ minWidth: 120, textAlign: 'right' }}> {/* Đặt chiều rộng tối thiểu cho cột */}
        {onBook ? (
          // 1. Nếu có hàm onBook (phòng 'Available' VÀ user chưa đặt)
          <>
            <Button type="primary" onClick={() => onBook(room._id)} style={{ marginBottom: 8 }}>
              Đặt ngay
            </Button>
            <Button onClick={() => onView && onView(room)} style={{ display: 'block' }}>Xem chi tiết</Button>
          </>
        ) : bookingStatus ? (
          // 2. Nếu có bookingStatus (phòng này là của user, hoặc đã bị đặt, hoặc không có sẵn)
          <>
            <Tag color={
              // Trạng thái booking CỦA BẠN
              bookingStatus === "paid" ? "success" :
                bookingStatus === "approved" ? "cyan" :
                  bookingStatus === "pending_approval" ? "processing" :

                    // Trạng thái chung CỦA PHÒNG (nếu không phải của bạn)
                    bookingStatus === "Booked" ? "error" : // Đã bị người khác đặt
                      bookingStatus === "Unavailable" ? "default" : // Không có sẵn
                        "default"
            }>
              {/* Dịch trạng thái */}
              {bookingStatus === "paid" ?
                room.hasRoommatePost ? "Tìm bạn trọ" : "Đã đặt" :
                bookingStatus === "approved" ? "Chờ thanh toán" :
                  bookingStatus === "pending_approval" ? "Chờ duyệt" :
                    bookingStatus === "Booked" ?
                      room.hasRoommatePost ? "Tìm bạn trọ" : "Đã có người đặt" :
                      bookingStatus === "Unavailable" ? "Không có sẵn" :
                        bookingStatus} {/* Fallback */}
            </Tag>
            <Button onClick={() => onView && onView(room)} style={{ display: 'block', marginTop: 8 }}>Xem chi tiết</Button>
          </>
        ) : (
          // Trường hợp không xác định: chỉ hiển thị nút xem
          <Button onClick={() => onView && onView(room)}>Xem chi tiết</Button>
        )}
      </Col>
    </Row>
  </Card>
);


const PropertyDetails = () => {
  const { Title, Paragraph } = Typography;

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { socket, isConnected, onlineUsers } = useSocket();
  const [messageApi, contextHolder] = message.useMessage();

  const [userBooking, setUserBooking] = useState(null);

  const [boardingHouse, setBoardingHouse] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [roommatePosts, setRoommatePosts] = useState([]);
  const sliderRef = useRef();

  // Review states
  const [reviewContent, setReviewContent] = useState("");
  const [reviewPurpose, setReviewPurpose] = useState("");
  const [reviewRating, setReviewRating] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedReviewContent, setEditedReviewContent] = useState("");
  const [editedReviewRating, setEditedReviewRating] = useState(null);
  const [editedReviewPurpose, setEditedReviewPurpose] = useState("");
  const [token, setToken] = useState('');
  const [isVisitModalVisible, setIsVisitModalVisible] = useState(false);
  const [showRoommatePostModal, setShowRoommatePostModal] = useState(false);
  // Room details modal
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const AmenitiesList = ({ amenities }) => {
    let parsedAmenities = [];

    try {
      parsedAmenities = Array.isArray(amenities)
        ? amenities
        : JSON.parse(amenities || "[]");
    } catch (error) {
      parsedAmenities = []; // Nếu parse lỗi thì để rỗng
    }
  }

  const handleSummarizeReviews = async () => {
    try {
      setLoadingSummary(true);
      const reviews = boardingHouse?.reviews?.map(r => r.comment) || [];
      if (reviews.length === 0) {
        messageApi.warning("Không có đánh giá nào để tóm tắt.");
        return;
      }

      const aiSummary = await summarizeReviews(reviews);
      setSummary(aiSummary);
    } catch (err) {
      messageApi.error("Không thể tóm tắt đánh giá.");
    } finally {
      setLoadingSummary(false);
    }
  };


  // Tạo function riêng để fetch boarding-house data
  const fetchBoardingHouseData = async () => {
    try {
      const data = await getBoardingHouseById(id);
      console.log(data)
      setBoardingHouse(data);
      const userToken = await getValidAccessToken();
      setToken(userToken);
      return data; // return fetched data so callers can use freshest value immediately
    } catch (error) {
      console.log("Không tìm thấy nhà trọ!", error);
      return null;
    }
  };

  useEffect(() => {
    fetchBoardingHouseData();
  }, [id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !boardingHouse?._id) return;
      try {
        const favorites = await getUserFavorites();
        const isFav = favorites.some((fav) => fav.boardingHouseId?._id === boardingHouse._id);
        setIsFavorite(isFav);
      } catch (err) {
        console.error("Lỗi khi kiểm tra yêu thích", err);
      }
    };
    checkFavoriteStatus();
  }, [user, boardingHouse?._id]);

  useEffect(() => {
    const checkUserBooking = async () => {
      if (!user || !boardingHouse?._id) return;
      try {
        const bookingData = await getUserBookingForBoardingHouse(user._id, boardingHouse._id);
        setUserBooking(bookingData); // Lưu trữ booking
      } catch (error) {
        setUserBooking(null); // Không tìm thấy booking
      }
    };
    checkUserBooking();
  }, [user, boardingHouse?._id]);

  const fetchRoommates = async () => {
    if (boardingHouse?._id) {
      try {
        const posts = await getRoommatePosts(boardingHouse._id);
        setRoommatePosts(posts);
      } catch (err) {
        console.log("Không thể tải bài đăng tìm phòng", err);
      }
    }
  };

  useEffect(() => {
    fetchRoommates();
  }, [boardingHouse?._id]);

  if (!boardingHouse) {
    return <div className="boarding-house-not-found">Đang tải hoặc không tìm thấy nhà trọ...</div>;
  }

  const toggleFavorite = async () => {
    if (!user) {
      messageApi.warning("Vui lòng đăng nhập để thêm vào yêu thích.");
      return;
    }
    try {
      if (isFavorite) {
        await removeFromFavorite(boardingHouse._id);
        setIsFavorite(false);
        messageApi.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToFavorite({ boardingHouseId: boardingHouse._id });
        setIsFavorite(true);
        messageApi.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      messageApi.error("Cập nhật thất bại");
    }
  };

  const handleBookRoom = (roomId) => {
    if (!user) {
      messageApi.warning("Vui lòng đăng nhập để đặt phòng!");
      return;
    }
    // New flow: go to Checkout first with boardingHouseId and roomId
    navigate('/customer/checkout', { state: { boardingHouseId: id, roomId } });
  };

  const handleViewRoom = (room) => {
    // Re-fetch the latest boarding house data so we have up-to-date roommate posts
    (async () => {
      try {
        const freshBoardingHouse = await fetchBoardingHouseData();
        // Use the freshly returned boarding house (not the stale state var)
        let freshRoom = (freshBoardingHouse && freshBoardingHouse.rooms)
          ? freshBoardingHouse.rooms.find(r => String(r._id) === String(room._id))
          : room;

        // Also fetch roommate posts and attach the matching one for this room
        try {
          const posts = await getRoommatePosts(freshBoardingHouse?._id || boardingHouse?._id);
          if (posts && posts.length > 0) {
            // Only attach posts that are explicitly linked to this room
            const matchedPosts = posts.filter(
              (p) => p.roomId && (String(p.roomId) === String(room._id) || String(p.roomId) === String(freshRoom?._id))
            );
            if (matchedPosts.length > 0) {
              // If there are multiple matches for the room, pick the latest
              const latest = matchedPosts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
              freshRoom = {
                ...(freshRoom || room),
                hasRoommatePost: true,
                roommatePost: latest,
              };
            }
            // If no matchedPosts, do not attach any roommate post for this room
          }
        } catch (postErr) {
          console.error('Error fetching roommate posts when opening room modal', postErr);
        }

        setSelectedRoom(freshRoom || room);
      } catch (err) {
        console.error('Error refreshing boarding house data before opening room modal', err);
        setSelectedRoom(room);
      } finally {
        setRoomModalVisible(true);
      }
    })();
  };

  const handleRoomModalClose = () => {
    setRoomModalVisible(false);
    setSelectedRoom(null);
  };

  const handleEditRoommatePost = (post) => {
    // TODO: Implement edit functionality
    messageApi.info('Tính năng đang được phát triển');
  };

  const handleDeleteRoommatePost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
      return;
    }
    try {
      await deleteRoommatePost(postId);
      // Cập nhật selectedRoom
      if (selectedRoom) {
        setSelectedRoom({
          ...selectedRoom,
          hasRoommatePost: false,
          roommatePost: null
        });
      }
      // Cập nhật lại toàn bộ dữ liệu
      await fetchBoardingHouseData();
      messageApi.success('Đã xóa bài đăng thành công');
    } catch (error) {
      console.error('Failed to delete post:', error);
      messageApi.error('Không thể xóa bài đăng. Vui lòng thử lại!');
    }
  };

  const handleContactOwner = async () => {
    if (!user) {
      messageApi.warning("Vui lòng đăng nhập để liên hệ chủ nhà!");
      return;
    }

    if (!boardingHouse?.ownerId?._id) {
      messageApi.error("Không tìm thấy thông tin chủ nhà!");
      return;
    }

    try {
      // Create or get existing chat
      const res = await axios.post("http://localhost:5000/api/chats/get-or-create", {
        user1Id: user._id,
        user2Id: boardingHouse.ownerId._id,
      });

      const chat = res.data;

      // Join socket room
      if (socket) {
        socket.emit("joinRoom", chat._id);
        console.log(`🔌 Joined chat room: ${chat._id}`);
      }

      // Navigate to communication page with owner ID
      navigate(`/customer/communication`);
      messageApi.success("Đã kết nối với chủ nhà!");
    } catch (error) {
      console.error("Error creating chat:", error);
      messageApi.error("Không thể kết nối với chủ nhà. Vui lòng thử lại!");
    }
  };
  const handleScheduleVisitClick = () => {
    if (!user) {
      messageApi.warning("Please log in to schedule a visit.");
      return;
    }

    if (user._id === boardingHouse.ownerId?._id) {
      messageApi.info("You cannot schedule a visit for your own accomodation.");
      return;
    }
    setIsVisitModalVisible(true);
  };

  const handleVisitModalClose = () => {
    setIsVisitModalVisible(false);
  };

  const handleVisitModalSuccess = () => {
    setIsVisitModalVisible(false);
    messageApi.success("Your visit request has been sent to the owner!");
  };

  const renderBookingSection = () => {
    // 1. Kiểm tra ban đầu
    if (!boardingHouse || !boardingHouse.rooms) return null;

    // 2. Lấy dữ liệu cần thiết
    const rooms = boardingHouse.rooms;
    const availableRooms = rooms.filter(room => room.status === 'Available');
    const hasAvailableRooms = availableRooms.length > 0;

    // Lấy ID và trạng thái của phòng mà user đã đặt (nếu có)
    const userBookedRoomId = userBooking?.roomId;
    const userBookingStatus = userBooking?.contractStatus || userBooking?.status;

    // 3. Render JSX
    return (
      <Card className="booking-card">
        <h3 className="booking-price">
          {boardingHouse.minPrice?.toLocaleString("vi-VN")} -{" "}
          {boardingHouse.maxPrice?.toLocaleString("vi-VN")} VNĐ/tháng
        </h3>
        <Divider />

        {/* Hiển thị thông báo nếu user đã đặt */}
        {userBooking && (
          <Result
            status="success"
            title="Bạn đã có một yêu cầu cho nhà trọ này!"
            subTitle="Kiểm tra trạng thái phòng của bạn bên dưới."
            style={{ padding: '16px 0' }}
          />
        )}

        {/* Hiển thị thông báo nếu hết phòng VÀ user chưa đặt */}
        {!userBooking && !hasAvailableRooms && (
          <Result
            status="warning"
            title="Đã hết phòng"
            subTitle="Rất tiếc, tất cả các phòng tại đây đã được đặt."
            style={{ padding: '16px 0' }}
          />
        )}

        <h4>Danh sách phòng:</h4>
        <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "8px" }}>
          {/* Lặp qua TẤT CẢ các phòng */}
          {rooms.map((room) => {
            let cardProps = {};

            if (userBookedRoomId === room._id) {
              // 1. Đây là phòng user đã đặt/yêu cầu
              cardProps.bookingStatus = userBookingStatus;
            } else if (room.status === 'Available') {
              // 2. Phòng này còn trống
              cardProps.onBook = handleBookRoom;
            } else {
              // 3. Phòng này đã bị người khác đặt ('Booked') hoặc 'Unavailable'
              cardProps.bookingStatus = room.status;
            }

            return (
              <RoomCard
                key={room._id}
                room={room}
                onView={handleViewRoom}
                {...cardProps}
              />
            );
          })}
        </div>

        <Divider />

        <Button
          icon={<MessageOutlined />}
          onClick={handleScheduleVisitClick} // Giả sử hàm này tồn tại
          style={{ width: "100%", marginTop: "8px" }}
        >
          Yêu cầu xem phòng
        </Button>
        <Button
          icon={<MessageOutlined />}
          onClick={handleContactOwner}
          style={{ width: '100%', marginTop: '8px' }}
          type="primary"
        >
          Liên hệ chủ nhà
        </Button>
      </Card>
    );
  };
  const sliderSettings = {
    dots: false,
    infinite: roommatePosts.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  // Review handlers
  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewContent || !reviewPurpose) {
      messageApi.error("Vui lòng điền đầy đủ thông tin đánh giá.");
      return;
    }
    try {
      // ✅ SỬA: Dùng boardingHouse._id
      const response = await fetch(`http://localhost:5000/api/boarding-houses/${boardingHouse._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewRating, comment: reviewContent, purpose: reviewPurpose }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gửi đánh giá thất bại');
      }
      messageApi.success("Gửi đánh giá thành công!");
      fetchBoardingHouseData(); // Tải lại toàn bộ dữ liệu
      setReviewContent("");
      setReviewPurpose("");
      setReviewRating(null);
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  const handleEditReview = async (reviewId) => {
    try {
      // ✅ SỬA: Dùng boardingHouse._id
      const response = await fetch(`http://localhost:5000/api/boarding-houses/${boardingHouse._id}/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: editedReviewRating, comment: editedReviewContent, purpose: editedReviewPurpose }),
      });
      const result = await response.json();
      if (response.ok) {
        messageApi.success("Cập nhật đánh giá thành công!");
        // ✅ SỬA: Dùng setBoardingHouse
        setBoardingHouse(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => (r._id === reviewId ? result.review : r)),
        }));
        setEditingReviewId(null);
      } else {
        throw new Error(result.message || "Cập nhật đánh giá thất bại.");
      }
    } catch (err) {
      messageApi.error(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    try {
      // ✅ SỬA: Dùng boardingHouse._id
      const response = await fetch(`http://localhost:5000/api/boarding-houses/${boardingHouse._id}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        messageApi.success("Xóa đánh giá thành công.");
        // ✅ SỬA: Dùng setBoardingHouse
        setBoardingHouse(prev => ({
          ...prev,
          reviews: prev.reviews.filter((r) => r._id !== reviewId),
        }));
      } else {
        const result = await response.json();
        throw new Error(result.message || "Xóa đánh giá thất bại.");
      }
    } catch (err) {
      messageApi.error(err.message);
    }
  };


  // // riel-time messaging section
  // const handleOpen = () => {
  //   if (!user) {
  //     return Modal.warning({ title: "Please login to message the owner." });
  //   }
  //   setIsModalOpen(true);
  //   fetchMessages(); // Load existing chat
  // };

  // const handleSend = async () => {
  //   if (!inputValue.trim()) return;
  //   const messageData = {
  //     senderId: user._id,
  //     receiverId: boardingHouse.ownerId,
  //     boardingHouseId: boardingHouse._id,
  //     text: inputValue,
  //   };
  //   try {
  //     await axios.post(
  //       process.env.REACT_APP_API_URL + "/messages/send",
  //       messageData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${user.token}`,
  //         },
  //       }
  //     );
  //     setMessages((prev) => [
  //       ...prev,
  //       { ...messageData, createdAt: new Date() },
  //     ]);
  //     setInputValue("");
  //   } catch (err) {
  //     console.error("Message send failed", err);
  //   }
  // };

  // const fetchMessages = async () => {
  //   const boardingHouseId = boardingHouse?._id;

  //   try {
  //     console.log(
  //       "[DEBUG] GET messages for:",
  //       `/api/messages/${boardingHouseId}`
  //     );

  //     console.log("[DEBUG] boardingHouseId length:", boardingHouseId.length);

  //     const res = await axios.get(process.env.REACT_APP_API_URL + `/messages/${boardingHouseId}`, {
  //       headers: {
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     });
  //     setMessages(res.data);
  //   } catch (err) {
  //     console.error("Fetch messages failed", err);
  //   }
  // };
  console.log("KIỂM TRA BOOKING:", userBooking);
  return (
    <div>
      {contextHolder}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <div className="boardingHouse-main-image-wrapper">
            <img
              src={boardingHouse.photos?.[0] ? `http://localhost:5000${boardingHouse.photos[0]}` : "/image/default-image.jpg"}
              alt={boardingHouse.name}
              className="boardingHouse-main-image"
            />
            <button className="favorite-btn" onClick={toggleFavorite}>
              {isFavorite ? <HeartFilled style={{ color: "red", fontSize: 24 }} /> : <HeartOutlined style={{ color: "black", fontSize: 24 }} />}
            </button>
          </div>
        </Col>
      </Row>

      <Row gutter={32} className="boardingHouse-main-content">
        <Col xs={24} md={16}>
          <h1 className="boardingHouse-title">{boardingHouse.name}</h1>
          <p className="boardingHouse-location">
            {`${boardingHouse.location.addressDetail}, ${boardingHouse.location.street}, ${boardingHouse.location.district}`}
          </p>
          <h2>Mô tả</h2>
          <p>{boardingHouse.description}</p>
        </Col>

        <Col xs={24} md={8}>
          {renderBookingSection()}
        </Col>
      </Row>

      <Divider />
      <h1 className="text-heading mb-3">Tiện ích</h1>
      <Row gutter={[16, 16]} justify="center"> {/* ✅ Căn giữa và tăng khoảng cách */}
        {(() => {
          const amenities = boardingHouse?.amenities || [];
          let data = [];

          try {
            if (
              Array.isArray(amenities) &&
              typeof amenities[0] === "string" &&
              amenities[0].startsWith("[")
            ) {
              data = JSON.parse(amenities[0]);
            } else if (Array.isArray(amenities)) {
              data = amenities;
            }
          } catch (e) {
            console.warn("❌ Lỗi khi parse amenities:", e);
          }

          // ✅ Helper để lấy icon tương ứng
          const getAmenityIcon = (item) => {
            const lowerItem = item.toLowerCase();
            if (lowerItem.includes("wifi")) return <WifiOutlined />;
            if (lowerItem.includes("máy lạnh")) return <BulbOutlined />; // Tượng trưng
            if (lowerItem.includes("giữ xe")) return <CarOutlined />;
            if (lowerItem.includes("giặt")) return <SkinOutlined />; // Tượng trưng
            if (lowerItem.includes("camera") || lowerItem.includes("an ninh")) {
              return <SecurityScanOutlined />;
            }
            return <CheckOutlined />; // Icon mặc định
          };

          // ✅ Định nghĩa style một lần bên ngoài
          const tagStyle = {
            fontSize: "15px",
            padding: "8px 14px",
            borderRadius: "10px",
            background: "#f6ffed",
            border: "1px solid #b7eb8f",
            color: "#389e0d",
            fontWeight: "500",
            display: "flex",       // Để căn icon và chữ
            alignItems: "center",  //
            gap: "6px",            // Khoảng cách giữa icon và chữ
          };

          // ✅ Xử lý trường hợp không có tiện ích
          if (data.length === 0) {
            return (
              <Tag style={{
                fontSize: "15px",
                padding: "8px 14px",
                borderRadius: "10px",
                background: "#fafafa",
                border: "1px solid #d9d9d9",
                color: "#888"
              }}>
                Chưa cập nhật tiện ích
              </Tag>
            )
          }

          // ✅ Render danh sách
          return data.map((item, index) => (
            <Tag
              key={index}
              icon={getAmenityIcon(item)} // ✅ Dùng prop 'icon'
              style={tagStyle}
            >
              {item}
            </Tag>
          ));
        })()}
      </Row>




      <Divider />
      <h1 className="text-heading">Vị trí</h1>
      <div className="map-container">
        <MapContainer
          center={[boardingHouse.location.latitude, boardingHouse.location.longitude]}
          zoom={15} scrollWheelZoom={false} className="map-leaflet"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[boardingHouse.location.latitude, boardingHouse.location.longitude]}>
            <Popup>{boardingHouse.name}</Popup>
          </Marker>
        </MapContainer>
      </div>


      <RoommatePostModal
        visible={showRoommatePostModal}
        onClose={() => setShowRoommatePostModal(false)}
        boardingHouseId={boardingHouse._id}
        roomId={selectedRoom?._id}
        onSuccess={async (newPost) => {
          setShowRoommatePostModal(false);
          // Cập nhật selectedRoom với bài đăng mới
          if (selectedRoom && newPost) {
            setSelectedRoom({
              ...selectedRoom,
              hasRoommatePost: true,
              roommatePost: newPost
            });
          }
          // Cập nhật lại toàn bộ dữ liệu boarding house
          await fetchBoardingHouseData();
          messageApi.success('Đã đăng bài tìm bạn trọ thành công!');

          // close modal and redirect to community feed so user sees their post in context
          setShowRoommatePostModal(false);
          messageApi.success('Đã đăng bài tìm bạn trọ thành công! Chuyển hướng tới bảng tin.');
          navigate('/customer/roommates');
        }}
      />
      <VisitRequestModal
        visible={isVisitModalVisible}
        onClose={handleVisitModalClose}
        onSuccess={handleVisitModalSuccess}
        boardingHouseId={boardingHouse._id}
        ownerId={boardingHouse.ownerId?._id}
      />
      {/* Room details modal */}
      <Modal
        open={roomModalVisible}
        title={selectedRoom ? `Phòng ${selectedRoom.roomNumber}` : 'Chi tiết phòng'}
        onCancel={handleRoomModalClose}
        footer={null}
        width={800}
      >
        {selectedRoom ? (
          <div>
            {/* Images */}
            {selectedRoom.photos && selectedRoom.photos.length > 0 ? (
              <Carousel autoplay>
                {selectedRoom.photos.map((p, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <img src={`http://localhost:5000${p}`} alt={`room-${idx}`} style={{ maxHeight: 360, width: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </Carousel>
            ) : (
              <img src="/image/default-image.jpg" alt="room" style={{ width: '100%', maxHeight: 360, objectFit: 'cover' }} />
            )}

            <div style={{ marginTop: 16 }}>
              <Tabs defaultActiveKey="room" items={[
                {
                  key: 'room',
                  label: 'Thông tin phòng',
                  children: (
                    <div>
                      <p><strong>Diện tích:</strong> {selectedRoom.area} m²</p>
                      <p><strong>Giá:</strong> {selectedRoom.price?.toLocaleString('vi-VN')} VNĐ/tháng</p>
                      <p><strong>Trạng thái:</strong> {selectedRoom.status}</p>
                      {selectedRoom.description && <p><strong>Mô tả:</strong> {selectedRoom.description}</p>}
                      {selectedRoom.features && selectedRoom.features.length > 0 && (
                        <p><strong>Tiện nghi:</strong> {selectedRoom.features.join(', ')}</p>
                      )}
                    </div>
                  )
                },
                ...(selectedRoom.roommatePost || selectedRoom.hasRoommatePost ? [{
                  key: 'roommate',
                  label: (
                    <span>
                      Tìm bạn trọ
                      <Tag color="blue" style={{ marginLeft: 8 }}>1</Tag>
                    </span>
                  ),
                  children: (
                    <div>
                      {selectedRoom.roommatePost ? (
                        <Card bordered={false}>
                          <Card.Meta
                            avatar={
                              <Avatar
                                size={64}
                                src={selectedRoom.roommatePost.userId?.avatar ?
                                  `http://localhost:5000${selectedRoom.roommatePost.userId.avatar}` : null}
                                style={{
                                  backgroundColor: selectedRoom.roommatePost.userId?.avatar ? 'transparent' : '#004d40',
                                }}
                              >
                                {!selectedRoom.roommatePost.userId?.avatar &&
                                  selectedRoom.roommatePost.userId?.name?.charAt(0).toUpperCase()}
                              </Avatar>
                            }
                            title={selectedRoom.roommatePost.userId?.name || "Người dùng ẩn danh"}
                            description={`Đăng ${dayjs(selectedRoom.roommatePost.createdAt).fromNow()}`}
                          />
                          <div style={{ marginTop: 16 }}>
                            <p style={{ fontStyle: 'italic', marginBottom: 16 }}>
                              "{selectedRoom.roommatePost.intro}"
                            </p>
                            <p>
                              <strong>Giới tính mong muốn:</strong>{' '}
                              {selectedRoom.roommatePost.genderPreference === 'male' ? 'Nam' :
                                selectedRoom.roommatePost.genderPreference === 'female' ? 'Nữ' :
                                  'Không quan trọng'}
                            </p>
                            {selectedRoom.roommatePost.habits && selectedRoom.roommatePost.habits.length > 0 && (
                              <div style={{ marginTop: 8 }}>
                                <strong>Thói quen:</strong><br />
                                {selectedRoom.roommatePost.habits.map((habit, idx) => (
                                  <Tag key={idx} color="blue" style={{ margin: '4px' }}>{habit}</Tag>
                                ))}
                              </div>
                            )}
                            {selectedRoom.roommatePost.note && (
                              <div style={{ marginTop: 8 }}>
                                <strong>Ghi chú:</strong>
                                <p>{selectedRoom.roommatePost.note}</p>
                              </div>
                            )}
                            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              {selectedRoom.roommatePost.userId?._id === user?._id ? (
                                <>
                                  <Button onClick={() => handleEditRoommatePost(selectedRoom.roommatePost)}>
                                    Chỉnh sửa
                                  </Button>
                                  <Button danger onClick={() => handleDeleteRoommatePost(selectedRoom.roommatePost._id)}>
                                    Xóa bài
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="primary"
                                  icon={<MessageOutlined />}
                                  onClick={() => navigate(`/customer/chat/${selectedRoom.roommatePost.userId._id}`)}
                                >
                                  Nhắn tin ngay
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <Spin />
                          <p>Đang tải thông tin...</p>
                        </div>
                      )}
                    </div>
                  )
                }] : [])
              ]} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Button onClick={handleRoomModalClose}>Đóng</Button>
              {selectedRoom.status === 'Available' && (
                <Button type="primary" onClick={() => { handleRoomModalClose(); handleBookRoom(selectedRoom._id); }}>
                  Đặt ngay
                </Button>
              )}
              {(userBooking?.roomId === selectedRoom._id || selectedRoom.status === 'Booked') && !selectedRoom.hasRoommatePost && (
                <Button type="primary" onClick={() => setShowRoommatePostModal(true)}>
                  Đăng bài tìm bạn trọ
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>Đang tải...</div>
        )}
      </Modal>
      <Divider />

      <h1 className="text-heading">Reviews</h1>

      <Row gutter={32} align="top">
        {/* Left: Add Review */}
        <Col xs={24} md={10}>
          <div className="leave-review-section">
            <h2 className="leave-review-title">Leave a Review</h2>

            {user ? (
              (userBooking && (userBooking.status === 'paid' || userBooking.status === 'completed' || userBooking.contractStatus === 'paid')) ? (
                <>
                  {(() => {
                    const bookedRoom = boardingHouse.rooms.find(
                      r => String(r._id) === String(userBooking.roomId._id)
                    );

                    if (bookedRoom) {
                      return (
                        <Tag
                          color="cyan"
                          icon={<TagOutlined />}
                          style={{ marginBottom: 16, fontSize: 15, padding: '4px 8px' }}
                        >
                          Đánh giá cho Phòng {bookedRoom.roomNumber}
                        </Tag>
                      );
                    }
                    return null;
                  })()}
                  {/* === KẾT THÚC LOGIC TÌM PHÒNG === */}

                  <div className="review-form-container">
                    {/* ... Toàn bộ form review của bạn ... */}
                    <div className="review-form-row">
                      <label className="review-form-label">Your Review</label>
                      <Input.TextArea
                        rows={4}
                        placeholder="Share your experience about this boardingHouse..."
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        className="review-custom-textarea"
                      />
                    </div>

                    <div className="review-form-row">
                      <label className="review-form-label">Purpose</label>
                      <Input
                        placeholder="e.g., Business trip, Vacation, Study"
                        value={reviewPurpose}
                        onChange={(e) => setReviewPurpose(e.target.value)}
                        className="review-custom-input"
                      />
                    </div>

                    <div className="review-form-row">
                      <label className="review-form-label">Rating (1-5)</label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        placeholder="Rate from 1 to 5 stars"
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="review-custom-input"
                      />
                    </div>

                    <Button
                      className="review-submit-button"
                      onClick={handleSubmitReview}
                      size="large"
                    >
                      Submit Review
                    </Button>
                  </div>
                </>
              ) : (
                <div className="login-prompt-custom">
                  <div className="review-prompt-container">
                    <i className="bi bi-info-circle review-prompt-icon"></i>
                    <h3 className="review-prompt-title">Only Verified Guests Can Review</h3>
                    <p className="review-prompt-description">
                      You need to book and stay at this boardingHouse to leave a review.
                    </p>
                    <p className="review-prompt-note">
                      This helps ensure authentic and helpful reviews for other travelers.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="login-prompt-custom">
                Please log in to leave a review.
              </div>
            )}
          </div>
        </Col>

        {/* Right: Review List */}
        <Col xs={24} md={14}>
          <h2 className="reviews-section-header">
            Reviews from Others
          </h2>

          {boardingHouse.reviews && boardingHouse.reviews.length > 0 ? (
            boardingHouse.reviews.map((review, index) => {

              // === TÌM PHÒNG TƯƠNG ỨNG VỚI REVIEW ===
              const reviewedRoom = boardingHouse.rooms.find(
                r => String(r._id) === String(review.roomId)
              );
              // === KẾT THÚC TÌM PHÒNG ===

              return (
                <Card
                  key={index}
                  className="custom-review-card"
                  style={{ marginBottom: 16 }}
                >
                  <div className="review-header">
                    <Avatar
                      size={48}
                      style={{ backgroundColor: "#004d47", marginRight: 12 }}
                    >
                      {review.name?.[0]?.toUpperCase() ||
                        review.user?.name?.[0]?.toUpperCase() ||
                        review.customerId?.name?.[0]?.toUpperCase() ||
                        "U"}{" "}
                    </Avatar>
                    <div className="review-meta">
                      <div className="review-name-rating">
                        <strong className="review-customer-name">
                          {review.name || review.user?.name || review.customerId?.name || "Unknown User"}
                        </strong>
                        <span className="review-rating">
                          <i
                            className="bi bi-star-fill"
                            style={{ color: "#004d40" }}
                          />{" "}
                          {review.rating}/5
                        </span>

                        {/* === HIỂN THỊ SỐ PHÒNG === */}
                        {reviewedRoom && (
                          <Tag
                            icon={<TagOutlined />}
                            color="blue"
                            style={{ marginLeft: 8 }}
                          >
                            Phòng {reviewedRoom.roomNumber}
                          </Tag>
                        )}
                        {/* === KẾT THÚC HIỂN THỊ SỐ PHÒNG === */}

                      </div>
                      <span className="review-time">
                        • From {review.weeksAgo} weeks ago
                      </span>
                    </div>
                  </div>

                  {editingReviewId === review._id ? (
                    <>
                      <Input.TextArea
                        rows={3}
                        value={editedReviewContent}
                        onChange={(e) => setEditedReviewContent(e.target.value)}
                        style={{ marginBottom: 8 }}
                      />
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        placeholder="Rating (1-5 stars)"
                        value={editedReviewRating}
                        onChange={(e) =>
                          setEditedReviewRating(Number(e.target.value))
                        }
                        style={{ marginBottom: 8 }}
                      />
                      <Input
                        placeholder="Purpose"
                        value={editedReviewPurpose}
                        onChange={(e) => setEditedReviewPurpose(e.target.value)}
                        style={{ marginBottom: 8 }}
                      />
                      <Button
                        type="primary"
                        onClick={() =>
                          handleEditReview(review._id || review?.user?._id)
                        }
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingReviewId(null)}
                        style={{ marginLeft: 8 }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <div className="review-body">
                      <p>{review.comment}</p>
                      <p>
                        <strong>Purpose:</strong> {review.purpose}
                      </p>

                      {user &&
                        (review.user?._id || review.customerId?._id) &&
                        (String(review.user?._id || review.customerId?._id) === String(user._id)) && (
                          <div className="review-action-buttons">
                            <Button
                              size="small"
                              onClick={() => {
                                setEditingReviewId(review._id);
                                setEditedReviewContent(review.comment);
                                setEditedReviewRating(review.rating);
                                setEditedReviewPurpose(review.purpose);
                              }}
                            >
                              Edit
                            </Button>

                            <Button
                              size="small"
                              onClick={() => handleDeleteReview(review._id)}
                              style={{ marginLeft: 8 }}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <p>No reviews yet for this boarding-house.</p>
          )}
        </Col>
      </Row>

      <div className="mb-6">
        {/* Header + Button */}
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0">
            Đánh giá của người thuê
          </Title>

          <Button
            type="primary"
            loading={loadingSummary}
            onClick={handleSummarizeReviews}
            icon={<Brain size={18} />}
            style={{
              background: "linear-gradient(to right, #6366F1, #3B82F6)",
              border: "none",
              fontWeight: 500,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Tóm tắt bằng AI
          </Button>
        </div>

        {/* Summary Card */}
        {summary && (
          <Card
            bordered={false}
            style={{
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              backgroundColor: "#f9fafb",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Gradient top line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                background: "linear-gradient(to right, #6366F1, #3B82F6)",
              }}
            />

            <div className="flex items-center gap-2 mb-2">
              <Brain size={20} className="text-indigo-600" />
              <Title level={5} className="m-0">
                Tóm tắt AI
              </Title>
            </div>

            <Paragraph style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
              {summary}
            </Paragraph>
          </Card>
        )}
      </div>

      <Divider />
      <h1 className="text-heading">Policy detail</h1>
      <Row gutter={[32, 32]} justify="center">
        <Col xs={24} md={8}>
          <h3>House rules</h3>
          <ul className="policy-list">
            <li>
              <i className="bi bi-clock-fill" /> Checkin time
            </li>
            <li>
              <i className="bi bi-clock-fill" /> Checkout time
            </li>
            <li>
              <i className="bi bi-x-circle" /> No smoking
            </li>
            <li>
              <i className="bi bi-slash-circle" /> No pets
            </li>
            <li>
              <i className="bi bi-ban" /> No parties or events
            </li>
          </ul>
        </Col>

        <Col xs={24} md={8}>
          <h3>Cancellation Policy</h3>
          <ul className="policy-list">
            <li>
              <i className="bi bi-dot" /> Free cancellation up to 24hrs before
              checkin
            </li>
          </ul>
        </Col>

        <Col xs={24} md={8}>
          <h3>Health & Safety</h3>
          <ul className="policy-list">
            <li>
              <i className="bi bi-shield-check" /> Cleaner follows COVID policy
            </li>
          </ul>
        </Col>
      </Row>
    </div >
  );
};

export default PropertyDetails;