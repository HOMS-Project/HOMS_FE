// import React, { useState } from 'react';
// import { Button, Input, InputNumber, Form, Space, Upload, message } from 'antd';
// import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
// import axiosInstance from '../../../services/axiosInstance';
// import { useParams, useNavigate } from 'react-router-dom';

// // Component to add multiple rooms with photos for an owner
// // Usage: <AddRoomsWithPhotos boardingHouseId={id} /> or use route param

// const AddRoomsWithPhotos = ({ boardingHouseId: propBoardingHouseId }) => {
//   const { id: paramId } = useParams();
//   const boardingHouseId = propBoardingHouseId || paramId;
//   const navigate = useNavigate();

//   const [rooms, setRooms] = useState([
//     { tempId: `r_${Date.now()}`, roomNumber: '', price: 0, area: 0, description: '', files: [] }
//   ]);
//   const [loading, setLoading] = useState(false);

//   const addRow = () => setRooms(r => [...r, { tempId: `r_${Date.now()}_${r.length || 0}`, roomNumber: '', price: 0, area: 0, description: '', files: [] }]);
//   const removeRow = (index) => setRooms(r => r.filter((_, i) => i !== index));

//   const updateRow = (index, key, value) => {
//     setRooms(prev => {
//       const copy = [...prev];
//       copy[index] = { ...copy[index], [key]: value };
//       return copy;
//     });
//   };

//   const handleFileChange = (index, fileList) => {
//     // fileList is an array of File objects
//     updateRow(index, 'files', fileList);
//   };

//   const handleSubmit = async () => {
//     if (!boardingHouseId) {
//       message.error('Không xác định được BoardingHouse ID');
//       return;
//     }

//     // Basic validation
//     for (const r of rooms) {
//       if (!r.roomNumber || !r.price || !r.area) {
//         message.error('Vui lòng điền đầy đủ thông tin phòng (số phòng, giá, diện tích)');
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       const fd = new FormData();

//       // Build rooms payload (without files)
//       const roomsPayload = rooms.map(r => ({ tempId: r.tempId, roomNumber: r.roomNumber, price: Number(r.price), area: Number(r.area), description: r.description }));
//       fd.append('rooms', JSON.stringify(roomsPayload));

//       // Build photosMap where key = tempId and value = array of original filenames
//       const photosMap = {};
//       rooms.forEach((r) => {
//         if (Array.isArray(r.files) && r.files.length > 0) {
//           photosMap[r.tempId] = r.files.map(f => f.name);
//         }
//       });
//       fd.append('photosMap', JSON.stringify(photosMap));

//       // Append files
//       rooms.forEach((r) => {
//         if (Array.isArray(r.files) && r.files.length > 0) {
//           r.files.forEach((f) => {
//             // f is a File object
//             fd.append('files', f, f.name);
//           });
//         }
//       });

//       const res = await axiosInstance.post(`rooms/${boardingHouseId}/rooms`, fd, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });

//       message.success(res.data?.message || 'Đã thêm phòng thành công');
//       // Optionally navigate to owner boarding house detail
//       navigate(`/owner/boarding-houses/${boardingHouseId}`);
//     } catch (err) {
//       console.error('AddRooms error', err);
//       const errMsg = err.response?.data?.message || err.message || 'Lỗi khi thêm phòng';
//       message.error(errMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 16 }}>
//       <h2>Thêm phòng (kèm ảnh)</h2>
//       {rooms.map((r, idx) => (
//         <div key={r.tempId} style={{ border: '1px solid #eee', padding: 12, marginBottom: 12, borderRadius: 6 }}>
//           <Space direction="vertical" style={{ width: '100%' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <strong>Phòng #{idx + 1}</strong>
//               {rooms.length > 1 && (
//                 <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => removeRow(idx)}>Xóa</Button>
//               )}
//             </div>

//             <Input placeholder="Số phòng (roomNumber)" value={r.roomNumber} onChange={(e) => updateRow(idx, 'roomNumber', e.target.value)} />
//             <InputNumber style={{ width: '100%' }} placeholder="Giá (VNĐ)" min={0} value={r.price} onChange={(v) => updateRow(idx, 'price', v)} />
//             <InputNumber style={{ width: '100%' }} placeholder="Diện tích (m²)" min={0} value={r.area} onChange={(v) => updateRow(idx, 'area', v)} />
//             <Input.TextArea placeholder="Mô tả (không bắt buộc)" value={r.description} onChange={(e) => updateRow(idx, 'description', e.target.value)} />

//             <div>
//               <label>Ảnh phòng (chọn nhiều):</label>
//               <input type="file" multiple onChange={(e) => handleFileChange(idx, Array.from(e.target.files))} />
//               <div style={{ marginTop: 8 }}>
//                 {Array.isArray(r.files) && r.files.map((f, i) => (
//                   <div key={i}>{f.name}</div>
//                 ))}
//               </div>
//             </div>

//           </Space>
//         </div>
//       ))}

//       <Space>
//         <Button type="dashed" icon={<PlusOutlined />} onClick={() => addRow()}>Thêm phòng khác</Button>
//         <Button type="primary" loading={loading} onClick={handleSubmit}>Lưu</Button>
//       </Space>
//     </div>
//   );
// };

// export default AddRoomsWithPhotos;
