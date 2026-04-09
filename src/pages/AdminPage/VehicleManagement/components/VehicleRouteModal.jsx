import React, { useEffect, useState } from 'react';
import { Modal, Select, Spin, Empty, Row, Col, Switch, Typography, Button } from 'antd';
import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import adminVehicleService from '../../../../services/adminVehicleService';
import api from '../../../../services/api';
import OrderTrackingMap from '../../../../components/OrderTrackingMap/OrderTrackingMap';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

// Helper component to fit map to bounds when coords change
function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !coords || coords.length === 0) return;
    try {
      const latLngs = coords.map(c => [Number(c[0]), Number(c[1])]);
      map.fitBounds(latLngs, { padding: [40, 40] });
    } catch (err) {
      // ignore
    }
  }, [map, coords]);
  return null;
}

const VehicleRouteModal = ({ visible, onClose, vehicle }) => {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]); // list of assignment objects
  const [selectedId, setSelectedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!visible || !vehicle) return;
    setLoading(true);
    (async () => {
      try {
        const data = await adminVehicleService.getVehicleAssignments(vehicle.vehicleId);
        // normalize items to have:
        // { id, orderId, startAt, pickup: {lat,lng,address}, delivery: {lat,lng,address}, route: [[lat,lng],...] }
        // helper to resolve many coordinate shapes into [lat, lng]
        const resolveCoords = (obj) => {
          if (!obj) return [null, null];
          // if it's already an array [lat, lng] or [lng, lat]
          if (Array.isArray(obj) && obj.length >= 2) return [Number(obj[0]), Number(obj[1])];
          // Geo fields directly on object
          if (typeof obj.lat === 'number' && typeof obj.lng === 'number') return [obj.lat, obj.lng];
          if (typeof obj.latitude === 'number' && typeof obj.longitude === 'number') return [obj.latitude, obj.longitude];
          // nested latLng array
          if (Array.isArray(obj.latLng) && obj.latLng.length >= 2) return [Number(obj.latLng[0]), Number(obj.latLng[1])];
          // coordinates could be an array or an object with {lat, lng} or {latitude, longitude}
          if (obj.coordinates) {
            if (Array.isArray(obj.coordinates) && obj.coordinates.length >= 2) return [Number(obj.coordinates[0]), Number(obj.coordinates[1])];
            if (typeof obj.coordinates.lat === 'number' && typeof obj.coordinates.lng === 'number') return [obj.coordinates.lat, obj.coordinates.lng];
            if (typeof obj.coordinates.latitude === 'number' && typeof obj.coordinates.longitude === 'number') return [obj.coordinates.latitude, obj.coordinates.longitude];
          }
          // fallback: maybe object indexed like [0],[1]
          try {
            if (typeof obj[0] !== 'undefined' && typeof obj[1] !== 'undefined') return [Number(obj[0]), Number(obj[1])];
          } catch (e) { /* ignore */ }
          return [null, null];
        };

        const normalized = (data || []).map((a, idx) => {
          // prefer backend-provided fields
          const id = a.dispatchAssignmentId || a._id || a.id || `${vehicle.vehicleId}-${idx}`;
          const pickupRaw = a.pickupLocation || a.pickup || a.origin || {};
          const deliveryRaw = a.deliveryLocation || a.delivery || a.destination || {};
          const route = a.routeCoordinates || a.routeData?.coordinates || a.path || [];
          // resolve coords into lat/lng and ensure ordering (lat within [-90,90])
          let [plat, plng] = resolveCoords(pickupRaw);
          let [dlat, dlng] = resolveCoords(deliveryRaw);
          // heuristics: swap if value looks like [lng, lat]
          if (plat !== null && Math.abs(plat) > 90 && dlng !== null && Math.abs(dlng) <= 90) { const t = plat; plat = plng; plng = t; }
          if (dlat !== null && Math.abs(dlat) > 90 && dlng !== null && Math.abs(dlng) <= 90) { const t = dlat; dlat = dlng; dlng = t; }

          // try to determine a real invoice _id when available (24-hex) so we can fetch it
          const maybeInvoiceId = (val) => (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) ? val : null;
          const invoiceIdFromFields = maybeInvoiceId(a.invoiceId) || maybeInvoiceId(a.orderId) || maybeInvoiceId(a._id) || null;
          const invoiceCode = a.orderCode || a.invoiceCode || a.code || null;

          return {
            id,
            // human-facing label (prefer readable code when available)
            orderId: invoiceCode || a.invoiceId || a.orderId || id,
            invoiceIdNormalized: invoiceIdFromFields,
            startAt: a.pickupTime || a.startAt || a.assignedAt || a.createdAt || null,
            pickup: {
              lat: plat !== null ? Number(plat) : null,
              lng: plng !== null ? Number(plng) : null,
              address: pickupRaw.address || pickupRaw.formattedAddress || a.pickupAddress || '',
            },
            delivery: {
              lat: dlat !== null ? Number(dlat) : null,
              lng: dlng !== null ? Number(dlng) : null,
              address: deliveryRaw.address || deliveryRaw.formattedAddress || a.deliveryAddress || '',
            },
            route: Array.isArray(route) ? route.map(r => [Number(r[0]), Number(r[1])]) : [],
            raw: a,
          };
        });
        setAssignments(normalized);
        setSelectedId(normalized[0]?.id || null);
      } catch (err) {
        console.error('Unable to fetch assignments', err);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible, vehicle]);

  // When user selects an assignment that lacks pickup/delivery info, fetch invoice details to try to obtain requestTicket coordinates
  useEffect(() => {
      const fillSelectedFromInvoice = async () => {
      const sel = assignments.find(a => a.id === selectedId);
      if (!sel) return;
      // if pickup and delivery absent, try to fetch invoice detail
      const needsPickup = !(sel.pickup && sel.pickup.lat && sel.pickup.lng && sel.pickup.address);
      const needsDelivery = !(sel.delivery && sel.delivery.lat && sel.delivery.lng && sel.delivery.address);
      // prefer a normalized invoice _id (24-hex) when available; otherwise try to search by code
      const invoiceId = sel.invoiceIdNormalized || sel.raw?.invoiceId || sel.invoiceId || null;
      const invoiceCodeCandidate = sel.raw?.orderCode || sel.raw?.invoiceCode || sel.orderId || null;
      if ((needsPickup || needsDelivery) && (invoiceId || invoiceCodeCandidate)) {
        try {
          let inv = null;
          if (invoiceId) {
            try {
              const res = await api.get(`/invoices/${invoiceId}`, { _suppressErrorNotification: true });
              inv = res.data?.data;
            } catch (err) {
              // If direct invoice lookup fails, maybe the id is a requestTicketId — try ticket endpoint
              try {
                const byTicket = await api.get(`/invoices/ticket/${invoiceId}`, { _suppressErrorNotification: true });
                inv = byTicket.data?.data || null;
              } catch (err2) {
                inv = null;
              }
            }
          }
          if (!inv && invoiceCodeCandidate) {
            // search invoices by code using list endpoint (will search by code regex)
            const listRes = await api.get('/invoices', { params: { search: invoiceCodeCandidate, limit: 1 }, _suppressErrorNotification: true });
            // listInvoices returns { success, data: { invoices, total, ... } } in admin service,
            // but public /api/invoices returns { success, data: [ ... ] } — handle both shapes
            if (listRes.data) {
              if (Array.isArray(listRes.data.data)) {
                inv = listRes.data.data[0] || null;
              } else if (listRes.data.data && Array.isArray(listRes.data.data.invoices)) {
                inv = listRes.data.data.invoices[0] || null;
              }
            }
          }
          if (!inv) throw new Error('Invoice not found');
          const rt = inv?.requestTicketId;
          if (rt) {
            const findCoords = (obj) => {
              if (!obj) return null;
              // reuse same resolution logic as above
              if (Array.isArray(obj) && obj.length >= 2) return [Number(obj[0]), Number(obj[1])];
              if (Array.isArray(obj.coordinates) && obj.coordinates.length >= 2) return [Number(obj.coordinates[0]), Number(obj.coordinates[1])];
              if (obj.coordinates && typeof obj.coordinates.lat === 'number' && typeof obj.coordinates.lng === 'number') return [obj.coordinates.lat, obj.coordinates.lng];
              if (Array.isArray(obj.latLng) && obj.latLng.length >= 2) return [Number(obj.latLng[0]), Number(obj.latLng[1])];
              if (typeof obj.latitude === 'number' && typeof obj.longitude === 'number') return [obj.latitude, obj.longitude];
              if (typeof obj.lat === 'number' && typeof obj.lng === 'number') return [obj.lat, obj.lng];
              try { if (typeof obj[0] !== 'undefined' && typeof obj[1] !== 'undefined') return [Number(obj[0]), Number(obj[1])]; } catch (e) { }
              return null;
            };

            const pickupCandidate = rt.pickup || rt.pickupLocation || null;
            const deliveryCandidate = rt.delivery || rt.deliveryLocation || null;
            const pcoords = findCoords(pickupCandidate);
            const dcoords = findCoords(deliveryCandidate);
            const updated = assignments.map(a => {
              if (a.id !== sel.id) return a;
              const newA = { ...a };
              if ((!newA.pickup || !newA.pickup.lat) && pcoords && pcoords.length >= 2) {
                let lat = pcoords[0]; let lng = pcoords[1];
                if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) { const t = lat; lat = lng; lng = t; }
                newA.pickup = { lat: Number(lat), lng: Number(lng), address: (pickupCandidate && (pickupCandidate.address || pickupCandidate.formattedAddress)) || '' };
              }
              if ((!newA.delivery || !newA.delivery.lat) && dcoords && dcoords.length >= 2) {
                let lat = dcoords[0]; let lng = dcoords[1];
                if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) { const t = lat; lat = lng; lng = t; }
                newA.delivery = { lat: Number(lat), lng: Number(lng), address: (deliveryCandidate && (deliveryCandidate.address || deliveryCandidate.formattedAddress)) || '' };
              }
              return newA;
            });
            setAssignments(updated);
          }
        } catch (err) {
          // ignore
        }
      }
    };
    fillSelectedFromInvoice();
  }, [selectedId]);

  const selected = assignments.find(a => a.id === selectedId) || null;

  const mapCenter = selected?.route?.length ? selected.route[0] : (selected?.pickup?.lat ? [selected.pickup.lat, selected.pickup.lng] : [10.762622, 106.660172]);

  return (
    <Modal
      title={`Lộ trình - ${vehicle?.vehicleId || ''}`}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Đóng</Button>
      ]}
      width={900}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : (
        <div>
          <Row gutter={12} style={{ marginBottom: 8, alignItems: 'center' }}>
            <Col flex="auto">
              <Text strong>Chọn đơn hàng:</Text>
              <div>
                {assignments.length > 0 ? (
                  <Select style={{ width: '100%' }} value={selectedId} onChange={setSelectedId} placeholder="Chọn đơn hàng để xem lộ trình">
                    {assignments.map(a => (
                      <Option key={a.id} value={a.id}>{`${a.orderId} • ${a.startAt ? dayjs(a.startAt).format('YYYY-MM-DD HH:mm') : '—'}`}</Option>
                    ))}
                  </Select>
                ) : (
                  <Empty description="Không có lộ trình" />
                )}
              </div>
            </Col>
            <Col style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text>Hiển thị tất cả</Text>
              <Switch checked={showAll} onChange={setShowAll} />
            </Col>
          </Row>

          <div>
            <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: '12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                <Text strong style={{ color: '#389e0d' }}>Điểm lấy hàng:</Text>
                <div style={{ marginTop: 8 }}>{selected?.pickup?.address || selected?.raw?.pickupAddress || 'Không có thông tin'}</div>
              </div>
              <div style={{ padding: '12px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 6 }}>
                <Text strong style={{ color: '#cf1322' }}>Điểm giao hàng:</Text>
                <div style={{ marginTop: 8 }}>{selected?.delivery?.address || selected?.raw?.deliveryAddress || 'Không có thông tin'}</div>
              </div>
            </div>

            <div style={{ height: 520, position: 'relative' }}>
              {assignments.length === 0 ? (
                <div style={{ padding: 40 }}><Empty description="Không có dữ liệu lộ trình" /></div>
              ) : (
                // If selected has no stored route but has pickup/delivery coords and user isn't viewing "showAll",
                // reuse OrderTrackingMap which calls OSRM to produce a road-following polyline (same as Dispatcher view).
                (selected && (!selected.route || selected.route.length === 0) && selected.pickup?.lat && selected.delivery?.lat && !showAll) ? (
                  <OrderTrackingMap
                    pickup={{ lat: selected.pickup.lat, lng: selected.pickup.lng, address: selected.pickup.address }}
                    delivery={{ lat: selected.delivery.lat, lng: selected.delivery.lng, address: selected.delivery.address }}
                    routeData={selected.raw?.routeData || selected.raw?.route || selected.raw?.routeId || null}
                  />
                ) : (
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* If showAll, draw all routes */}
                  {showAll && assignments.map(a => (
                    a.route && a.route.length > 0 ? (
                      <React.Fragment key={`route-${a.id}`}>
                        <Polyline positions={a.route} color={'#3388ff'} weight={4} opacity={0.6} />
                        {a.pickup?.lat && a.pickup?.lng && (
                          <CircleMarker center={[a.pickup.lat, a.pickup.lng]} radius={6} pathOptions={{ color: '#2b8a3e', fillColor: '#2b8a3e' }}>
                            <Popup>{`Pickup: ${a.pickup.address || a.orderId}`}</Popup>
                          </CircleMarker>
                        )}
                        {a.delivery?.lat && a.delivery?.lng && (
                          <CircleMarker center={[a.delivery.lat, a.delivery.lng]} radius={6} pathOptions={{ color: '#d9534f', fillColor: '#d9534f' }}>
                            <Popup>{`Delivery: ${a.delivery.address || a.orderId}`}</Popup>
                          </CircleMarker>
                        )}
                      </React.Fragment>
                    ) : null
                  ))}

                  {/* Selected assignment route */}
                  {selected && selected.route && selected.route.length > 0 && (
                    <>
                      <Polyline positions={selected.route} color={'#165db8'} weight={6} opacity={0.9} />
                      {selected.pickup?.lat && selected.pickup?.lng && (
                        <Marker position={[selected.pickup.lat, selected.pickup.lng]}>
                          <Popup>{`Điểm lấy hàng: ${selected.pickup.address || ''}`}</Popup>
                        </Marker>
                      )}
                      {selected.delivery?.lat && selected.delivery?.lng && (
                        <Marker position={[selected.delivery.lat, selected.delivery.lng]}>
                          <Popup>{`Điểm giao hàng: ${selected.delivery.address || ''}`}</Popup>
                        </Marker>
                      )}
                      <FitBounds coords={selected.route} />
                    </>
                  )}

                  {/* legend overlay */}
                  <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 9999 }}>
                    <div style={{ background: 'rgba(255,255,255,0.95)', padding: 8, borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.12)', fontSize: 12 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><div style={{ width: 10, height: 10, background: '#165db8' }} /> Lộ trình di chuyển</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}><div style={{ width: 10, height: 10, background: '#ff4d4f', borderRadius: 6 }} /> Đoạn đường cấm (HOMS)</div>
                    </div>
                  </div>
                  </MapContainer>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default VehicleRouteModal;
