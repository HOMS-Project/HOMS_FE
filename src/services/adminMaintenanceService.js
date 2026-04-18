import api from './api';

export async function getAllMaintenances() {
  try {
    const res = await api.get('/admin/maintenances');
    return res.data;
  } catch (err) {
    console.error('Failed to fetch maintenances', err);
    throw err;
  }
}

export async function createMaintenance(payload) {
  try {
    const res = await api.post('/admin/maintenances', payload);
    return res.data;
  } catch (err) {
    console.error('Failed to create maintenance', err);
    throw err;
  }
}

export async function getCostSummary() {
  try {
    const res = await api.get('/admin/maintenances/summary/cost');
    return res.data;
  } catch (err) {
    console.error('Failed to fetch maintenance cost summary', err);
    throw err;
  }
}

export async function getDrivers(opts = { roles: ['driver', 'staff'] }) {
  try {
    const roles = Array.isArray(opts.roles) ? opts.roles.join(',') : String(opts.roles || 'driver,staff');
    const url = `/admin/maintenances/drivers?roles=${encodeURIComponent(roles)}`;
    const res = await api.get(url);
    return res.data;
  } catch (err) {
    console.error('Failed to fetch drivers', err);
    throw err;
  }
}

const adminMaintenanceService = {
  getAllMaintenances,
  createMaintenance,
  getCostSummary,
  getDrivers
};

export default adminMaintenanceService;