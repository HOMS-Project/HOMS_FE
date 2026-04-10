import React, { useState } from 'react';
import { Button, Typography, Spin, Space, Alert, Modal } from 'antd';
import { Sparkles, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import adminAiService from '../../../services/adminAiService';

const { Title, Text } = Typography;

const AIFeedbackSummary = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = async () => {
    setIsModalOpen(true);
    if (!summary) {
      setLoading(true);
      setError(null);
      try {
        const resp = await adminAiService.getFeedbackSummary();
        if (resp.success) {
          setSummary(resp.data);
        }
      } catch (err) {
        console.error('Failed to fetch AI feedback summary:', err);
        setError('Không thể phân tích phản hồi ngay lúc này. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div
        onClick={handleOpen}
        style={{
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
          border: '1px solid #ffe8e8',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 77, 79, 0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff4d4f 0%, #d9363e 100%)', 
            borderRadius: '10px', 
            padding: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)'
          }}>
            <Sparkles color="white" size={24} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>
              Thấu hiểu khách hàng tức thì
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Đọc hàng trăm đánh giá và tóm tắt những điểm cần cải thiện chỉ với một cú chạm.
            </div>
          </div>
        </div>
        <Button 
          type="primary" 
          danger
          shape="round"
          size="large"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
        >
          Lắng nghe ngay <ArrowRight size={16} />
        </Button>
      </div>

      <Modal
        title={
          <Space>
            <Sparkles color="#ff4d4f" size={18} />
            <Title level={5} style={{ margin: 0, color: '#ff4d4f' }}>Báo cáo Trải nghiệm khách hàng AI</Title>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
        centered
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <div style={{ minHeight: '100px', padding: '10px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin tip="AI đang tổng hợp toàn bộ cảm xúc và đánh giá của khách hàng..." size="large" />
            </div>
          ) : error ? (
            <Alert message={error} type="error" showIcon />
          ) : summary ? (
            <div className="ai-feedback-content" style={{ fontSize: '15px', lineHeight: '1.8' }}>
              <ReactMarkdown>{summary}</ReactMarkdown>
              <div style={{
                marginTop: '32px',
                paddingTop: '16px',
                borderTop: '1px solid #f0f0f0',
                textAlign: 'center'
              }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  *Báo cáo được Trí tuệ nhân tạo (AI) tổng hợp từ 50 lượt đánh giá mới nhất nhằm đảm bảo tính khách quan.
                </Text>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>

      <style>{`
        .ai-feedback-content b, .ai-feedback-content strong { color: #ff4d4f; font-weight: 700; }
        .ai-feedback-content h1, .ai-feedback-content h2, .ai-feedback-content h3 { color: #ff4d4f; margin-top: 20px; margin-bottom: 12px; }
        .ai-feedback-content ul { padding-left: 20px; margin-bottom: 16px; }
        .ai-feedback-content li { margin-bottom: 8px; }
      `}</style>
    </>
  );
};

export default AIFeedbackSummary;
