import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Spin, Card, Checkbox, message, Modal } from 'antd';
import SignaturePad from 'react-signature-canvas';
import { getContractTemplateForHouse, getBoardingHouseById } from '../../../services/boardingHouseAPI';
import { getBookingById } from '../../../services/bookingService';
import { saveContract, exportContract } from '../../../services/contractService';
import useUser from '../../../contexts/UserContext';
import './RentalContract.css';

const RentalContract = () => {
    const { boardingHouseId, roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const location = useLocation();
    const { bookingId } = location.state || {};

    const [messageApi, contextHolder] = message.useMessage();
    const [template, setTemplate] = useState(null);
    const [boardingHouse, setBoardingHouse] = useState(null);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agreed, setAgreed] = useState(false);

    const [sigModalOpen, setSigModalOpen] = useState(false);
    const sigPadRef = useRef(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState(null);

    const [savedContractId, setSavedContractId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [templateData, houseData] = await Promise.all([
                    getContractTemplateForHouse(boardingHouseId),
                    getBoardingHouseById(boardingHouseId)
                ]);
                const selectedRoom = houseData.rooms.find(r => r._id === roomId);
                if (!selectedRoom) {
                    messageApi.error('Phòng trọ không hợp lệ.');
                    navigate(-1);
                    return;
                }
                setTemplate(templateData);
                setBoardingHouse(houseData);
                setRoom(selectedRoom);

                if (bookingId) {
                    try {
                        const booking = await getBookingById(bookingId);
                        console.log('Fetched booking', booking);
                    } catch (err) {
                        console.warn('Cannot fetch booking', err);
                    }
                }
            } catch (err) {
                messageApi.error('Không thể tải hợp đồng.');
                console.error(err);
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [boardingHouseId, roomId, bookingId, navigate, messageApi]);

    const renderContractContent = () => {
        if (!template || !user || !room || !boardingHouse) return '';
        const replacements = {
            '{{tenantName}}': user.name,
            '{{tenantEmail}}': user.email,
            '{{customerPhone}}': user.phone,
            '{{roomNumber}}': room.roomNumber,
            '{{roomPrice}}': room.price?.toLocaleString('vi-VN') || '',
            '{{roomArea}}': room.area || '',
            '{{houseAddress}}': `${boardingHouse.location?.addressDetail || ''}, ${boardingHouse.location?.street || ''}, ${boardingHouse.location?.district || ''}`,
            '{{ownerName}}': boardingHouse.ownerId?.name || '',
            '{{ownerPhone}}': boardingHouse.ownerId?.phone || '',
            '{{currentDate}}': new Date().toLocaleDateString('vi-VN')
        };
        let content = template.content || '';
        Object.keys(replacements).forEach(key => {
            content = content.replace(new RegExp(key, 'g'), replacements[key]);
        });
        return content;
    };

    const handleOpenSig = () => setSigModalOpen(true);
    const handleClearSig = () => sigPadRef.current?.clear();
    const handleSaveSig = () => {
        if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
            messageApi.warning('Vui lòng ký trước khi lưu.');
            return;
        }
        const dataUrl = sigPadRef.current.toDataURL('image/png');
        setSignatureDataUrl(dataUrl);
        setSigModalOpen(false);
        messageApi.success('Đã lưu chữ ký.');
    };

    const handleContinue = async () => {
        if (!agreed) {
            messageApi.warning('Bạn phải đồng ý với điều khoản.');
            return;
        }
        try {
            setLoading(true);
            const payload = {
                bookingId: bookingId || null,
                boardingHouseId,
                roomId,
                tenantId: user._id,
                ownerId: boardingHouse.ownerId._id,
                content: renderContractContent(),
                signatureTenant: signatureDataUrl || null
            };
            const res = await saveContract(payload);
            const saved = res.data;
            setSavedContractId(saved._id);
            messageApi.success('Hợp đồng đã được lưu.');

            if (bookingId) {
                navigate('/customer/checkout', { state: { bookingId, contractId: saved._id, fromContract: true } });
            } else {
                setTimeout(() => navigate('/customer/my-bookings'), 1200);
            }
        } catch (err) {
            console.error(err);
            messageApi.error('Không thể lưu hợp đồng!');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><Spin size="large" /></div>;
    if (!template) return <div className="loading-container">Chủ nhà chưa cung cấp mẫu hợp đồng.</div>;

    return (
        <>
            {contextHolder}
            <div className="contract-container">
                <Card title={template.title} bordered={false}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{renderContractContent()}</div>

                    <div className="signature-section" style={{ marginTop: 16 }}>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Chữ ký chủ trọ (Bên A):</strong>
                            {template.signatureImage ? (
                                <img
                                    src={`http://localhost:5000${template.signatureImage}`}
                                    alt="signature-owner"
                                    style={{ width: 250, border: '1px solid #eee', marginTop: 8, display: 'block' }}
                                />
                            ) : (
                                <p style={{ color: 'red', marginTop: 8 }}>Chủ trọ chưa tạo chữ ký.</p>
                            )}
                        </div>

                        <div>
                            <strong>Chữ ký người thuê (Bên B):</strong>
                            {signatureDataUrl ? (
                                <img
                                    src={signatureDataUrl}
                                    alt="signature"
                                    style={{ width: 250, border: '1px solid #eee', marginTop: 8, display: 'block' }}
                                />
                            ) : (
                                <div style={{ marginTop: 8 }}>
                                    <Button onClick={handleOpenSig}>Ký hợp đồng</Button>
                                </div>
                            )}
                        </div>
                    </div>


                    <div style={{ marginTop: 16 }}>
                        <Checkbox checked={agreed} onChange={e => setAgreed(e.target.checked)}>
                            Tôi đã đọc, hiểu và đồng ý với điều khoản.
                        </Checkbox>
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <Button onClick={() => navigate(-1)} style={{ marginRight: 8 }}>Quay lại</Button>
                        <Button type="primary" disabled={!agreed} onClick={handleContinue}>Lưu hợp đồng</Button>
                    </div>
                </Card>
            </div>

            <Modal open={sigModalOpen} onCancel={() => setSigModalOpen(false)} footer={null} width={600}>
                <div style={{ textAlign: 'center' }}>
                    <h3>Ký tên</h3>
                    <SignaturePad ref={sigPadRef} canvasProps={{ width: 520, height: 200, className: 'signature-canvas' }} />
                    <div style={{ marginTop: 12 }}>
                        <Button onClick={handleClearSig} style={{ marginRight: 8 }}>Xóa</Button>
                        <Button type="primary" onClick={handleSaveSig}>Lưu chữ ký</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default RentalContract;
