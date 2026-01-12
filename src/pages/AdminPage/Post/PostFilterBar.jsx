import { Space, Input, Select, DatePicker, Button } from "antd";

const { RangePicker } = DatePicker;
const { Option } = Select;

// ✅ Thay đổi props: nhận `onFilterChange` thay vì `setFilters`
const PostFilterBar = ({ filters, onFilterChange, ownerOptions }) => {

    const handleReset = () => {
        // ✅ Khi reset, gọi onFilterChange với object rỗng hoặc giá trị mặc định
        // Component cha sẽ xử lý việc reset state
        onFilterChange({
            owner: undefined,
            approvedStatus: undefined,
            dateRange: [],
            search: ""
        });
    };

    return (
        <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
            <Input
                placeholder="Search by name" // ✅ Đổi từ title sang name cho nhất quán
                allowClear
                value={filters.search}
                // ✅ Chỉ cần gọi onFilterChange với sự thay đổi
                onChange={(e) => onFilterChange({ search: e.target.value })}
                style={{ width: 180 }}
            />
            <Select
                placeholder="Status"
                allowClear
                style={{ width: 140 }}
                value={filters.approvedStatus}
                // ✅ Tương tự, chỉ cần báo cáo sự thay đổi
                onChange={(value) => onFilterChange({ approvedStatus: value })}
            >
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="deleted">Deleted</Option>
            </Select>
            <RangePicker
                value={filters.dateRange}
                onChange={(dates) => onFilterChange({ dateRange: dates || [] })}
                style={{ width: 260 }}
            />
            <Button onClick={handleReset} type="default">
                Reset
            </Button>
        </Space>
    );
};

export default PostFilterBar;