import { useEffect, useState } from "react";
import { Row, Col, Card, Spin, Empty, Tag } from "antd";
import { useLocation } from "react-router-dom";

import Filters from "./components/Filters";
import PropertyList from "./components/PropertyList";
import MapView from "./components/MapView";
import FAQ from "./components/FAQ";
import MapPopup from "./components/MapPopup";

import {
  searchBoardingHouses,
  getAllBoardingHouses,
} from "../../../services/boardingHouseAPI";

import { getAiRecommendations } from "../../../services/aiService";

const ApartmentSearch = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);

  const location = useLocation();

  // ============================
  // Fetch & gọi AI recommend
  // ============================
  const fetchAndMap = async (searchFn, filtersForAi = {}) => {
    try {
      const data = await searchFn();

      const mapData = data.map((item) => ({
        ...item,
        position: [
          parseFloat(item.location.latitude),
          parseFloat(item.location.longitude),
        ],
      }));

      setFilteredData(mapData);

      // ---------------------------
      // Gọi AI gợi ý trọ
      // ---------------------------
      try {
        setRecLoading(true);
        const roomsForAi = mapData.slice(0, 50); // giới hạn prompt

        const res = await getAiRecommendations(filtersForAi, roomsForAi);

        const recommendedFull = (res || [])
          .map((r) => {
            const found = mapData.find(
              (m) => String(m._id) === String(r.id) || String(m.id) === String(r.id)
            );
            return found ? { ...found, reason: r.reason } : null;
          })
          .filter(Boolean);

        setRecommendedRooms(recommendedFull);
      } catch (e) {
        console.error("AI recommendation failed:", e);
        setRecommendedRooms([]);
      } finally {
        setRecLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch accommodations:", error);
    }
  };

  // ============================
  // Load initial
  // ============================
  useEffect(() => {
    if (location.state) {
      const filters = location.state;
      fetchAndMap(() => searchBoardingHouses(filters), filters);
    } else {
      fetchAndMap(getAllBoardingHouses, {});
    }
  }, [location.state]);

  // ============================
  // Khi user bấm Search
  // ============================
  const handleSearch = async (filters) => {
    fetchAndMap(() => searchBoardingHouses(filters), filters);
  };

  // ============================
  // Xem bản đồ + khoảng cách
  // ============================
  const handleViewMap = (room) => {
    setSelectedRoom(room);
    setMapVisible(true);
  };

  // ============================
  // Render card gợi ý AI
  // ============================
  const renderRecommendedCard = (room) => {
    const priceRange =
      room.minPrice && room.maxPrice
        ? `${room.minPrice?.toLocaleString("vi-VN")} - ${room.maxPrice?.toLocaleString("vi-VN")} VNĐ/tháng`
        : Number(room.price).toLocaleString() + " đ/tháng";

    const areaRange =
      room.minArea && room.maxArea
        ? `${room.minArea} - ${room.maxArea} m²`
        : "Chưa có thông tin diện tích";

    return (
      <Col xs={24} sm={12} md={8} key={room._id || room.id}>
        <div
          style={{
            display: "flex",
            background: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: 12,
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
          }}
        >
          <img
            src={
              room.photos && room.photos.length > 0
                ? `http://localhost:5000${room.photos[0]}`
                : "/image/default-image.jpg"
            }
            alt={room.name}
            style={{ width: "120px", height: "100%", objectFit: "cover" }}
          />

          <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h4 style={{ margin: 0, marginBottom: 6 }}>{room.name || room.title}</h4>
              <p style={{ margin: 0, fontSize: 12, color: "#666", marginBottom: 8 }}>
                {room.location?.street || ""}, {room.location?.district || ""}
              </p>

              {/* Price + Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <Tag color={room.availableRoomsCount > 0 ? "green" : "orange"}>
                  {room.availableRoomsCount > 0
                    ? `Còn ${room.availableRoomsCount} phòng trống`
                    : "Hết phòng"}
                </Tag>
                <span style={{ fontWeight: "bold", fontSize: 14 }}>{priceRange}</span>
              </div>

              <div style={{ fontSize: 13, color: "#333" }}>
                <strong>Diện tích:</strong> {areaRange}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {room.reason && <div style={{ fontSize: 12, color: "#444" }}><strong>Lý do:</strong> {room.reason}</div>}
              <button
                style={{
                  background: "#1677ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
                onClick={() => handleViewMap(room)}
              >
                📍 Xem bản đồ
              </button>
            </div>
          </div>
        </div>
      </Col>
    );
  };

  return (
    <div>
      <Filters onSearch={handleSearch} />

      {/* --------------------------- */}
      {/* BLOCK GỢI Ý TRỌ TỪ AI */}
      {/* --------------------------- */}
      <div style={{ padding: 16 }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            marginBottom: 12,
            minHeight: 72,
          }}
          bodyStyle={{ paddingBottom: 6 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 16 }}>🎯 Gợi ý dành cho bạn</div>
            {recLoading ? <Spin /> : null}
          </div>

          <div style={{ marginTop: 12 }}>
            {!recLoading && recommendedRooms.length === 0 ? (
              <Empty description="Không có gợi ý phù hợp" />
            ) : (
              <Row gutter={12}>
                {recommendedRooms.map(renderRecommendedCard)}
              </Row>
            )}
          </div>
        </Card>
      </div>

      {/* --------------------------- */}
      {/* PROPERTY LIST + MAP */}
      {/* --------------------------- */}
      <Row gutter={16} style={{ padding: 16 }}>
        <Col xs={24} lg={16}>
          <PropertyList data={filteredData} />
        </Col>
        <Col xs={24} lg={8}>
          <div style={{ height: "600px", position: "sticky", top: "100px" }}>
            <MapView properties={filteredData} />
          </div>
        </Col>
      </Row>

      <FAQ />

      {/* --------------------------- */}
      {/* POP-UP BẢN ĐỒ + KHOẢNG CÁCH */}
      {/* --------------------------- */}
      <MapPopup
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        room={selectedRoom}
      />
    </div>
  );
};

export default ApartmentSearch;
