import React, { useState, useEffect, useRef, useCallback } from "react";
import { Layout, Modal, message, Spin, Tour, ConfigProvider, Pagination } from "antd";
import viVN from 'antd/locale/vi_VN';
import { useLocation } from "react-router-dom";
import {
  CalendarOutlined,
} from "@ant-design/icons";
import AppHeader from "../../../components/header/header";
import AppFooter from "../../../components/footer/footer";
import { useSelector } from "react-redux";
import api from "../../../services/api";
import orderService from "../../../services/orderService";
import ReportIncidentModal from "../../../components/MovingOrder/ReportIncidentModal";
import ViewIncidentModal from "../../../components/MovingOrder/ViewIncidentModal";
import SurveyPricingModal from "../../../components/MovingOrder/SurveyPricingModal";
import SurveyTimeModal from "../../../components/MovingOrder/SurveyTimeModal";
import RateServiceModal from "../../../components/ServiceRating/RateServiceModal";
import CancelTicketModal from "../../../components/MovingOrder/CancelTicketModal";
import RescheduleSurveyModal from "../../../components/MovingOrder/RescheduleSurveyModal";

// Sub-components
import OrderHero from "./components/OrderHero";
import FilterTabs from "./components/FilterTabs";
import OrderCard from "./components/OrderCard";
import { fmtDate, getFinalPrice, FILTERS } from "./constants";

import "./style.css";

const { Content } = Layout;
const { confirm } = Modal;

/* ─── main page ───────────────────────────────────────────── */
const ViewMovingOrder = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  // Unified Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [isSurveyModalVisible, setIsSurveyModalVisible] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTicketPricing, setSelectedTicketPricing] = useState(null);
  const [isSurveyTimeModalVisible, setIsSurveyTimeModalVisible] = useState(false);
  const [selectedTicketForTime] = useState(null);
  const [isIncidentModalVisible, setIsIncidentModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  // [RATING] State cho modal đánh giá
  const [isRateModalVisible, setIsRateModalVisible] = useState(false);
  const [ticketToRate, setTicketToRate] = useState(null);

  // States for Cancel / Reschedule Modals
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] = useState(false);
  const [actionTicket, setActionTicket] = useState(null);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // [TOUR] State & Refs
  const refStatus = useRef(null);
  const refRoute = useRef(null);
  const refMeta = useRef(null);
  const refPricing = useRef(null);
  const refActions = useRef(null);
  const refModalSurvey = useRef(null);
  const refModalResources = useRef(null);
  const refModalPricing = useRef(null);

  const [tourOpen, setTourOpen] = useState(false);

  const handleRemainingPayment = (ticket) => {
    confirm({
      title: "Xác nhận thanh toán phần còn lại",
      content: (
        <>
          <p>Bạn sắp thanh toán <b>phần còn lại của đơn hàng</b>.</p>
          <p>
            Số tiền:{" "}
            <b style={{ color: "#d9363e" }}>
              {(getFinalPrice(ticket.pricing) / 2).toLocaleString()} ₫
            </b>
          </p>
        </>
      ),
      onOk: async () => {
        try {
          const res = await orderService.createMovingRemaining(ticket._id);
          if (res?.data?.checkoutUrl) {
            window.location.href = res.data.checkoutUrl;
          } else {
            message.error("Không tạo được link thanh toán");
          }
        } catch (err) {
          message.error("Lỗi thanh toán: " + (err.response?.data?.message || err.message));
        }
      },
    });
  };

  useEffect(() => {
    if (!localStorage.getItem('hasSeenViewOrderTour')) {
      setTimeout(() => setTourOpen(true), 800);
      localStorage.setItem('hasSeenViewOrderTour', 'true');
    }
  }, []);

  const tourSteps = [
    {
      title: 'Tình Trạng Đơn Hàng',
      description: 'Cập nhật liên tục trạng thái hiện tại (Tạo mới, Đã khảo sát, Đang vận chuyển).',
      target: () => refStatus.current,
    },
    {
      title: 'Lộ Trình Vận Chuyển',
      description: 'Cho biết địa điểm bắt đầu (Nơi đi) và đích đến (Nơi đến) chính xác của bạn.',
      target: () => refRoute.current,
    },
    {
      title: 'Chi Phí Dự Kiến (Pricing Meta)',
      description: 'Hiển thị tóm tắt tổng chi phí dự kiến. Giá trị này được thuật toán tổng kết tự động.',
      target: () => refPricing.current,
    },
    {
      title: 'Xem Chi Tiết Báo Giá',
      description: 'Nhấn vào nút "Chấp nhận báo giá" hoặc "Xem báo giá" để mở Bảng Phân Tích Cấu Thành Giá cực kỳ chi tiết của hệ thống.',
      target: () => refActions.current,
    },
    {
      title: 'Mục 1: Thông tin khảo sát địa hình',
      description: 'Các yếu tố then chốt như Tổng Quãng Đường (km), Số lầu nhà, Có/Không Thang máy và Quãng đường khênh vác (nếu hẻm nhỏ xe không vào được) sẽ trực tiếp ảnh hưởng đến thuật toán tính giá.',
      target: () => refModalSurvey.current,
    },
    {
      title: 'Mục 2: Tài Nguyên & Nhân Dực',
      description: 'Dựa vào bảng kê khai số lượng và loại đồ đạc bên dưới, hệ thống tự động suy ra loại Xe Tải phù hợp và số lượng Nhân viên khuân vác, đóng gói cần thiết.',
      target: () => refModalResources.current,
    },
    {
      title: 'Mục 3: Cấu Thành Giá (Phân Rã Toán Học)',
      description: (
        <div>
          <p>Thuật toán lõi sẽ chia nhỏ chi phí một cách minh bạch, KHÔNG BAO GIỜ có chi phí ẩn:</p>
          <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
            <li><b>Phí xe tải:</b> Lấy quãng đường (km) nhân với Đơn giá của loại xe Tải được cấu hình sẵn.</li>
            <li><b>Phí Nhân công & Khuân vác:</b> Là tập hợp của Phí khiêng bộ xa, Phí số tầng lầu bê vác, và khối lượng đồ đạc.</li>
            <li><b>Phí dịch vụ:</b> Các phụ phí như bọc màng co, thùng carton, bảo hiểm hàng hóa, tháo ráp máy lạnh.</li>
          </ul>
        </div>
      ),
      target: () => refModalPricing.current,
    },
  ];

  const mockTicketForTour = {
    _id: "mock_123",
    code: "MOK-99999999",
    createdAt: new Date().toISOString(),
    scheduledTime: new Date(Date.now() + 86400000).toISOString(),
    status: "QUOTED",
    pickup: { address: "123 Đường Bắt Đầu, Phường 1, Quận 10" },
    delivery: { address: "456 Đường Kết Thúc, Quận 7, TP.HCM" },
    pricing: { totalPrice: 1850000 },
    invoice: null,
    isMock: true,
  };

  const mockSurveyForTour = {
    distanceKm: 15, floors: 2, hasElevator: false, carryMeter: 50, needsPacking: true, needsAssembling: true,
    insuranceRequired: true, declaredValue: 50000000, estimatedHours: 4, notes: "Ghi chú: Đồ đạc cồng kềnh, cần bọc lót kỹ.",
    suggestedVehicle: "Xe tải 1.5 Tấn", suggestedStaffCount: 4,
    items: [
      { name: "Sofa góc L", condition: "GOOD", actualWeight: 80 },
      { name: "Tủ lạnh 400L", condition: "FRAGILE" },
      { name: "⚠️ Tủ kính trang trí", condition: "FRAGILE" }
    ]
  };

  const mockPricingBreakdownForTour = {
    totalPrice: 1850000, subtotal: 1850000, discountAmount: 0, tax: 0,
    breakdown: { baseTransportFee: 300000, vehicleFee: 400000, laborFee: 600000, distanceSurcharge: 100000, floorFee: 250000, carryFee: 200000, serviceFee: 0 }
  };

  const handleTourChange = (currentStep) => {
    // Steps 4, 5, 6 require the modal to be open
    if (currentStep >= 4) {
      setSelectedTicket(mockTicketForTour);
      setSelectedSurvey(mockSurveyForTour);
      setSelectedTicketPricing(mockPricingBreakdownForTour);
      setIsSurveyModalVisible(true);
    } else {
      setIsSurveyModalVisible(false);
    }
  };

  /* ── handlers ── */
  const handleViewSurvey = async (ticket) => {
    try {
      setSelectedTicket(ticket);
      const res = await api.get(`/surveys/ticket/${ticket._id}`);
      setSelectedSurvey(res.data?.data || res.data);
      try {
        const resPricing = await api.get(`/pricing/${ticket._id}`);
        setSelectedTicketPricing({
          ...ticket.pricing,
          breakdown: resPricing.data?.data?.breakdown,
        });
      } catch {
        setSelectedTicketPricing(ticket.pricing);
      }
      setIsSurveyModalVisible(true);
    } catch (error) {
      message.error(
        "Không thể tải thông tin khảo sát: " +
        (error.response?.data?.message || error.message)
      );
    }
  };

  const handleReportIncident = (ticket) => {
    setSelectedTicket(ticket);
    setIsReportModalVisible(true);
  };

  const handleCloseReportModal = () => setIsReportModalVisible(false);

  const handleViewIncident = (incident) => {
    setSelectedIncident(incident);
    setIsIncidentModalVisible(true);
  };

  // [RATING] Mở modal đánh giá
  const handleRateService = (ticket) => {
    setTicketToRate(ticket);
    setIsRateModalVisible(true);
  };

  // [RATING] Callback sau khi đánh giá thành công — cập nhật isRated trong state
  const handleRateSuccess = (invoiceId) => {
    setIsRateModalVisible(false);
    setTickets((prev) =>
      prev.map((t) =>
        t.invoice?._id === invoiceId
          ? { ...t, invoice: { ...t.invoice, isRated: true } }
          : t
      )
    );
    message.success("Cảm ơn bạn đã đánh giá dịch vụ!");
  };

  const handleDepositPayment = (ticket) => {
    confirm({
      title: "Xác nhận thanh toán cọc",
      content: (
        <>
          <p>Bạn sắp thanh toán <b>50% giá trị đơn hàng</b>.</p>
          <p>
            Số tiền cọc:{" "}
            <b style={{ color: "#d9363e" }}>
              {(ticket.pricing.totalPrice / 2).toLocaleString()} ₫
            </b>
          </p>
          <p>Bạn có chắc chắn muốn tiếp tục?</p>
        </>
      ),
      okText: "Thanh toán",
      cancelText: "Hủy",
      okType: "primary",
      onOk: async () => {
        try {
          const depositAmount = Math.floor(getFinalPrice(ticket.pricing) * 0.5);
          const res = await orderService.createMovingDeposit(ticket._id, depositAmount);
          if (res?.data?.checkoutUrl) {
            window.location.href = res.data.checkoutUrl;
          } else {
            message.error("Không tạo được link thanh toán");
          }
        } catch (err) {
          message.error(
            "Không thể tạo thanh toán: " +
            (err.response?.data?.message || err.message)
          );
        }
      },
    });
  };

  const handleConfirmUnderstaffed = (ticket, action) => {
    confirm({
      title: action === 'ACCEPT' ? "Chấp nhận vận chuyển (Thiếu nhân sự)?" : "Từ chối và yêu cầu dời lịch?",
      content: action === 'ACCEPT'
        ? "Bạn đồng ý vận chuyển với số lượng nhân sự ít hơn? Thời gian vận chuyển thực tế có thể kéo dài thêm do thiếu hụt nhân lực."
        : "Hệ thống sẽ ghi nhận yêu cầu và điều phối viên sẽ đề xuất lịch trình mới phù hợp hơn cho bạn.",
      okText: "Xác nhận",
      onOk: async () => {
        try {
          await api.patch(`/invoices/${ticket.invoice._id}/confirm-understaffed`, { action });
          message.success("Đã gửi phản hồi thành công.");
          setTickets((prev) =>
            prev.map((t) => {
              if (t._id === ticket._id) {
                return { ...t, invoice: { ...t.invoice, understaffedApproval: action } };
              }
              return t;
            })
          );
        } catch (err) {
          message.error("Lỗi: " + (err.response?.data?.message || err.message));
        }
      },
    });
  };

  const handleConfirmReschedule = (ticket, action) => {
    confirm({
      title: action === 'ACCEPT' ? "Chấp nhận dời lịch vận chuyển?" : "Từ chối dời lịch vận chuyển?",
      content: action === 'ACCEPT'
        ? `Bạn đồng ý dời lịch vận chuyển sang ${fmtDate(ticket.invoice.proposedDispatchTime)}?`
        : "Điều phối viên sẽ tiếp tục tìm nhân sự hoặc liên hệ lại với bạn. Bạn có chắc chắn từ chối đổi lịch?",
      okText: action === 'ACCEPT' ? "Đồng ý" : "Từ chối",
      okButtonProps: { danger: action === 'REJECT' },
      onOk: async () => {
        try {
          await api.patch(`/invoices/${ticket.invoice._id}/confirm-reschedule`, { action });
          message.success(action === 'ACCEPT' ? "Đã chấp nhận lịch vận chuyển mới." : "Đã từ chối lịch và phản hồi lại cho điều phối viên.");
          setTickets((prev) =>
            prev.map((t) => {
              if (t._id === ticket._id) {
                const invoice = { ...t.invoice, rescheduleStatus: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED' };
                if (action === 'ACCEPT' && invoice.proposedDispatchTime) {
                  invoice.scheduledTime = invoice.proposedDispatchTime;
                }
                return { ...t, invoice };
              }
              return t;
            })
          );
        } catch (err) {
          message.error("Lỗi: " + (err.response?.data?.message || err.message));
        }
      },
    });
  };

  const handleCancelQuote = (record) => {
    confirm({
      title: "Từ chối báo giá này?",
      content: "Yêu cầu chuyển nhà sẽ bị hủy bỏ.",
      okText: "Từ chối & Hủy",
      okType: "danger",
      cancelText: "Quay lại",
      onOk: async () => {
        try {
          await api.put(`/request-tickets/${record._id}/cancel`, {
            reason: "Khách hàng từ chối báo giá",
          });
          message.success("Đã từ chối báo giá và hủy đơn.");
          setTickets((prev) =>
            prev.map((t) =>
              t._id === record._id ? { ...t, status: "CANCELLED" } : t
            )
          );
        } catch (err) {
          message.error(
            "Lỗi khi hủy đơn: " + (err.response?.data?.message || err.message)
          );
        }
      },
    });
  };

  const handleCancelTicketRequest = (ticket) => {
    setActionTicket(ticket);
    setIsCancelModalVisible(true);
  };

  const handleRescheduleSurveyRequest = (ticket) => {
    setActionTicket(ticket);
    setIsRescheduleModalVisible(true);
  };

  const handleActionSuccess = (ticketId, updatedFields) => {
    setTickets((prev) =>
      prev.map((t) =>
        t._id === ticketId ? { ...t, ...updatedFields } : t
      )
    );
  };

  // refresh tickets
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchTickets = useCallback(async (isManual = false) => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    if (isManual) setIsRefreshing(true);

    try {
      const currentUserId = user._id || user.id;
      const response = await api.get(`/request-tickets`, {
        params: {
          customerId: currentUserId,
          _t: Date.now() // Bypass cache
        },
      });

      if (response.data?.success) {
        let userTickets = response.data.data || [];
        userTickets = userTickets.filter(
          (t) =>
            (t.customerId && (t.customerId._id === currentUserId || t.customerId === currentUserId)) ||
            t.customerId === currentUserId
        );
        userTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const searchCode = new URLSearchParams(location.search).get("searchCode");
        if (searchCode) {
          const kw = searchCode.toLowerCase();
          userTickets = userTickets.filter(
            (t) =>
              (t.code && t.code.toLowerCase().includes(kw)) ||
              (t.invoice?.code && t.invoice.code.toLowerCase().includes(kw))
          );
        }

        setTickets(userTickets);
        if (isManual) message.success("Dữ liệu đã được cập nhật mới nhất!");
      }
    } catch (error) {
      console.error("Lỗi khi làm mới:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, user, location.search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Tự động cuộn lên đầu khi có đơn mới nạp vào
  useEffect(() => {
    if (tickets.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [tickets.length]);

  /* ── filter logic ── */
  const matchFilter = (t, key) => {
    const ticketStatus = t.status;
    const invoiceStatus = t.invoice?.status;
    const hasInvoice = !!invoiceStatus;

    if (key === "ALL") return true;
    if (key === "QUOTED") return ticketStatus === "QUOTED";
    if (key === "PROCESSING") {
      if (!hasInvoice) return ["CREATED", "WAITING_SURVEY", "SURVEYED", "ACCEPTED"].includes(ticketStatus);
      return ["DRAFT", "CONFIRMED"].includes(invoiceStatus);
    }
    if (key === "IN_PROGRESS") return ["ASSIGNED", "IN_PROGRESS"].includes(invoiceStatus);
    if (key === "COMPLETED") return invoiceStatus === "COMPLETED";
    if (key === "CANCELLED") return ticketStatus === "CANCELLED" || invoiceStatus === "CANCELLED";
    return false;
  };

  const filtered = tickets.filter((t) => matchFilter(t, activeFilter));
  const filterCounts = FILTERS.reduce((acc, f) => {
    acc[f.key] = tickets.filter((t) => matchFilter(t, f.key)).length;
    return acc;
  }, {});

  // Logic to handle Mock data for Tour + Pagination
  const allDisplayTickets = (tourOpen && tickets.length === 0)
    ? [mockTicketForTour]
    : (tourOpen ? [mockTicketForTour, ...filtered] : filtered);

  const paginatedTickets = allDisplayTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Layout className="view-order-page">
      <AppHeader />

      <Content>
        <OrderHero onOpenTour={() => setTourOpen(true)} />

        <section className="order-section">
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={filterCounts}
            onRefresh={fetchTickets}
            isRefreshing={isRefreshing}
          />

          {loading ? (
            <div className="mo-loading"><Spin size="large" /></div>
          ) : allDisplayTickets.length === 0 ? (
            <div className="mo-empty"><p>Không có đơn hàng nào.</p></div>
          ) : (
            <>
              <div
                key={tickets.length + (isRefreshing ? '-loading' : '-ready')}
                className={`mo-card-list ${!isRefreshing ? 'mo-card-list-refresh' : ''}`}
              >
                {paginatedTickets.map((ticket, idx) => (
                  <OrderCard
                    key={ticket._id || idx}
                    ticket={ticket}
                    tourRefs={idx === 0 && tourOpen ? { refStatus, refRoute, refMeta, refPricing, refActions } : null}
                    onViewSurvey={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleViewSurvey}
                    onReportIncident={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleReportIncident}
                    onViewIncident={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleViewIncident}
                    onDepositPayment={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleDepositPayment}
                    onPayRemaining={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleRemainingPayment}
                    onCancelQuote={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleCancelQuote}
                    onRateService={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleRateService}
                    onCancelTicketRequest={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleCancelTicketRequest}
                    onRescheduleSurveyRequest={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleRescheduleSurveyRequest}
                    onConfirmReschedule={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleConfirmReschedule}
                    onConfirmUnderstaffed={ticket.isMock ? () => message.info('Đây là dữ liệu mẫu.') : handleConfirmUnderstaffed}
                  />
                ))}
              </div>

              {allDisplayTickets.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 40 }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={allDisplayTickets.length}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    showSizeChanger
                    pageSizeOptions={['3', '5', '10', '20']}
                    locale={{ items_per_page: '/ trang' }}
                  />
                </div>
              )}
            </>
          )}
        </section>

        {/* Tour Component */}
        < ConfigProvider locale={viVN} >
          <Tour
            open={tourOpen}
            onChange={handleTourChange}
            onClose={() => { setTourOpen(false); setIsSurveyModalVisible(false); }}
            steps={tourSteps}
            mask={{ color: 'rgba(0, 0, 0, 0.4)' }}
          />
        </ConfigProvider >

        {/* ── Modals ── */}
        < SurveyPricingModal
          visible={isSurveyModalVisible}
          onClose={() => setIsSurveyModalVisible(false)}
          ticket={selectedTicket}
          survey={selectedSurvey}
          pricing={selectedTicketPricing}
          onPromotionApplied={(ticketId, pricingUpdate) => {
            setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, pricing: { ...(t.pricing || {}), ...(pricingUpdate || {}) } } : t));
            setSelectedTicketPricing(prev => ({ ...(prev || {}), ...(pricingUpdate || {}) }));
          }}
          tourRefs={{ refModalSurvey, refModalResources, refModalPricing }}
        />
        < SurveyTimeModal
          visible={isSurveyTimeModalVisible}
          onClose={() => setIsSurveyTimeModalVisible(false)}
          ticket={selectedTicketForTime}
          survey={selectedSurvey}
          onSuccess={(ticketId, updatedFields) => {
            setTickets((prev) =>
              prev.map((t) => t._id === ticketId ? { ...t, ...updatedFields } : t)
            );
          }}
        />
        {
          selectedTicket && (
            <ReportIncidentModal
              visible={isReportModalVisible}
              onClose={handleCloseReportModal}
              ticket={selectedTicket}
              onSuccess={(incident) => {
                setTickets((prev) =>
                  prev.map((t) =>
                    t._id === selectedTicket._id
                      ? { ...t, invoice: { ...t.invoice, incident } }
                      : t
                  )
                );
              }}
            />
          )
        }
        <ViewIncidentModal
          visible={isIncidentModalVisible}
          onClose={() => setIsIncidentModalVisible(false)}
          incident={selectedIncident}
        />

        {
          ticketToRate && (
            <RateServiceModal
              visible={isRateModalVisible}
              onClose={() => setIsRateModalVisible(false)}
              ticket={ticketToRate}
              onSuccess={handleRateSuccess}
            />
          )
        }

        <CancelTicketModal
          visible={isCancelModalVisible}
          onClose={() => setIsCancelModalVisible(false)}
          ticket={actionTicket}
          onSuccess={handleActionSuccess}
        />

        <RescheduleSurveyModal
          visible={isRescheduleModalVisible}
          onClose={() => setIsRescheduleModalVisible(false)}
          ticket={actionTicket}
          onSuccess={handleActionSuccess}
        />
      </Content >

      <AppFooter />
    </Layout >
  );
};

export default ViewMovingOrder;