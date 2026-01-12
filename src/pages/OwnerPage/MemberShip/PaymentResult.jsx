import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './paymentResult.css';
import useUser from '../../../contexts/UserContext';
import axios from 'axios';

const PaymentResult = () => {
  const { user } = useUser();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const success = query.get("success");
  const packageId = query.get("packageId");
const orderCode = query.get("orderCode");

  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (success === "true") {
      setStatus("success");
    } else {
      setStatus("fail");
  if (user?._id && orderCode) {
  axios.post("http://localhost:5000/api/payment/cancel", { orderCode })
    .then(() => console.log("Đã cập nhật trạng thái cancel thành công"))
    .catch(err => console.error("Lỗi khi cập nhật cancel:", err));
}

    }
  }, [success, user, packageId]);

  return (
    <main className="ticket-system">
      <div className="top">
        <h1 className="title">
          {status === "success"
            ? "Mua gói thành công, hóa đơn của bạn đang được in..."
            : "Mua gói thất bại, kiểm tra lại đơn hàng."}
        </h1>
        <div className="printer" />
      </div>

      <div className="receipts-wrapper">
        <div className="receipts">
          <div className={`receipt ${status === "success" ? '' : 'fail'}`}>
            <h2 className="receipt-title">
              {status === "success"
                ? "🧾 HÓA ĐƠN THANH TOÁN"
                : "❌ THANH TOÁN THẤT BẠI"}
            </h2>

            <div className="details">
              <div className="item">
                <span>Trạng thái</span>
                <h3>{status === "success" ? "Thành công" : "Thất bại"}</h3>
              </div>

              <div className="item">
                <span>Thời gian</span>
                <h3>{new Date().toLocaleString('vi-VN')}</h3>
              </div>

              <div className="item">
                <span>Thành viên</span>
                <h3>{user?.name || 'Người dùng'}</h3>
              </div>
            </div>

            <div className="footer-btn">
              <Link to="/owner/membership" className="btn-back">
                {status === "success" ? "Quay lại Membership" : "Thử lại"}
              </Link>
            </div>
          </div>

          <div className="receipt qr-code">
            <img
              src={`${process.env.PUBLIC_URL}/Logo_TrọNhanh.png`}
              alt="Logo TrọNhanh"
              className="qr"
            />
            <div className="description">
              <h2>TroNhanh.vn</h2>
              <p>Cảm ơn bạn đã nâng cấp gói thành viên TroNhanh</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentResult;
