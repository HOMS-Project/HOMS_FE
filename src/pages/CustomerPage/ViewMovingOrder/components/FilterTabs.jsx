import React from "react";
import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { FILTERS } from "../constants";

const FilterTabs = ({ activeFilter, onFilterChange, counts, onRefresh, isRefreshing }) => {
  return (
    <>
      <div className="mo-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Lịch Chuyển Nhà Của Tôi</h2>
        <Button
          className="mo-btn-refresh"
          icon={!isRefreshing && <ReloadOutlined />}
          onClick={() => onRefresh(true)}
          loading={isRefreshing}
          style={{
            borderRadius: '8px',
            fontWeight: 600,
            borderColor: '#44624a',
            color: '#44624a'
          }}
        >
          Làm mới
        </Button>
      </div>

      <div className="mo-filters">
        {FILTERS.map((f) => {
          const cnt = counts[f.key] || 0;
          return (
            <button
              key={f.key}
              className={`mo-filter-btn${activeFilter === f.key ? " mo-filter-btn--active" : ""}`}
              onClick={() => onFilterChange(f.key)}
            >
              {f.label}
              {cnt > 0 && <span className="mo-filter-badge">{cnt}</span>}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default FilterTabs;
