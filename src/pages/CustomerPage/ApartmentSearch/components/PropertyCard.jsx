import { Tag } from "antd";
import { Link } from "react-router-dom";

const PropertyCard = ({ property }) => {
    // ✅ Giá
    const priceRange =
        property.minPrice && property.maxPrice
            ? `${property.minPrice?.toLocaleString("vi-VN")} - ${property.maxPrice?.toLocaleString("vi-VN")} VNĐ/tháng`
            : "Chưa có thông tin giá";

    // ✅ Area (diện tích)
    const areaRange =
        property.minArea && property.maxArea
            ? `${property.minArea} - ${property.maxArea} m²`
            : "Chưa có thông tin diện tích";

    return (
        <Link
            to={`/customer/property/${property._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
        >
            <div
                style={{
                    display: "flex",
                    background: "#fff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    marginBottom: "16px",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                }}
            >
                <img
                    alt={property.name}
                    src={
                        property.photos && property.photos.length > 0
                            ? `http://localhost:5000${property.photos[0]}`
                            : "/default-image.jpg"
                    }
                    style={{ width: "200px", height: "150px", objectFit: "cover" }}
                />

                <div
                    style={{
                        padding: "16px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <h3 style={{ margin: 0, marginBottom: "8px" }}>{property.name}</h3>
                    <p style={{ margin: 0, marginBottom: "12px", color: "#555" }}>
                        {property.location?.street}, {property.location?.district}
                    </p>

                    {/* Tag + Price */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            marginBottom: "8px",
                        }}
                    >
                        <Tag color={property.availableRoomsCount > 0 ? "green" : "orange"}>
                            {property.availableRoomsCount > 0
                                ? `Còn ${property.availableRoomsCount} phòng trống`
                                : "Hết phòng"}
                        </Tag>

                        <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                            {priceRange}
                        </span>
                    </div>

                    {/* ⭐ NEW AREA SECTION */}
                    <div style={{ fontSize: "15px", color: "#333", marginTop: "4px" }}>
                        <strong>Diện tích: </strong> {areaRange}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PropertyCard;
