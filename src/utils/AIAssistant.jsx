import React, { useState, useRef, useEffect } from "react";
import { MessageOutlined, CloseOutlined, SendOutlined } from "@ant-design/icons";
import { Modal, Input, Button, Space, Typography } from "antd";
import ReactMarkdown from "react-markdown";

const { Text } = Typography;

const SUGGESTED_QUESTIONS = [
  "Dịch vụ sửa chữa bao gồm những gì?",
  "Làm sao để đặt lịch dịch vụ?",
  "Bảng giá dịch vụ như thế nào?",
  "Có quy trình khảo sát trước không?"
];

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào 👋! Tôi là trợ lý ảo AI của HOMS. Tôi có thể giúp gì cho bạn hôm nay?", completed: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMessage = textToSend;
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    if (textToSend === input) setInput("");
    setLoading(true);

    // Thêm message bot kiểu "Đang suy nghĩ..."
    setMessages((prev) => [...prev, { from: "bot", text: "Đang suy nghĩ...", completed: false }]);

    try {
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMessage }),
        headers: { "Content-Type": "application/json" },
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partial = "";

      // Thêm message mới cho typing, để không ghi đè "Đang suy nghĩ..."
      setMessages((prev) => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = { from: "bot", text: "", completed: false };
        return newArr;
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });

        const newText = partial; // Lưu giá trị riêng
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, text: newText, completed: false };
          return updated;
        });
      }

      // Khi xong stream, đánh dấu completed
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, completed: true };
        return updated;
      });

    } catch (err) {
      setMessages((prev) => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = { from: "bot", text: "Xin lỗi, đã có lỗi xảy ra khi kết nối. Vui lòng thử lại sau.", completed: true };
        return newArr;
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined style={{ fontSize: "24px" }} />}
        onClick={() => setIsOpen(true)}
        style={{ 
          position: "fixed", 
          bottom: 30, 
          right: 30, 
          zIndex: 1000,
          width: 60,
          height: 60,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}
      />
      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        closeIcon={<CloseOutlined style={{ color: "white" }} />}
        centered
        width={420}
        styles={{
          body: { display: "flex", flexDirection: "column", height: 550, padding: 0 }
        }}
        title={
          <div style={{ color: "white", padding: "12px 16px", margin: "-20px -24px -20px -24px", background: "linear-gradient(135deg, #1890ff 0%, #0050b3 100%)", borderRadius: "8px 8px 0 0" }}>
            <h3 style={{ margin: 0, color: "white", display: "flex", alignItems: "center", gap: "8px" }}>
              🤖 Trợ lý ảo AI
            </h3>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>Luôn sẵn sàng hỗ trợ bạn 24/7</Text>
          </div>
        }
      >
        <div style={{ flex: 1, overflowY: "auto", padding: 16, background: "#f5f7fa" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 12, textAlign: msg.from === "bot" ? "left" : "right", display: "flex", flexDirection: "column", alignItems: msg.from === "bot" ? "flex-start" : "flex-end" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "16px",
                  borderBottomLeftRadius: msg.from === "bot" ? "2px" : "16px",
                  borderBottomRightRadius: msg.from === "user" ? "2px" : "16px",
                  background: msg.from === "bot" ? "white" : "#1890ff",
                  color: msg.from === "bot" ? "#333" : "white",
                  maxWidth: "85%",
                  wordWrap: "break-word",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  lineHeight: "1.5",
                  textAlign: "left"
                }}
              >
                {msg.from === "bot" ? (
                  <div className="markdown-body" style={{ margin: 0, padding: 0, fontSize: "14px" }}>
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p style={{margin: "0 0 8px 0"}} {...props} />,
                        ul: ({node, ...props}) => <ul style={{marginTop: 0, marginBottom: "8px", paddingLeft: "20px"}} {...props} />,
                        li: ({node, ...props}) => <li style={{margin: 0}} {...props} />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          
          {messages.length === 1 && (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: "13px", marginBottom: "12px", display: "block" }}>
                Gợi ý câu hỏi:
              </Text>
              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <Button 
                    key={idx} 
                    block 
                    style={{ 
                      borderRadius: "20px", 
                      textAlign: "left", 
                      padding: "8px 16px", 
                      height: "auto",
                      background: "white",
                      borderColor: "#d9d9d9",
                      color: "#555",
                      whiteSpace: "normal"
                    }}
                    onClick={() => handleSend(q)}
                    disabled={loading}
                    hoverable="true"
                  >
                    {q}
                  </Button>
                ))}
              </Space>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ display: "flex", padding: "12px 16px", background: "white", borderTop: "1px solid #f0f0f0" }}>
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhấn Enter để gửi..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            bordered={false}
            style={{ 
              background: "#f0f2f5", 
              borderRadius: "20px", 
              padding: "8px 16px",
              resize: "none"
            }}
            onPressEnter={(e) => {
              if (!e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
          />
          <Button 
            type="primary" 
            shape="circle" 
            icon={<SendOutlined />} 
            onClick={() => handleSend()} 
            style={{ marginLeft: 12, marginTop: "auto", marginBottom: "auto", width: 40, height: 40 }} 
            loading={loading}
          />
        </div>
      </Modal>
    </>
  );
}

export default AIAssistant;
