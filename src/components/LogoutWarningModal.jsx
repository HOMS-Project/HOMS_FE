// components/common/LogoutWarningModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';

function LogoutWarningModal() {
  const [visible, setVisible] = useState(false);

useEffect(() => {
  const handleShowWarning = () => {
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 10000);
  };

  window.addEventListener('show-logout-warning', handleShowWarning);

  return () => {
    window.removeEventListener('show-logout-warning', handleShowWarning);
  };
}, []);


return (
  <Modal
    open={visible}
    onOk={() => setVisible(false)}
    onCancel={() => setVisible(false)}
    okText="Tôi hiểu"
    cancelButtonProps={{ style: { display: 'none' } }}
    centered
  >
    <p>Bạn sẽ bị đăng xuất sau vài giây do không hoạt động.</p>
    <p>Vui lòng tương tác với trang để giữ phiên đăng nhập.</p>
  </Modal>
);
}

export default LogoutWarningModal;
