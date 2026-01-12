// file: Posts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import PostFilterBar from "./PostFilterBar";
import PostTable from "./PostTable";
import PostDetailModal from "./PostDetailModal";
import { getAdminBoardingHouses, approveBoardingHouseAdmin, deleteBoardingHouseAdmin } from "../../../services/accommodationAdminService";

const Posts = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
    });
    const [filters, setFilters] = useState({
        owner: "",
        approvedStatus: undefined, // Dùng undefined để không gửi param nếu không chọn
        dateRange: [],
        search: "",
    });
    const [viewPost, setViewPost] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ Dùng useCallback để tránh re-render không cần thiết
    const fetchData = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const params = { page, limit };

            // Chỉ thêm các filter có giá trị vào params để gửi lên backend
            if (filters.owner) params.owner = filters.owner;
            if (filters.approvedStatus) params.status = filters.approvedStatus; // Backend controller dùng 'status'
            if (filters.search?.trim()) params.search = filters.search.trim();
            if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
                params.fromDate = filters.dateRange[0].format("YYYY-MM-DD");
                params.toDate = filters.dateRange[1].format("YYYY-MM-DD");
            }

            const data = await getAdminBoardingHouses(params);

            // ✅ FIX 1: Truy cập đúng thuộc tính `boardingHouses`
            setPosts(data.boardingHouses || []);

            // ✅ FIX 2: Bỏ client-side filtering và lấy thông tin phân trang trực tiếp từ backend
            setPagination({
                total: data.total || 0,
                page: data.page || 1,
                limit: limit,
            });

        } catch (err) {
            messageApi.error('Không thể tải dữ liệu. Vui lòng thử lại!');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, messageApi]);

    // Lần đầu tải dữ liệu
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Xử lý khi filter thay đổi
    const handleFilterChange = (changedFilters) => {
        setFilters(prev => ({ ...prev, ...changedFilters }));
    };
    
    // Tải lại dữ liệu khi filter thay đổi
    useEffect(() => {
        // Đặt page về 1 khi filter thay đổi
        fetchData(1, pagination.limit);
    }, [filters.approvedStatus, filters.search, filters.dateRange, filters.owner]); // eslint-disable-line react-hooks/exhaustive-deps

    const refreshData = () => {
        fetchData(pagination.page, pagination.limit);
    };

    const handleTableChange = (newPagination) => {
        fetchData(newPagination.current, newPagination.pageSize);
    };

    // --- Các hàm xử lý Approve, Reject, Delete ---
    const handleApprove = async (postId, approvedStatus) => {
        const key = `approve_${postId}`;
        messageApi.loading({ content: 'Đang xử lý...', key });
        try {
            await approveBoardingHouseAdmin(postId, approvedStatus);
            messageApi.success({ content: 'Phê duyệt bài đăng thành công!', key, duration: 2 });
            refreshData();
        } catch (err) {
            messageApi.error({ content: 'Phê duyệt thất bại!', key, duration: 2 });
        }
    };

    const handleReject = async (postId, approvedStatus, rejectedReason) => {
        const key = `reject_${postId}`;
        messageApi.loading({ content: 'Đang xử lý...', key });
        try {
            await approveBoardingHouseAdmin(postId, approvedStatus, rejectedReason);
            messageApi.success({ content: 'Đã từ chối bài đăng!', key, duration: 2 });
            refreshData();
        } catch (err) {
            messageApi.error({ content: 'Từ chối thất bại!', key, duration: 2 });
        }
    };

    const handleDelete = async (postId, reason) => {
        const key = `delete_${postId}`;
        messageApi.loading({ content: 'Đang xóa...', key });
        try {
            await deleteBoardingHouseAdmin(postId, reason);
            messageApi.success({ content: 'Đã xóa bài đăng!', key, duration: 2 });
            refreshData();
        } catch (err) {
            messageApi.error({ content: err.response?.data?.message || 'Xóa thất bại!', key, duration: 2 });
        }
    };

    // ✅ FIX 3: Ánh xạ dữ liệu cho bảng, đổi `title` thành `name`
    const tableData = posts.map((post) => ({
        id: post._id,
        name: post.name, // Sửa từ title -> name
        owner: post.ownerId?.name || "N/A", // Sửa từ owner -> ownerId
        approvedStatus: post.approvedStatus || "unknown",
        createdAt: post.createdAt,
        raw: post, // Dùng cho modal chi tiết
    }));

    return (
        <>
            {contextHolder}
            <div className="page-container" style={{ maxWidth: 1100, margin: "0 auto" }}>
                <h1 style={{ marginBottom: 24 }}>Quản lý bài đăng</h1>
                <PostFilterBar filters={filters} onFilterChange={handleFilterChange} />
                <PostTable
                    data={tableData}
                    loading={loading}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài đăng`,
                    }}
                    onChange={handleTableChange}
                    onView={(row) => setViewPost(row.raw)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                />
                <PostDetailModal post={viewPost} onClose={() => setViewPost(null)} />
                {/* PostDeleteModal có thể được tích hợp vào onConfirm của Ant Design Popconfirm trong PostTable */}
            </div>
        </>
    );
};

export default Posts;