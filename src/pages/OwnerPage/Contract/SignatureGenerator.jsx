// file: src/components/SignatureGenerator/SignatureGenerator.jsx

import React, { useRef, useEffect } from 'react';

const SignatureGenerator = ({ name, onSignatureGenerated }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !name) return;

        const ctx = canvas.getContext('2d');
        
        // --- Cấu hình ---
        const font = '48px "Dancing Script", cursive';
        const color = '#000000'; // Màu chữ ký
        const canvasWidth = 400;
        const canvasHeight = 150;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Xóa nội dung cũ
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Thiết lập font và màu
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Vẽ chữ ký vào giữa canvas
        ctx.fillText(name, canvasWidth / 2, canvasHeight / 2);

        // Chuyển đổi canvas thành ảnh dạng Base64 và gửi về cho component cha
        const dataUrl = canvas.toDataURL('image/png');
        onSignatureGenerated(dataUrl);

    }, [name, onSignatureGenerated]); // Vẽ lại khi tên thay đổi

    return (
        <canvas ref={canvasRef} style={{ border: '1px dashed #ccc', borderRadius: '4px' }} />
    );
};

export default SignatureGenerator;