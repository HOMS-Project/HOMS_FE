import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Tag, Button, Input, Select, Space, Modal,
  Typography, Card, Row, Col, Statistic, Tooltip,
  Empty, Spin, message, Divider, Alert,
} from 'antd';
import {
  FileTextOutlined, SearchOutlined, EyeOutlined, DownloadOutlined,
  EditOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined, SyncOutlined,
} from '@ant-design/icons';


const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const STATUS_CONFIG = {
  DRAFT:     { color: 'default',    label: 'Nháp',    icon: <EditOutlined /> },
  SENT:      { color: 'processing', label: 'Chờ ký',  icon: <ClockCircleOutlined /> },
  SIGNED:    { color: 'success',    label: 'Đã ký',   icon: <CheckCircleOutlined /> },
  EXPIRED:   { color: 'warning',    label: 'Hết hạn', icon: <ExclamationCircleOutlined /> },
  CANCELLED: { color: 'error',      label: 'Đã huỷ',  icon: <CloseCircleOutlined /> },
};

const StatusTag = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return <Tag icon={cfg.icon} color={cfg.color} style={{ fontWeight: 500 }}>{cfg.label}</Tag>;
};




export default MyContract;