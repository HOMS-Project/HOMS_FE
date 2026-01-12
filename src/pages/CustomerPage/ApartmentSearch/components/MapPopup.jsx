import { useEffect, useState } from "react";
import { Modal, Input, Button } from "antd";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";

// Fix map kích thước khi mở modal
const MapUpdater = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
  }, [map]);
  return null;
};

// Hàm tính khoảng cách km
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

const MapPopup = ({ visible, onClose, room }) => {
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  const roomPos = room
    ? [parseFloat(room.location.latitude), parseFloat(room.location.longitude)]
    : null;

  useEffect(() => {
    if (!room) return;
    setPlaces([]);
    setRoutes([]);
    setKeyword("");
  }, [room, visible]);

  const mapKeywordToCategory = (keyword) => {
    const k = keyword.trim().toLowerCase();
    if (k.includes("chợ") || k.includes("market")) return "commercial.marketplace";
    if (k.includes("siêu thị") || k.includes("supermarket")) return "commercial.supermarket";
    if (k.includes("bệnh viện") || k.includes("hospital")) return "building.healthcare";
    if (k.includes("nhà hàng") || k.includes("restaurant")) return "catering.restaurant";
    if (k.includes("cafe") || k.includes("coffee")) return "catering.cafe";
    return k;
  };

  const handleSearch = async () => {
    if (!keyword.trim() || !roomPos) return;
    setLoading(true);
    setPlaces([]);
    setRoutes([]);

    try {
      const category = mapKeywordToCategory(keyword);

      // 1. Lấy danh sách POI
      const res = await fetch(
        `http://localhost:5000/api/ai/nearby-places?lat=${roomPos[0]}&lng=${roomPos[1]}&keyword=${category}`
      );
      const data = await res.json();
      setPlaces(data);

      // 2. Lấy đường đi từ room → POI
      const allRoutes = await Promise.all(
        data.map(async (poi) => {
          const routeRes = await fetch(
            `http://localhost:5000/api/ai/route?fromLat=${roomPos[0]}&fromLng=${roomPos[1]}&toLat=${poi.lat}&toLng=${poi.lng}`
          );
          const routeData = await routeRes.json();

          // GeoJSON: coordinates [lng, lat] → đảo thành [lat, lng]
          const coords =
            routeData?.features?.[0]?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];
          return coords;
        })
      );
      setRoutes(allRoutes);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Bản đồ - ${room?.name || ""}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      bodyStyle={{ height: "600px", padding: "10px" }}
      style={{ top: 20 }}
    >
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <Input
          placeholder="Nhập chợ, siêu thị, bệnh viện..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button type="primary" loading={loading} onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </div>

      {visible && roomPos && (
        <div style={{ height: "95%", width: "100%" }}>
          <MapContainer center={roomPos} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater />

            {/* Marker phòng trọ */}
            <Marker position={roomPos}>
              <Popup>{room.name}</Popup>
            </Marker>

            {/* POI + khoảng cách */}
            {places.map((p, idx) => (
              <Marker key={idx} position={[p.lat, p.lng]}>
                <Popup>
                  <b>{p.name}</b>
                  <br />
                  Khoảng cách: {getDistanceKm(roomPos[0], roomPos[1], p.lat, p.lng)} km
                </Popup>
              </Marker>
            ))}

            {/* Vẽ đường đi */}
            {routes.map(
              (route, idx) =>
                route.length > 0 && <Polyline key={idx} positions={route} color="blue" />
            )}
          </MapContainer>
        </div>
      )}
    </Modal>
  );
};

export default MapPopup;
