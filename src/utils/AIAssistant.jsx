import React, { useState } from "react";
import { MessageOutlined, CloseOutlined } from "@ant-design/icons";
import { Modal, Input, Button } from "antd";

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào 👋! Tôi là AI Assistant.", completed: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = input;
  setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
  setInput("");
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
    setMessages((prev) => [...prev, { from: "bot", text: "", completed: false }]);

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
    setMessages((prev) => [
      ...prev,
      { from: "bot", text: "Lỗi khi kết nối AI", completed: true },
    ]);
  }

  setLoading(false);
};



  return (
    <>
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined />}
        onClick={() => setIsOpen(true)}
        style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}
      />
      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        closeIcon={<CloseOutlined />}
        centered
        width={400}
        bodyStyle={{ display: "flex", flexDirection: "column", height: 500, padding: 0 }}
        title="🤖 AI Assistant"
      >
        <div style={{ flex: 1, overflowY: "auto", padding: 10, background: "#fafafa" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 8, textAlign: msg.from === "bot" ? "left" : "right" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: msg.from === "bot" ? "#f0f0f0" : "#d9f7be",
                  maxWidth: "80%",
                  wordWrap: "break-word",
                }}
              >
                {msg.text}
                {!msg.completed && msg.from === "bot" ? "" : ""}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", padding: 10, borderTop: "1px solid #f0f0f0" }}>
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
          />
          <Button type="primary" onClick={handleSend} style={{ marginLeft: 8 }} loading={loading}>
            Gửi
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default AIAssistant;
