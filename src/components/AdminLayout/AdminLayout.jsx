import React from 'react';
import { Layout } from 'antd';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const { Content } = Layout;

const AdminLayout = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            <AdminSidebar />
            <Layout style={{ marginLeft: 250 }}>
                <AdminHeader />
                <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
                    <div style={{ padding: 24, textAlign: 'center', background: '#fff', borderRadius: '8px', minHeight: 'calc(100vh - 120px)' }}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
