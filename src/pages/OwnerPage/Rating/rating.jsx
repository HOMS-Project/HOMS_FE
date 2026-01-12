// File: src/pages/OwnerPage/Rating/rating.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Tag, Spin, message, Rate } from "antd";
import { getOwnerRatings } from "../../../services/boardingHouseAPI";
import "./rating.css";

const Rating = () => {
  const navigate = useNavigate();
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallAvgRating, setOverallAvgRating] = useState(null);

  useEffect(() => {
    fetchOwnerRatings();
  }, []);

  const fetchOwnerRatings = async () => {
    try {
      setLoading(true);
      const response = await getOwnerRatings();

      if (response.success && response.boardingHouses) {
        setBoardingHouses(response.boardingHouses);

        // Tính tổng average rating
        const housesWithRatings = response.boardingHouses.filter(h => h.totalReviews > 0);
        if (housesWithRatings.length > 0) {
          const totalRating = housesWithRatings.reduce((sum, h) => sum + h.averageRating, 0);
          const avgRating = (totalRating / housesWithRatings.length).toFixed(1);
          setOverallAvgRating(avgRating);
        } else {
          setOverallAvgRating(null);
        }
      } else {
        console.log("❌ [DEBUG] API Failed or no boarding houses found");
        message.error("Không thể tải dữ liệu ratings");
      }
    } catch (error) {
      console.error("💥 [DEBUG] Error fetching owner ratings:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên nhà trọ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Đánh giá trung bình",
      key: "averageRating",
      render: (_, record) => (
        record.totalReviews > 0 ? (
          <Rate disabled allowHalf value={record.averageRating} />
        ) : (
          <span>Chưa có đánh giá</span>
        )
      ),
    },
    {
      title: "Số lượt đánh giá",
      dataIndex: "totalReviews",
      key: "totalReviews",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => navigate(`/owner/rating/${record._id}`)}
        >
          Xem đánh giá
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="rating-wrapper" style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="rating-wrapper">
      <h2>Danh sách nhà trọ của bạn</h2>

      {overallAvgRating && (
        <div className="overall-rating" style={{ marginBottom: 16 }}>
          <strong>Đánh giá trung bình chung:</strong>{" "}
          <Rate disabled allowHalf value={parseFloat(overallAvgRating)} /> ({overallAvgRating})
        </div>
      )}

      <Table
        className="rating-table"
        dataSource={boardingHouses.map(h => ({ ...h, key: h._id }))}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Rating;
