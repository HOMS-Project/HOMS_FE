import React from 'react';
import { Menu,Badge } from 'antd';
import { UserOutlined, HeartOutlined, MessageOutlined, WarningOutlined, FileOutlined, HistoryOutlined,CalendarOutlined } from '@ant-design/icons';
import { useNotifications } from '../../../../contexts/NotificationContext';
const Sidebar = ({ selectedKey, onSelect }) => {
  const { hasVisitResponse, clearCustomerVisitNotif } = useNotifications();


    const handleSelect = (e) => {

        if (e.key === '/customer/profile/visit-requests') {
            clearCustomerVisitNotif(); 
        }
        onSelect(e);
    };
  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      onClick={onSelect}
      style={{ height: '100%' }}
    >
      <Menu.Item key="/customer/profile/personal-info" icon={<UserOutlined />}>
        Personal Info
      </Menu.Item>
      <Menu.Item key="/customer/profile/favorites" icon={<HeartOutlined />}>
        Favorites
      </Menu.Item>
      <Menu.Item key="/customer/profile/booking-history" icon={<HistoryOutlined />}>
        Booking History
      </Menu.Item>
      <Menu.Item key="/customer/profile/contracts" icon={<FileOutlined />}>
        Contracts
      </Menu.Item>
     <Menu.Item 
        key="/customer/profile/visit-requests" 
        icon={
            <Badge dot={hasVisitResponse} size="small">
                <CalendarOutlined />
            </Badge>
        }
      >
 Visit Requests 
</Menu.Item>
       <Menu.Item key="/customer/profile/my-reports" icon={<WarningOutlined/>}>
        Reports
      </Menu.Item>
      <Menu.Item key="/customer/profile/messages" icon={<MessageOutlined />}>
        Messages
      </Menu.Item>
      
    </Menu>
  );
};

export default Sidebar;