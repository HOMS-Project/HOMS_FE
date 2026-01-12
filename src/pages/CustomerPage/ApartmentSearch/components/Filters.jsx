import { useState } from "react";
import {
  InputNumber,
  DatePicker,
  Button,
  Select,
  Dropdown,
  Menu,
  Checkbox,
  Space,
  notification,
} from "antd";
import {
  DownOutlined,
  SearchOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const Filters = ({ onSearch, resultText }) => {
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedBedrooms, setSelectedBedrooms] = useState(null);
  const [selectedBathrooms, setSelectedBathrooms] = useState(null);
  const [features, setFeatures] = useState({
    disabledAccess: false,
    parking: false,
    elevator: false,
    washingMachine: false,
  });

  const [street, setStreet] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  // ⭐ NEW AREA FILTER
  const [areaMin, setAreaMin] = useState(null);
  const [areaMax, setAreaMax] = useState(null);

  const districtOptions = [
    { label: "Liên Chiểu", value: "Liên Chiểu" },
    { label: "Hải Châu", value: "Hải Châu" },
    { label: "Thanh Khê", value: "Thanh Khê" },
    { label: "Cẩm Lệ", value: "Cẩm Lệ" },
    { label: "Sơn Trà", value: "Sơn Trà" },
    { label: "Ngũ Hành Sơn", value: "Ngũ Hành Sơn" },
  ];

  const handleSearch = () => {
    const filters = {
      district: selectedDistrict,
      street,
      addressDetail,
      bedrooms: selectedBedrooms,
      bathrooms: selectedBathrooms,
      features,
      area: {
        min: areaMin,
        max: areaMax,
      },
    };

    onSearch(filters);
  };

  const handleFeatureChange = (featureName, checked) => {
    setFeatures((prev) => ({
      ...prev,
      [featureName]: checked,
    }));
  };

  return (
    <div style={{ padding: "24px 16px" }}>
      {/* Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "2px solid #004d47",
          borderRadius: "40px",
          overflow: "hidden",
          padding: "4px",
          flexWrap: "wrap",
        }}
      >
        {/* Districts */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            flex: "1",
            minWidth: "150px",
            borderRight: "1px solid #004d47",
          }}
        >
          <SearchOutlined style={{ marginRight: 8 }} />
          <Select
            placeholder="Select a district"
            style={{ flex: 1 }}
            bordered={false}
            options={districtOptions}
            value={selectedDistrict}
            onChange={setSelectedDistrict}
          />
        </div>

        {/* Street */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            flex: "1",
            minWidth: "150px",
            borderRight: "1px solid #004d47",
          }}
        >
          <input
            placeholder="Enter street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "14px",
              color: "#004d47",
            }}
          />
        </div>

        {/* Address Detail */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            flex: "1",
            minWidth: "150px",
            borderRight: "1px solid #004d47",
          }}
        >
          <input
            placeholder="Enter address detail"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "14px",
              color: "#004d47",
            }}
          />
        </div>

        {/* ⭐ AREA Filter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            flex: "1",
            minWidth: "150px",
            borderRight: "1px solid #004d47",
            gap: "8px",
          }}
        >
          <InputNumber
            placeholder="Area min (m²)"
            value={areaMin}
            onChange={setAreaMin}
            min={0}
            bordered={false}
            style={{ width: "100%" }}
          />
          <span>-</span>
          <InputNumber
            placeholder="Area max (m²)"
            value={areaMax}
            onChange={setAreaMax}
            min={0}
            bordered={false}
            style={{ width: "100%" }}
          />
        </div>

        {/* Search button */}
        <div>
          <Button
            type="primary"
            onClick={handleSearch}
            style={{
              backgroundColor: "#004d47",
              color: "#fff",
              borderRadius: "40px",
              height: "100%",
              padding: "12px 24px",
              border: "none",
            }}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Bottom filters */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* Result summary */}
        {resultText && (
          <div style={{ fontSize: "16px" }}>
            <span style={{ fontWeight: "bold" }}>{resultText}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default Filters;
